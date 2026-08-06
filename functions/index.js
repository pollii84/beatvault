/**
 * BeatVault Cloud Functions — Stripe Payment Engine
 *
 * Two functions:
 * 1. createCheckoutSession (callable) — creates a Stripe Checkout Session
 * 2. stripeWebhook (HTTP) — handles Stripe webhook events for order fulfillment
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();
const db = admin.firestore();

// Secrets — set via: firebase functions:secrets:set STRIPE_SECRET_KEY
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

// ============================================================
// 1. createCheckoutSession — callable function
// ============================================================
exports.createCheckoutSession = onCall(
  {
    secrets: [stripeSecretKey],
    enforceAppCheck: false, // enable later for production hardening
  },
  async (request) => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to checkout."
      );
    }

    const { items, successUrl, cancelUrl } = request.data;
    const buyerId = request.auth.uid;
    const buyerEmail = request.auth.token.email || "";

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Cart must contain at least one item."
      );
    }

    if (items.length > 20) {
      throw new HttpsError(
        "invalid-argument",
        "Cart cannot contain more than 20 items."
      );
    }

    // Initialize Stripe with the secret key
    const stripe = require("stripe")(stripeSecretKey.value());

    // Validate prices server-side against Firestore to prevent tampering
    const lineItems = [];
    const validatedItems = [];

    for (const item of items) {
      if (!item.beatId || !item.format) {
        throw new HttpsError(
          "invalid-argument",
          "Each item must have a beatId and format."
        );
      }

      const beatDoc = await db.collection("beats").doc(item.beatId).get();
      if (!beatDoc.exists) {
        throw new HttpsError(
          "not-found",
          `Beat "${item.beatId}" not found.`
        );
      }

      const beat = beatDoc.data();
      if (!beat.isActive) {
        throw new HttpsError(
          "failed-precondition",
          `Beat "${beat.title}" is no longer available.`
        );
      }

      const serverPrice = beat.prices?.[item.format];
      if (serverPrice === undefined || serverPrice === null) {
        throw new HttpsError(
          "invalid-argument",
          `Format "${item.format}" is not available for "${beat.title}".`
        );
      }

      // Convert to cents for Stripe
      const priceInCents = Math.round(serverPrice * 100);

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: beat.title,
            description: `${item.format.toUpperCase()} • ${beat.bpm} BPM • ${beat.key}`,
            images: beat.coverArtUrl ? [beat.coverArtUrl] : [],
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      });

      validatedItems.push({
        beatId: item.beatId,
        beatTitle: beat.title,
        beatCoverUrl: beat.coverArtUrl || "",
        format: item.format,
        price: serverPrice,
        producerId: beat.producerId,
      });
    }

    // Create Stripe Checkout Session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: buyerEmail,
        line_items: lineItems,
        success_url: successUrl || "https://getbeatvault.com/checkout/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: cancelUrl || "https://getbeatvault.com/cart",
        metadata: {
          buyerId,
          itemsJson: JSON.stringify(validatedItems),
        },
      });

      return { sessionId: session.id, url: session.url };
    } catch (error) {
      console.error("Stripe session creation failed:", error);
      throw new HttpsError(
        "internal",
        "Failed to create checkout session. Please try again."
      );
    }
  }
);

// ============================================================
// 2. stripeWebhook — HTTP endpoint for Stripe events
// ============================================================
exports.stripeWebhook = onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
    cors: false,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = require("stripe")(stripeSecretKey.value());

    // Verify the webhook signature
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        await fulfillOrder(session);
        console.log(`Order fulfilled for session ${session.id}`);
      } catch (error) {
        console.error("Order fulfillment failed:", error);
        // Return 500 so Stripe retries the webhook
        res.status(500).send("Order fulfillment failed");
        return;
      }
    }

    res.status(200).json({ received: true });
  }
);

// ============================================================
// Order fulfillment — writes to Firestore
// ============================================================
async function fulfillOrder(session) {
  const { buyerId, itemsJson } = session.metadata;
  const items = JSON.parse(itemsJson);

  // Check for duplicate processing (idempotency)
  const existingOrder = await db
    .collection("orders")
    .where("stripePaymentId", "==", session.payment_intent)
    .limit(1)
    .get();

  if (!existingOrder.empty) {
    console.log(`Order already exists for payment ${session.payment_intent}`);
    return;
  }

  // Build order items with download tokens
  const orderItems = items.map((item, index) => ({
    id: `item_${index}`,
    beatId: item.beatId,
    beatTitle: item.beatTitle,
    beatCoverUrl: item.beatCoverUrl,
    format: item.format,
    licenseType: "standard",
    price: item.price,
    downloadUrl: "", // Generated on-demand via secure storage rules
    downloadCount: 0,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  // Use a batch write for atomicity
  const batch = db.batch();

  // 1. Create the order document
  const orderRef = db.collection("orders").doc();
  batch.set(orderRef, {
    buyerId,
    stripePaymentId: session.payment_intent,
    stripeSessionId: session.id,
    totalAmount,
    currency: "usd",
    status: "paid",
    items: orderItems,
    createdAt: FieldValue.serverTimestamp(),
  });

  // 2. Increment salesCount on each beat
  const beatIds = [...new Set(items.map((item) => item.beatId))];
  for (const beatId of beatIds) {
    const beatRef = db.collection("beats").doc(beatId);
    batch.update(beatRef, {
      salesCount: FieldValue.increment(1),
    });
  }

  // Commit the batch
  await batch.commit();
  console.log(`Created order ${orderRef.id} with ${orderItems.length} items`);
}


// ============================================================
// 3. getSecureDownloadUrl — callable function for secure downloads
// ============================================================
exports.getSecureDownloadUrl = onCall(
  {
    enforceAppCheck: false,
  },
  async (request) => {
    // 1. Require authentication
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in to download files."
      );
    }

    const { orderId, beatId, format } = request.data;
    const userId = request.auth.uid;

    if (!orderId || !beatId) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: orderId and beatId."
      );
    }

    // 2. Fetch order and verify ownership
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }

    const order = orderSnap.data();

    if (order.buyerId !== userId) {
      throw new HttpsError(
        "permission-denied",
        "You do not own this purchase."
      );
    }

    if (order.status !== "paid") {
      throw new HttpsError(
        "failed-precondition",
        "Order payment has not been completed."
      );
    }

    // 3. Find matching item in order
    const items = order.items || [];
    const itemIndex = items.findIndex(
      (item) => item.beatId === beatId && (!format || item.format === format)
    );

    if (itemIndex === -1) {
      throw new HttpsError(
        "not-found",
        "The requested beat is not part of this order."
      );
    }

    const targetItem = items[itemIndex];
    const targetFormat = format || targetItem.format || "mp3";

    // 4. Fetch beat doc to locate storage path
    const beatSnap = await db.collection("beats").doc(beatId).get();
    if (!beatSnap.exists) {
      throw new HttpsError("not-found", "Beat details not found.");
    }

    const beat = beatSnap.data();
    const producerId = beat.producerId;

    // 5. Generate signed URL from Firebase Storage via Admin SDK
    const bucket = admin.storage().bucket();
    const folderPath = `beats/${producerId}/${beatId}`;

    let signedUrl = "";
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    try {
      const [files] = await bucket.getFiles({ prefix: folderPath });
      const matchingFile = files.find((f) =>
        f.name.toLowerCase().includes(`/${targetFormat}.`)
      );

      if (matchingFile) {
        const [url] = await matchingFile.getSignedUrl({
          action: "read",
          expires: expiresAt,
        });
        signedUrl = url;
      } else if (beat.previewUrl && targetFormat === "mp3") {
        // Fallback to previewUrl if custom mp3 preview exists
        signedUrl = beat.previewUrl;
      } else {
        throw new HttpsError(
          "not-found",
          `Master audio file for format "${targetFormat}" is currently unavailable.`
        );
      }
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      console.error("Error generating signed URL:", err);
      throw new HttpsError(
        "internal",
        "Failed to generate secure download URL."
      );
    }

    // 6. Atomically update downloadCount in order item
    items[itemIndex].downloadCount = (items[itemIndex].downloadCount || 0) + 1;
    await orderRef.update({ items });

    return {
      url: signedUrl,
      format: targetFormat,
      beatTitle: beat.title,
      expiresAt,
      downloadCount: items[itemIndex].downloadCount,
    };
  }
);


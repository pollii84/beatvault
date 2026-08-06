import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Beat, BeatPack, Order, Review } from "./types";

// ===== Beat CRUD =====

export async function createBeat(
  beatData: Omit<Beat, "id" | "createdAt" | "avgRating" | "reviewCount" | "salesCount">
): Promise<string> {
  const docRef = await addDoc(collection(db, "beats"), {
    ...beatData,
    avgRating: 0,
    reviewCount: 0,
    salesCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBeat(
  beatId: string,
  data: Partial<Beat>
): Promise<void> {
  const beatRef = doc(db, "beats", beatId);
  await updateDoc(beatRef, { ...data });
}

export async function deactivateBeat(beatId: string): Promise<void> {
  await updateBeat(beatId, { isActive: false });
}

export async function deleteBeat(beatId: string): Promise<void> {
  const beatRef = doc(db, "beats", beatId);
  await deleteDoc(beatRef);
}

export async function getBeat(beatId: string): Promise<Beat | null> {
  const beatRef = doc(db, "beats", beatId);
  const snap = await getDoc(beatRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Beat;
}

export async function getProducerBeats(producerId: string): Promise<Beat[]> {
  const q = query(
    collection(db, "beats"),
    where("producerId", "==", producerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Beat));
}

export async function getActiveBeats(limitCount = 50): Promise<Beat[]> {
  const q = query(
    collection(db, "beats"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Beat));
}

// ===== Order / Purchase CRUD =====

export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserPurchases(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("buyerId", "==", buyerId),
    where("status", "==", "paid"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

// ===== Check if user owns a beat (has purchased it) =====
export async function userOwnsBeat(
  userId: string,
  beatId: string
): Promise<boolean> {
  const q = query(
    collection(db, "orders"),
    where("buyerId", "==", userId),
    where("status", "==", "paid")
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => {
    const order = d.data() as Order;
    return order.items?.some((item) => item.beatId === beatId);
  });
}

// ===== Reviews =====

export async function addReview(
  reviewData: Omit<Review, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getBeatReviews(beatId: string): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    where("beatId", "==", beatId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Review));
}

// ===== Producer Stats =====

export async function getProducerStats(producerId: string) {
  const beats = await getProducerBeats(producerId);
  const totalBeats = beats.length;
  const activeBeats = beats.filter((b) => b.isActive).length;
  const totalSales = beats.reduce((sum, b) => sum + (b.salesCount || 0), 0);
  const avgRating =
    beats.length > 0
      ? beats.reduce((sum, b) => sum + (b.avgRating || 0), 0) / beats.length
      : 0;

  return { totalBeats, activeBeats, totalSales, avgRating };
}

export async function getProducerSales(producerId: string): Promise<Order[]> {
  const beats = await getProducerBeats(producerId);
  const beatIds = beats.map((b) => b.id);
  if (beatIds.length === 0) return [];

  const q = query(
    collection(db, "orders"),
    where("status", "==", "paid"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);

  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Order))
    .filter((order) =>
      order.items?.some((item) => beatIds.includes(item.beatId))
    );
}

// ===== Beat Pack CRUD =====

export async function createBeatPack(
  packData: Omit<BeatPack, "id" | "createdAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, "packs"), {
    ...packData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getBeatPacks(limitCount = 20): Promise<BeatPack[]> {
  try {
    const q = query(
      collection(db, "packs"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as BeatPack));
  } catch (err) {
    console.warn("Error fetching beat packs from Firestore:", err);
    return [];
  }
}

export async function getBeatPack(packId: string): Promise<BeatPack | null> {
  try {
    const packRef = doc(db, "packs", packId);
    const snap = await getDoc(packRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as BeatPack;
  } catch {
    return null;
  }
}

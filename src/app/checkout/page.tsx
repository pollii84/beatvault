"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      setError("Please sign in to complete your purchase.");
      setProcessing(false);
      return;
    }

    try {
      const functions = getFunctions();
      const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");

      const cartItems = items.map((item) => ({
        beatId: item.beatId,
        format: item.format,
      }));

      const result = await createCheckoutSession({
        items: cartItems,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cart`,
      });

      const { url } = result.data as { sessionId: string; url: string };

      if (url) {
        // Clear cart before redirecting (it will be fulfilled by webhook)
        clearCart();
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(errorMessage);
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Nothing to checkout</h1>
        <Link href="/beats" className="btn-primary">Browse Beats</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <Link href="/cart" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={14} /> Back to Cart
      </Link>

      <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: "var(--font-heading)" }}>
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payment Info */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} style={{ color: "var(--accent-purple-light)" }} />
              <h2 className="text-sm font-semibold">Secure Payment</h2>
            </div>

            <div className="space-y-4">
              {/* Stripe info box */}
              <div
                className="rounded-lg p-4 flex items-start gap-3"
                style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
              >
                <Lock size={16} className="mt-0.5 shrink-0" style={{ color: "var(--accent-purple-light)" }} />
                <div>
                  <p className="text-sm font-medium mb-1">Powered by Stripe</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    You&apos;ll be redirected to Stripe&apos;s secure checkout to complete your payment.
                    We never see or store your card details.
                  </p>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="rounded-lg p-3 flex items-start gap-2"
                  style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)" }}
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: "#ef4444" }} />
                  <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer mt-2">
                <input type="checkbox" className="mt-1 accent-purple-500" id="checkout-terms" />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  I agree to the{" "}
                  <a href="#" className="underline" style={{ color: "var(--accent-purple-light)" }}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline" style={{ color: "var(--accent-purple-light)" }}>
                    License Agreement
                  </a>
                </span>
              </label>
            </div>

            <button
              onClick={handleCheckout}
              disabled={processing}
              className="btn-primary w-full justify-center py-3 mt-6 disabled:opacity-60"
              id="pay-btn"
            >
              {processing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Pay ${totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Order Review */}
        <div className="lg:col-span-2">
          <div
            className="rounded-xl p-5 sticky top-24"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Order Review
            </h3>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.beatId}-${item.format}`} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{
                      background: item.beat.coverArtUrl
                        ? `url(${item.beat.coverArtUrl}) center/cover`
                        : "var(--gradient-cool)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.beat.title}</p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {item.format.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-xs font-medium">${item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 space-y-1.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <ShieldCheck size={12} style={{ color: "var(--accent-green)" }} /> Buyer protection
              </div>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <Check size={12} style={{ color: "var(--accent-green)" }} /> Instant download
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

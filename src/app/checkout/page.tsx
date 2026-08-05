"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Check } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const handleCheckout = async () => {
    setProcessing(true);
    // Simulating Stripe checkout
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    setComplete(true);
    clearCart();
  };

  if (complete) {
    return (
      <div className="max-w-lg mx-auto px-6 py-20 text-center animate-fadeIn">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(16, 185, 129, 0.15)" }}
        >
          <Check size={32} style={{ color: "var(--accent-green)" }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          Payment Successful!
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Your beats are ready to download. Check your email for the receipt and download links.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/beats" className="btn-secondary">
            Browse More Beats
          </Link>
        </div>
      </div>
    );
  }

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
        {/* Payment Form */}
        <div className="lg:col-span-3">
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} style={{ color: "var(--accent-purple-light)" }} />
              <h2 className="text-sm font-semibold">Payment Details</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input-field"
                  id="checkout-email"
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                  Card Number
                </label>
                <div
                  className="input-field flex items-center"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Stripe payment form will render here
                  </span>
                </div>
                <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  <Lock size={10} /> Secured by Stripe. We never store your card details.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    Expiry
                  </label>
                  <input type="text" placeholder="MM / YY" className="input-field" id="checkout-expiry" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                    CVC
                  </label>
                  <input type="text" placeholder="123" className="input-field" id="checkout-cvc" />
                </div>
              </div>

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
                "Processing..."
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
                    style={{ background: "var(--gradient-cool)" }}
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

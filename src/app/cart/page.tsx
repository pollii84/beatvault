"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { Trash2, ShoppingCart, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <ShoppingCart size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Your cart is empty
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Discover amazing beats and add them to your cart.
        </p>
        <Link href="/beats" className="btn-primary" id="empty-cart-browse">
          Browse Beats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          Shopping Cart ({items.length})
        </h1>
        <button onClick={clearCart} className="btn-ghost text-sm" style={{ color: "#ef4444" }} id="clear-cart-btn">
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <div
              key={`${item.beatId}-${item.format}`}
              className="flex items-center gap-4 p-4 rounded-xl animate-fadeIn"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div
                className="w-16 h-16 rounded-lg shrink-0"
                style={{
                  background: item.beat.coverArtUrl
                    ? `url(${item.beat.coverArtUrl}) center/cover`
                    : "var(--gradient-cool)",
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{item.beat.title}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {item.beat.producerName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-format text-[10px]">{item.format.toUpperCase()}</span>
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {item.beat.bpm} BPM • {item.beat.key}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: "var(--accent-green)" }}>
                  ${item.price.toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.beatId, item.format)}
                  className="mt-1 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-red-500/10"
                  style={{ color: "var(--text-muted)" }}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
            id="order-summary"
          >
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Order Summary
            </h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Subtotal ({items.length} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Processing Fee</span>
                <span>$0.00</span>
              </div>
            </div>

            <div
              className="flex justify-between py-3 mb-6"
              style={{ borderTop: "1px solid var(--border-subtle)" }}
            >
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Link href="/checkout" className="btn-primary w-full justify-center py-3 mb-3" id="checkout-btn">
              Proceed to Checkout
              <ArrowRight size={16} />
            </Link>

            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <ShieldCheck size={14} style={{ color: "var(--accent-green)" }} />
                Secure payment via Stripe
              </div>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <Zap size={14} style={{ color: "var(--accent-orange)" }} />
                Instant download after purchase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

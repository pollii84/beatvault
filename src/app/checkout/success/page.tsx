"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Download, Music } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [sessionId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("session_id");
    }
    return null;
  });

  return (
    <div className="max-w-lg mx-auto px-6 py-20 text-center animate-fadeIn">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))",
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.15)",
        }}
      >
        <Check size={36} style={{ color: "var(--accent-green)" }} />
      </div>

      <h1
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Payment Successful!
      </h1>

      <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
        Your beats are ready to download from your dashboard.
      </p>

      {sessionId && (
        <p className="text-[10px] mb-6 font-mono" style={{ color: "var(--text-muted)" }}>
          Order ref: {sessionId.slice(0, 20)}...
        </p>
      )}

      {/* What happens next */}
      <div
        className="rounded-xl p-5 mb-8 text-left"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
          What happens next
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(16, 185, 129, 0.15)" }}
            >
              <Check size={12} style={{ color: "var(--accent-green)" }} />
            </div>
            <div>
              <p className="text-sm font-medium">Payment confirmed</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Your payment has been securely processed by Stripe.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(139, 92, 246, 0.15)" }}
            >
              <Download size={12} style={{ color: "var(--accent-purple-light)" }} />
            </div>
            <div>
              <p className="text-sm font-medium">Download your beats</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Head to your dashboard to download your purchased beats.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(251, 146, 60, 0.15)" }}
            >
              <Music size={12} style={{ color: "var(--accent-orange)" }} />
            </div>
            <div>
              <p className="text-sm font-medium">Start creating</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Your license is active immediately. Check your email for the receipt.
              </p>
            </div>
          </div>
        </div>
      </div>

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

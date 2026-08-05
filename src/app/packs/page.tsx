"use client";

import React from "react";
import Link from "next/link";
import { Package, Sparkles, ArrowRight } from "lucide-react";

export default function PacksPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(6, 182, 212, 0.15)" }}
          >
            <Package size={20} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Beat Packs
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Curated bundles at discounted prices — or build your own custom pack.
        </p>
      </div>

      {/* Empty State */}
      <div className="text-center py-20">
        <Package size={56} className="mx-auto mb-5" style={{ color: "var(--text-muted)" }} />
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          No packs available yet
        </h2>
        <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Producers can create beat packs to offer bundled discounts. Check back soon or build your own custom pack.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/packs/builder" className="btn-primary">
            <Sparkles size={16} /> Build Custom Pack
          </Link>
          <Link href="/beats" className="btn-secondary">
            Browse Beats <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

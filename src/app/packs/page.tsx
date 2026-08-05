"use client";

import React from "react";
import Link from "next/link";
import { MOCK_PACKS, MOCK_BEATS } from "@/lib/mockData";
import { Music, Package, ArrowRight, Sparkles } from "lucide-react";

export default function PacksPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Beat Packs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Save big with curated beat bundles. Mix & match to build your perfect collection.
        </p>
      </div>

      {/* Build Your Own Banner */}
      <div
        className="relative rounded-2xl p-8 mb-10 overflow-hidden"
        style={{ background: "var(--gradient-surface)", border: "1px solid var(--border-default)" }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-cyan)" }}>
                Mix & Match
              </span>
            </div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
              Build Your Own Pack
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Pick any beats, choose your formats, and get an automatic bundle discount.
            </p>
          </div>
          <Link href="/packs/builder" className="btn-primary shrink-0" id="build-pack-cta">
            <Package size={16} />
            Start Building
          </Link>
        </div>
      </div>

      {/* Pack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PACKS.map((pack, i) => {
          const packBeats = pack.beatIds
            .map((id) => MOCK_BEATS.find((b) => b.id === id))
            .filter(Boolean);

          const gradients = ["var(--gradient-cool)", "var(--gradient-warm)", "var(--gradient-primary)"];

          return (
            <div
              key={pack.id}
              className="glass-card overflow-hidden animate-fadeIn"
              style={{ animationDelay: `${i * 100}ms` }}
              id={`pack-${pack.id}`}
            >
              {/* Cover */}
              <div
                className="aspect-[2/1] relative"
                style={{ background: gradients[i % gradients.length] }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package size={40} className="text-white/30" />
                </div>
                <div className="absolute top-3 right-3">
                  <span className="badge badge-new">{pack.discountPercent}% OFF</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-semibold mb-1">{pack.title}</h3>
                <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                  by {pack.producerName}
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                  {pack.description}
                </p>

                {/* Beat Previews */}
                <div className="space-y-2 mb-4">
                  {packBeats.map((beat) =>
                    beat ? (
                      <div
                        key={beat.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <div
                          className="w-8 h-8 rounded shrink-0 flex items-center justify-center"
                          style={{ background: "var(--gradient-cool)" }}
                        >
                          <Music size={12} className="text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{beat.title}</p>
                          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {beat.bpm} BPM • {beat.key}
                          </p>
                        </div>
                        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          ${Math.min(...Object.values(beat.prices)).toFixed(2)}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <div>
                    <span className="text-lg font-bold" style={{ color: pack.price === 0 ? "var(--accent-cyan)" : "var(--accent-green)" }}>
                      {pack.price === 0 ? "100% FREE" : `$${pack.price.toFixed(2)}`}
                    </span>
                    <span className="text-xs line-through ml-2" style={{ color: "var(--text-muted)" }}>
                      ${pack.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {pack.beatIds.length} beats
                  </span>
                </div>

                {pack.allowMixMatch && (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium mb-4" style={{ color: "var(--accent-cyan)" }}>
                    <Sparkles size={12} />
                    Customizable — swap beats in this pack
                  </div>
                )}

                <Link
                  href={`/packs/${pack.id}`}
                  className="btn-primary w-full justify-center text-sm"
                  id={`view-pack-${pack.id}`}
                >
                  View Pack
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

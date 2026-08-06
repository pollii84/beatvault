"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getBeatPacks, getProducerBeats } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { BeatPack, Beat } from "@/lib/types";
import CreatePackModal from "@/components/CreatePackModal";
import {
  Package,
  Sparkles,
  ArrowRight,
  Plus,
  Loader2,
  Zap,
  Tag,
} from "lucide-react";

export default function PacksPage() {
  const { user, profile } = useAuth();
  const [packs, setPacks] = useState<BeatPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [producerBeats, setProducerBeats] = useState<Beat[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isProducer = profile?.role === "producer" || profile?.role === "both";

  useEffect(() => {
    async function loadPacksData() {
      setLoading(true);
      try {
        const livePacks = await getBeatPacks(20);
        setPacks(livePacks);
        if (user && isProducer) {
          const pBeats = await getProducerBeats(user.uid);
          setProducerBeats(pBeats);
        }
      } catch (err) {
        console.error("Error loading beat packs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPacksData();
  }, [user, isProducer]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(6, 182, 212, 0.15)" }}
            >
              <Package size={20} style={{ color: "var(--accent-cyan)" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Beat Packs & Bundles
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Curated producer bundles at discounted prices — or build your own custom mix-and-match pack.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/packs/builder" className="btn-primary">
            <Sparkles size={16} /> Mix & Match Builder
          </Link>
          {isProducer && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-secondary"
            >
              <Plus size={16} /> Create Pack
            </button>
          )}
        </div>
      </div>

      {/* Featured Mix & Match CTA Banner */}
      <div
        className="rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.8))",
          border: "1px solid rgba(139, 92, 246, 0.3)",
          boxShadow: "0 8px 32px rgba(139, 92, 246, 0.1)",
        }}
      >
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Zap size={13} /> Exclusive Marketplace Feature
          </div>
          <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Build Your Own Beat Pack & Save up to 50%
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Don&apos;t want a fixed bundle? Hand-pick 3, 5, or 7 beats across any genre or producer and automatically unlock tiered bundle discounts at checkout.
          </p>
        </div>

        <Link
          href="/packs/builder"
          className="btn-primary text-sm py-3 px-6 shrink-0 shadow-lg"
        >
          <Sparkles size={16} /> Open Pack Builder <ArrowRight size={16} />
        </Link>
      </div>

      {/* Curated Packs Catalog */}
      <div>
        <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          Curated Producer Packs
        </h2>

        {loading ? (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-cyan-400" />
            <p className="text-xs text-zinc-400">Loading beat packs from Firestore...</p>
          </div>
        ) : packs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col justify-between transition-all hover:border-purple-500/40 hover:shadow-xl"
              >
                <div>
                  <div
                    className="h-44 w-full relative"
                    style={{
                      background: pack.coverArtUrl
                        ? `url(${pack.coverArtUrl}) center/cover`
                        : "var(--gradient-cool)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-purple-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-lg">
                      {pack.discountPercent}% OFF
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        By {pack.producerName || "BeatVault Producer"}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>
                        {pack.title}
                      </h3>
                      {pack.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                          {pack.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                      <Tag size={13} className="text-cyan-400" />
                      <span>{pack.beatIds?.length || pack.maxBeats || 5} Stems/WAV Beats Included</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between mt-auto">
                  <div>
                    {pack.originalPrice && pack.originalPrice > pack.price && (
                      <span className="text-xs text-zinc-500 line-through block">
                        ${pack.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-lg font-bold text-emerald-400 font-heading">
                      ${pack.price.toFixed(2)} USD
                    </span>
                  </div>

                  <Link
                    href="/packs/builder"
                    className="btn-primary text-xs py-2 px-3.5 gap-1.5"
                  >
                    <Sparkles size={13} /> Customize Pack
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-950/40">
            <Package size={48} className="mx-auto mb-4 text-zinc-500" />
            <h3 className="text-lg font-semibold mb-1 text-white">No fixed packs published yet</h3>
            <p className="text-xs text-zinc-400 mb-6 max-w-sm mx-auto">
              Producers haven&apos;t published fixed bundles yet. Use the Mix & Match Builder to build your custom pack today!
            </p>
            <Link href="/packs/builder" className="btn-primary">
              <Sparkles size={16} /> Open Pack Builder
            </Link>
          </div>
        )}
      </div>

      {/* Create Pack Modal for Producers */}
      {isProducer && user && (
        <CreatePackModal
          isOpen={isCreateModalOpen}
          producerBeats={producerBeats}
          producerId={user.uid}
          producerName={profile?.displayName || "Producer"}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newPack) => {
            setPacks((prev) => [newPack, ...prev]);
          }}
        />
      )}
    </div>
  );
}

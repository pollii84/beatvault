"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_PACKS, MOCK_BEATS } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { usePlayer } from "@/contexts/PlayerContext";
import BeatCard from "@/components/BeatCard";
import {
  Package,
  Play,
  Pause,
  ShoppingCart,
  Sparkles,
  Music,
  Check,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

export default function PackDetailPage() {
  const params = useParams();
  const packId = params.packId as string;
  const pack = MOCK_PACKS.find((p) => p.id === packId);

  const { currentBeat, isPlaying, togglePlay } = usePlayer();
  const { addItem, isInCart } = useCart();

  // Selected beat IDs for customizable pack
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>(
    pack ? pack.beatIds : []
  );

  if (!pack) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Pack Not Found</h1>
        <Link href="/packs" className="btn-primary">
          Browse Packs
        </Link>
      </div>
    );
  }

  const selectedBeats = selectedBeatIds
    .map((id) => MOCK_BEATS.find((b) => b.id === id))
    .filter(Boolean);

  const availableBeats = MOCK_BEATS.filter(
    (b) => b.producerId === pack.producerId || pack.allowMixMatch
  );

  const handleSwapBeat = (oldBeatId: string, newBeatId: string) => {
    setSelectedBeatIds((prev) =>
      prev.map((id) => (id === oldBeatId ? newBeatId : id))
    );
  };

  const addPackToCart = () => {
    // Add each beat in the pack with MP3 or default format to cart
    selectedBeats.forEach((beat) => {
      if (beat && !isInCart(beat.id, "mp3")) {
        addItem(beat, "mp3");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link href="/packs" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={14} /> Back to Packs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pack Info & Beats List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Banner */}
          <div
            className="relative rounded-2xl p-8 overflow-hidden flex flex-col justify-end min-h-[220px]"
            style={{ background: "var(--gradient-cool)" }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative z-10">
              <span className="badge badge-new mb-3">-{pack.discountPercent}% OFF</span>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {pack.title}
              </h1>
              <p className="text-sm text-white/80">by {pack.producerName}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {pack.description}
          </p>

          {pack.allowMixMatch && (
            <div
              className="flex items-center gap-2 p-3.5 rounded-xl"
              style={{
                background: "rgba(6, 182, 212, 0.1)",
                border: "1px solid rgba(6, 182, 212, 0.2)",
              }}
            >
              <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--accent-cyan)" }}>
                Mix & Match Enabled: You can swap beats in this pack with any other available tracks!
              </p>
            </div>
          )}

          {/* Included Beats List */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Included Beats ({selectedBeats.length})
            </h2>

            <div className="space-y-3">
              {selectedBeats.map((beat) => {
                if (!beat) return null;
                const isCurrentlyPlaying = currentBeat?.id === beat.id && isPlaying;

                return (
                  <div
                    key={beat.id}
                    className="flex items-center justify-between p-4 rounded-xl transition-all"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={() => togglePlay(beat)}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {isCurrentlyPlaying ? (
                          <Pause size={16} className="text-white" />
                        ) : (
                          <Play size={16} className="text-white ml-0.5" />
                        )}
                      </button>
                      <div className="min-w-0">
                        <Link href={`/beats/${beat.id}`} className="font-semibold text-sm hover:text-purple-400 truncate block">
                          {beat.title}
                        </Link>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {beat.bpm} BPM • {beat.key} • {beat.genres.join(", ")}
                        </p>
                      </div>
                    </div>

                    {pack.allowMixMatch && (
                      <div className="flex items-center gap-2">
                        <select
                          className="input-field text-xs py-1.5 px-2.5 w-auto"
                          value={beat.id}
                          onChange={(e) => handleSwapBeat(beat.id, e.target.value)}
                        >
                          <option value={beat.id}>Current: {beat.title}</option>
                          {availableBeats
                            .filter((b) => !selectedBeatIds.includes(b.id))
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                Swap to: {b.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div>
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--text-muted)" }}>
              Bundle Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Individual Total</span>
                <span className="line-through" style={{ color: "var(--text-muted)" }}>
                  ${pack.originalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Bundle Discount</span>
                <span style={{ color: "var(--accent-pink)" }}>-{pack.discountPercent}%</span>
              </div>
              <div
                className="flex justify-between py-3"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <span className="font-semibold">Pack Price</span>
                <span className="text-xl font-bold" style={{ color: pack.price === 0 ? "var(--accent-cyan)" : "var(--accent-green)", fontFamily: "var(--font-heading)" }}>
                  {pack.price === 0 ? "100% FREE" : `$${pack.price.toFixed(2)}`}
                </span>
              </div>
            </div>

            {pack.price === 0 ? (
              <Link
                href="/orders/starter-kit-free"
                className="btn-primary w-full justify-center py-3 mb-3 bg-gradient-to-r from-cyan-500 to-purple-600"
                id="claim-free-pack-btn"
              >
                <Sparkles size={16} />
                Claim & Download Free Pack
              </Link>
            ) : (
              <button
                onClick={addPackToCart}
                className="btn-primary w-full justify-center py-3 mb-3"
                id="buy-pack-btn"
              >
                <ShoppingCart size={16} />
                Add Pack Beats to Cart
              </button>
            )}

            <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
              Instant WAV/MP3 delivery upon purchase • Commercial license included
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

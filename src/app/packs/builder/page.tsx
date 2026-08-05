"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_BEATS } from "@/lib/mockData";
import { useCart } from "@/contexts/CartContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { Beat } from "@/lib/types";
import {
  Package,
  Plus,
  Trash2,
  Play,
  Pause,
  ShoppingCart,
  Sparkles,
  ArrowLeft,
  Check,
} from "lucide-react";

export default function PackBuilderPage() {
  const [selectedBeats, setSelectedBeats] = useState<Beat[]>([]);
  const { currentBeat, isPlaying, togglePlay } = usePlayer();
  const { addItem, isInCart } = useCart();

  const maxBeats = 5;

  const toggleBeatSelection = (beat: Beat) => {
    setSelectedBeats((prev) => {
      const exists = prev.some((b) => b.id === beat.id);
      if (exists) {
        return prev.filter((b) => b.id !== beat.id);
      }
      if (prev.length >= maxBeats) return prev;
      return [...prev, beat];
    });
  };

  // Calculate dynamic bundle discount: 3 beats = 15%, 4 beats = 25%, 5 beats = 35%
  const discountPercent =
    selectedBeats.length >= 5
      ? 35
      : selectedBeats.length >= 4
      ? 25
      : selectedBeats.length >= 3
      ? 15
      : 0;

  const rawTotal = selectedBeats.reduce(
    (sum, b) => sum + Math.min(...Object.values(b.prices)),
    0
  );

  const discountedTotal = rawTotal * (1 - discountPercent / 100);

  const handleAddAllToCart = () => {
    selectedBeats.forEach((b) => {
      if (!isInCart(b.id, "wav")) {
        addItem(b, "wav");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link href="/packs" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={14} /> Back to Packs
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ background: "rgba(6, 182, 212, 0.12)", color: "var(--accent-cyan)" }}>
          <Sparkles size={14} /> Mix & Match Builder
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Custom Beat Pack Builder
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Select up to 5 beats from any producer. Unlock up to 35% off when you bundle!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Beats Selector */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Select Beats ({selectedBeats.length}/{maxBeats})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_BEATS.map((beat) => {
              const isSelected = selectedBeats.some((b) => b.id === beat.id);
              const isCurrentlyPlaying = currentBeat?.id === beat.id && isPlaying;
              const minPrice = Math.min(...Object.values(beat.prices));

              return (
                <div
                  key={beat.id}
                  className="glass-card p-4 flex items-center gap-3 transition-all"
                  style={{
                    borderColor: isSelected ? "var(--accent-cyan)" : "var(--border-subtle)",
                    background: isSelected ? "rgba(6, 182, 212, 0.08)" : "var(--glass-bg)",
                  }}
                >
                  <button
                    onClick={() => togglePlay(beat)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {isCurrentlyPlaying ? (
                      <Pause size={16} className="text-white" />
                    ) : (
                      <Play size={16} className="text-white ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{beat.title}</p>
                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                      {beat.producerName} • {beat.bpm} BPM
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold" style={{ color: "var(--accent-green)" }}>
                      ${minPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => toggleBeatSelection(beat)}
                      className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform"
                      style={{
                        background: isSelected ? "var(--accent-cyan)" : "var(--bg-surface)",
                        color: isSelected ? "black" : "white",
                      }}
                    >
                      {isSelected ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Builder Summary Sidebar */}
        <div>
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Pack Summary
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}>
                {selectedBeats.length} / {maxBeats} selected
              </span>
            </div>

            {/* Selected Beats List */}
            {selectedBeats.length > 0 ? (
              <div className="space-y-2 mb-4">
                {selectedBeats.map((b) => (
                  <div key={b.id} className="flex items-center justify-between text-xs p-2 rounded" style={{ background: "var(--bg-tertiary)" }}>
                    <span className="truncate pr-2">{b.title}</span>
                    <button onClick={() => toggleBeatSelection(b)} className="text-red-400 hover:text-red-300">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs" style={{ color: "var(--text-muted)" }}>
                Click + on beats to add them to your custom pack.
              </div>
            )}

            {/* Discount Tier Status */}
            <div className="p-3 rounded-lg mb-4 text-xs space-y-1" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <div className="flex justify-between font-semibold">
                <span>Bundle Discount:</span>
                <span style={{ color: "var(--accent-pink)" }}>{discountPercent}% OFF</span>
              </div>
              <p style={{ color: "var(--text-muted)" }}>
                {selectedBeats.length < 3
                  ? "Add 3 beats for 15% off!"
                  : selectedBeats.length < 4
                  ? "Add 4 beats for 25% off!"
                  : selectedBeats.length < 5
                  ? "Add 5 beats for 35% off!"
                  : "Max discount unlocked (35% OFF)!"}
              </p>
            </div>

            {/* Pricing */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>Regular Price</span>
                <span className="line-through" style={{ color: "var(--text-muted)" }}>
                  ${rawTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span>Bundled Price</span>
                <span className="text-xl" style={{ color: "var(--accent-green)", fontFamily: "var(--font-heading)" }}>
                  ${discountedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={selectedBeats.length === 0}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50"
            >
              <ShoppingCart size={16} />
              Add Custom Pack to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getActiveBeats } from "@/lib/firestore";
import { useCart } from "@/contexts/CartContext";
import { usePlayer } from "@/contexts/PlayerContext";
import { Beat, GENRES } from "@/lib/types";
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
  Search,
  Filter,
  Loader2,
  Zap,
} from "lucide-react";

export default function PackBuilderPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeats, setSelectedBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const { currentBeat, isPlaying, togglePlay } = usePlayer();
  const { addItem, isInCart } = useCart();

  const maxBeats = 7;

  useEffect(() => {
    async function loadBeats() {
      setLoading(true);
      try {
        const liveBeats = await getActiveBeats(100);
        setBeats(liveBeats);
      } catch (err) {
        console.error("Error loading beats for Pack Builder:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBeats();
  }, []);

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

  // Filter beats by search & genre
  const filteredBeats = beats.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.producerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre =
      selectedGenre === "All" || b.genres?.includes(selectedGenre);

    return matchesSearch && matchesGenre;
  });

  // Calculate dynamic bundle discount
  const discountPercent =
    selectedBeats.length >= 7
      ? 50
      : selectedBeats.length >= 5
      ? 35
      : selectedBeats.length >= 3
      ? 20
      : 0;

  const rawTotal = selectedBeats.reduce(
    (sum, b) => sum + (b.prices?.wav || 39.99),
    0
  );

  const savingsAmount = rawTotal * (discountPercent / 100);
  const discountedTotal = rawTotal - savingsAmount;

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

      {/* Hero Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ background: "rgba(6, 182, 212, 0.12)", color: "var(--accent-cyan)" }}
        >
          <Sparkles size={14} /> Dynamic Mix & Match Engine
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Custom Beat Pack Builder
        </h1>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Hand-pick 3 to 7 beats across any genre or producer. Unlock up to 50% OFF instant bundle discounts!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Beats Selector */}
        <div className="lg:col-span-2 space-y-5">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-3"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search catalog beats, producers, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-xs w-full"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
              <Filter size={14} className="text-zinc-400 shrink-0" />
              {["All", "Hip Hop", "Trap", "R&B", "House", "Drill", "Pop"].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                    selectedGenre === g
                      ? "bg-purple-500 text-white font-bold"
                      : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Available Beats ({filteredBeats.length})
            </h2>
            <span className="text-xs text-zinc-400">
              Selected: <strong className="text-cyan-400">{selectedBeats.length}</strong> / {maxBeats}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-cyan-400" />
              <p className="text-xs text-zinc-400">Loading catalog beats from Firestore...</p>
            </div>
          ) : filteredBeats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBeats.map((beat) => {
                const isSelected = selectedBeats.some((b) => b.id === beat.id);
                const isCurrentlyPlaying = currentBeat?.id === beat.id && isPlaying;
                const wavPrice = beat.prices?.wav || 39.99;

                return (
                  <div
                    key={beat.id}
                    className="p-4 rounded-xl flex items-center gap-3 transition-all border"
                    style={{
                      borderColor: isSelected ? "var(--accent-cyan)" : "var(--border-subtle)",
                      background: isSelected
                        ? "rgba(6, 182, 212, 0.08)"
                        : "var(--bg-secondary)",
                    }}
                  >
                    <button
                      onClick={() => togglePlay(beat)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 cursor-pointer shadow-md"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {isCurrentlyPlaying ? (
                        <Pause size={16} className="text-white" />
                      ) : (
                        <Play size={16} className="text-white ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-white">{beat.title}</p>
                      <p className="text-xs truncate text-zinc-400">
                        {beat.producerName} • {beat.bpm} BPM • {beat.key}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-400">
                        ${wavPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => toggleBeatSelection(beat)}
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                        style={{
                          background: isSelected ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.1)",
                          color: isSelected ? "black" : "white",
                        }}
                        title={isSelected ? "Remove from pack" : "Add to pack"}
                      >
                        {isSelected ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-950/40">
              <Package size={40} className="mx-auto mb-3 text-zinc-500" />
              <p className="text-sm font-semibold text-zinc-300">No beats matched your filter</p>
              <p className="text-xs text-zinc-500 mt-1">Try clearing search filters or changing genre.</p>
            </div>
          )}
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
              <span
                className="text-xs font-mono px-2 py-0.5 rounded font-bold"
                style={{ background: "var(--bg-tertiary)", color: "var(--accent-cyan)" }}
              >
                {selectedBeats.length} / {maxBeats} selected
              </span>
            </div>

            {/* Selected Beats List */}
            {selectedBeats.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {selectedBeats.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between text-xs p-2 rounded bg-zinc-950/60 border border-zinc-800/60"
                  >
                    <span className="truncate pr-2 text-zinc-200">{b.title}</span>
                    <button
                      onClick={() => toggleBeatSelection(b)}
                      className="text-red-400 hover:text-red-300 p-0.5 shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-zinc-500">
                Click <Plus size={12} className="inline mx-0.5" /> on beats to build your custom bundle.
              </div>
            )}

            {/* Discount Tier Status Banner */}
            <div
              className="p-3.5 rounded-xl mb-4 text-xs space-y-1.5 border"
              style={{
                background: discountPercent > 0 ? "rgba(16, 185, 129, 0.08)" : "rgba(139, 92, 246, 0.08)",
                borderColor: discountPercent > 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(139, 92, 246, 0.2)",
              }}
            >
              <div className="flex justify-between font-bold">
                <span className="flex items-center gap-1">
                  <Zap size={13} className={discountPercent > 0 ? "text-emerald-400" : "text-purple-400"} />
                  Tier Discount:
                </span>
                <span className={discountPercent > 0 ? "text-emerald-400 text-sm" : "text-purple-300"}>
                  {discountPercent}% OFF
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                {selectedBeats.length < 3
                  ? "Select 3 beats to unlock 20% OFF!"
                  : selectedBeats.length < 5
                  ? "Select 5 beats to unlock 35% OFF!"
                  : selectedBeats.length < 7
                  ? "Select 7 beats to unlock MAX 50% OFF!"
                  : "🎉 MAX 50% OFF Discount Unlocked!"}
              </p>
            </div>

            {/* Pricing Details */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Standard Total ({selectedBeats.length} beats)</span>
                <span className="line-through">${rawTotal.toFixed(2)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-medium">
                  <span>Bundle Savings ({discountPercent}% OFF)</span>
                  <span>-${savingsAmount.toFixed(2)}</span>
                </div>
              )}

              <div
                className="flex justify-between text-sm font-bold pt-2 border-t border-zinc-800"
              >
                <span className="text-white">Bundled Price</span>
                <span className="text-xl text-emerald-400 font-heading">
                  ${discountedTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddAllToCart}
              disabled={selectedBeats.length === 0}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50 gap-2"
            >
              <ShoppingCart size={16} />
              Add Bundle to Cart (${discountedTotal.toFixed(2)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

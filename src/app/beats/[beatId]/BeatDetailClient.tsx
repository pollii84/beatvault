"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_BEATS } from "@/lib/mockData";
import { getBeat } from "@/lib/firestore";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCart } from "@/contexts/CartContext";
import { Beat, BeatFormat, FORMATS } from "@/lib/types";
import BeatCard from "@/components/BeatCard";
import {
  Play,
  Pause,
  Heart,
  ShoppingCart,
  Star,
  Clock,
  Disc3,
  Music2,
  Share2,
  Check,
  ChevronRight,
} from "lucide-react";

export default function BeatDetailClient() {
  const params = useParams();
  const beatId = params.beatId as string;
  const [beat, setBeat] = useState<Beat | null>(() => {
    return MOCK_BEATS.find((b) => b.id === beatId) || null;
  });
  const [loading, setLoading] = useState(!beat);

  useEffect(() => {
    async function loadBeat() {
      try {
        const fetched = await getBeat(beatId);
        if (fetched) {
          setBeat(fetched);
        }
      } catch (err) {
        console.error("Failed to load beat from Firestore:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBeat();
  }, [beatId]);

  const activeBeat = beat || MOCK_BEATS[0];
  const { currentBeat, isPlaying, togglePlay, progress } = usePlayer();
  const { addItem, isInCart } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<BeatFormat>("wav");

  const isCurrentlyPlaying = currentBeat?.id === activeBeat.id && isPlaying;
  const relatedBeats = MOCK_BEATS.filter(
    (b) => b.id !== activeBeat.id && b.genres.some((g) => activeBeat.genres.includes(g))
  ).slice(0, 4);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const reviews = [
    { id: 1, user: "MelodyMaker99", rating: 5, comment: "Incredible beat! Perfect for my project. The 808s hit so hard.", date: "2 days ago" },
    { id: 2, user: "VocalVibes", rating: 4, comment: "Great vibe, very well mixed. Would love more variations in the stems.", date: "1 week ago" },
    { id: 3, user: "BeatCrafter", rating: 5, comment: "This producer never misses. Instant purchase.", date: "2 weeks ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/beats" className="hover:text-white transition-colors">Beats</Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-secondary)" }}>{activeBeat.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-6" style={{ background: "var(--gradient-cool)" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => togglePlay(activeBeat)}
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                id="detail-play-btn"
              >
                {isCurrentlyPlaying ? (
                  <Pause size={32} className="text-white" />
                ) : (
                  <Play size={32} className="text-white ml-1" />
                )}
              </button>
            </div>

            {currentBeat?.id === activeBeat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="h-full" style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
              </div>
            )}
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {activeBeat.title}
              </h1>
              <Link
                href={`/profile/${activeBeat.producerId}`}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--accent-purple-light)" }}
              >
                by {activeBeat.producerName}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-icon" title="Add to Wishlist" id="detail-wishlist-btn">
                <Heart size={18} />
              </button>
              <button className="btn-icon" title="Share" id="detail-share-btn">
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            {activeBeat.genres?.map((g) => (
              <span key={g} className="badge badge-genre">{g}</span>
            ))}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Disc3 size={12} /> {activeBeat.bpm} BPM
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Music2 size={12} /> Key of {activeBeat.key}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Clock size={12} /> {formatDuration(activeBeat.duration || 180)}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#fbbf24" }}>
              <Star size={12} fill="#fbbf24" /> {(activeBeat.avgRating || 5).toFixed(1)} ({activeBeat.reviewCount || 0} reviews)
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-2">About this beat</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {activeBeat.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Reviews ({activeBeat.reviewCount || 0})
            </h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{review.user}</span>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{review.date}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Choose Format
            </h3>

            <div className="space-y-2 mb-6">
              {FORMATS.filter((f) => activeBeat.formats?.includes(f.value) || (activeBeat.prices && activeBeat.prices[f.value] !== undefined)).map((fmt) => {
                const price = activeBeat.prices ? activeBeat.prices[fmt.value] : undefined;
                if (price === undefined) return null;
                const isSelected = selectedFormat === fmt.value;
                return (
                  <button
                    key={fmt.value}
                    onClick={() => setSelectedFormat(fmt.value)}
                    className="w-full flex items-center justify-between p-3.5 rounded-lg cursor-pointer transition-all text-left"
                    style={{
                      background: isSelected ? "rgba(139, 92, 246, 0.1)" : "var(--bg-tertiary)",
                      border: `1px solid ${isSelected ? "var(--border-accent)" : "var(--border-subtle)"}`,
                    }}
                  >
                    <span className="text-sm font-medium">{fmt.label}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--accent-green)" }}>
                      {price === 0 ? "FREE" : `$${price.toFixed(2)}`}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => addItem(activeBeat, selectedFormat)}
              disabled={isInCart(activeBeat.id, selectedFormat)}
              className="btn-primary w-full justify-center py-3 mb-3 disabled:opacity-70"
            >
              {isInCart(activeBeat.id, selectedFormat) ? <Check size={16} /> : <ShoppingCart size={16} />}
              {isInCart(activeBeat.id, selectedFormat) ? "Added to Cart" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

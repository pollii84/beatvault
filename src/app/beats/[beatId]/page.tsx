"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_BEATS } from "@/lib/mockData";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCart } from "@/contexts/CartContext";
import { BeatFormat, FORMATS } from "@/lib/types";
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
  Flag,
  Check,
  ChevronRight,
} from "lucide-react";

export default function BeatDetailPage() {
  const params = useParams();
  const beatId = params.beatId as string;
  const beat = MOCK_BEATS.find((b) => b.id === beatId);
  const { currentBeat, isPlaying, togglePlay, progress } = usePlayer();
  const { addItem, isInCart } = useCart();
  const [selectedFormat, setSelectedFormat] = useState<BeatFormat>("wav");

  if (!beat) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Beat not found</h1>
        <Link href="/beats" className="btn-primary">
          Browse Beats
        </Link>
      </div>
    );
  }

  const isCurrentlyPlaying = currentBeat?.id === beat.id && isPlaying;
  const relatedBeats = MOCK_BEATS.filter(
    (b) => b.id !== beat.id && b.genres.some((g) => beat.genres.includes(g))
  ).slice(0, 4);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // Mock reviews
  const reviews = [
    { id: 1, user: "MelodyMaker99", rating: 5, comment: "Incredible beat! Perfect for my project. The 808s hit so hard.", date: "2 days ago" },
    { id: 2, user: "VocalVibes", rating: 4, comment: "Great vibe, very well mixed. Would love more variations in the stems.", date: "1 week ago" },
    { id: 3, user: "BeatCrafter", rating: 5, comment: "This producer never misses. Instant purchase.", date: "2 weeks ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/beats" className="hover:text-white transition-colors">Beats</Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--text-secondary)" }}>{beat.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — Cover + Player */}
        <div className="lg:col-span-2">
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-6" style={{ background: "var(--gradient-cool)" }}>
            {/* Large Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => togglePlay(beat)}
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

            {/* Progress bar overlay */}
            {currentBeat?.id === beat.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(0,0,0,0.3)" }}>
                <div className="h-full" style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
              </div>
            )}

            {/* Equalizer */}
            {isCurrentlyPlaying && (
              <div className="absolute bottom-4 left-4 equalizer">
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
                <div className="bar" />
              </div>
            )}
          </div>

          {/* Title & Producer */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
                {beat.title}
              </h1>
              <Link
                href={`/profile/${beat.producerId}`}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--accent-purple-light)" }}
              >
                by {beat.producerName}
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

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {beat.genres.map((g) => (
              <span key={g} className="badge badge-genre">{g}</span>
            ))}
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Disc3 size={12} /> {beat.bpm} BPM
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Music2 size={12} /> Key of {beat.key}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Clock size={12} /> {formatDuration(beat.duration)}
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "#fbbf24" }}>
              <Star size={12} fill="#fbbf24" /> {beat.avgRating.toFixed(1)} ({beat.reviewCount} reviews)
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-2">About this beat</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {beat.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {beat.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2.5 py-1 rounded-full"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Reviews ({beat.reviewCount})
            </h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 rounded-xl"
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        {review.user[0]}
                      </div>
                      <span className="text-sm font-medium">{review.user}</span>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{review.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={i < review.rating ? "#fbbf24" : "none"}
                        color={i < review.rating ? "#fbbf24" : "var(--text-muted)"}
                      />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Pricing Card */}
        <div>
          <div
            className="rounded-xl p-6 sticky top-24"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
            }}
            id="pricing-card"
          >
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Choose Format
            </h3>

            <div className="space-y-2 mb-6">
              {FORMATS.filter((f) => beat.formats.includes(f.value) || beat.prices[f.value]).map((fmt) => {
                const price = beat.prices[fmt.value];
                if (!price) return null;
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
                    id={`format-${fmt.value}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isSelected ? "var(--accent-purple)" : "var(--text-muted)",
                        }}
                      >
                        {isSelected && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent-purple)" }} />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{fmt.label}</span>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {fmt.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--accent-green)" }}>
                      ${price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between py-3 mb-4"
              style={{ borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Total</span>
              <span className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                ${beat.prices[selectedFormat]?.toFixed(2) ?? "—"}
              </span>
            </div>

            {/* Add to Cart */}
            <button
              onClick={() => addItem(beat, selectedFormat)}
              disabled={isInCart(beat.id, selectedFormat)}
              className="btn-primary w-full justify-center py-3 mb-3 disabled:opacity-70"
              id="add-to-cart-detail"
            >
              {isInCart(beat.id, selectedFormat) ? (
                <>
                  <Check size={16} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              )}
            </button>

            <p className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>
              Instant download after purchase • Secure payment via Stripe
            </p>

            {/* Producer Card */}
            <div
              className="mt-6 p-4 rounded-lg"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {beat.producerName[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{beat.producerName}</p>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {beat.salesCount}+ sales
                  </p>
                </div>
              </div>
              <Link
                href={`/profile/${beat.producerId}`}
                className="btn-secondary w-full justify-center text-xs"
              >
                View Profile
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Beats */}
      {relatedBeats.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
            Similar Beats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedBeats.map((b) => (
              <BeatCard key={b.id} beat={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

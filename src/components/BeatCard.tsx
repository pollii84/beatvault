"use client";

import React from "react";
import Link from "next/link";
import { Beat } from "@/lib/types";
import { usePlayer } from "@/contexts/PlayerContext";
import { useCart } from "@/contexts/CartContext";
import { Play, Pause, ShoppingCart, Heart, Star } from "lucide-react";

interface BeatCardProps {
  beat: Beat;
  onWishlistToggle?: (beatId: string) => void;
  isWishlisted?: boolean;
}

export default function BeatCard({ beat, onWishlistToggle, isWishlisted = false }: BeatCardProps) {
  const { currentBeat, isPlaying, togglePlay } = usePlayer();
  const { addItem, isInCart } = useCart();
  const isCurrentlyPlaying = currentBeat?.id === beat.id && isPlaying;

  const lowestPrice = Math.min(...Object.values(beat.prices));

  return (
    <div className="glass-card group relative overflow-hidden" id={`beat-card-${beat.id}`}>
      {/* Cover Art */}
      <div className="relative aspect-square overflow-hidden rounded-t-[15px]">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: beat.coverArtUrl
              ? `url(${beat.coverArtUrl})`
              : undefined,
            background: beat.coverArtUrl
              ? undefined
              : "var(--gradient-cool)",
          }}
        />

        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              togglePlay(beat);
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-strong)",
            }}
            id={`play-btn-${beat.id}`}
          >
            {isCurrentlyPlaying ? (
              <Pause size={22} className="text-white" />
            ) : (
              <Play size={22} className="text-white ml-1" />
            )}
          </button>
        </div>

        {/* Equalizer indicator when playing */}
        {isCurrentlyPlaying && (
          <div className="absolute bottom-3 left-3 equalizer">
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
            <div className="bar" />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.(beat.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(8px)",
          }}
          id={`wishlist-btn-${beat.id}`}
        >
          <Heart
            size={14}
            fill={isWishlisted ? "var(--accent-pink)" : "none"}
            color={isWishlisted ? "var(--accent-pink)" : "white"}
          />
        </button>

        {/* Genre & Free Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {beat.isFree && (
            <span className="badge badge-new text-[10px] font-bold tracking-wider uppercase">FREE DEMO</span>
          )}
          {beat.genres[0] && (
            <span className="badge badge-genre text-[10px]">{beat.genres[0]}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <Link href={`/beats/${beat.id}`}>
          <h3 className="font-semibold text-sm truncate hover:text-purple-400 transition-colors">
            {beat.title}
          </h3>
        </Link>
        <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
          {beat.producerName}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}>
            {beat.bpm} BPM
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded" style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}>
            {beat.key}
          </span>
          {beat.avgRating > 0 && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#fbbf24" }}>
              <Star size={10} fill="#fbbf24" />
              {beat.avgRating.toFixed(1)}
            </span>
          )}
        </div>

        {/* Price + Add to Cart */}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <span className="text-sm font-bold" style={{ color: lowestPrice === 0 ? "var(--accent-cyan)" : "var(--accent-green)" }}>
            {lowestPrice === 0 ? "FREE DEMO" : `$${lowestPrice.toFixed(2)}`}
            {lowestPrice > 0 && (
              <span className="text-[10px] font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                +
              </span>
            )}
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              const defaultFormat = beat.formats[0];
              if (!isInCart(beat.id, defaultFormat)) {
                addItem(beat, defaultFormat);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full cursor-pointer transition-all"
            style={{
              background: isInCart(beat.id, beat.formats[0])
                ? "rgba(16, 185, 129, 0.15)"
                : "var(--bg-surface)",
              border: `1px solid ${isInCart(beat.id, beat.formats[0]) ? "rgba(16, 185, 129, 0.3)" : "var(--border-subtle)"}`,
              color: isInCart(beat.id, beat.formats[0])
                ? "var(--accent-green)"
                : "var(--text-secondary)",
            }}
            id={`add-cart-${beat.id}`}
          >
            <ShoppingCart size={12} />
            {isInCart(beat.id, beat.formats[0]) ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

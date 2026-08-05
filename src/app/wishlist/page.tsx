"use client";

import React, { useState } from "react";
import Link from "next/link";
import BeatCard from "@/components/BeatCard";
import { MOCK_BEATS } from "@/lib/mockData";
import { Heart, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const wishlistedBeats = MOCK_BEATS.filter((b) => wishlistedIds.includes(b.id));

  const removeFromWishlist = (beatId: string) => {
    setWishlistedIds((prev) => prev.filter((id) => id !== beatId));
  };

  if (wishlistedBeats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Heart size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Your wishlist is empty
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          Save beats you love to find them easily later.
        </p>
        <Link href="/beats" className="btn-primary">
          Browse Beats
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Wishlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {wishlistedBeats.length} beat{wishlistedBeats.length !== 1 ? "s" : ""} saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {wishlistedBeats.map((beat, i) => (
          <div key={beat.id} className="animate-fadeIn" style={{ animationDelay: `${i * 60}ms` }}>
            <BeatCard
              beat={beat}
              isWishlisted={true}
              onWishlistToggle={removeFromWishlist}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

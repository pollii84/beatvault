"use client";

import React from "react";
import Link from "next/link";
import BeatCard from "@/components/BeatCard";
import { MOCK_BEATS } from "@/lib/mockData";
import { GENRES } from "@/lib/types";
import {
  ArrowRight,
  TrendingUp,
  Headphones,
  Zap,
  Shield,
  Download,
  Star,
  Package,
  Sparkles,
  Wand2,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  const featuredBeats = MOCK_BEATS.slice(0, 4);
  const trendingBeats = MOCK_BEATS.slice(2, 6);
  const topGenres = GENRES.slice(0, 8);

  return (
    <div>
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden" id="hero-section">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.12), transparent 60%)",
              top: "-300px",
              right: "-200px",
            }}
          />
          <div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 60%)",
              bottom: "-200px",
              left: "-100px",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(236, 72, 153, 0.06), transparent 60%)",
              top: "50%",
              left: "40%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl">
            {/* Tag */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 animate-fadeIn"
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                color: "var(--accent-purple-light)",
              }}
            >
              <Sparkles size={12} />
              Over 10,000+ premium beats available
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 animate-fadeIn"
              style={{ fontFamily: "var(--font-heading)", animationDelay: "100ms" }}
            >
              Find Your{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Perfect Beat
              </span>
              <br />
              Start Creating
            </h1>

            <p
              className="text-lg sm:text-xl max-w-xl mb-8 animate-fadeIn"
              style={{ color: "var(--text-secondary)", animationDelay: "200ms" }}
            >
              Discover studio-quality beat samples from top producers. Browse WAV, MP3, FLAC, and STEMS
              formats — mix, match, and download instantly.
            </p>

            <div className="flex flex-wrap items-center gap-3 animate-fadeIn" style={{ animationDelay: "300ms" }}>
              <Link href="/beats" className="btn-primary text-base px-8 py-3" id="hero-browse-cta">
                <Headphones size={18} />
                Browse Beats
              </Link>
              <Link href="/match" className="btn-secondary text-base px-6 py-3 border-amber-500/40 text-amber-300 hover:text-amber-200" id="hero-match-cta">
                <Wand2 size={18} />
                Match My Track (AI)
              </Link>
              <Link href="/learn" className="btn-secondary text-base px-6 py-3 border-purple-500/40 text-purple-300 hover:text-purple-200" id="hero-learn-cta">
                <BookOpen size={18} />
                Masterclass
              </Link>
            </div>

            {/* Stats */}
            <div
              className="flex items-center gap-8 mt-12 pt-8 animate-fadeIn"
              style={{ borderTop: "1px solid var(--border-subtle)", animationDelay: "400ms" }}
            >
              {[
                { value: "10K+", label: "Beats" },
                { value: "2.5K+", label: "Producers" },
                { value: "50K+", label: "Downloads" },
                { value: "4.9★", label: "Avg Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Feature Spotlight: AI Matcher & Fred Again Masterclass ===== */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: AI Smart Beat Matcher */}
          <div
            className="p-6 md:p-8 rounded-2xl border border-amber-500/30 space-y-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.9))",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Wand2 size={13} /> Feature 8: AI Innovation
            </div>
            <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              AI Smart Beat Matcher v1
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Upload a vocal take or record a 10s voice memo. Our AI detects key, BPM, and mood to rank catalog beats using Camelot Wheel harmonic compatibility.
            </p>
            <div className="pt-2">
              <Link href="/match" className="btn-primary text-xs py-2.5 px-5 gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold">
                <Wand2 size={15} /> Try &quot;Match My Track&quot; Now
              </Link>
            </div>
          </div>

          {/* Card 2: Fred Again-Style Beat Line & Masterclass */}
          <div
            className="p-6 md:p-8 rounded-2xl border border-purple-500/30 space-y-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(15, 23, 42, 0.9))",
            }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <BookOpen size={13} /> Feature 7: Signature Beat Line
            </div>
            <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Fred Again-Style Line & Masterclass
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Explore UK Garage swing, chopped vocal stems, and the 6-module studio practice workbook for vocal chopping, rolling bass, and emotional pacing.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link href="/learn" className="btn-primary text-xs py-2.5 px-5 gap-2">
                <BookOpen size={15} /> Open Studio Masterclass
              </Link>
              <Link href="/beats?genre=Fred+Again+Type" className="btn-secondary text-xs py-2.5 px-4">
                Fred Again Beats
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Genre Quick Nav ===== */}
      <section className="py-12 px-6" id="genre-nav">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Browse by Genre
            </h2>
            <Link href="/beats" className="btn-ghost text-sm">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre, i) => {
              const colors = [
                "rgba(139, 92, 246, 0.12)",
                "rgba(6, 182, 212, 0.12)",
                "rgba(236, 72, 153, 0.12)",
                "rgba(249, 115, 22, 0.12)",
                "rgba(16, 185, 129, 0.12)",
                "rgba(99, 102, 241, 0.12)",
                "rgba(251, 191, 36, 0.12)",
                "rgba(139, 92, 246, 0.12)",
              ];
              return (
                <Link
                  key={genre}
                  href={`/beats?genre=${encodeURIComponent(genre)}`}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: colors[i % colors.length],
                    border: `1px solid ${colors[i % colors.length].replace("0.12", "0.25")}`,
                    color: "var(--text-primary)",
                  }}
                >
                  {genre}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Featured Beats ===== */}
      <section className="py-12 px-6" id="featured-beats">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(139, 92, 246, 0.15)" }}
              >
                <Star size={16} style={{ color: "var(--accent-purple-light)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Featured Beats
              </h2>
            </div>
            <Link href="/beats" className="btn-ghost text-sm">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredBeats.map((beat, i) => (
              <div key={beat.id} className="animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                <BeatCard beat={beat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Trending Now ===== */}
      <section className="py-12 px-6" id="trending-beats">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(236, 72, 153, 0.15)" }}
              >
                <TrendingUp size={16} style={{ color: "var(--accent-pink)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Trending Now
              </h2>
            </div>
            <Link href="/beats" className="btn-ghost text-sm">
              See All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trendingBeats.map((beat, i) => (
              <div key={beat.id} className="animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                <BeatCard beat={beat} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Beat Packs Highlight ===== */}
      <section className="py-12 px-6" id="beat-packs-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(6, 182, 212, 0.15)" }}
              >
                <Package size={16} style={{ color: "var(--accent-cyan)" }} />
              </div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Beat Packs — Save More
              </h2>
            </div>
            <Link href="/packs" className="btn-ghost text-sm">
              Browse Packs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="glass-card p-10 text-center">
            <Package size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-lg font-semibold mb-2">Packs coming soon</h3>
            <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
              Producers will be able to create curated beat bundles at discounted prices. Stay tuned!
            </p>
          </div>
        </div>
      </section>

      {/* ===== Why BeatVault ===== */}
      <section className="py-16 px-6" id="why-beatvault">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
              Why Producers & Artists Choose{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>
                BeatVault
              </span>
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
              Everything you need to find, buy, and deliver professional-grade beats.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: <Zap size={20} />,
                title: "Instant Delivery",
                desc: "Download your beats immediately after purchase. No waiting.",
                color: "var(--accent-orange)",
                bg: "rgba(249, 115, 22, 0.1)",
              },
              {
                icon: <Headphones size={20} />,
                title: "Multiple Formats",
                desc: "MP3, WAV, FLAC, and STEMS — choose what works for your project.",
                color: "var(--accent-purple-light)",
                bg: "rgba(139, 92, 246, 0.1)",
              },
              {
                icon: <Shield size={20} />,
                title: "Secure Payments",
                desc: "Powered by Stripe with full buyer and seller protection.",
                color: "var(--accent-green)",
                bg: "rgba(16, 185, 129, 0.1)",
              },
              {
                icon: <Download size={20} />,
                title: "Mix & Match Packs",
                desc: "Build custom beat packs and save with bundle discounts.",
                color: "var(--accent-cyan)",
                bg: "rgba(6, 182, 212, 0.1)",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: feature.bg, color: feature.color }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-16 px-6" id="cta-section">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative rounded-2xl p-10 sm:p-14 text-center overflow-hidden"
            style={{ background: "var(--gradient-surface)", border: "1px solid var(--border-default)" }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative z-10">
              <h2
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Ready to find your next hit?
              </h2>
              <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
                Join thousands of artists and producers on BeatVault. Start browsing or upload your beats today.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/beats" className="btn-primary text-base px-8 py-3" id="cta-browse">
                  <Headphones size={18} />
                  Browse Beats
                </Link>
                <Link href="/signup" className="btn-secondary text-base px-8 py-3" id="cta-signup">
                  Create Account
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

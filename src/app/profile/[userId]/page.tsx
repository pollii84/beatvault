"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import BeatCard from "@/components/BeatCard";
import { MOCK_BEATS } from "@/lib/mockData";
import {
  Star,
  Music,
  DollarSign,
  Download,
  Calendar,
  MapPin,
  Globe,
  AtSign,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

// Mock producer profiles
const MOCK_PROFILES: Record<string, {
  name: string;
  bio: string;
  location: string;
  website: string;
  joined: string;
  totalSales: number;
  totalBeats: number;
  avgRating: number;
  socialLinks: { platform: string; url: string }[];
}> = {
  "prod-1": {
    name: "NIGHTOWL",
    bio: "Dark atmospheric producer specializing in trap and lo-fi. 5+ years crafting moody beats that hit different at 2 AM.",
    location: "Los Angeles, CA",
    website: "nightowlbeats.com",
    joined: "Jan 2024",
    totalSales: 865,
    totalBeats: 42,
    avgRating: 4.7,
    socialLinks: [
      { platform: "instagram", url: "#" },
      { platform: "twitter", url: "#" },
    ],
  },
  "prod-2": {
    name: "VELVET KEYS",
    bio: "R&B and soul producer. Piano-driven beats with rich harmonies and silky drums. Every note tells a story.",
    location: "Atlanta, GA",
    website: "velvetkeys.io",
    joined: "Mar 2024",
    totalSales: 946,
    totalBeats: 35,
    avgRating: 4.6,
    socialLinks: [
      { platform: "instagram", url: "#" },
    ],
  },
  "prod-3": {
    name: "BASSQUAKE",
    bio: "Drill and trap specialist. Earth-shaking 808s and razor-sharp hi-hats. If it doesn't rattle windows, it's not finished.",
    location: "London, UK",
    website: "bassquakemusic.com",
    joined: "Jun 2024",
    totalSales: 1703,
    totalBeats: 58,
    avgRating: 4.9,
    socialLinks: [
      { platform: "instagram", url: "#" },
      { platform: "twitter", url: "#" },
    ],
  },
};

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const profile = MOCK_PROFILES[userId];
  const producerBeats = MOCK_BEATS.filter((b) => b.producerId === userId);

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
        <Link href="/beats" className="btn-primary">
          Browse Beats
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Profile Header */}
      <div className="relative mb-10">
        {/* Banner */}
        <div
          className="h-44 rounded-2xl overflow-hidden"
          style={{ background: "var(--gradient-cool)" }}
        >
          <div className="w-full h-full" style={{ background: "var(--gradient-glow)" }} />
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 -mt-12 px-6">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold shrink-0"
            style={{
              background: "var(--gradient-primary)",
              border: "4px solid var(--bg-primary)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            {profile.name[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {profile.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {profile.bio}
            </p>
          </div>
          <button className="btn-primary shrink-0" id="follow-btn">
            Follow
          </button>
        </div>
      </div>

      {/* Stats + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Sales", value: profile.totalSales.toLocaleString(), icon: <DollarSign size={16} />, color: "var(--accent-green)" },
            { label: "Beats", value: profile.totalBeats.toString(), icon: <Music size={16} />, color: "var(--accent-purple-light)" },
            { label: "Avg Rating", value: profile.avgRating.toFixed(1), icon: <Star size={16} />, color: "#fbbf24" },
            { label: "Downloads", value: "2.3K+", icon: <Download size={16} />, color: "var(--accent-cyan)" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-xl"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <p className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{stat.value}</p>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div
          className="p-5 rounded-xl"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <MapPin size={14} /> {profile.location}
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Globe size={14} />
              <a href="#" style={{ color: "var(--accent-purple-light)" }}>{profile.website}</a>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              <Calendar size={14} /> Joined {profile.joined}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            {profile.socialLinks.map((link) => (
              <a key={link.platform} href={link.url} className="btn-icon" style={{ width: 32, height: 32 }}>
                {link.platform === "instagram" ? <AtSign size={14} /> : <MessageCircle size={14} />}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Producer's Beats */}
      <div>
        <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
          Beats by {profile.name}
        </h2>
        {producerBeats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {producerBeats.map((beat, i) => (
              <div key={beat.id} className="animate-fadeIn" style={{ animationDelay: `${i * 60}ms` }}>
                <BeatCard beat={beat} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No beats uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
}

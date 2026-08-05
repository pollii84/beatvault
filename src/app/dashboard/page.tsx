"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getProducerBeats, getProducerStats, getUserPurchases } from "@/lib/firestore";
import { getBeatDownloadUrl } from "@/lib/storage";
import { Beat, Order } from "@/lib/types";
import BeatCard from "@/components/BeatCard";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Download,
  Heart,
  Star,
  Plus,
  TrendingUp,
  Music,
  ArrowRight,
  ExternalLink,
  Loader2,
} from "lucide-react";

type DashTab = "overview" | "beats" | "sales" | "purchases" | "analytics";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  // Live Firestore state
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalBeats: 0, activeBeats: 0, totalSales: 0, avgRating: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const isProducer = profile?.role === "producer" || profile?.role === "both";
  const isBuyer = profile?.role === "buyer" || profile?.role === "both";

  useEffect(() => {
    async function loadDashboardData() {
      if (!user) return;
      setLoadingData(true);
      try {
        if (isProducer) {
          const beats = await getProducerBeats(user.uid);
          setMyBeats(beats);
          const pStats = await getProducerStats(user.uid);
          setStats(pStats);
        }
        if (isBuyer) {
          const userOrders = await getUserPurchases(user.uid);
          setPurchases(userOrders);
        }
      } catch (err) {
        console.error("Error loading dashboard data from Firestore:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadDashboardData();
  }, [user, isProducer, isBuyer]);

  const handleDownloadFile = async (producerId: string, beatId: string, format: string) => {
    const key = `${beatId}-${format}`;
    setDownloadingFormat(key);
    try {
      const url = await getBeatDownloadUrl(producerId, beatId, format);
      if (url) {
        window.open(url, "_blank");
      } else {
        alert(`Download link for ${format.toUpperCase()} is processing or unavailable.`);
      }
    } catch {
      alert("Failed to retrieve download link.");
    } finally {
      setDownloadingFormat(null);
    }
  };

  const tabs: { id: DashTab; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} />, show: true },
    { id: "beats", label: "My Beats", icon: <Music size={16} />, show: isProducer },
    { id: "sales", label: "Sales", icon: <DollarSign size={16} />, show: isProducer },
    { id: "purchases", label: "Purchases", icon: <ShoppingBag size={16} />, show: isBuyer },
    { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} />, show: isProducer },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Welcome back, {profile?.displayName || "Producer / Artist"}
          </p>
        </div>
        {isProducer && (
          <Link href="/dashboard/upload" className="btn-primary" id="upload-beat-btn">
            <Plus size={16} />
            Upload Beat
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {tabs
          .filter((t) => t.show)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer"
              style={{
                background: activeTab === tab.id ? "rgba(139, 92, 246, 0.12)" : "transparent",
                color: activeTab === tab.id ? "var(--accent-purple-light)" : "var(--text-secondary)",
                border: activeTab === tab.id ? "1px solid rgba(139, 92, 246, 0.2)" : "1px solid transparent",
              }}
              id={`tab-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "beats" && myBeats.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                  {myBeats.length}
                </span>
              )}
            </button>
          ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Earnings",
                value: `$${(stats.totalSales * 39.99).toFixed(2)}`,
                icon: <DollarSign size={18} />,
                color: "var(--accent-green)",
                bg: "rgba(16, 185, 129, 0.1)",
              },
              {
                label: "Total Sales",
                value: `${stats.totalSales}`,
                icon: <TrendingUp size={18} />,
                color: "var(--accent-purple-light)",
                bg: "rgba(139, 92, 246, 0.1)",
              },
              {
                label: "Uploaded Beats",
                value: `${stats.totalBeats}`,
                icon: <Music size={18} />,
                color: "var(--accent-cyan)",
                bg: "rgba(6, 182, 212, 0.1)",
              },
              {
                label: "Avg Rating",
                value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "5.0 ★",
                icon: <Star size={18} />,
                color: "#fbbf24",
                bg: "rgba(251, 191, 36, 0.1)",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl p-5"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: stat.bg, color: stat.color }}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  {stat.label}
                </p>
                <p className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Upload New Beat", icon: <Upload size={18} />, href: "/dashboard/upload", color: "var(--accent-purple-light)" },
                { label: "View Wishlist", icon: <Heart size={18} />, href: "/wishlist", color: "var(--accent-pink)" },
                { label: "Browse Beats", icon: <Music size={18} />, href: "/beats", color: "var(--accent-cyan)" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:translate-y-[-2px]"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${action.color}15`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "beats" && (
        <div className="animate-fadeIn">
          {loadingData ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-purple-400" />
              <p className="text-xs text-muted-foreground">Loading your beats from Firestore...</p>
            </div>
          ) : myBeats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {myBeats.map((beat) => (
                <div key={beat.id} className="relative group">
                  <BeatCard beat={beat} />
                  <div className="mt-2 flex items-center justify-between px-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${beat.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>
                      {beat.isActive ? "Active" : "Draft"}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      ${beat.prices?.wav ? beat.prices.wav.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No beats uploaded yet</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Start building your catalog by uploading your first beat.
              </p>
              <Link href="/dashboard/upload" className="btn-primary">
                <Upload size={16} /> Upload Your First Beat
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "sales" && (
        <div className="animate-fadeIn text-center py-16">
          <DollarSign size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your sales and revenue data will appear here once buyers purchase your beats.
          </p>
        </div>
      )}

      {activeTab === "purchases" && (
        <div className="animate-fadeIn">
          {loadingData ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-purple-400" />
              <p className="text-xs text-muted-foreground">Loading your purchases...</p>
            </div>
          ) : purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">PAID</span>
                      <span className="text-xs text-zinc-500">• Order #{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <Music size={14} className="text-purple-400 shrink-0" />
                          <span className="text-sm font-semibold text-zinc-200">{item.beatTitle}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {item.format.toUpperCase()}
                          </span>
                          <button
                            onClick={() => handleDownloadFile(item.id, item.beatId, item.format)}
                            disabled={downloadingFormat === `${item.beatId}-${item.format}`}
                            className="btn-ghost text-xs px-2 py-1 gap-1 text-cyan-400 hover:text-cyan-300 ml-auto"
                          >
                            {downloadingFormat === `${item.beatId}-${item.format}` ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Download size={12} />
                            )}
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Total Paid</p>
                    <p className="text-lg font-bold text-white">${order.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Your purchased beats and downloads will appear here.
              </p>
              <Link href="/beats" className="btn-primary">
                Browse Beats <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="animate-fadeIn text-center py-16">
          <BarChart3 size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-lg font-semibold mb-2">No analytics data yet</h3>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Plays, downloads, revenue trends, and audience data will appear here once you have activity.
          </p>
        </div>
      )}
    </div>
  );
}

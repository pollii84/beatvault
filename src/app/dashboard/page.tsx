"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProducerBeats,
  getProducerStats,
  getUserPurchases,
  getProducerSales,
  updateBeat,
  deleteBeat,
} from "@/lib/firestore";
import { getBeatDownloadUrl, deleteBeatFiles } from "@/lib/storage";
import { Beat, Order, OrderItem } from "@/lib/types";
import LicenseModal from "@/components/LicenseModal";
import EditBeatModal from "@/components/EditBeatModal";
import { getFunctions, httpsCallable } from "firebase/functions";
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
  Loader2,
  FileText,
  ShieldCheck,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

type DashTab = "overview" | "beats" | "sales" | "purchases" | "analytics";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  // Live Firestore state
  const [myBeats, setMyBeats] = useState<Beat[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalBeats: 0, activeBeats: 0, totalSales: 0, avgRating: 0 });
  const [loadingData, setLoadingData] = useState(true);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  // Producer catalog actions state
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const [deletingBeatId, setDeletingBeatId] = useState<string | null>(null);
  const [togglingBeatId, setTogglingBeatId] = useState<string | null>(null);

  // License Modal State
  const [licenseModal, setLicenseModal] = useState<{
    isOpen: boolean;
    item: OrderItem | null;
    order: Order | null;
  }>({
    isOpen: false,
    item: null,
    order: null,
  });

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
          const pSales = await getProducerSales(user.uid);
          setSales(pSales);
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

  // Handle active/draft toggle
  const handleToggleBeatActive = async (beat: Beat) => {
    setTogglingBeatId(beat.id);
    const newStatus = !beat.isActive;
    try {
      await updateBeat(beat.id, { isActive: newStatus });
      setMyBeats((prev) =>
        prev.map((b) => (b.id === beat.id ? { ...b, isActive: newStatus } : b))
      );
    } catch (err) {
      console.error("Error toggling beat status:", err);
      alert("Failed to update beat status.");
    } finally {
      setTogglingBeatId(null);
    }
  };

  // Handle beat deletion
  const handleDeleteBeat = async (beat: Beat) => {
    if (
      !confirm(
        `Are you sure you want to delete "${beat.title}"? This will permanently delete the beat record and its audio files.`
      )
    ) {
      return;
    }

    setDeletingBeatId(beat.id);
    try {
      await deleteBeat(beat.id);
      await deleteBeatFiles(beat.producerId, beat.id);
      setMyBeats((prev) => prev.filter((b) => b.id !== beat.id));
      setStats((prev) => ({
        ...prev,
        totalBeats: Math.max(0, prev.totalBeats - 1),
      }));
    } catch (err) {
      console.error("Error deleting beat:", err);
      alert("Failed to delete beat. Please try again.");
    } finally {
      setDeletingBeatId(null);
    }
  };

  const handleDownloadFile = async (orderId: string, beatId: string, format: string, producerId?: string) => {
    const key = `${orderId}-${beatId}-${format}`;
    setDownloadingFormat(key);

    try {
      let downloadUrl: string | null = null;

      try {
        const functions = getFunctions();
        const getSecureUrlCall = httpsCallable(functions, "getSecureDownloadUrl");
        const result = await getSecureUrlCall({ orderId, beatId, format });
        const data = result.data as { url?: string };

        if (data?.url) {
          downloadUrl = data.url;
          setPurchases((prev) =>
            prev.map((o) =>
              o.id === orderId
                ? {
                    ...o,
                    items: o.items.map((it) =>
                      it.beatId === beatId && it.format === format
                        ? { ...it, downloadCount: (it.downloadCount || 0) + 1 }
                        : it
                    ),
                  }
                : o
            )
          );
        }
      } catch (cfErr) {
        console.warn("Secure Cloud Function download fallback:", cfErr);
      }

      if (!downloadUrl && producerId) {
        downloadUrl = await getBeatDownloadUrl(producerId, beatId, format);
      }

      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        alert(`Secure download link for ${format.toUpperCase()} is processing or unavailable.`);
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to retrieve secure download link.");
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

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Sales Revenue",
                value: `$${(stats.totalSales * 39.99).toFixed(2)}`,
                icon: <DollarSign size={18} />,
                color: "var(--accent-green)",
                bg: "rgba(16, 185, 129, 0.1)",
              },
              {
                label: "Total Beats Sold",
                value: `${stats.totalSales}`,
                icon: <TrendingUp size={18} />,
                color: "var(--accent-purple-light)",
                bg: "rgba(139, 92, 246, 0.1)",
              },
              {
                label: "Catalog Beats",
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

          <div>
            <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Upload New Beat", icon: <Upload size={18} />, href: "/dashboard/upload", color: "var(--accent-purple-light)" },
                { label: "View Wishlist", icon: <Heart size={18} />, href: "/wishlist", color: "var(--accent-pink)" },
                { label: "Browse Marketplace", icon: <Music size={18} />, href: "/beats", color: "var(--accent-cyan)" },
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

      {/* My Beats Tab (Producer Catalog Management) */}
      {activeTab === "beats" && (
        <div className="animate-fadeIn">
          {loadingData ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-purple-400" />
              <p className="text-xs text-muted-foreground">Loading catalog from Firestore...</p>
            </div>
          ) : myBeats.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-medium text-zinc-400">
                  Managing {myBeats.length} {myBeats.length === 1 ? "beat" : "beats"} in your catalog
                </p>
                <Link href="/dashboard/upload" className="btn-primary text-xs py-1.5 px-3">
                  <Plus size={14} /> Add Beat
                </Link>
              </div>

              <div className="space-y-3">
                {myBeats.map((beat) => (
                  <div
                    key={beat.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="w-14 h-14 rounded-xl shrink-0"
                        style={{
                          background: beat.coverArtUrl
                            ? `url(${beat.coverArtUrl}) center/cover`
                            : "var(--gradient-cool)",
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white truncate">{beat.title}</h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              beat.isActive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}
                          >
                            {beat.isActive ? "ACTIVE" : "DRAFT"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span className="font-mono">{beat.bpm} BPM</span>
                          <span>•</span>
                          <span className="font-mono">{beat.key}</span>
                          <span>•</span>
                          <span className="text-purple-300 font-medium">
                            {beat.genres?.join(", ") || "Hip Hop"}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            ${beat.prices?.wav?.toFixed(2) || "39.99"} WAV
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-zinc-500">
                          <span>Sales: <strong className="text-white">{beat.salesCount || 0}</strong></span>
                          <span>Rating: <strong className="text-yellow-400">{beat.avgRating ? beat.avgRating.toFixed(1) : "5.0 ★"}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Catalog Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        href={`/beats/${beat.id}`}
                        target="_blank"
                        className="btn-ghost text-xs p-2 text-zinc-400 hover:text-white"
                        title="View Public Store Page"
                      >
                        <ExternalLink size={15} />
                      </Link>

                      <button
                        onClick={() => handleToggleBeatActive(beat)}
                        disabled={togglingBeatId === beat.id}
                        className="btn-ghost text-xs p-2 text-zinc-400 hover:text-white"
                        title={beat.isActive ? "Set to Draft" : "Set to Active"}
                      >
                        {togglingBeatId === beat.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : beat.isActive ? (
                          <EyeOff size={15} className="text-amber-400" />
                        ) : (
                          <Eye size={15} className="text-emerald-400" />
                        )}
                      </button>

                      <button
                        onClick={() => setEditingBeat(beat)}
                        className="btn-ghost text-xs p-2 text-purple-400 hover:text-purple-300 border border-purple-500/20 rounded-lg"
                        title="Edit Metadata & Pricing"
                      >
                        <Edit size={15} />
                      </button>

                      <button
                        onClick={() => handleDeleteBeat(beat)}
                        disabled={deletingBeatId === beat.id}
                        className="btn-ghost text-xs p-2 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg"
                        title="Delete Beat"
                      >
                        {deletingBeatId === beat.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <Music size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No beats in catalog</h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Start building your producer catalog by uploading your first beat.
              </p>
              <Link href="/dashboard/upload" className="btn-primary">
                <Upload size={16} /> Upload Your First Beat
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="animate-fadeIn">
          {loadingData ? (
            <div className="text-center py-16">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 text-purple-400" />
              <p className="text-xs text-muted-foreground">Loading sales data...</p>
            </div>
          ) : sales.length > 0 ? (
            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400">Total Store Revenue</p>
                  <p className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ${sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0).toFixed(2)} USD
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">Completed Transactions</p>
                  <p className="text-lg font-bold text-white">{sales.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {sales.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/60 pb-2">
                      <span className="font-mono">Order #{order.id.slice(0, 10)}</span>
                      <span>
                        {order.createdAt
                          ? new Date(
                              typeof order.createdAt === "object" && "seconds" in order.createdAt
                                ? (order.createdAt as { seconds: number }).seconds * 1000
                                : (order.createdAt as unknown as string)
                            ).toLocaleDateString()
                          : "Recent"}
                      </span>
                    </div>
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <Music size={14} className="text-purple-400" />
                          <span className="font-bold text-white">{item.beatTitle}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase font-mono">
                            {item.format}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-400">${item.price?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <DollarSign size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No sales recorded yet</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Sales and revenue metrics will appear here once buyers complete purchases of your beats.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Purchases Tab */}
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
                  className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">ORDER CONFIRMED</span>
                      <span className="text-xs text-zinc-500">• Order #{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 mr-2">Paid:</span>
                      <span className="text-sm font-bold text-white">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-zinc-950/40 border border-zinc-800/50 gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg shrink-0"
                            style={{
                              background: item.beatCoverUrl
                                ? `url(${item.beatCoverUrl}) center/cover`
                                : "var(--gradient-cool)",
                            }}
                          />
                          <div>
                            <p className="text-sm font-bold text-white">{item.beatTitle}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-wider font-mono">
                                {item.format.toUpperCase()}
                              </span>
                              <span className="text-[11px] text-zinc-400">
                                License: Standard Commercial
                              </span>
                              {item.downloadCount !== undefined && item.downloadCount > 0 && (
                                <span className="text-[10px] text-emerald-400 font-medium">
                                  • Downloaded {item.downloadCount} {item.downloadCount === 1 ? "time" : "times"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() =>
                              setLicenseModal({
                                isOpen: true,
                                item,
                                order,
                              })
                            }
                            className="btn-ghost text-xs px-3 py-1.5 gap-1.5 text-purple-300 hover:text-purple-200 border border-purple-500/30 rounded-lg"
                          >
                            <FileText size={13} /> License
                          </button>
                          <button
                            onClick={() => handleDownloadFile(order.id, item.beatId, item.format)}
                            disabled={downloadingFormat === `${order.id}-${item.beatId}-${item.format}`}
                            className="btn-primary text-xs px-3.5 py-1.5 gap-1.5"
                          >
                            {downloadingFormat === `${order.id}-${item.beatId}-${item.format}` ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Download size={13} />
                            )}
                            Secure Download
                          </button>
                        </div>
                      </div>
                    ))}
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

      {/* Edit Beat Modal */}
      <EditBeatModal
        isOpen={!!editingBeat}
        beat={editingBeat}
        onClose={() => setEditingBeat(null)}
        onSaveSuccess={(updatedBeat) => {
          setMyBeats((prev) =>
            prev.map((b) => (b.id === updatedBeat.id ? updatedBeat : b))
          );
        }}
      />

      {/* License Contract Modal */}
      <LicenseModal
        isOpen={licenseModal.isOpen}
        onClose={() => setLicenseModal({ isOpen: false, item: null, order: null })}
        item={licenseModal.item}
        order={licenseModal.order}
        buyerName={profile?.displayName || user?.email || "Buyer"}
        buyerEmail={user?.email || "buyer@beatvault.com"}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
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
  Package,
  ArrowRight,
} from "lucide-react";

type DashTab = "overview" | "beats" | "sales" | "purchases" | "analytics";

export default function DashboardPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  const isProducer = profile?.role === "producer" || profile?.role === "both";
  const isBuyer = profile?.role === "buyer" || profile?.role === "both";

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
            Welcome back, {profile?.displayName || "User"}
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
            </button>
          ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="animate-fadeIn">
          {/* Stats Grid — zeros until real data exists */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Earnings", value: "$0.00", icon: <DollarSign size={18} />, color: "var(--accent-green)", bg: "rgba(16, 185, 129, 0.1)" },
              { label: "Total Sales", value: "0", icon: <TrendingUp size={18} />, color: "var(--accent-purple-light)", bg: "rgba(139, 92, 246, 0.1)" },
              { label: "Downloads", value: "0", icon: <Download size={18} />, color: "var(--accent-cyan)", bg: "rgba(6, 182, 212, 0.1)" },
              { label: "Avg Rating", value: "—", icon: <Star size={18} />, color: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
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
        <div className="animate-fadeIn text-center py-16">
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
        <div className="animate-fadeIn text-center py-16">
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

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Notification } from "@/lib/types";
import {
  Bell,
  DollarSign,
  Star,
  Music,
  Info,
  CheckCheck,
  ArrowRight,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications] = useState<Notification[]>([]);

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "sale":
        return <DollarSign size={18} className="text-emerald-400" />;
      case "review":
        return <Star size={18} className="text-amber-400" />;
      case "release":
        return <Music size={18} className="text-purple-400" />;
      case "system":
        return <Info size={18} className="text-cyan-400" />;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <Bell size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          No notifications yet
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          When you receive sales, reviews, or new releases, they&apos;ll show up here.
        </p>
        <Link href="/beats" className="btn-primary">
          Browse Beats <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
            <Bell size={20} style={{ color: "var(--accent-purple-light)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Notifications
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Stay updated on sales, releases, reviews, and activity
            </p>
          </div>
        </div>

        <button className="btn-ghost text-xs">
          <CheckCheck size={14} /> Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-4 p-4 rounded-xl transition-all"
            style={{
              background: n.isRead ? "var(--bg-secondary)" : "var(--bg-tertiary)",
              border: `1px solid ${n.isRead ? "var(--border-subtle)" : "var(--border-hover)"}`,
            }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-primary)" }}>
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold">{n.title}</h3>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Notification } from "@/lib/types";
import {
  Bell,
  CheckCircle2,
  DollarSign,
  Star,
  Music,
  Info,
  CheckCheck,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-1",
      userId: "user-1",
      type: "sale",
      title: "New Sale!",
      message: "You sold WAV License for 'Midnight Drip' to @VocalVibes.",
      isRead: false,
      createdAt: new Date("2026-08-04T10:30:00"),
    },
    {
      id: "notif-2",
      userId: "user-1",
      type: "review",
      title: "New 5-Star Review",
      message: "BeatCrafter left a 5-star review on 'Midnight Drip'.",
      isRead: false,
      createdAt: new Date("2026-08-03T15:45:00"),
    },
    {
      id: "notif-3",
      userId: "user-1",
      type: "release",
      title: "New Release from BASSQUAKE",
      message: "BASSQUAKE just uploaded 'Phantom' (Drill/Trap).",
      isRead: true,
      createdAt: new Date("2026-08-02T09:12:00"),
    },
    {
      id: "notif-4",
      userId: "user-1",
      type: "system",
      title: "Payout Completed",
      message: "Your monthly earnings of $1,240.00 were transferred to Stripe.",
      isRead: true,
      createdAt: new Date("2026-08-01T12:00:00"),
    },
  ]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

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

        <button onClick={markAllAsRead} className="btn-ghost text-xs">
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

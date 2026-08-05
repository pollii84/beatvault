"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MOCK_BEATS } from "@/lib/mockData";
import {
  Download,
  CheckCircle2,
  FileAudio,
  ShieldCheck,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function OrderDetailClient() {
  const params = useParams();
  const orderId = params.orderId as string;

  const purchasedItems = [
    { beat: MOCK_BEATS[0], format: "wav", price: 39.99, downloadUrl: "#" },
    { beat: MOCK_BEATS[2], format: "stems", price: 119.99, downloadUrl: "#" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/dashboard" className="btn-ghost text-sm mb-6 inline-flex">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div
        className="rounded-2xl p-8 mb-8"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.15)" }}>
            <CheckCircle2 size={24} style={{ color: "var(--accent-green)" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Order Confirmed & Delivered
            </h1>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              Order ID: #{orderId || "sample-order"} • {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Thank you for your purchase! Your high-quality beat files, licenses, and stems are ready for instant download below.
        </p>

        <div className="space-y-4">
          {purchasedItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--gradient-cool)" }}>
                  <FileAudio size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.beat.title}</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Producer: {item.beat.producerName} • Format: <span className="uppercase font-mono text-cyan-400">{item.format}</span>
                  </p>
                </div>
              </div>

              <a href={item.downloadUrl} download className="btn-primary text-xs py-2 px-4">
                <Download size={14} /> Download
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: "var(--accent-green)" }} /> License Agreement
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Non-Exclusive Commercial Rights granted.
          </p>
        </div>

        <div className="p-6 rounded-xl" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock size={16} style={{ color: "var(--accent-cyan)" }} /> Re-downloads
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Stored securely in your BeatVault account.
          </p>
        </div>
      </div>
    </div>
  );
}

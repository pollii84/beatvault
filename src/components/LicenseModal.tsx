"use client";

import React from "react";
import { OrderItem, Order } from "@/lib/types";
import { X, Printer, ShieldCheck, FileText } from "lucide-react";

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: OrderItem | null;
  order: Order | null;
  buyerName?: string;
  buyerEmail?: string;
}

export default function LicenseModal({
  isOpen,
  onClose,
  item,
  order,
  buyerName = "Valued Buyer",
  buyerEmail = "buyer@beatvault.com",
}: LicenseModalProps) {
  if (!isOpen || !item || !order) return null;

  const rawDate = order.createdAt;
  let orderDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  if (rawDate) {
    if (typeof rawDate === "object" && rawDate !== null && "seconds" in rawDate) {
      const sec = (rawDate as { seconds: number }).seconds;
      if (typeof sec === "number") {
        orderDate = new Date(sec * 1000).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    } else if (rawDate instanceof Date || typeof rawDate === "string" || typeof rawDate === "number") {
      orderDate = new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  const formatName = item.format ? item.format.toUpperCase() : "MP3/WAV";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn print:p-0 print:bg-white print:text-black">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl print:max-w-none print:max-h-none print:shadow-none"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 print:hidden"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--accent-purple-light)" }}
            >
              <FileText size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Digital License Agreement
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Order #{order.id.slice(0, 12)} • {orderDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-secondary text-xs py-2 px-3 gap-1.5"
              title="Print License"
            >
              <Printer size={14} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm print:p-8 print:text-black print:overflow-visible">
          {/* Certificate Header */}
          <div className="text-center pb-6 border-b border-zinc-800 print:border-black">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400 print:text-purple-700 mb-1">
              <ShieldCheck size={14} /> BeatVault Certified License
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
              STANDARD MUSIC LICENSE AGREEMENT
            </h1>
            <p className="text-xs text-zinc-400 print:text-zinc-600 mt-1">
              This non-exclusive license agreement is entered into as of {orderDate}.
            </p>
          </div>

          {/* Parties & Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 print:bg-gray-100 print:border-gray-300">
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600 mb-0.5">LICENSOR (PRODUCER)</p>
              <p className="font-semibold text-white print:text-black">{item.beatTitle || "BeatVault Producer"}</p>
              <p className="text-xs text-zinc-400 print:text-gray-600">Represented by BeatVault Inc.</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600 mb-0.5">LICENSEE (BUYER)</p>
              <p className="font-semibold text-white print:text-black">{buyerName}</p>
              <p className="text-xs text-zinc-400 print:text-gray-600">{buyerEmail}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600 mb-0.5">BEAT TITLE</p>
              <p className="font-semibold text-purple-400 print:text-purple-800">{item.beatTitle}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-zinc-400 print:text-gray-600 mb-0.5">PURCHASED FORMAT & FEE</p>
              <p className="font-semibold text-emerald-400 print:text-emerald-800">
                {formatName} • ${item.price?.toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* License Terms */}
          <div className="space-y-4 text-xs leading-relaxed text-zinc-300 print:text-gray-800">
            <div>
              <h3 className="font-bold text-white print:text-black uppercase text-[11px] mb-1">
                1. Grant of Rights
              </h3>
              <p>
                Licensor grants Licensee a worldwide, non-exclusive, perpetual license to use the audio track
                titled &quot;{item.beatTitle}&quot; ({formatName} format) to record vocal/instrumental performances, mix, master, and distribute commercial master recordings.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white print:text-black uppercase text-[11px] mb-1">
                2. Distribution & Streaming Limits
              </h3>
              <p>
                Licensee is authorized to distribute up to <strong>500,000 monetized audio streams</strong> across Spotify, Apple Music, YouTube Music, and digital platforms. Licensee retains 100% of master recording royalties generated up to this limit.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white print:text-black uppercase text-[11px] mb-1">
                3. Credit Requirement
              </h3>
              <p>
                Licensee agrees to provide production credit in all metadata and packaging as:
                <em className="text-purple-300 print:text-purple-900 font-mono"> &quot;Produced by BeatVault&quot;</em> or the accredited producer name.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white print:text-black uppercase text-[11px] mb-1">
                4. Synchronization & Video Rights
              </h3>
              <p>
                Licensee may use the track in unlimited non-monetized or monetized social media videos (YouTube, TikTok, Instagram) and live public performances.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white print:text-black uppercase text-[11px] mb-1">
                5. Restrictions & Non-Transferability
              </h3>
              <p>
                Licensee may not re-sell, sub-license, or redistribute the standalone beat instrumental or raw stems without vocal transformation. This license is non-transferable.
              </p>
            </div>
          </div>

          {/* Footer Watermark */}
          <div className="pt-4 border-t border-zinc-800 print:border-gray-300 flex items-center justify-between text-[10px] text-zinc-400 print:text-gray-500">
            <span>Verified by BeatVault Order Engine</span>
            <span>Transaction Ref: {order.stripePaymentId || order.id}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-4 flex items-center justify-end gap-3 print:hidden"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button onClick={onClose} className="btn-secondary text-xs px-4">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

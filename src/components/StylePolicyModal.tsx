"use client";

import React from "react";
import { X, ShieldCheck, AlertTriangle, CheckCircle, FileText } from "lucide-react";

interface StylePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StylePolicyModal({ isOpen, onClose }: StylePolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--accent-purple-light)" }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Style-Tag Content & Compliance Policy
              </h2>
              <p className="text-xs text-zinc-400">
                Guidelines for &quot;Fred Again Type&quot; and artist style-alike listings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed text-zinc-300">
          {/* Important Legal Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
            <div className="flex items-center gap-2 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              <FileText size={14} /> Nominative Fair Use & Style Disclaimer
            </div>
            <p className="text-zinc-300 text-[11px]">
              BeatVault listings containing artist style tags (e.g. &quot;Fred Again Type&quot;) refer solely to musical arrangement aesthetic, production style, tempo, and genre characteristics. All beats are 100% original composition works produced independently. BeatVault and its producers are not affiliated with, endorsed by, or sponsored by any named recording artist.
            </p>
          </div>

          {/* Permitted Practices */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400" /> Permitted Producer Practices
            </h3>
            <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-1">
              <li>
                <strong className="text-zinc-200">100% Original Composition:</strong> Producing original instrumentals capturing loop-based UK garage, chopped-vocal aesthetics, 2-step swing, and rolling basslines.
              </li>
              <li>
                <strong className="text-zinc-200">Descriptive Tagging:</strong> Using &quot;Fred Again type beat&quot; in tags and search metadata for nominative discovery.
              </li>
              <li>
                <strong className="text-zinc-200">Cleared Vocal Source Material:</strong> Using recorded original voice memos, royalty-free vocal sample packs with commercial resale permissions, or self-recorded vocals.
              </li>
            </ul>
          </div>

          {/* Prohibited Practices */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-400" /> Prohibited Banned Practices
            </h3>
            <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-1">
              <li>
                <strong className="text-zinc-200">No Sampling Actual Recordings:</strong> Strictly zero sampling of Fred again..&apos;s master recordings, stems, interviews, or third-party copyrighted tracks without express written clearance.
              </li>
              <li>
                <strong className="text-zinc-200">No Implied Endorsement:</strong> Never claim or imply that beats were created by, collaborated on, or approved by the named artist.
              </li>
              <li>
                <strong className="text-zinc-200">No Likeness/Logo Infringement:</strong> Do not use artist photos, album artwork, or logos in beat cover art images.
              </li>
            </ul>
          </div>

          {/* Producer Submission Checklist */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">
              Producer Submission Checklist
            </h4>
            <div className="space-y-1 text-[11px] text-zinc-400">
              <p>✔ All drum samples, synths, and vocal chops are 100% cleared for commercial resale.</p>
              <p>✔ Listing contains required disclaimer metadata.</p>
              <p>✔ Audio preview contains watermarking tag.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-end"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <button onClick={onClose} className="btn-primary text-xs px-5 py-2">
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}

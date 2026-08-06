"use client";

import React, { useState } from "react";
import { Beat, BeatPack } from "@/lib/types";
import { createBeatPack } from "@/lib/firestore";
import { X, Plus, Package, Save, Loader2 } from "lucide-react";

interface CreatePackModalProps {
  isOpen: boolean;
  producerBeats: Beat[];
  producerId: string;
  producerName: string;
  onClose: () => void;
  onSuccess: (newPack: BeatPack) => void;
}

export default function CreatePackModal({
  isOpen,
  producerBeats,
  producerId,
  producerName,
  onClose,
  onSuccess,
}: CreatePackModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverArtUrl, setCoverArtUrl] = useState("");
  const [selectedBeatIds, setSelectedBeatIds] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState(25);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleBeat = (beatId: string) => {
    setSelectedBeatIds((prev) =>
      prev.includes(beatId) ? prev.filter((id) => id !== beatId) : [...prev, beatId]
    );
  };

  const selectedBeats = producerBeats.filter((b) => selectedBeatIds.includes(b.id));

  const originalPrice = selectedBeats.reduce(
    (sum, b) => sum + (b.prices?.wav || 39.99),
    0
  );
  const packPrice = originalPrice * (1 - discountPercent / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Pack title is required.");
      return;
    }
    if (selectedBeatIds.length < 2) {
      setError("Select at least 2 beats for your pack.");
      return;
    }

    setSaving(true);
    setError(null);

    const packData: Omit<BeatPack, "id" | "createdAt"> = {
      producerId,
      producerName,
      title,
      description,
      coverArtUrl: coverArtUrl || selectedBeats[0]?.coverArtUrl || "",
      price: packPrice,
      originalPrice,
      discountPercent,
      allowMixMatch: true,
      maxBeats: selectedBeatIds.length,
      beatIds: selectedBeatIds,
    };

    try {
      const packId = await createBeatPack(packData);
      const newPack: BeatPack = {
        id: packId,
        ...packData,
        createdAt: new Date(),
      };
      onSuccess(newPack);
      onClose();
    } catch (err) {
      console.error("Error creating beat pack:", err);
      setError("Failed to create beat pack. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
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
              style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)" }}
            >
              <Package size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Create New Beat Pack
              </h2>
              <p className="text-xs text-zinc-400">
                Bundle your beats together to offer discounted packages.
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Pack Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field w-full text-sm"
              placeholder="e.g. Emotional Garage Vol. 1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field w-full text-xs h-16 resize-none"
              placeholder="Describe the mood, vibe, and contents of this pack..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Cover Artwork Image URL (Optional)
            </label>
            <input
              type="url"
              value={coverArtUrl}
              onChange={(e) => setCoverArtUrl(e.target.value)}
              className="input-field w-full text-xs"
              placeholder="https://..."
            />
          </div>

          {/* Select Beats */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Select Included Beats ({selectedBeatIds.length} selected)
            </label>
            {producerBeats.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-zinc-950/40 border border-zinc-800">
                {producerBeats.map((b) => {
                  const selected = selectedBeatIds.includes(b.id);
                  return (
                    <div
                      key={b.id}
                      onClick={() => toggleBeat(b.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                        selected
                          ? "bg-purple-500/20 border border-purple-500/40 text-white"
                          : "bg-zinc-900/60 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-semibold truncate">{b.title}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ${b.prices?.wav?.toFixed(2) || "39.99"}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-amber-400">
                You haven&apos;t uploaded any beats yet. Upload beats first from your Dashboard.
              </p>
            )}
          </div>

          {/* Discount Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min={5}
                max={75}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="input-field w-full text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Calculated Pack Price
              </label>
              <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-right">
                <span className="text-xs text-zinc-500 line-through mr-2">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  ${packPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <button type="button" onClick={onClose} className="btn-secondary text-xs px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs px-5 py-2 gap-1.5 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving Pack...
                </>
              ) : (
                <>
                  <Save size={14} /> Publish Beat Pack
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

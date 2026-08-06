"use client";

import React, { useState } from "react";
import { Beat, GENRES, MUSICAL_KEYS, BeatFormat } from "@/lib/types";
import { updateBeat } from "@/lib/firestore";
import { X, Save, Loader2, Music, DollarSign, Tag } from "lucide-react";

interface EditBeatModalProps {
  isOpen: boolean;
  beat: Beat | null;
  onClose: () => void;
  onSaveSuccess: (updatedBeat: Beat) => void;
}

export default function EditBeatModal({
  isOpen,
  beat,
  onClose,
  onSaveSuccess,
}: EditBeatModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bpm, setBpm] = useState(120);
  const [key, setKey] = useState("Cm");
  const [genres, setGenres] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [prices, setPrices] = useState<Record<BeatFormat, number>>({
    mp3: 19.99,
    wav: 39.99,
    flac: 49.99,
    stems: 99.99,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [prevBeatId, setPrevBeatId] = useState<string | null>(null);

  if (beat && beat.id !== prevBeatId) {
    setPrevBeatId(beat.id);
    setTitle(beat.title || "");
    setDescription(beat.description || "");
    setBpm(beat.bpm || 120);
    setKey(beat.key || "Cm");
    setGenres(beat.genres || ["Hip Hop"]);
    setTagsInput(beat.tags?.join(", ") || "");
    setIsActive(beat.isActive !== false);
    setPrices({
      mp3: beat.prices?.mp3 || 19.99,
      wav: beat.prices?.wav || 39.99,
      flac: beat.prices?.flac || 49.99,
      stems: beat.prices?.stems || 99.99,
    });
    setError(null);
  }

  if (!isOpen || !beat) return null;

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handlePriceChange = (format: BeatFormat, val: number) => {
    setPrices((prev) => ({ ...prev, [format]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (genres.length === 0) {
      setError("Please select at least one genre.");
      return;
    }

    setSaving(true);
    setError(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    const updates: Partial<Beat> = {
      title,
      description,
      bpm: Number(bpm),
      key,
      genres,
      tags,
      prices,
      isActive,
    };

    try {
      await updateBeat(beat.id, updates);
      const updatedFull: Beat = { ...beat, ...updates };
      onSaveSuccess(updatedFull);
      onClose();
    } catch (err) {
      console.error("Error updating beat:", err);
      setError("Failed to update beat details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
              <Music size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Edit Beat Metadata & Pricing
              </h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                ID: {beat.id.slice(0, 12)}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Beat Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full text-sm"
                placeholder="e.g. Midnight Vibe"
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
                className="input-field w-full text-xs h-20 resize-none"
                placeholder="Brief description, instruments used, mood..."
              />
            </div>
          </div>

          {/* BPM, Key & Active status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                BPM
              </label>
              <input
                type="number"
                min={40}
                max={250}
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="input-field w-full text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Musical Key
              </label>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="input-field w-full text-sm font-mono bg-zinc-900"
              >
                {MUSICAL_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Visibility Status
              </label>
              <select
                value={isActive ? "active" : "draft"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="input-field w-full text-sm font-semibold bg-zinc-900"
              >
                <option value="active">🟢 Active (Live in Store)</option>
                <option value="draft">⚪ Draft (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Genres * (Select applicable)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-lg bg-zinc-950/40 border border-zinc-800">
              {GENRES.map((g) => {
                const selected = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                      selected
                        ? "bg-purple-500 text-white font-bold"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1 flex items-center gap-1">
              <Tag size={12} className="text-purple-400" /> Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="input-field w-full text-xs"
              placeholder="e.g. drake, dark, ambient, trap, bass"
            />
          </div>

          {/* Tiered Pricing */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2 flex items-center gap-1">
              <DollarSign size={13} className="text-emerald-400" /> Tiered Format Pricing (USD)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(["mp3", "wav", "flac", "stems"] as BeatFormat[]).map((fmt) => (
                <div key={fmt} className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800">
                  <span className="text-[10px] font-bold uppercase text-purple-300 block mb-1">
                    {fmt}
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-xs text-zinc-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={prices[fmt]}
                      onChange={(e) => handlePriceChange(fmt, parseFloat(e.target.value) || 0)}
                      className="input-field w-full text-xs pl-6 font-mono font-bold text-emerald-400"
                    />
                  </div>
                </div>
              ))}
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
                  <Loader2 size={14} className="animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Beat Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

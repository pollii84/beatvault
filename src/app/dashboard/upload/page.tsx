"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GENRES, FORMATS, MUSICAL_KEYS, BeatFormat } from "@/lib/types";
import {
  uploadBeatFile,
  uploadCoverArt,
  validateFile,
  formatFileSize,
  UploadProgress,
  ACCEPTED_AUDIO_TYPES,
  FILE_SIZE_LIMITS,
} from "@/lib/storage";
import { createBeat } from "@/lib/firestore";
import {
  Music,
  FileAudio,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

// ===== Step Definitions =====
const STEPS = [
  { id: "files", label: "Audio Files", icon: <FileAudio size={16} /> },
  { id: "metadata", label: "Metadata", icon: <Tag size={16} /> },
  { id: "pricing", label: "Pricing", icon: <DollarSign size={16} /> },
  { id: "cover", label: "Cover Art", icon: <ImageIcon size={16} /> },
  { id: "review", label: "Review & Publish", icon: <Check size={16} /> },
];

// ===== File Upload Item =====
interface FileUploadItem {
  file: File;
  format: string;
  progress: UploadProgress | null;
  url: string | null;
  error: string | null;
}

export default function UploadPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Step 1 — Audio files
  const [audioFiles, setAudioFiles] = useState<Map<string, FileUploadItem>>(new Map());

  // Step 2 — Metadata
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [bpm, setBpm] = useState<number>(120);
  const [musicalKey, setMusicalKey] = useState("Cm");
  const [tags, setTags] = useState("");

  // Step 3 — Pricing
  const [prices, setPrices] = useState<Record<string, number>>({
    mp3: 9.99,
    wav: 19.99,
    flac: 24.99,
    stems: 49.99,
  });
  const [isFree, setIsFree] = useState(false);

  // Step 4 — Cover Art
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Producer role check
  const isProducer = profile?.role === "producer" || profile?.role === "both";

  // ===== Audio File Handlers =====
  const handleAddFile = (format: string, file: File) => {
    const validation = validateFile(file, format);
    const item: FileUploadItem = {
      file,
      format,
      progress: null,
      url: null,
      error: validation.valid ? null : validation.error || "Invalid file",
    };
    setAudioFiles((prev) => new Map(prev).set(format, item));
  };

  const handleRemoveFile = (format: string) => {
    setAudioFiles((prev) => {
      const next = new Map(prev);
      next.delete(format);
      return next;
    });
  };

  const handleDrop = useCallback(
    (format: string) => (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleAddFile(format, file);
    },
    []
  );

  const handleFileInput = (format: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAddFile(format, file);
  };

  // ===== Cover Art Handlers =====
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ===== Genre Toggle =====
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  // ===== Publish =====
  const handlePublish = async () => {
    if (!user) return;
    setIsPublishing(true);
    setPublishError(null);

    try {
      // 1. Generate a temporary beat ID
      const beatId = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // 2. Upload audio files
      const fileUrls: Record<string, string> = {};
      for (const [format, item] of audioFiles.entries()) {
        if (item.error) continue;
        const { promise } = uploadBeatFile(item.file, user.uid, beatId, format, (progress) => {
          setAudioFiles((prev) => {
            const next = new Map(prev);
            const existing = next.get(format);
            if (existing) next.set(format, { ...existing, progress });
            return next;
          });
        });
        fileUrls[format] = await promise;
      }

      // 3. Upload cover art
      let coverArtUrl = "";
      if (coverFile) {
        const { promise } = uploadCoverArt(coverFile, user.uid, beatId);
        coverArtUrl = await promise;
      }

      // 4. Create Firestore document
      const availableFormats = Array.from(audioFiles.keys()) as BeatFormat[];
      const beatPrices: Record<string, number> = {};
      for (const fmt of availableFormats) {
        beatPrices[fmt] = isFree ? 0 : prices[fmt] || 0;
      }

      await createBeat({
        producerId: user.uid,
        producerName: profile?.displayName || "Unknown",
        producerAvatar: profile?.avatarUrl || "",
        title,
        description,
        genres: selectedGenres,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        formats: availableFormats,
        bpm,
        key: musicalKey,
        duration: 0, // Could be calculated from audio
        prices: beatPrices as Record<BeatFormat, number>,
        previewUrl: fileUrls["mp3"] || Object.values(fileUrls)[0] || "",
        waveformData: Array.from({ length: 60 }, () => Math.random() * 0.8 + 0.2),
        coverArtUrl,
        isActive: true,
        isFree,
      });

      router.push("/dashboard?uploaded=true");
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Failed to publish beat");
    } finally {
      setIsPublishing(false);
    }
  };

  // ===== Validation per Step =====
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return audioFiles.size > 0 && Array.from(audioFiles.values()).some((f) => !f.error);
      case 1:
        return title.trim().length > 0 && selectedGenres.length > 0;
      case 2:
        return true;
      case 3:
        return true; // Cover art is optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isProducer) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <Music size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Producer Account Required
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          You need a producer account to upload beats. Update your profile role to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          Upload Beat
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Share your beats with the world
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
        {STEPS.map((step, i) => (
          <React.Fragment key={step.id}>
            <button
              onClick={() => i < currentStep && setCurrentStep(i)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
              style={{
                background:
                  i === currentStep
                    ? "rgba(139, 92, 246, 0.15)"
                    : i < currentStep
                    ? "rgba(16, 185, 129, 0.1)"
                    : "transparent",
                color:
                  i === currentStep
                    ? "var(--accent-purple-light)"
                    : i < currentStep
                    ? "var(--accent-green)"
                    : "var(--text-muted)",
                border:
                  i === currentStep
                    ? "1px solid rgba(139, 92, 246, 0.3)"
                    : "1px solid transparent",
                cursor: i < currentStep ? "pointer" : "default",
              }}
            >
              {i < currentStep ? <Check size={14} /> : step.icon}
              {step.label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight
                size={14}
                style={{ color: "var(--text-muted)", flexShrink: 0 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ===== STEP 0: Audio Files ===== */}
      {currentStep === 0 && (
        <div className="animate-fadeIn space-y-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Upload Audio Files
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload at least one format. Each format will have its own price tier.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMATS.map((fmt) => {
              const existing = audioFiles.get(fmt.value);
              return (
                <div
                  key={fmt.value}
                  onDrop={handleDrop(fmt.value)}
                  onDragOver={(e) => e.preventDefault()}
                  className="rounded-xl p-5 transition-all relative"
                  style={{
                    background: existing ? "rgba(139, 92, 246, 0.06)" : "var(--bg-secondary)",
                    border: existing
                      ? "1px dashed rgba(139, 92, 246, 0.4)"
                      : "1px dashed var(--border-default)",
                  }}
                >
                  {existing && (
                    <button
                      onClick={() => handleRemoveFile(fmt.value)}
                      className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/10 transition"
                    >
                      <X size={14} style={{ color: "var(--text-muted)" }} />
                    </button>
                  )}

                  <div className="text-center">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-3"
                      style={{
                        background: existing
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(139, 92, 246, 0.1)",
                        color: existing ? "var(--accent-green)" : "var(--accent-purple-light)",
                      }}
                    >
                      {existing ? <Check size={18} /> : <FileAudio size={18} />}
                    </div>

                    <p className="text-sm font-semibold mb-0.5">{fmt.label}</p>
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      {fmt.description}
                    </p>

                    {existing ? (
                      <div>
                        <p className="text-xs font-medium truncate" style={{ color: "var(--accent-green)" }}>
                          {existing.file.name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {formatFileSize(existing.file.size)}
                        </p>
                        {existing.error && (
                          <p className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: "#ef4444" }}>
                            <AlertCircle size={12} /> {existing.error}
                          </p>
                        )}
                        {existing.progress && (
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${existing.progress.percent}%`,
                                background: "var(--gradient-primary)",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="cursor-pointer">
                          <span
                            className="inline-block px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:translate-y-[-1px]"
                            style={{
                              background: "rgba(139, 92, 246, 0.15)",
                              color: "var(--accent-purple-light)",
                            }}
                          >
                            Choose File
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept={ACCEPTED_AUDIO_TYPES[fmt.value]?.join(",") || "*"}
                            onChange={handleFileInput(fmt.value)}
                          />
                        </label>
                        <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                          or drag & drop • Max {Math.round(FILE_SIZE_LIMITS[fmt.value] / (1024 * 1024))}MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== STEP 1: Metadata ===== */}
      {currentStep === 1 && (
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Beat Details
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midnight Phantom"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              id="beat-title-input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your beat — mood, instruments, intended use..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              id="beat-description-input"
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-medium mb-2">Genres * (select at least one)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
                  style={{
                    background: selectedGenres.includes(genre)
                      ? "rgba(139, 92, 246, 0.2)"
                      : "var(--bg-secondary)",
                    color: selectedGenres.includes(genre)
                      ? "var(--accent-purple-light)"
                      : "var(--text-secondary)",
                    border: selectedGenres.includes(genre)
                      ? "1px solid rgba(139, 92, 246, 0.4)"
                      : "1px solid var(--border-subtle)",
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* BPM & Key */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">BPM</label>
              <input
                type="number"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 0)}
                min={40}
                max={300}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                id="beat-bpm-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <select
                value={musicalKey}
                onChange={(e) => setMusicalKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all cursor-pointer"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                id="beat-key-select"
              >
                {MUSICAL_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. dark, melodic, hard-hitting, 808"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              id="beat-tags-input"
            />
          </div>
        </div>
      )}

      {/* ===== STEP 2: Pricing ===== */}
      {currentStep === 2 && (
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Set Your Prices
          </h2>

          {/* Free toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: isFree ? "rgba(16, 185, 129, 0.08)" : "var(--bg-secondary)",
              border: isFree ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-subtle)",
            }}
          >
            <div>
              <p className="text-sm font-medium">Free Beat</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Make this beat available for free download
              </p>
            </div>
            <button
              onClick={() => setIsFree(!isFree)}
              className="w-11 h-6 rounded-full transition-all relative cursor-pointer"
              style={{
                background: isFree ? "var(--accent-green)" : "var(--bg-tertiary)",
              }}
            >
              <div
                className="w-5 h-5 rounded-full absolute top-0.5 transition-all"
                style={{
                  background: "white",
                  left: isFree ? "22px" : "2px",
                }}
              />
            </button>
          </div>

          {/* Price inputs per format */}
          {!isFree && (
            <div className="space-y-3">
              {FORMATS.map((fmt) => {
                const hasFile = audioFiles.has(fmt.value);
                return (
                  <div
                    key={fmt.value}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      opacity: hasFile ? 1 : 0.4,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          color: "var(--accent-purple-light)",
                        }}
                      >
                        <FileAudio size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fmt.label}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {fmt.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        $
                      </span>
                      <input
                        type="number"
                        value={prices[fmt.value] || 0}
                        onChange={(e) =>
                          setPrices((prev) => ({
                            ...prev,
                            [fmt.value]: parseFloat(e.target.value) || 0,
                          }))
                        }
                        step={0.01}
                        min={0}
                        disabled={!hasFile}
                        className="w-20 px-3 py-2 rounded-lg text-sm text-right outline-none"
                        style={{
                          background: "var(--bg-tertiary)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== STEP 3: Cover Art ===== */}
      {currentStep === 3 && (
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Cover Art
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload album artwork (optional). Recommended 1000×1000 pixels, JPEG/PNG/WebP.
          </p>

          <div className="flex flex-col items-center">
            <div
              onClick={() => coverInputRef.current?.click()}
              className="w-64 h-64 rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center transition-all hover:scale-[1.02]"
              style={{
                background: coverPreview ? "transparent" : "var(--bg-secondary)",
                border: coverPreview
                  ? "2px solid rgba(139, 92, 246, 0.4)"
                  : "2px dashed var(--border-default)",
              }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon
                    size={36}
                    className="mx-auto mb-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Click to upload
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Max 5MB
                  </p>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverSelect}
            />
            {coverFile && (
              <div className="mt-3 text-center">
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {coverFile.name} • {formatFileSize(coverFile.size)}
                </p>
                <button
                  onClick={() => {
                    setCoverFile(null);
                    setCoverPreview(null);
                  }}
                  className="text-xs mt-1 cursor-pointer"
                  style={{ color: "var(--accent-pink)" }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== STEP 4: Review & Publish ===== */}
      {currentStep === 4 && (
        <div className="animate-fadeIn space-y-6">
          <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            Review & Publish
          </h2>

          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Preview card */}
            <div className="flex gap-4">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <Music size={24} style={{ color: "var(--text-muted)" }} />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  {title || "Untitled Beat"}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {selectedGenres.join(", ") || "No genre"} • {bpm} BPM • {musicalKey}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {description || "No description"}
                </p>
              </div>
            </div>

            {/* Files summary */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                FILES
              </p>
              <div className="space-y-1">
                {Array.from(audioFiles.entries()).map(([format, item]) => (
                  <div
                    key={format}
                    className="flex items-center justify-between text-xs py-1"
                  >
                    <span className="font-medium">{format.toUpperCase()}</span>
                    <span style={{ color: item.error ? "#ef4444" : "var(--text-secondary)" }}>
                      {item.error || `${formatFileSize(item.file.size)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing summary */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                PRICING
              </p>
              {isFree ? (
                <p className="text-sm font-bold" style={{ color: "var(--accent-green)" }}>
                  FREE
                </p>
              ) : (
                <div className="space-y-1">
                  {Array.from(audioFiles.keys()).map((format) => (
                    <div
                      key={format}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <span className="font-medium">{format.toUpperCase()}</span>
                      <span>${(prices[format] || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {tags && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
                  TAGS
                </p>
                <div className="flex flex-wrap gap-1">
                  {tags.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {publishError && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-xs"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#ef4444",
              }}
            >
              <AlertCircle size={14} />
              {publishError}
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="btn-primary w-full flex items-center justify-center gap-2"
            id="publish-beat-btn"
          >
            {isPublishing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Publish to Marketplace
              </>
            )}
          </button>
        </div>
      )}

      {/* ===== Navigation Buttons ===== */}
      <div className="flex items-center justify-between mt-10">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-subtle)",
            color: currentStep === 0 ? "var(--text-muted)" : "var(--text-primary)",
            opacity: currentStep === 0 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {currentStep < STEPS.length - 1 && (
          <button
            onClick={() => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1))}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
            style={{
              background: canProceed() ? "var(--gradient-primary)" : "var(--bg-tertiary)",
              color: canProceed() ? "white" : "var(--text-muted)",
              opacity: canProceed() ? 1 : 0.6,
            }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

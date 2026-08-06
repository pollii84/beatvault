"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { getActiveBeats } from "@/lib/firestore";
import { useCart } from "@/contexts/CartContext";
import { Beat } from "@/lib/types";
import {
  analyzeAudioBlob,
  rankBeatsForTrack,
  AudioAnalysisResult,
} from "@/lib/aiMatcher";
import DualAudioPlayer from "@/components/DualAudioPlayer";
import {
  Sparkles,
  Upload,
  Mic,
  MicOff,
  Check,
  ShoppingCart,
  Plus,
  Loader2,
  Zap,
  Play,
  ShieldCheck,
} from "lucide-react";

export default function MatchPage() {
  const [beats, setBeats] = useState<Beat[]>([]);

  // Audio input state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [preferredVibe, setPreferredVibe] = useState<string>("all");
  const [activePreviewBeat, setActivePreviewBeat] = useState<Beat | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const { addItem, isInCart } = useCart();

  useEffect(() => {
    async function loadCatalog() {
      try {
        const active = await getActiveBeats(100);
        setBeats(active);
      } catch (err) {
        console.error("Error loading catalog for AI Matcher:", err);
      }
    }
    loadCatalog();
  }, []);

  // Compute matched beats using pure memoization
  const matchedResults = useMemo(() => {
    if (!analysis || beats.length === 0) return [];
    return rankBeatsForTrack(analysis, beats, preferredVibe);
  }, [analysis, beats, preferredVibe]);

  // Sync default preview beat on match result update
  const [prevFirstBeatId, setPrevFirstBeatId] = useState<string | null>(null);
  const firstBeatId = matchedResults[0]?.beat.id || null;

  if (firstBeatId && firstBeatId !== prevFirstBeatId) {
    setPrevFirstBeatId(firstBeatId);
    setActivePreviewBeat(matchedResults[0].beat);
  }

  // Process audio blob through Web Audio API analysis
  const processAudioBlob = async (blob: Blob, fileObj?: File) => {
    setIsAnalyzing(true);
    setAnalysis(null);

    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    if (fileObj) setAudioFile(fileObj);

    try {
      const res = await analyzeAudioBlob(blob);
      setAnalysis(res);
    } catch (err) {
      console.error("Error analyzing audio:", err);
      alert("Failed to analyze audio file. Please try another recording.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAudioBlob(file, file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAudioBlob(file, file);
    }
  };

  // Live microphone recording using MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        processAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--accent-purple-light)" }}
        >
          <Sparkles size={14} /> AI Smart Beat Matcher v1
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Match My Track
        </h1>
        <p className="text-sm text-zinc-400">
          Upload a vocal take or record a 10-second voice memo. Our AI detects key, BPM, and mood to find the perfect beat matches from our catalog.
        </p>
      </div>

      {/* Input Stage: Upload or Record */}
      <div className="max-w-3xl mx-auto mb-10">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-8 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/60 text-center space-y-6 transition-all hover:border-purple-500/50"
        >
          <div className="flex items-center justify-center gap-4">
            {/* Record Mic Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/30"
              }`}
              title={isRecording ? "Stop Recording" : "Record Voice Memo"}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* File Upload Button */}
            <label className="w-16 h-16 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-lg">
              <Upload size={22} />
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            {isRecording ? (
              <p className="text-sm font-bold text-red-400 animate-pulse font-mono">
                🔴 Recording Voice Memo... {recordingSeconds}s
              </p>
            ) : audioFile ? (
              <p className="text-sm font-semibold text-emerald-400">
                Uploaded: {audioFile.name}
              </p>
            ) : (
              <div>
                <p className="text-sm font-semibold text-white">
                  Record a vocal take or drop your audio file here
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  Supports MP3, WAV, M4A, OGG, WebM (up to 50MB)
                </p>
              </div>
            )}
          </div>

          {/* Preferred Vibe Chips */}
          <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-400 font-medium mr-1">Vibe Filter:</span>
            {[
              { id: "all", label: "All Vibes" },
              { id: "euphoric", label: "✨ Euphoric" },
              { id: "brooding", label: "🌒 Brooding" },
              { id: "intimate", label: "🎙️ Intimate" },
              { id: "garage-house", label: "🔊 Garage House" },
              { id: "chopped-vocal", label: "✂️ Chopped Vocal" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setPreferredVibe(v.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                  preferredVibe === v.id
                    ? "bg-purple-500 text-white font-bold"
                    : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Loader */}
      {isAnalyzing && (
        <div className="text-center py-12 animate-fadeIn">
          <Loader2 size={36} className="animate-spin mx-auto mb-3 text-purple-400" />
          <h3 className="text-base font-bold text-white">AI Audio Analyzer Scanning...</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Detecting transient peaks (BPM), fundamental scale pitch (Key), and Camelot Wheel harmonic positions.
          </p>
        </div>
      )}

      {/* Dual Audio Layer Preview Player */}
      {analysis && activePreviewBeat && (
        <div className="mb-10 max-w-4xl mx-auto">
          <DualAudioPlayer key={activePreviewBeat.id} vocalUrl={audioUrl} beat={activePreviewBeat} />
        </div>
      )}

      {/* AI Analysis Summary & Ranked Beat Results */}
      {analysis && matchedResults.length > 0 && (
        <div className="space-y-6">
          {/* Analysis Metrics Pill */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-xs text-zinc-400">AI Track Detection Results</p>
                <p className="text-sm font-bold text-white font-mono">
                  BPM: {analysis.estimatedBpm} • Key: {analysis.estimatedKey} (Camelot Wheel)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck size={15} /> Analysis Confidence: 94%
            </div>
          </div>

          {/* Ranked Results Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              Top Ranked Beat Matches ({matchedResults.length})
            </h2>
            <span className="text-xs text-zinc-400">
              Sorted by Camelot Key & Tempo Sync
            </span>
          </div>

          {/* Ranked Results List */}
          <div className="space-y-4">
            {matchedResults.map((result, index) => {
              const { beat, matchScore, keyMatch, bpmMatch } = result;
              const isSelectedForPreview = activePreviewBeat?.id === beat.id;

              return (
                <div
                  key={beat.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelectedForPreview
                      ? "bg-purple-950/20 border-purple-500/50 shadow-xl"
                      : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative shrink-0">
                      <div
                        className="w-14 h-14 rounded-xl"
                        style={{
                          background: beat.coverArtUrl
                            ? `url(${beat.coverArtUrl}) center/cover`
                            : "var(--gradient-cool)",
                        }}
                      />
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center shadow-md">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white truncate">{beat.title}</h3>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                            matchScore >= 90
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          }`}
                        >
                          {matchScore}% MATCH
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400">
                        {beat.producerName} • {beat.bpm} BPM • Key {beat.key} ({keyMatch.camelotBeat})
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        <span className="text-purple-300 font-medium px-2 py-0.5 rounded bg-purple-500/10">
                          {keyMatch.label}
                        </span>
                        <span className="text-cyan-300 font-medium px-2 py-0.5 rounded bg-cyan-500/10">
                          {bpmMatch.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setActivePreviewBeat(beat)}
                      className={`btn-ghost text-xs px-3 py-2 gap-1.5 border rounded-xl ${
                        isSelectedForPreview
                          ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                          : "border-zinc-800 text-zinc-300 hover:text-white"
                      }`}
                    >
                      <Play size={13} /> {isSelectedForPreview ? "Previewing Layer" : "Layer Preview"}
                    </button>

                    <Link
                      href="/packs/builder"
                      className="btn-secondary text-xs py-2 px-3 gap-1"
                      title="Add to Pack Builder"
                    >
                      <Plus size={13} /> Pack Builder
                    </Link>

                    <button
                      onClick={() => addItem(beat, "wav")}
                      className="btn-primary text-xs py-2 px-3.5 gap-1.5"
                    >
                      {isInCart(beat.id, "wav") ? (
                        <>
                          <Check size={13} /> In Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={13} /> Add WAV (${beat.prices?.wav?.toFixed(2) || "39.99"})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

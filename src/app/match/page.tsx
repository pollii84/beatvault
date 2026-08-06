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
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Volume2,
  ArrowRight,
} from "lucide-react";

export default function MatchPage() {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Audio input state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [inputTitle, setInputTitle] = useState<string>("");

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Analysis & Status State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<"idle" | "success" | "warning" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
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

  // Set audio input from file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      setInputTitle(file.name);
      setAnalysis(null);
      setAnalysisStatus("idle");
      setActiveStep(2);
    }
  };

  // Set audio input from dropzone
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      setInputTitle(file.name);
      setAnalysis(null);
      setAnalysisStatus("idle");
      setActiveStep(2);
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
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setInputTitle(`Voice Memo (${recordingSeconds}s)`);
        setAnalysis(null);
        setAnalysisStatus("idle");
        setActiveStep(2);
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

  // Reset audio input
  const resetAudioInput = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setInputTitle("");
    setAnalysis(null);
    setAnalysisStatus("idle");
    setStatusMessage("");
    setActiveStep(1);
  };

  // Explicit Trigger Action: Analyze & Find Beat Matches
  const runAiMatching = async () => {
    if (!audioBlob) {
      alert("Please upload an audio file or record a voice memo first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus("idle");
    setStatusMessage("");
    setActiveStep(3);

    try {
      const res = await analyzeAudioBlob(audioBlob);
      setAnalysis(res);
      setAnalysisStatus("success");
      setStatusMessage(
        `Analysis Successful! Key Detected: ${res.estimatedKey} • Estimated Tempo: ${res.estimatedBpm} BPM (Confidence: ${res.confidence}%)`
      );
    } catch (err) {
      console.error("Analysis failure:", err);
      setAnalysisStatus("error");
      setStatusMessage("Could not decode audio pitch spectrum. Please try uploading a WAV or MP3 file.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider"
          style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "1px solid rgba(245, 158, 11, 0.3)" }}
        >
          <Sparkles size={14} /> AI Smart Beat Matcher v1
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Match My Track
        </h1>
        <p className="text-sm text-zinc-400">
          Upload a vocal take or record a voice memo. Our AI engine scans key, BPM, and mood to rank catalog beat matches using Camelot Wheel harmonic rules.
        </p>
      </div>

      {/* Wizard Step Indicator */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
          <div
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeStep === 1
                ? "bg-purple-600 text-white shadow-lg"
                : audioBlob
                ? "bg-zinc-800 text-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
              {audioBlob ? "✓" : "1"}
            </span>
            <span>1. Input Audio</span>
          </div>

          <div
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeStep === 2
                ? "bg-purple-600 text-white shadow-lg"
                : analysis
                ? "bg-zinc-800 text-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
              {analysis ? "✓" : "2"}
            </span>
            <span>2. Vibe & Run</span>
          </div>

          <div
            className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeStep === 3
                ? "bg-purple-600 text-white shadow-lg"
                : "text-zinc-500"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
              3
            </span>
            <span>3. Matched Beats</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Step 1: Input Audio (Upload File OR Record Mic) */}
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-mono">1</span>
              Step 1: Provide Vocal Take or Voice Memo
            </h2>
            {audioBlob && (
              <button
                onClick={resetAudioInput}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1"
              >
                <RotateCcw size={13} /> Change Input
              </button>
            )}
          </div>

          {!audioBlob ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="p-8 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 text-center space-y-6 transition-all hover:border-purple-500/50"
            >
              <div className="flex items-center justify-center gap-4">
                {/* Record Mic Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all ${
                    isRecording
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
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
                    🔴 Recording Mic Input... {recordingSeconds}s (Click red button to finish)
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Click the Mic to Record or Drop your Audio File here
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Supports MP3, WAV, M4A, OGG, WebM (up to 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Loaded Audio Player Preview */
            <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-400 uppercase tracking-wider">Audio Loaded</span>
                  <span className="text-zinc-400 font-mono">• {inputTitle}</span>
                </div>
                <button onClick={resetAudioInput} className="text-zinc-500 hover:text-white">
                  Remove
                </button>
              </div>

              {audioUrl && (
                <div className="flex items-center gap-3 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                  <Volume2 size={18} className="text-purple-400 shrink-0" />
                  <audio controls src={audioUrl} className="w-full h-8 accent-purple-500" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: Configure Vibe & Explicit Action Trigger Button */}
        {audioBlob && (
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-6 animate-fadeIn">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-mono">2</span>
              Step 2: Select Aesthetic Vibe & Run AI Scan
            </h2>

            {/* Vibe Selection */}
            <div>
              <label className="text-xs text-zinc-400 font-medium mb-2 block">
                Target Vibe Filter:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
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
                    className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                      preferredVibe === v.id
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* THE EXPLICIT TRIGGER ACTION BUTTON */}
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={runAiMatching}
                disabled={isAnalyzing}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-purple-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-purple-900/30 transition-transform active:scale-[0.99] disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin text-black" />
                    Scanning Key, BPM & Camelot Harmonics...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Run AI Audio Scan & Find Beat Matches
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analysis Status Confirmation Banners & Results */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Status Banner: Scanning Loader */}
            {isAnalyzing && (
              <div className="p-8 rounded-2xl bg-zinc-900 border border-purple-500/40 text-center space-y-3">
                <Loader2 size={36} className="animate-spin mx-auto text-amber-400" />
                <h3 className="text-base font-bold text-white">Scanning Audio Transient Spectrum...</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Calculating fundamental scale pitch, energy transients (BPM), and Camelot Wheel harmonic positions.
                </p>
              </div>
            )}

            {/* Status Banner: Confirmation of Completion */}
            {analysisStatus === "success" && analysis && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 size={18} /> AI Scan Completed Successfully
                </div>
                <p className="text-xs text-emerald-200 font-mono">
                  {statusMessage}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Key: {analysis.estimatedKey}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Tempo: {analysis.estimatedBpm} BPM
                  </span>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                    Density: {analysis.vocalDensity}
                  </span>
                </div>
              </div>
            )}

            {/* Status Banner: Non-Completion / Warning */}
            {analysisStatus === "error" && (
              <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertTriangle size={18} /> Audio Processing Error
                </div>
                <p className="text-xs text-red-200">
                  {statusMessage}
                </p>
              </div>
            )}

            {/* Dual Audio Layer Preview Player */}
            {analysis && activePreviewBeat && (
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  Live Vocal + Beat Layer Preview
                </h3>
                <DualAudioPlayer key={activePreviewBeat.id} vocalUrl={audioUrl} beat={activePreviewBeat} />
              </div>
            )}

            {/* Ranked Beat Results List */}
            {analysis && matchedResults.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    Top Ranked Beat Matches ({matchedResults.length})
                  </h2>
                  <span className="text-xs text-zinc-400">
                    Sorted by Camelot Key & Tempo Sync
                  </span>
                </div>

                <div className="space-y-4">
                  {matchedResults.map((result, index) => {
                    const { beat, matchScore, keyMatch, bpmMatch } = result;
                    const isSelectedForPreview = activePreviewBeat?.id === beat.id;

                    return (
                      <div
                        key={beat.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isSelectedForPreview
                            ? "bg-purple-950/30 border-purple-500/60 shadow-xl"
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
                                ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold"
                                : "border-zinc-800 text-zinc-300 hover:text-white"
                            }`}
                          >
                            <Play size={13} /> {isSelectedForPreview ? "Layer Previewing" : "Layer Preview"}
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
        )}
      </div>
    </div>
  );
}

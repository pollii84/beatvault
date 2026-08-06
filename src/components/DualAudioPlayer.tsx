"use client";

import React, { useState, useEffect, useRef } from "react";
import { Beat } from "@/lib/types";
import { Play, Pause, Volume2, Mic, Music, RotateCcw, VolumeX } from "lucide-react";

interface DualAudioPlayerProps {
  vocalUrl: string | null;
  beat: Beat | null;
}

export default function DualAudioPlayer({ vocalUrl, beat }: DualAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [vocalVolume, setVocalVolume] = useState(0.85);
  const [beatVolume, setBeatVolume] = useState(0.85);
  const [vocalMuted, setVocalMuted] = useState(false);
  const [beatMuted, setBeatMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const beatAudioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Audio elements volume sync

  useEffect(() => {
    if (vocalAudioRef.current) {
      vocalAudioRef.current.volume = vocalMuted ? 0 : vocalVolume;
    }
  }, [vocalVolume, vocalMuted]);

  useEffect(() => {
    if (beatAudioRef.current) {
      beatAudioRef.current.volume = beatMuted ? 0 : beatVolume;
    }
  }, [beatVolume, beatMuted]);

  const updateProgress = () => {
    if (beatAudioRef.current) {
      const cur = beatAudioRef.current.currentTime;
      const dur = beatAudioRef.current.duration || 1;
      setProgress((cur / dur) * 100);

      if (!beatAudioRef.current.paused) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    }
  };

  const toggleMasterPlay = () => {
    if (!beatAudioRef.current) return;

    if (isPlaying) {
      beatAudioRef.current.pause();
      if (vocalAudioRef.current) vocalAudioRef.current.pause();
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    } else {
      // Sync playback start
      beatAudioRef.current.play().then(() => {
        if (vocalAudioRef.current) {
          vocalAudioRef.current.currentTime = beatAudioRef.current?.currentTime || 0;
          vocalAudioRef.current.play().catch(() => {});
        }
        setIsPlaying(true);
        updateProgress();
      }).catch((err) => console.error("Error playing audio layer:", err));
    }
  };

  const handleRestart = () => {
    if (beatAudioRef.current) beatAudioRef.current.currentTime = 0;
    if (vocalAudioRef.current) vocalAudioRef.current.currentTime = 0;
    setProgress(0);
    if (!isPlaying) {
      toggleMasterPlay();
    }
  };

  if (!beat) {
    return (
      <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center text-xs text-zinc-500">
        Select a matched beat below to layer your vocal preview in real time.
      </div>
    );
  }

  return (
    <div
      className="p-5 rounded-2xl border border-purple-500/30 bg-zinc-900/90 shadow-2xl space-y-4 animate-fadeIn"
      style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(15, 23, 42, 0.95))" }}
    >
      {/* Hidden Audio Elements */}
      {vocalUrl && <audio ref={vocalAudioRef} src={vocalUrl} loop />}
      {beat.previewUrl && <audio ref={beatAudioRef} src={beat.previewUrl} loop />}

      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMasterPlay}
            className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                LIVE DUAL-LAYER MIX
              </span>
              <span className="text-xs text-zinc-400">• {beat.bpm} BPM • {beat.key}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-heading)" }}>
              {beat.title}
            </h3>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="btn-ghost text-xs p-2 text-zinc-400 hover:text-white flex items-center gap-1"
          title="Restart both audio tracks"
        >
          <RotateCcw size={14} /> Sync Restart
        </button>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden cursor-pointer">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Independent Volume Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
        {/* User Vocal Layer */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-500/15 text-pink-400 flex items-center justify-center shrink-0">
            <Mic size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-zinc-200 truncate">Your Vocal Take</span>
              <button
                onClick={() => setVocalMuted(!vocalMuted)}
                className="text-zinc-400 hover:text-white"
              >
                {vocalMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={vocalMuted ? 0 : vocalVolume}
              onChange={(e) => {
                setVocalMuted(false);
                setVocalVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-pink-500 h-1 rounded bg-zinc-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Matched Beat Layer */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <Music size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-zinc-200 truncate">{beat.title} Beat</span>
              <button
                onClick={() => setBeatMuted(!beatMuted)}
                className="text-zinc-400 hover:text-white"
              >
                {beatMuted ? <VolumeX size={13} className="text-red-400" /> : <Volume2 size={13} />}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={beatMuted ? 0 : beatVolume}
              onChange={(e) => {
                setBeatMuted(false);
                setBeatVolume(parseFloat(e.target.value));
              }}
              className="w-full accent-cyan-500 h-1 rounded bg-zinc-800 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

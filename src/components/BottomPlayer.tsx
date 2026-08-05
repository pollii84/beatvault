"use client";

import React from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

export default function BottomPlayer() {
  const { currentBeat, isPlaying, progress, duration, togglePlay, seek } = usePlayer();

  if (!currentBeat) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const currentTime = (progress / 100) * duration;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    seek(pct);
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center px-4 sm:px-6 gap-4"
      style={{
        height: "var(--player-height)",
        background: "rgba(7, 6, 11, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border-subtle)",
      }}
      id="bottom-player"
    >
      {/* Beat Info */}
      <div className="flex items-center gap-3 min-w-0 w-[200px] shrink-0">
        <div
          className="w-12 h-12 rounded-lg bg-cover bg-center shrink-0"
          style={{
            backgroundImage: currentBeat.coverArtUrl
              ? `url(${currentBeat.coverArtUrl})`
              : undefined,
            background: currentBeat.coverArtUrl
              ? undefined
              : "var(--gradient-cool)",
          }}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{currentBeat.title}</p>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {currentBeat.producerName}
          </p>
        </div>
      </div>

      {/* Controls + Progress */}
      <div className="flex-1 flex flex-col items-center gap-1 max-w-xl mx-auto">
        <div className="flex items-center gap-4">
          <button className="btn-ghost p-1" id="player-prev">
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => togglePlay(currentBeat)}
            className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: "var(--gradient-primary)" }}
            id="player-toggle"
          >
            {isPlaying ? <Pause size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
          </button>
          <button className="btn-ghost p-1" id="player-next">
            <SkipForward size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {formatTime(currentTime)}
          </span>
          <div
            className="flex-1 h-1 rounded-full cursor-pointer group relative"
            style={{ background: "var(--bg-surface)" }}
            onClick={handleProgressClick}
            id="player-progress-bar"
          >
            <div
              className="h-full rounded-full relative"
              style={{
                width: `${progress}%`,
                background: "var(--gradient-primary)",
              }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "white",
                  boxShadow: "var(--shadow-glow)",
                }}
              />
            </div>
          </div>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume — Desktop only */}
      <div className="hidden sm:flex items-center gap-2 w-[140px] justify-end shrink-0">
        <Volume2 size={16} style={{ color: "var(--text-muted)" }} />
        <div
          className="w-20 h-1 rounded-full"
          style={{ background: "var(--bg-surface)" }}
        >
          <div
            className="h-full rounded-full"
            style={{ width: "70%", background: "var(--accent-purple)" }}
          />
        </div>
      </div>
    </div>
  );
}

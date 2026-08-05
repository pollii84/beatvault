"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { Beat } from "@/lib/types";

interface PlayerContextType {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  play: (beat: Beat) => void;
  pause: () => void;
  togglePlay: (beat: Beat) => void;
  seek: (percent: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType>({
  currentBeat: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  play: () => {},
  pause: () => {},
  togglePlay: () => {},
  seek: () => {},
  audioRef: { current: null },
});

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((beat: Beat) => {
    if (audioRef.current) {
      if (currentBeat?.id !== beat.id) {
        audioRef.current.src = beat.previewUrl;
        audioRef.current.load();
        setCurrentBeat(beat);
        setProgress(0);
      }
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [currentBeat?.id]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback((beat: Beat) => {
    if (currentBeat?.id === beat.id && isPlaying) {
      pause();
    } else {
      play(beat);
    }
  }, [currentBeat?.id, isPlaying, pause, play]);

  const seek = useCallback((percent: number) => {
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = (percent / 100) * duration;
    }
  }, [duration]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(pct) ? 0 : pct);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <PlayerContext.Provider
      value={{ currentBeat, isPlaying, progress, duration, play, pause, togglePlay, seek, audioRef }}
    >
      {children}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}

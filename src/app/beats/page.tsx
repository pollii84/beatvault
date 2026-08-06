"use client";

import React, { useState, useMemo, useEffect } from "react";
import BeatCard from "@/components/BeatCard";
import { MOCK_BEATS } from "@/lib/mockData";
import { getActiveBeats } from "@/lib/firestore";
import { Beat, GENRES, FORMATS, MUSICAL_KEYS } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  X,
  Grid3X3,
  List,
} from "lucide-react";

export default function BeatsPage() {
  const [dbBeats, setDbBeats] = useState<Beat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function loadDbBeats() {
      try {
        const fetched = await getActiveBeats(100);
        setDbBeats(fetched);
      } catch (err) {
        console.error("Failed to load beats from Firestore:", err);
      }
    }
    loadDbBeats();
  }, []);

  // Merge uploaded beats from Firestore with demo fallback beats
  const allBeats = useMemo(() => {
    const combined = [...dbBeats];
    MOCK_BEATS.forEach((mb) => {
      if (!combined.some((b) => b.id === mb.id)) {
        combined.push(mb);
      }
    });
    return combined;
  }, [dbBeats]);


  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedFormats([]);
    setSelectedKey("");
    setBpmRange([60, 200]);
    setPriceRange([0, 150]);
    setSearchQuery("");
  };

  const activeFilterCount =
    selectedGenres.length +
    selectedFormats.length +
    (selectedKey ? 1 : 0) +
    (bpmRange[0] !== 60 || bpmRange[1] !== 200 ? 1 : 0) +
    (priceRange[0] !== 0 || priceRange[1] !== 150 ? 1 : 0);

  const filteredBeats = useMemo(() => {
    let beats = [...allBeats];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      beats = beats.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.producerName.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      beats = beats.filter((b) => b.genres.some((g) => selectedGenres.includes(g)));
    }

    // Format filter
    if (selectedFormats.length > 0) {
      beats = beats.filter((b) => b.formats.some((f) => selectedFormats.includes(f)));
    }

    // Key filter
    if (selectedKey) {
      beats = beats.filter((b) => b.key === selectedKey);
    }

    // BPM filter
    beats = beats.filter((b) => b.bpm >= bpmRange[0] && b.bpm <= bpmRange[1]);

    // Price filter
    beats = beats.filter((b) => {
      const minPrice = Math.min(...Object.values(b.prices));
      return minPrice >= priceRange[0] && minPrice <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case "newest":
        beats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case "popular":
        beats.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case "price-low":
        beats.sort(
          (a, b) =>
            Math.min(...Object.values(a.prices)) - Math.min(...Object.values(b.prices))
        );
        break;
      case "price-high":
        beats.sort(
          (a, b) =>
            Math.min(...Object.values(b.prices)) - Math.min(...Object.values(a.prices))
        );
        break;
      case "rating":
        beats.sort((a, b) => b.avgRating - a.avgRating);
        break;
    }

    return beats;
  }, [allBeats, searchQuery, selectedGenres, selectedFormats, selectedKey, bpmRange, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
          Browse Beats
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Discover {allBeats.length} premium beats from top producers
        </p>
      </div>

      {/* Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, producer, genre, tag..."
            className="input-field pl-10"
            id="beats-search"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary text-sm relative"
            id="toggle-filters"
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: "var(--accent-purple)" }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field text-sm py-2.5 w-auto pr-8"
            style={{ backgroundImage: "none" }}
            id="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>

          <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
            <button
              onClick={() => setViewMode("grid")}
              className="p-1.5 rounded cursor-pointer"
              style={{
                background: viewMode === "grid" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "grid" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-1.5 rounded cursor-pointer"
              style={{
                background: viewMode === "list" ? "var(--bg-surface)" : "transparent",
                color: viewMode === "list" ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filter Sidebar */}
        {showFilters && (
          <aside
            className="w-60 shrink-0 hidden lg:block animate-fadeIn"
            id="filter-sidebar"
          >
            <div
              className="rounded-xl p-5 sticky top-24"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-medium cursor-pointer"
                    style={{ color: "var(--accent-purple-light)" }}
                    id="clear-filters"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Genre */}
              <div className="mb-5">
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Genre
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer"
                      style={{
                        background: selectedGenres.includes(genre) ? "rgba(139, 92, 246, 0.15)" : "var(--bg-tertiary)",
                        border: `1px solid ${selectedGenres.includes(genre) ? "rgba(139, 92, 246, 0.3)" : "var(--border-subtle)"}`,
                        color: selectedGenres.includes(genre) ? "var(--accent-purple-light)" : "var(--text-secondary)",
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="mb-5">
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Format
                </h4>
                <div className="space-y-1.5">
                  {FORMATS.map((fmt) => (
                    <label
                      key={fmt.value}
                      className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-colors hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFormats.includes(fmt.value)}
                        onChange={() => toggleFormat(fmt.value)}
                        className="accent-purple-500"
                      />
                      <div>
                        <span className="text-xs font-medium">{fmt.label}</span>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {fmt.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Key */}
              <div className="mb-5">
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Key
                </h4>
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                  className="input-field text-xs py-2"
                >
                  <option value="">Any Key</option>
                  {MUSICAL_KEYS.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {/* BPM Range */}
              <div className="mb-5">
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  BPM Range
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bpmRange[0]}
                    onChange={(e) => setBpmRange([parseInt(e.target.value) || 60, bpmRange[1]])}
                    className="input-field text-xs py-1.5 w-16 text-center"
                    min={60}
                    max={200}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>to</span>
                  <input
                    type="number"
                    value={bpmRange[1]}
                    onChange={(e) => setBpmRange([bpmRange[0], parseInt(e.target.value) || 200])}
                    className="input-field text-xs py-1.5 w-16 text-center"
                    min={60}
                    max={200}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Price Range
                </h4>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>$</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="input-field text-xs py-1.5 w-16 text-center pl-5"
                      min={0}
                    />
                  </div>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>to</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--text-muted)" }}>$</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 150])}
                      className="input-field text-xs py-1.5 w-16 text-center pl-5"
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1">
          {/* Active Filters Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedGenres.map((g) => (
                <span
                  key={g}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer"
                  style={{
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    color: "var(--accent-purple-light)",
                  }}
                  onClick={() => toggleGenre(g)}
                >
                  {g} <X size={10} />
                </span>
              ))}
              {selectedFormats.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer"
                  style={{
                    background: "rgba(6, 182, 212, 0.1)",
                    border: "1px solid rgba(6, 182, 212, 0.2)",
                    color: "var(--accent-cyan)",
                  }}
                  onClick={() => toggleFormat(f)}
                >
                  {f.toUpperCase()} <X size={10} />
                </span>
              ))}
            </div>
          )}

          {/* Results Count */}
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            {filteredBeats.length} beat{filteredBeats.length !== 1 ? "s" : ""} found
          </p>

          {filteredBeats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredBeats.map((beat, i) => (
                <div key={beat.id} className="animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                  <BeatCard beat={beat} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search size={40} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-lg font-semibold mb-2">No beats found</h3>
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                Try adjusting your filters or search query.
              </p>
              <button onClick={clearFilters} className="btn-secondary text-sm">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

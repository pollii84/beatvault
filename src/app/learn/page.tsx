"use client";

import React, { useState } from "react";
import Link from "next/link";
import StylePolicyModal from "@/components/StylePolicyModal";
import {
  BookOpen,
  Sparkles,
  Music,
  Zap,
  Sliders,
  Radio,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  FileText,
} from "lucide-react";

export default function LearnPage() {
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);

  const modules = [
    {
      id: 1,
      title: "Module 1 — Source Capture & Vocal Chopping",
      subtitle: "The Identity Technique",
      icon: <Radio size={18} className="text-purple-400" />,
      time: "90 min studio session",
      takeaways: [
        "Reverb BEFORE compression on found vocal Takes — exaggerates close voice + room fill.",
        "Tune speech into melody: pitch-correct spoken cadence onto a major/minor scale.",
        "Slice-to-MIDI: slice voice clips into pad fragments and play rhythmically like drums.",
        "Formant-shift vocal chop leads (Flex Pitch / AlterBoy) sidechained to the kick.",
      ],
      exercises: [
        "Record a 30s voice memo on phone → put reverb before compression → build a drone.",
        "Slice 4s speech clip into pads → trigger rhythmic syllables without pitched synths.",
        "Isolate one phrase, formant-shift up, and layer over a 2-chord loop sidechained to kick.",
      ],
      deliverable: "16-bar loop with voice-memo drone, rhythmic chop lead, and tuned vocal hook.",
    },
    {
      id: 2,
      title: "Module 2 — Loop-Based Arrangement Logic",
      subtitle: "Mute/Unmute Layering",
      icon: <Layers size={18} className="text-cyan-400" />,
      time: "90 min studio session",
      takeaways: [
        "Build 5 interlocking layers: drums → chord/pad → bass → lead → vocal chop.",
        "Subtraction arrangement: build 32 bars using ONLY mute automation and filtering.",
        "Transposition variation: move bass/pad rhythmic figures to different scale degrees between sections.",
        "Micro-lift device: add a single extra hit between beats 1–2 for periodic lift.",
      ],
      exercises: [
        "Set 45-min timer: build 5-layer loop from scratch to 1-min sketch.",
        "Automate muting to create 3 distinct arrangement sections from 1 loop.",
        "Transpose bassline up a 3rd or down a 4th in section 2 instead of writing a new part.",
      ],
      deliverable: "32-bar arrangement built from 1 loop set using only mute & filter automation.",
    },
    {
      id: 3,
      title: "Module 3 — Drum Treatment & UK Garage Groove",
      subtitle: "Layering & Rhythmic Pockets",
      icon: <Zap size={18} className="text-emerald-400" />,
      time: "90 min studio session",
      takeaways: [
        "Layered kicks: bus a deep sub kick + a transient-focused click kick together.",
        "Rhythmic pocket: accent the weak 16th-note step immediately BEFORE the kick for swing.",
        "Human velocity variation: manually adjust shaker/hat velocities by ear for organic feel.",
        "Sidechain-everything: duck bass, pads, and chord stabs to kick (~10ms attack / 15ms release).",
      ],
      exercises: [
        "Layer two kicks (sub + transient click), subtractive EQ first, soft clip + drum buss.",
        "Program 16-step hats accenting 16th step before kick — A/B against quantized grid.",
        "Sidechain reverb return tail directly to kick so ambient space pumps cleanly.",
      ],
      deliverable: "Glued drum bus loop with layered kicks, humanized hats, and sidechained pads.",
    },
    {
      id: 4,
      title: "Module 4 — Rolling Bass Movement",
      subtitle: "Swung Triplets & Portamento",
      icon: <Sliders size={18} className="text-amber-400" />,
      time: "60 min studio session",
      takeaways: [
        "Rolling rhythm: lengthen bass notes into 8th-note-triplet or swung durations.",
        "Mono voicing + portamento (glide at ~20%): creates sliding note-to-note movement.",
        "Heavy kick sidechain + 1kHz presence boost to cut through dance mixes.",
        "Transposition for section changes: repeat same rolling figure across scale roots.",
      ],
      exercises: [
        "Rewrite static 4th-note bassline into 8th-triplet swung rolling pattern.",
        "Set mono Serum patch with 20% glide and MG Low 24 filter envelope (~900ms decay).",
        "Automate bass in/out via filter cutoff at dropstep transition points.",
      ],
      deliverable: "Rolling bassline with mono glide, transposed root shifts, and kick sidechain.",
    },
    {
      id: 5,
      title: "Module 5 — Signature Transitions",
      subtitle: "The Dropstep & Filter Reveals",
      icon: <Sparkles size={18} className="text-pink-400" />,
      time: "90 min studio session",
      takeaways: [
        "The Dropstep: at loop start, mute bass + synths for 1 beat, leave kick + vocal stab + reverse noise.",
        "Filter-reveal build: open low-pass filter gradually ('out from underwater') instead of volume fade.",
        "Silence before impact: insert 1–2 second silent gap before drop fill.",
        "Sparse first beat: play only kick + delayed vocal on beat 1 of drop, full drop enters beat 2.",
      ],
      exercises: [
        "Automate Utility gain to -∞ dB for beat 1 of drop, add vocal stab + reverse white noise.",
        "Automate EQ low-pass filter cutoffs opening gradually into main section.",
        "Hold back full arrangement for 2 beats after drop impact to create a sucking sensation.",
      ],
      deliverable: "16-bar transition sequence with dropstep, filter reveal, and sparse first beat.",
    },
    {
      id: 6,
      title: "Module 6 — Emotional Pacing",
      subtitle: "Drone Beds & Contrast Mapping",
      icon: <Heart size={18} className="text-red-400" />,
      time: "120 min capstone session",
      takeaways: [
        "Drone-first writing: build sustained note/chord through maximal reverb before writing rhythm.",
        "Scale degree mood dial: 5th degree = consonant/sweet, 3rd degree = tense/ambiguous.",
        "Found speech anchor: build track around natural spoken cadence rather than pop lyrics.",
        "Dynamic contrast: sequence sparse, vulnerable sections against full club propulsion.",
      ],
      exercises: [
        "Build 10s reverb drone on 3rd scale degree → write 1-min sketch over it.",
        "Create 2 contrast versions of same loop: sparse (vocal+drone) vs club (drums+bass+lead).",
        "Insert 1 rich 7th chord voicing at emotional peak after simple triads.",
      ],
      deliverable: "Full 2-minute arc sketch: drone intro → found speech → contrast → dropstep → release.",
    },
  ];

  const cheatSheetItems = [
    "Reverb BEFORE compression on vocal takes.",
    "Loop build order: drums → chords/pad → bass → lead → vocal chop.",
    "Accent the 16th step BEFORE the kick, not the kick itself.",
    "Two kicks bussed & glued (sub + transient click), not one.",
    "Vary hi-hat velocity by ear — never leave grid uniform.",
    "Rolling bass = swung triplet durations + mono glide (20%), not static 4ths.",
    "Dropstep = mute everything but kick for 1 beat, add stab + reversed noise.",
    "Filter-reveal builds: open low-pass filter, don't just fader-in.",
    "1–2 seconds of true silence before impact beats a loud riser.",
    "First beat after drop = sparse (kick + vocal only), full drop on beat 2.",
    "Drone first on 5th (consonant) or 3rd (tense) scale degree.",
    "Preserve 1 imperfection per track on purpose for authentic texture.",
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(139, 92, 246, 0.15)" }}
            >
              <BookOpen size={20} style={{ color: "var(--accent-purple-light)" }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Production Masterclass & Practice Workbook
            </h1>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Deconstructed production techniques for Fred Again-style UK garage, vocal chopping, and emotional pacing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPolicyOpen(true)}
            className="btn-secondary text-xs"
          >
            <ShieldCheck size={14} /> Style Content Policy
          </button>
          <Link href="/beats?genre=Fred+Again+Type" className="btn-primary text-xs">
            <Music size={14} /> Explore Style Catalog
          </Link>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        className="rounded-2xl p-6 md:p-8 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          background:
            "linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(6, 182, 212, 0.15), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(139, 92, 246, 0.3)",
        }}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Sparkles size={13} /> Official Producer Curriculum
          </div>
          <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            6-Module Studio Practice Workbook
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Derived directly from official breakdowns, Tape Notes sessions, and ear-trained remakes. Designed for focused 60-120 minute studio sessions to drill arrangement, drum swing, rolling bass, vocal chopping, and transitions.
          </p>
        </div>

        <Link
          href="/packs/builder"
          className="btn-primary text-xs py-3 px-5 shrink-0"
        >
          <Sparkles size={14} /> Build Fred Again Pack <ArrowRight size={14} />
        </Link>
      </div>

      {/* Module Selector & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Module Navigation List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            Workbook Modules
          </h3>
          {modules.map((m) => {
            const isSelected = selectedModule === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedModule(m.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-purple-500/15 border-purple-500/40 text-white shadow-lg"
                    : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    {m.icon}
                    <span>Mod {m.id}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                    <Clock size={10} /> {m.time.split(" ")[0]}m
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-200 truncate">{m.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Selected Module Detail Panel */}
        <div className="lg:col-span-2">
          {(() => {
            const m = modules.find((mod) => mod.id === selectedModule) || modules[0];
            return (
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                    {m.icon} {m.subtitle}
                  </div>
                  <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    {m.title}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">Recommended Studio Time: {m.time}</p>
                </div>

                {/* Key Takeaways */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Core Technical Concepts
                  </h4>
                  <div className="space-y-2">
                    {m.takeaways.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/60">
                        <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Exercises */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Session Exercises
                  </h4>
                  <ol className="space-y-2 text-xs text-zinc-300 list-decimal list-inside pl-1">
                    {m.exercises.map((e, idx) => (
                      <li key={idx} className="leading-relaxed text-zinc-300">
                        {e}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Deliverable Box */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                    Session Deliverable Target
                  </h4>
                  <p className="text-xs text-zinc-200">{m.deliverable}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 12-Point Quick Reference Cheat Sheet Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Studio Quick-Reference Cheat Sheet
              </h3>
              <p className="text-xs text-zinc-400">12 Production rules to pin in your DAW workspace</p>
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-ghost text-xs px-3 py-1.5 gap-1.5 text-zinc-300 hover:text-white"
          >
            <FileText size={14} /> Print Rules
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cheatSheetItems.map((rule, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-start gap-3"
            >
              <span className="text-xs font-bold font-mono text-purple-400 shrink-0 mt-0.5">
                #{idx + 1}
              </span>
              <p className="text-xs text-zinc-300 leading-snug">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Style Policy Modal */}
      <StylePolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
      />
    </div>
  );
}

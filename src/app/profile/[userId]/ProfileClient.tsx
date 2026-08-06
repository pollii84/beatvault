"use client";

import React from "react";
import Link from "next/link";
import { User, ArrowLeft } from "lucide-react";

export default function ProfileClient() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <User size={56} className="mx-auto mb-5" style={{ color: "var(--text-muted)" }} />
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        Profile not found
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        This user profile doesn&apos;t exist yet. Profiles are created when users sign up.
      </p>
      <Link href="/beats" className="btn-primary">
        <ArrowLeft size={16} /> Browse Beats
      </Link>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";

export default function PackDetailClient() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <Package size={56} className="mx-auto mb-5" style={{ color: "var(--text-muted)" }} />
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        Pack not found
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        This beat pack doesn&apos;t exist or has been removed.
      </p>
      <Link href="/packs" className="btn-primary">
        <ArrowLeft size={16} /> Back to Packs
      </Link>
    </div>
  );
}

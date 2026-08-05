"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingBag, ArrowLeft } from "lucide-react";

export default function OrderDetailClient() {
  const params = useParams();
  const orderId = params.orderId as string;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <ShoppingBag size={56} className="mx-auto mb-5" style={{ color: "var(--text-muted)" }} />
      <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
        Order not found
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Order &quot;{orderId}&quot; doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard" className="btn-primary">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
    </div>
  );
}

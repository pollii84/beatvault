"use client";

import React from "react";
import Link from "next/link";
import { Music, AtSign, MessageCircle, Video } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border-subtle)",
        paddingBottom: "var(--player-height)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Music size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Beat<span style={{ color: "var(--accent-purple-light)" }}>Vault</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              The premium marketplace for beat samples. Find, mix, and create
              with studio-quality sounds.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="btn-icon" style={{ width: 36, height: 36 }}>
                <AtSign size={16} />
              </a>
              <a href="#" className="btn-icon" style={{ width: 36, height: 36 }}>
                <MessageCircle size={16} />
              </a>
              <a href="#" className="btn-icon" style={{ width: 36, height: 36 }}>
                <Video size={16} />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Marketplace
            </h4>
            <ul className="space-y-2.5">
              {["Browse Beats", "Beat Packs", "Genres", "New Releases", "Top Charts"].map((item) => (
                <li key={item}>
                  <Link
                    href="/beats"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Producers */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              For Producers
            </h4>
            <ul className="space-y-2.5">
              {["Sell Your Beats", "Producer Dashboard", "Analytics", "Pricing Guide", "Resources"].map((item) => (
                <li key={item}>
                  <Link
                    href="/dashboard"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
              Support
            </h4>
            <ul className="space-y-2.5">
              {["Help Center", "Contact Us", "Terms of Service", "Privacy Policy", "Licensing Info"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} BeatVault. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Made with 💜 for music producers
          </p>
        </div>
      </div>
    </footer>
  );
}

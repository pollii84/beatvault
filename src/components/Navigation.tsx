"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { signOutUser } from "@/lib/auth";
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Music,
  Package,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  Sparkles,
  Wand2,
} from "lucide-react";

export default function Navigation() {
  const { user, profile } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOutUser();
    setShowUserMenu(false);
  };

  return (
    <nav className="nav-main" id="main-navigation">
      <div className="flex items-center justify-between w-full max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" id="nav-logo">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
               style={{ background: "var(--gradient-primary)" }}>
            <Music size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden sm:block"
                style={{ fontFamily: "var(--font-heading)" }}>
            Beat<span style={{ color: "var(--accent-purple-light)" }}>Vault</span>
          </span>
        </Link>

        {/* Search Bar — Desktop */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search beats, genres, producers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 text-sm"
              id="search-input"
              style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-full)" }}
            />
          </div>
        </div>

        {/* Nav Links — Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          <Link href="/beats" className="btn-ghost text-sm" id="nav-browse">
            <Music size={16} />
            Browse
          </Link>
          <Link href="/packs" className="btn-ghost text-sm" id="nav-packs">
            <Package size={16} />
            Packs
          </Link>
          <Link href="/packs/builder" className="btn-ghost text-sm text-cyan-400 hover:text-cyan-300" id="nav-builder">
            <Sparkles size={16} />
            Pack Builder
          </Link>
          <Link href="/match" className="btn-ghost text-sm text-amber-400 hover:text-amber-300 font-bold" id="nav-match">
            <Wand2 size={16} />
            Match My Track
          </Link>
          <Link href="/learn" className="btn-ghost text-sm text-purple-400 hover:text-purple-300" id="nav-learn">
            <BookOpen size={16} />
            Learn
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-4">
          {user ? (
            <>
              <Link href="/wishlist" className="btn-icon" id="nav-wishlist" title="Wishlist">
                <Heart size={18} />
              </Link>
              <Link href="/notifications" className="btn-icon relative" id="nav-notifications" title="Notifications">
                <Bell size={18} />
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                  style={{ background: "var(--accent-pink)" }}
                >
                  3
                </span>
              </Link>
              <Link href="/cart" className="btn-icon relative" id="nav-cart" title="Cart">
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 ml-2 py-1.5 px-3 rounded-full cursor-pointer"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  id="user-menu-trigger"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {profile?.displayName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                    {profile?.displayName || "User"}
                  </span>
                  <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl py-2 animate-slideDown z-50"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                    id="user-dropdown-menu"
                  >
                    <div className="px-4 py-2 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <p className="text-sm font-medium">{profile?.displayName}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {profile?.email}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setShowUserMenu(false)}
                      id="menu-dashboard"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link
                      href={`/profile/${user.uid}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setShowUserMenu(false)}
                      id="menu-profile"
                    >
                      <User size={16} />
                      My Profile
                    </Link>
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "var(--text-secondary)" }}
                      onClick={() => setShowUserMenu(false)}
                      id="menu-wishlist"
                    >
                      <Heart size={16} />
                      Wishlist
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors hover:bg-white/5 cursor-pointer"
                      style={{ color: "#ef4444" }}
                      id="menu-signout"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm" id="nav-login">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary text-sm" id="nav-signup">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="btn-icon lg:hidden ml-1"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            id="mobile-menu-toggle"
          >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div
          className="absolute top-full left-0 right-0 py-4 px-4 lg:hidden animate-slideDown"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
          id="mobile-menu"
        >
          <div className="relative mb-3 md:hidden">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search beats..."
              className="input-field pl-10 text-sm"
              style={{ borderRadius: "var(--radius-full)" }}
            />
          </div>
          <Link
            href="/beats"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setShowMobileMenu(false)}
          >
            <Music size={18} />
            Browse Beats
          </Link>
          <Link
            href="/packs"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setShowMobileMenu(false)}
          >
            <Package size={18} />
            Beat Packs
          </Link>
          <Link
            href="/packs/builder"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-white/5 text-cyan-400"
            onClick={() => setShowMobileMenu(false)}
          >
            <Sparkles size={18} />
            Pack Builder
          </Link>
          <Link
            href="/match"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-white/5 text-amber-400 font-bold"
            onClick={() => setShowMobileMenu(false)}
          >
            <Wand2 size={18} />
            Match My Track (AI)
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors hover:bg-white/5 text-purple-400"
            onClick={() => setShowMobileMenu(false)}
          >
            <BookOpen size={18} />
            Masterclass / Learn
          </Link>
        </div>
      )}
    </nav>
  );
}

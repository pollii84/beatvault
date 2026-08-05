"use client";

import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { PlayerProvider } from "@/contexts/PlayerContext";
import Navigation from "@/components/Navigation";
import BottomPlayer from "@/components/BottomPlayer";
import Footer from "@/components/Footer";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <PlayerProvider>
          <Navigation />
          <main className="page-content flex-1">
            {children}
          </main>
          <Footer />
          <BottomPlayer />
        </PlayerProvider>
      </CartProvider>
    </AuthProvider>
  );
}

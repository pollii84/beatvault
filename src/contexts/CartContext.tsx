"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CartItem, Beat, BeatFormat } from "@/lib/types";

interface CartContextType {
  items: CartItem[];
  addItem: (beat: Beat, format: BeatFormat) => void;
  removeItem: (beatId: string, format: BeatFormat) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
  isInCart: (beatId: string, format: BeatFormat) => boolean;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  itemCount: 0,
  totalPrice: 0,
  isInCart: () => false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((beat: Beat, format: BeatFormat) => {
    setItems((prev) => {
      const exists = prev.some(
        (item) => item.beatId === beat.id && item.format === format
      );
      if (exists) return prev;
      return [
        ...prev,
        {
          beatId: beat.id,
          beat,
          format,
          price: beat.prices[format],
        },
      ];
    });
  }, []);

  const removeItem = useCallback((beatId: string, format: BeatFormat) => {
    setItems((prev) =>
      prev.filter(
        (item) => !(item.beatId === beatId && item.format === format)
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (beatId: string, format: BeatFormat) => {
      return items.some(
        (item) => item.beatId === beatId && item.format === format
      );
    },
    [items]
  );

  const itemCount = items.length;
  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, itemCount, totalPrice, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@pizzaria/validators";

interface CartStore {
  items: (CartItem & { id: string; name: string; price: number; imageUrl?: string })[];
  addItem: (item: CartItem & { name: string; price: number; imageUrl?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  itemCount: number;
  total: number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (item) => {
        const id = `${item.productId}-${JSON.stringify(item.variantIds)}-${JSON.stringify(item.composition)}`;
        const existingItem = get().items.find((i) => i.id === id);

        if (existingItem) {
          get().updateQuantity(id, existingItem.quantity + item.quantity);
        } else {
          set((state) => {
            const newItems = [...state.items, { ...item, id }];
            return {
              items: newItems,
              itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
              total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
            };
          });
        }
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set((state) => {
          const newItems = state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          );
          return {
            items: newItems,
            itemCount: newItems.reduce((sum, i) => sum + i.quantity, 0),
            total: newItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
          };
        });
      },

      clear: () => {
        set({ items: [], itemCount: 0, total: 0 });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);


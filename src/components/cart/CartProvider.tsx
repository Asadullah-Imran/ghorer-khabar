"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  kitchenId: string;
  kitchenName: string;
  kitchenLocation?: string;
  kitchenRating?: number;
  kitchenReviewCount?: number;
};

type AddItemResult = {
  success: boolean;
  message?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => AddItemResult;
  incrementItem: (id: string, delta?: number) => void;
  removeItem: (id: string) => void;
  removeItemsByKitchen: (kitchenId: string) => void;
  clearCart: () => void;
  totalItems: number;
  isInitialized: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Filter out items without valid kitchen info to prevent grouping errors
        const validItems = parsed.filter((i: CartItem) => i.kitchenId && i.kitchenId !== "unknown");
        setItems(validItems);
        // Update local storage if we filtered anything
        if (validItems.length !== parsed.length) {
            localStorage.setItem("cart", JSON.stringify(validItems));
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialized) {
        localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  const addItem = (item: Omit<CartItem, "quantity">, qty: number = 1): AddItemResult => {
    console.log("DEBUG_CART_ADD_ITEM:", item);
    
    // Validation: Check if item has required fields
    if (!item.kitchenId || item.kitchenId === "unknown") {
      return {
        success: false,
        message: "Cannot add item: Kitchen information is missing",
      };
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [...prev, { ...item, quantity: qty }];
    });

    return {
      success: true,
      message: qty > 1 
        ? `${qty}x ${item.name} added to cart`
        : `${item.name} added to cart`,
    };
  };

  const incrementItem = (id: string, delta: number = 1) => {
    setItems((prev) => {
      const copy = prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
      );
      return copy.filter((i) => i.quantity > 0);
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const removeItemsByKitchen = (kitchenId: string) => {
    setItems((prev) => prev.filter((i) => i.kitchenId !== kitchenId));
  };

  const clearCart = () => setItems([]);

  const totalItems = useMemo(
    () => items.reduce((acc, i) => acc + i.quantity, 0),
    [items]
  );

  const value: CartContextType = {
    items,
    addItem,
    incrementItem,
    removeItem,
    removeItemsByKitchen,
    clearCart,
    totalItems,
    isInitialized, 
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

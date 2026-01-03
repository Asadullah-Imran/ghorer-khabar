"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";

export function AddToCartBtn({
  minimal = false,
  item,
}: {
  minimal?: boolean;
  item: { id: string; name: string; price: number; image?: string };
}) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <button
      onClick={handleAdd}
      className={`bg-teal-600 hover:bg-teal-700 text-white rounded-full transition flex items-center justify-center ${
        minimal ? "w-8 h-8" : "px-4 py-2 text-sm font-medium gap-2"
      }`}
    >
      <Plus size={18} />
      {!minimal && "Add"}
    </button>
  );
}

export function FavoriteBtn() {
  const [liked, setLiked] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Stop navigation
        e.stopPropagation();
        setLiked(!liked);
      }}
      className={`p-2 rounded-full backdrop-blur-sm transition ${
        liked
          ? "bg-red-50 text-red-500"
          : "bg-white/70 text-gray-600 hover:bg-white"
      }`}
    >
      <Heart size={18} fill={liked ? "currentColor" : "none"} />
    </button>
  );
}

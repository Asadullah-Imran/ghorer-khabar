"use client";

import { useCart } from "@/components/cart/CartProvider";
import { Heart, Plus } from "lucide-react";
import { useState } from "react";

export function AddToCartBtn({
  minimal = false,
  item,
  disabled = false,
  isOwnDish = false,
}: {
  minimal?: boolean;
  item: {
    id: string;
    name: string;
    price: number;
    image?: string;
    kitchenId: string;
    kitchenName: string;
    kitchenLocation?: string;
    kitchenRating?: number;
    kitchenReviewCount?: number;
  };
  disabled?: boolean;
  isOwnDish?: boolean;
}) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      kitchenId: item.kitchenId,
      kitchenName: item.kitchenName,
      kitchenLocation: item.kitchenLocation,
      kitchenRating: item.kitchenRating,
      kitchenReviewCount: item.kitchenReviewCount,
    });
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      title={isOwnDish ? "You cannot add your own dishes to cart" : ""}
      className={`bg-teal-600 hover:bg-teal-700 text-white rounded-full transition flex items-center justify-center ${
        disabled
          ? "opacity-50 cursor-not-allowed bg-gray-400"
          : ""
      } ${
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

"use client";

import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/contexts/ToastContext";
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
  const toast = useToast();

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Always show toast for disabled/own dishes, even if button appears disabled
    if (disabled || isOwnDish) {
      if (isOwnDish) {
        toast.error(
          "Cannot Add Dish",
          "You cannot add your own dishes to cart"
        );
      } else {
        toast.error(
          "Cannot Add Dish",
          "This dish is currently unavailable"
        );
      }
      return;
    }

    const result = addItem({
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

    if (result.success) {
      toast.success(
        "Added to Cart",
        result.message || `${item.name} added to cart`
      );
    } else {
      toast.error(
        "Failed to Add",
        result.message || "Could not add item to cart"
      );
    }
  };

  return (
    <button
      onClick={handleAdd}
      title={isOwnDish ? "You cannot add your own dishes to cart" : disabled ? "This dish is unavailable" : "Add to cart"}
      className={`bg-teal-600 hover:bg-teal-700 text-white rounded-full transition flex items-center justify-center ${
        disabled || isOwnDish
          ? "opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400"
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

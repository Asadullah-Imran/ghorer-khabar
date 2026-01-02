"use client";

import { Heart, Plus } from "lucide-react";
import { useState } from "react";

export function AddToCartBtn({ minimal = false }: { minimal?: boolean }) {
  // Handle the click logic here, not in the parent
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents the Link from navigating to the details page
    e.stopPropagation();
    console.log("Added to cart!"); // Placeholder for real logic
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

"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface FavoriteButtonProps {
  itemId: string;
  itemType: "dish" | "kitchen" | "plan";
  variant?: "overlay" | "inline";
  size?: number;
  initialIsFavorite?: boolean; // NEW: Pass from server to avoid fetch
}

export default function FavoriteButton({
  itemId,
  itemType,
  variant = "overlay",
  size = 18,
  initialIsFavorite = false, // NEW: Default to false
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Only check favorite status on mount if not provided
  useEffect(() => {
    if (initialIsFavorite === undefined) {
      checkFavoriteStatus();
    }
  }, [itemId, itemType]);

  const checkFavoriteStatus = async () => {
    try {
      const res = await fetch(`/api/favorites?type=${itemType}`);
      if (res.ok) {
        const data = await res.json();
        const isFav = data.favorites.some((fav: any) => fav.id === itemId);
        setIsFavorite(isFav);
      }
    } catch (error) {
      // User might not be logged in, silently ignore
      console.log("Error checking favorite status:", error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove favorite
        const res = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: itemType, itemId }),
        });

        if (res.ok) {
          setIsFavorite(false);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } else {
        // Add favorite
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: itemType, itemId }),
        });

        if (res.ok) {
          setIsFavorite(true);
        } else if (res.status === 401) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = variant === "overlay"
    ? `p-2 rounded-full backdrop-blur-sm transition ${
        isFavorite
          ? "bg-red-50 text-red-500"
          : "bg-white/70 text-gray-600 hover:bg-white"
      }`
    : `p-1.5 rounded-full transition ${
        isFavorite
          ? "bg-red-50 text-red-500"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`;

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${baseClasses} ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        size={size}
        fill={isFavorite ? "currentColor" : "none"}
        className={isLoading ? "animate-pulse" : ""}
      />
    </button>
  );
}

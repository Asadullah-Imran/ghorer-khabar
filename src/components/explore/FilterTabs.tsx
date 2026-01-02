"use client";

import { SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface FilterTabsProps {
  categories: string[];
}

export default function FilterTabs({ categories }: FilterTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current state from URL or default
  const activeTab = searchParams.get("tab") || "dishes";
  const activeCategory = searchParams.get("category") || "All";
  const activeSort = searchParams.get("sort") || "recommended";

  // Helper to update URL
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" && key === "category") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-white sticky top-16 z-30 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        {/* 1. Main Toggle (Dishes vs Kitchens) */}
        <div className="flex w-full md:w-auto border-b border-gray-100">
          <button
            onClick={() => updateParam("tab", "dishes")}
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-bold border-b-2 transition ${
              activeTab === "dishes"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Dishes
          </button>
          <button
            onClick={() => updateParam("tab", "kitchens")}
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-bold border-b-2 transition ${
              activeTab === "kitchens"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Kitchens
          </button>
        </div>

        {/* 2. Filters & Sorting Row */}
        <div className="py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide">
          {/* Category Pills (Only show for Dishes) */}
          {activeTab === "dishes" && (
            <div className="flex items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateParam("category", cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition ${
                    activeCategory === cat
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-teal-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Sort Dropdown (Simplified) */}
          <div className="ml-auto flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-gray-400" />
            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="text-xs font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

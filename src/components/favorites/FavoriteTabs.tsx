"use client";

import { ChefHat, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FavoriteTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Default to 'dishes' if no param is set
  const activeTab = searchParams.get("tab") || "dishes";

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex gap-4 border-b border-gray-200 mb-6">
      <button
        onClick={() => setTab("dishes")}
        className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
          activeTab === "dishes"
            ? "border-teal-600 text-teal-800"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        <Utensils size={16} />
        Favorite Dishes
      </button>

      <button
        onClick={() => setTab("kitchens")}
        className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
          activeTab === "kitchens"
            ? "border-teal-600 text-teal-800"
            : "border-transparent text-gray-400 hover:text-gray-600"
        }`}
      >
        <ChefHat size={16} />
        Favorite Kitchens
      </button>
    </div>
  );
}

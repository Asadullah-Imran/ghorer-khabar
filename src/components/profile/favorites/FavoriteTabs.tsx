"use client";

import { CalendarCheck, ChefHat, Utensils } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FavoriteTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get("tab") || "dishes";

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getTabClass = (tabName: string) =>
    `flex items-center gap-2 pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${
      activeTab === tabName
        ? "border-teal-600 text-teal-800"
        : "border-transparent text-gray-400 hover:text-gray-600"
    }`;

  return (
    <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => setTab("dishes")}
        className={getTabClass("dishes")}
      >
        <Utensils size={16} /> Dishes
      </button>

      <button
        onClick={() => setTab("kitchens")}
        className={getTabClass("kitchens")}
      >
        <ChefHat size={16} /> Kitchens
      </button>

      <button
        onClick={() => setTab("subscriptions")}
        className={getTabClass("subscriptions")}
      >
        <CalendarCheck size={16} /> Subscriptions
      </button>
    </div>
  );
}

"use client";

import {
  ArrowRightLeft,
  CalendarX,
  ChefHat,
  PauseCircle,
  User,
} from "lucide-react";
import { useState } from "react";

// --- 1. Role Switcher Component ---
export function RoleSwitcher() {
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  const toggleMode = () => {
    setMode((prev) => (prev === "buyer" ? "seller" : "buyer"));
    // In real app, this would redirect to /seller-dashboard or update a global context
    if (mode === "buyer") {
      alert("Switching to Chef View... (This would load the Seller Dashboard)");
    }
  };

  return (
    <div className="bg-teal-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
      <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            {mode === "buyer" ? <User size={20} /> : <ChefHat size={20} />}
            Current Mode:{" "}
            {mode === "buyer" ? "Foodie (Buyer)" : "Chef (Seller)"}
          </h3>
          <p className="text-teal-200 text-sm mt-1">
            {mode === "buyer"
              ? "Want to start selling your homemade food?"
              : "Want to order food for yourself?"}
          </p>
        </div>

        <button
          onClick={toggleMode}
          className="bg-white text-teal-900 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-teal-50 transition-colors shadow-sm"
        >
          <ArrowRightLeft size={16} />
          {mode === "buyer" ? "Switch to Chef View" : "Switch to Buyer View"}
        </button>
      </div>
    </div>
  );
}

// --- 2. Subscription Actions ---
export function SubscriptionActions() {
  return (
    <div className="mt-5 flex gap-3">
      <button
        onClick={() => alert("Meal skipped for tomorrow")}
        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        <PauseCircle size={16} />
        Skip Meal
      </button>
      <button
        onClick={() => alert("Redirecting to Menu Selection...")}
        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
      >
        <CalendarX size={16} />
        Change Menu
      </button>
    </div>
  );
}

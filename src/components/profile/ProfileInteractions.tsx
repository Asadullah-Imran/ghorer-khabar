"use client";

import { useToast } from "@/contexts/ToastContext";
import { ArrowRightLeft, ChefHat, PauseCircle, User, X } from "lucide-react";
import { useState } from "react";

// --- 1. Role Switcher Component (Existing) ---
export function RoleSwitcher() {
  const [mode, setMode] = useState<"buyer" | "seller">("buyer");

  const toggleMode = () => {
    setMode((prev) => (prev === "buyer" ? "seller" : "buyer"));
    if (mode === "buyer") {
      // Logic to redirect to /seller-dashboard would go here
      console.log("Switching to Chef mode...");
    }
  };

  return (
    <div className="bg-teal-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg transition-all">
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

// --- 2. Subscription Actions (Updated with Modals) ---
export function SubscriptionActions() {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const toast = useToast();

  return (
    <>
      {/* Action Button */}
      <div className="mt-5">
        <button
          onClick={() => setShowSkipModal(true)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          <PauseCircle size={16} />
          Skip Meal
        </button>
      </div>

      {/* --- SKIP MEAL MODAL --- */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
            <button
              onClick={() => setShowSkipModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto">
              <PauseCircle size={24} />
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">
                Skip Tomorrow&apos;s Meal?
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                This will cancel delivery for <strong>Tomorrow, 1:00 PM</strong>
                . Your subscription will be extended by 1 day.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSkipModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50"
              >
                No, Keep it
              </button>
              <button
                onClick={() => {
                  toast.success("Meal Skipped", "Meal skipped! Subscription extended.");
                  setShowSkipModal(false);
                }}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
              >
                Yes, Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

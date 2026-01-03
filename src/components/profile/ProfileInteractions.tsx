"use client";

import {
  ArrowRightLeft,
  Check,
  ChefHat,
  PauseCircle,
  User,
  UtensilsCrossed,
  X,
} from "lucide-react";
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
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("default");

  // Dummy Menu Options for the Modal
  const menuOptions = [
    {
      id: "default",
      name: "Bhuna Khichuri & Egg Curry",
      label: "Standard Menu",
    },
    { id: "opt2", name: "Plain Rice & Chicken Curry", label: "Alternative 1" },
    { id: "opt3", name: "Roti & Mixed Vegetables", label: "Light Option" },
  ];

  return (
    <>
      {/* Action Buttons */}
      <div className="mt-5 flex gap-3">
        <button
          onClick={() => setShowSkipModal(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          <PauseCircle size={16} />
          Skip Meal
        </button>
        <button
          onClick={() => setShowMenuModal(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 text-gray-700 text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          <UtensilsCrossed size={16} />
          Change Menu
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
                  alert("Meal skipped! Subscription extended.");
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

      {/* --- CHANGE MENU MODAL --- */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowMenuModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Swap Menu</h3>
            <p className="text-sm text-gray-500 mb-5">
              Select a different dish for <strong>Tomorrow</strong>.
            </p>

            <div className="space-y-3 mb-6">
              {menuOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedMenu === option.id
                      ? "border-teal-600 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="menu"
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                    checked={selectedMenu === option.id}
                    onChange={() => setSelectedMenu(option.id)}
                  />
                  <div>
                    <span
                      className={`block text-sm font-bold ${
                        selectedMenu === option.id
                          ? "text-teal-900"
                          : "text-gray-700"
                      }`}
                    >
                      {option.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {option.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                alert(
                  `Menu changed to: ${
                    menuOptions.find((m) => m.id === selectedMenu)?.name
                  }`
                );
                setShowMenuModal(false);
              }}
              className="w-full py-3 rounded-lg bg-teal-700 text-white font-bold hover:bg-teal-800 flex items-center justify-center gap-2"
            >
              <Check size={18} /> Confirm Change
            </button>
          </div>
        </div>
      )}
    </>
  );
}

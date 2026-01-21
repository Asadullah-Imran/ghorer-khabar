"use client";

import { useConfirmation } from "@/contexts/ConfirmationContext";
import { Utensils } from "lucide-react";
import { useState } from "react";

export default function UpcomingMenu({
  initialMeals,
}: {
  initialMeals: any[];
}) {
  const { confirm } = useConfirmation();
  const [meals, setMeals] = useState(initialMeals);

  const handleSkip = async (index: number) => {
    const confirmed = await confirm({
      title: "Skip This Meal",
      message: "Skip this meal? You will be refunded for this day.",
      confirmLabel: "Skip Meal",
      variant: "info",
    });

    if (confirmed) {
      const updated = [...meals];
      updated[index].status = "Skipped";
      setMeals(updated);
    }
  };

  return (
    <div>
      <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
        <Utensils size={20} className="text-teal-700" />
        Upcoming Menu
      </h3>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {meals.map((meal, idx) => (
          <div
            key={idx}
            className={`p-4 flex items-center justify-between border-b border-gray-100 last:border-0 ${
              meal.status === "Skipped"
                ? "bg-gray-50 opacity-60"
                : "hover:bg-teal-50/30"
            }`}
          >
            <div className="flex gap-4">
              {/* Date Box */}
              <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 rounded-lg text-gray-600">
                <span className="text-xs font-bold uppercase">
                  {meal.date.split(" ")[0]}
                </span>
                <span className="text-lg font-black">
                  {meal.date.split(" ")[1]}
                </span>
              </div>
              {/* Dish Name */}
              <div>
                <p
                  className={`font-bold ${
                    meal.status === "Skipped"
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {meal.dish}
                </p>
                <p className="text-xs text-gray-500 mt-1">{meal.status}</p>
              </div>
            </div>

            {/* Interactive Skip Button */}
            {meal.status !== "Skipped" && (
              <button
                onClick={() => handleSkip(idx)}
                className="text-xs font-bold text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded transition-colors"
              >
                Skip
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Ban, CheckCircle, Droplets, Eye, Fish, Wheat } from "lucide-react";
import { useState } from "react";

interface Ingredient {
  name: string;
  icon: string;
  detail: string;
}

const icons: Record<string, any> = {
  droplets: Droplets,
  fish: Fish,
  wheat: Wheat,
};

export default function IngredientTransparency({
  ingredients,
}: {
  ingredients: Ingredient[];
}) {
  const [isDeepView, setIsDeepView] = useState(false);

  return (
    <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl border border-teal-100 overflow-hidden">
      {/* Header with Toggle */}
      <div className="p-5 border-b border-teal-100 flex justify-between items-center bg-teal-50/50">
        <div className="flex items-center gap-2 text-teal-900">
          <Eye size={20} className="text-teal-600" />
          <h3 className="font-bold">Ingredient Transparency</h3>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${
              !isDeepView ? "text-teal-700" : "text-gray-400"
            }`}
          >
            Standard
          </span>
          <button
            onClick={() => setIsDeepView(!isDeepView)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
              isDeepView ? "bg-teal-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${
                isDeepView ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDeepView ? "text-teal-700" : "text-gray-400"
            }`}
          >
            Deep View
          </span>
        </div>
      </div>

      {/* List */}
      <div className="p-5 space-y-5">
        {ingredients.length > 0 ? (
          ingredients.map((ing, idx) => {
            const Icon = icons[ing.icon] || Wheat;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-white rounded-full shadow-sm text-gray-400">
                  <Icon
                    size={18}
                    className={isDeepView ? "text-teal-600" : "text-gray-400"}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{ing.name}</p>

                  {/* Animated Details */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isDeepView
                        ? "grid-rows-[1fr] opacity-100 mt-2"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs text-teal-700 bg-teal-50 p-2 rounded-lg border border-teal-100">
                        ✓ {ing.detail}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No ingredient information available</p>
            <p className="text-xs mt-1 text-gray-400">Chef hasn't added ingredient details yet</p>
          </div>
        )}

        {/* Badges */}
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
            <Ban size={14} /> No Tasting Salt
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100">
            <CheckCircle size={14} /> Halal Certified
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { MenuItem } from "@/lib/dummy-data/chef";
import { Clock, Edit, Flame, Leaf, Trash2, ChefHat, BarChart3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
  onViewInsights?: () => void;
}

export default function MenuItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onViewInsights,
}: MenuItemCardProps) {
  const [showIngredients, setShowIngredients] = useState(false);
  const totalIngredientCost = item.ingredients.reduce((sum, ing) => sum + (ing.cost || 0), 0);
  const profitMargin = item.currentPrice - totalIngredientCost;
  const profitMarginPercent =
    totalIngredientCost > 0
      ? Math.round((profitMargin / item.currentPrice) * 100)
      : 0;
  return (
    <div
      className={`bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition ${
        item.isAvailable
          ? "border-gray-200"
          : "border-red-200 bg-gray-50 opacity-75"
      }`}
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gray-100 rounded-t-xl overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <button
            onClick={onToggleAvailability}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              item.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {item.isAvailable ? "Available" : "Unavailable"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name & Category */}
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            {item.name}
          </h3>
          <span className="inline-block mt-1 px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-semibold rounded">
            {item.category}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        {/* Attributes */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock size={14} />
            <span>{item.prepTime} min</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <Flame size={14} />
            <span>{item.spiciness}</span>
          </div>
          {item.isVegetarian && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Leaf size={14} />
              <span>Veg</span>
            </div>
          )}
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <span className="font-semibold">Allergens:</span>{" "}
            {item.allergens.join(", ")}
          </div>
        )}

        {/* Ingredients Section */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-3">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="w-full flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-800 p-2 hover:bg-teal-50 rounded transition"
            >
              <ChefHat size={14} />
              Ingredients ({item.ingredients.length}) • Cost: ৳{totalIngredientCost.toFixed(0)}
            </button>
            
            {showIngredients && (
              <div className="mt-2 p-2 bg-teal-50 border border-teal-100 rounded text-xs space-y-1">
                {item.ingredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>{ing.name}</span>
                    <span className="text-gray-500">{ing.quantity} {ing.unit} {ing.cost ? `(৳${ing.cost})` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pricing & Profit Margin */}
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-gray-500">Current Price</p>
              <p className="text-2xl font-bold text-teal-700">
                ৳{item.currentPrice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Market Range</p>
              <p className="text-sm font-semibold text-gray-700">
                ৳{item.marketPriceRange.min} - ৳{item.marketPriceRange.max}
              </p>
            </div>
          </div>
          
          {/* Profit Margin Info */}
          {totalIngredientCost > 0 && (
            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-50 p-2 rounded border border-orange-100">
                <p className="text-gray-600">Ingredient Cost</p>
                <p className="font-bold text-orange-600">৳{totalIngredientCost.toFixed(0)}</p>
              </div>
              <div className={`${profitMargin >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"} p-2 rounded border`}>
                <p className="text-gray-600">Profit</p>
                <p className={`font-bold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ৳{profitMargin.toFixed(0)} ({profitMarginPercent}%)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          {onViewInsights && (
            <button
              onClick={onViewInsights}
              className="flex items-center justify-center gap-2 py-2 bg-yellow-400 text-gray-900 text-sm font-semibold rounded-lg hover:bg-yellow-500 transition"
            >
              <BarChart3 size={16} />
              Insights
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

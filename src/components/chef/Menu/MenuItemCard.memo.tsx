"use client";

import { Clock, Edit, Flame, Leaf, Trash2, ChefHat, BarChart3 } from "lucide-react";
import Image from "next/image";
import { useState, memo, useMemo, useCallback } from "react";

interface MenuImage {
  id?: string;
  imageUrl?: string;
  order?: number;
}

interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
}

interface MenuItem {
  id?: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  prepTime?: number;
  calories?: number;
  spiciness?: string;
  isVegetarian?: boolean;
  isAvailable?: boolean;
  images?: MenuImage[];
  ingredients?: Ingredient[];
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
  onViewInsights?: () => void;
}

function MenuItemCardComponent({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onViewInsights,
}: MenuItemCardProps) {
  const [showIngredients, setShowIngredients] = useState(false);
  
  // Memoize expensive calculations
  const { totalIngredientCost, profitMargin, profitMarginPercent, primaryImage } = useMemo(() => {
    const totalCost = (item.ingredients || []).reduce((sum, ing) => sum + (ing.cost || 0), 0);
    const profit = item.price - totalCost;
    const profitPercent = totalCost > 0 ? Math.round((profit / item.price) * 100) : 0;
    const primaryImg = (item.images || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0))[0]?.imageUrl;

    return {
      totalIngredientCost: totalCost,
      profitMargin: profit,
      profitMarginPercent: profitPercent,
      primaryImage: primaryImg,
    };
  }, [item.ingredients, item.price, item.images]);

  const handleToggleIngredients = useCallback(() => {
    setShowIngredients((prev) => !prev);
  }, []);

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
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          {item.prepTime && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock size={14} />
              <span>{item.prepTime} min</span>
            </div>
          )}
          {item.spiciness && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Flame size={14} />
              <span>{item.spiciness}</span>
            </div>
          )}
          {item.isVegetarian && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Leaf size={14} />
              <span>Veg</span>
            </div>
          )}
        </div>

        {/* Ingredients Section */}
        {item.ingredients && item.ingredients.length > 0 && (
          <div className="mb-3">
            <button
              onClick={handleToggleIngredients}
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
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-2xl font-bold text-teal-700">
                ৳{item.price}
              </p>
            </div>
          </div>
          
          {/* Profit Margin Info */}
          {totalIngredientCost > 0 && (
            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-orange-50 p-2 rounded border border-orange-100">
                <p className="text-gray-600">Cost</p>
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
              className="flex items-center justify-center gap-2 py-2 text-gray-900 text-sm font-semibold rounded-lg transition"
              style={{ backgroundColor: '#fdc500' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6b000'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdc500'}
            >
              <BarChart3 size={16} />
              Insights
            </button>
          )}
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-2 py-2 text-white text-sm font-semibold rounded-lg transition"
            style={{ backgroundColor: '#0077b6' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0066a3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0077b6'}
          >
            <Edit size={16} />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-2 py-2 text-white text-sm font-semibold rounded-lg transition"
            style={{ backgroundColor: '#c1121f' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a00e1a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c1121f'}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Memoize with custom comparison
export const MenuItemCard = memo(MenuItemCardComponent, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.isAvailable === nextProps.item.isAvailable &&
    prevProps.item.images?.length === nextProps.item.images?.length &&
    prevProps.item.ingredients?.length === nextProps.item.ingredients?.length
  );
});

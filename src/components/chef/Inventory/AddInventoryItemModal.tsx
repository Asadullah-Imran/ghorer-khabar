"use client";

import { useToast } from "@/contexts/ToastContext";
import { InventoryItem } from "@/lib/dummy-data/chef";
import { ChevronDown, X, UtensilsCrossed } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface AddInventoryItemModalProps {
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

interface MenuDish {
  id: string;
  name: string;
  category: string;
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    cost: number | null;
  }[];
}

export default function AddInventoryItemModal({
  onClose,
  onSave,
}: AddInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    stockToAdd: "0",
    unitCost: "100",
  });
  const toast = useToast();
  
  // Menu dishes and ingredients state
  const [menuDishes, setMenuDishes] = useState<MenuDish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch menu dishes with ingredients on mount
  useEffect(() => {
    const fetchMenuDishes = async () => {
      try {
        setLoadingDishes(true);
        const res = await fetch("/api/chef/menu/ingredients");
        const data = await res.json();
        
        if (data.success) {
          setMenuDishes(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch menu dishes:", error);
      } finally {
        setLoadingDishes(false);
      }
    };

    fetchMenuDishes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.warning("Validation Error", "Item name is required");
      return;
    }

    const stockToAdd = parseFloat(formData.stockToAdd) || 0;
    
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: formData.name.trim(),
      unit: formData.unit,
      currentStock: stockToAdd, // For new items, stockToAdd becomes initial currentStock
      demandFromOrders: 0, // Will be calculated from orders
      forecastDemand: 0, // Will be calculated from forecast
      reorderLevel: 0, // Should be set separately
      unitCost: parseFloat(formData.unitCost) || 0,
    };

    onSave(newItem);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleIngredientSelect = (ingredientName: string, unit: string, cost: number | null) => {
    setFormData({
      ...formData,
      name: ingredientName,
      unit: unit.toLowerCase() === "gm" || unit.toLowerCase() === "g" ? "grams" : 
            unit.toLowerCase() === "kg" ? "kg" :
            unit.toLowerCase() === "ml" ? "ml" :
            unit.toLowerCase() === "l" || unit.toLowerCase() === "liter" ? "liters" :
            unit.toLowerCase() === "pcs" || unit.toLowerCase() === "pc" ? "pieces" :
            unit.toLowerCase() === "tsp" ? "tsp" :
            unit.toLowerCase() === "tbsp" ? "tbsp" :
            unit.toLowerCase() === "cup" ? "cup" : unit,
      unitCost: cost ? cost.toString() : formData.unitCost,
    });
    setShowDropdown(false);
    setSearchQuery("");
  };

  // Filter dishes and ingredients based on search query
  const filteredDishes = menuDishes
    .map((dish) => ({
      ...dish,
      ingredients: dish.ingredients.filter((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((dish) => dish.ingredients.length > 0);

  const units = ["kg", "grams", "ml", "liters", "pieces", "tsp", "tbsp", "cup"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Add New Item</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Item Name with Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Item Name *
                {menuDishes.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-teal-600">
                    (Select from menu dishes)
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    handleChange("name", e.target.value);
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    setShowDropdown(true);
                    setSearchQuery(formData.name);
                  }}
                  className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Type or select from menu dishes..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
                >
                  {loadingDishes ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Loading menu dishes...
                    </div>
                  ) : filteredDishes.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchQuery
                        ? "No matching ingredients found"
                        : "No menu dishes with ingredients available"}
                    </div>
                  ) : (
                    <div className="py-2">
                      {filteredDishes.map((dish) => (
                        <div key={dish.id} className="mb-2">
                          {/* Dish Header */}
                          <div className="px-3 py-2 bg-teal-50 border-b border-teal-100 flex items-center gap-2">
                            <UtensilsCrossed size={14} className="text-teal-600" />
                            <span className="text-xs font-semibold text-teal-900">
                              {dish.name}
                            </span>
                            <span className="text-xs text-teal-600">({dish.category})</span>
                          </div>
                          {/* Ingredients List */}
                          {dish.ingredients.map((ingredient) => (
                            <button
                              key={ingredient.id}
                              type="button"
                              onClick={() =>
                                handleIngredientSelect(
                                  ingredient.name,
                                  ingredient.unit,
                                  ingredient.cost
                                )
                              }
                              className="w-full px-4 py-2.5 text-left hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {ingredient.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {ingredient.quantity} {ingredient.unit}
                                    {ingredient.cost && (
                                      <span className="ml-2 text-teal-600">
                                        • ৳{ingredient.cost}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unit Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Unit of Measurement *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => handleChange("unit", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock to Add */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Stock to Add *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.stockToAdd}
                  onChange={(e) => handleChange("stockToAdd", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter quantity to add"
                  min="0"
                  step="0.1"
                  required
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                  {formData.unit}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This will be the initial stock level for this item
              </p>
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Unit Cost (৳)
              </label>
              <input
                type="number"
                value={formData.unitCost}
                onChange={(e) => handleChange("unitCost", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="0"
                min="0"
                step="1"
              />
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <h4 className="text-xs font-semibold text-blue-900 mb-2">Summary</h4>
              <div className="text-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-700">Initial Stock Value</span>
                  <span className="font-bold text-blue-900">
                    ৳{(parseFloat(formData.stockToAdd) * parseFloat(formData.unitCost)).toFixed(0)}
                  </span>
                </div>
                <p className="text-blue-600 text-xs italic">
                  Demand values will be calculated automatically from orders and forecasts
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 py-2 bg-teal-600 text-white font-semibold text-sm rounded-lg hover:bg-teal-700 transition"
          >
            Add Item
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

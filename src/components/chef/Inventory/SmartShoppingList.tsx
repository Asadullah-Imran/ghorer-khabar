"use client";

import { InventoryItem } from "@/lib/dummy-data/chef";
import { CheckCircle2, Circle, ShoppingCart, ArrowRight } from "lucide-react";
import { useState } from "react";

interface SmartShoppingListProps {
  items: InventoryItem[];
}

export default function SmartShoppingList({ items }: SmartShoppingListProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const calculateToBuy = (item: InventoryItem) => {
    const required = item.demandFromOrders + item.forecastDemand;
    return Math.max(0, required - item.currentStock);
  };

  // Filter items that need to be bought
  const itemsToBuy = items.filter((item) => calculateToBuy(item) > 0);

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const totalToBuy = itemsToBuy.reduce((sum, item) => sum + calculateToBuy(item), 0);
  const totalEstimatedCost = itemsToBuy.reduce(
    (sum, item) => sum + calculateToBuy(item) * item.unitCost,
    0
  );

  const checkedCount = checkedItems.size;

  if (itemsToBuy.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Set!</h3>
        <p className="text-gray-600">Your current inventory is sufficient for tomorrow's demand.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Items to Buy</p>
          <p className="text-2xl font-bold text-blue-700">{itemsToBuy.length}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">Total Quantity</p>
          <p className="text-2xl font-bold text-orange-700">{totalToBuy.toFixed(1)}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Estimated Cost</p>
          <p className="text-2xl font-bold text-green-700">৳{totalEstimatedCost.toFixed(0)}</p>
        </div>
      </div>

      {/* Shopping List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={24} />
            <div>
              <h3 className="font-bold text-lg">Smart Shopping List</h3>
              <p className="text-xs text-teal-100">{checkedCount} of {itemsToBuy.length} items checked</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${itemsToBuy.length > 0 ? (checkedCount / itemsToBuy.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {checkedCount > 0 && `${Math.round((checkedCount / itemsToBuy.length) * 100)}% completed`}
          </p>
        </div>

        {/* Items List */}
        <div className="divide-y divide-gray-200">
          {itemsToBuy.map((item) => {
            const toBuy = calculateToBuy(item);
            const cost = toBuy * item.unitCost;
            const isChecked = checkedItems.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`px-6 py-4 cursor-pointer transition ${
                  isChecked ? "bg-green-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <div className="mt-1">
                    {isChecked ? (
                      <CheckCircle2 size={24} className="text-green-600" />
                    ) : (
                      <Circle size={24} className="text-gray-300 hover:text-teal-600" />
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h4 className={`font-semibold text-gray-900 ${isChecked ? "line-through text-gray-500" : ""}`}>
                        {item.name}
                      </h4>
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-2">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <p className="font-semibold text-gray-900">{item.currentStock}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Demand:</span>
                        <p className="font-semibold text-gray-900">
                          {item.demandFromOrders} + {item.forecastDemand}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Required:</span>
                        <p className="font-semibold text-gray-900">
                          {(item.demandFromOrders + item.forecastDemand).toFixed(1)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight size={14} className="text-orange-600" />
                        <div>
                          <span className="text-gray-500">Buy:</span>
                          <p className="font-bold text-orange-700">{toBuy.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Unit Cost & Total */}
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        ৳{item.unitCost} per {item.unit}
                      </span>
                      <span className="font-bold text-teal-600">
                        Subtotal: ৳{cost.toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-orange-700">
                      {toBuy.toFixed(1)} {item.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">৳{cost.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Items</p>
              <p className="text-xl font-bold text-gray-900">{itemsToBuy.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Checked Off</p>
              <p className="text-xl font-bold text-green-600">{checkedCount}/{itemsToBuy.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Budget</p>
              <p className="text-xl font-bold text-teal-700">৳{totalEstimatedCost.toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition flex items-center justify-center gap-2">
        <ShoppingCart size={20} />
        Place Order to Supplier
      </button>
    </div>
  );
}

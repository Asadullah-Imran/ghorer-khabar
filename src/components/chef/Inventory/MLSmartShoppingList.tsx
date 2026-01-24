"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Circle, Loader2, RefreshCw, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

interface ShoppingListItem {
  ingredient_name: string;
  unit: string;
  current_stock: number;
  demand_from_orders: number;
  forecast_demand: number;
  total_demand: number;
  to_buy: number;
  unit_cost: number;
  estimated_cost: number;
  status: "critical" | "low" | "healthy";
}

interface ShoppingListSummary {
  total_items: number;
  total_estimated_cost: number;
  orders_processed: number;
  forecast_days: number;
}

interface ShoppingListResponse {
  chef_id: string;
  shopping_list: ShoppingListItem[];
  summary: ShoppingListSummary;
  metadata: {
    generated_at: string;
    include_forecast: boolean;
  };
}

export default function MLSmartShoppingList() {
  const [data, setData] = useState<ShoppingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [includeForecast, setIncludeForecast] = useState(true);

  const fetchShoppingList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `/api/chef/shopping-list/generate?includeForecast=${includeForecast}&daysAhead=7`
      );
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching shopping list:", err);
      setError("Failed to generate shopping list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList();
  }, [includeForecast]);

  const toggleCheck = (name: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(name)) {
      newChecked.delete(name);
    } else {
      newChecked.add(name);
    }
    setCheckedItems(newChecked);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded">Critical</span>;
      case "low":
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Low</span>;
      default:
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">OK</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={40} />
        <p className="text-gray-600">Generating smart shopping list from orders and forecasts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <AlertTriangle className="text-red-500 mx-auto mb-4" size={40} />
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={fetchShoppingList}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.shopping_list.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Set!</h3>
        <p className="text-gray-600">Your current inventory is sufficient for the next {includeForecast ? "7 days" : "pending orders"}.</p>
        <button
          onClick={fetchShoppingList}
          className="mt-4 px-4 py-2 text-teal-600 hover:underline flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    );
  }

  const checkedCount = checkedItems.size;
  const totalItems = data.shopping_list.length;

  return (
    <div className="space-y-4">
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600 mb-1">Items to Buy</p>
          <p className="text-2xl font-bold text-blue-700">{data.summary.total_items}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600 mb-1">Orders Analyzed</p>
          <p className="text-2xl font-bold text-orange-700">{data.summary.orders_processed}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 mb-1">Forecast Days</p>
          <p className="text-2xl font-bold text-purple-700">{data.summary.forecast_days}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 mb-1">Estimated Cost</p>
          <p className="text-2xl font-bold text-green-700">৳{data.summary.total_estimated_cost.toFixed(2)}</p>
        </div>
      </div>

      {/* Toggle Forecast */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
        <span className="text-sm text-gray-600">Include 7-day demand forecast</span>
        <button
          onClick={() => setIncludeForecast(!includeForecast)}
          className={`w-12 h-6 rounded-full transition ${
            includeForecast ? "bg-teal-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              includeForecast ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Shopping List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={24} />
            <div>
              <h3 className="font-bold text-lg">Smart Shopping List</h3>
              <p className="text-xs text-teal-100">{checkedCount} of {totalItems} items checked</p>
            </div>
          </div>
          <button
            onClick={fetchShoppingList}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${totalItems > 0 ? (checkedCount / totalItems) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {checkedCount > 0 && `${Math.round((checkedCount / totalItems) * 100)}% completed`}
          </p>
        </div>

        {/* Items List */}
        <div className="divide-y divide-gray-200">
          {data.shopping_list.map((item) => {
            const isChecked = checkedItems.has(item.ingredient_name);

            return (
              <div
                key={item.ingredient_name}
                onClick={() => toggleCheck(item.ingredient_name)}
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
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold text-gray-900 ${isChecked ? "line-through text-gray-500" : ""}`}>
                        {item.ingredient_name}
                      </h4>
                      <span className="text-xs text-gray-500">({item.unit})</span>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs text-gray-600 mb-2">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <p className="font-semibold text-gray-900">{item.current_stock.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Orders:</span>
                        <p className="font-semibold text-blue-700">{item.demand_from_orders.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Forecast:</span>
                        <p className="font-semibold text-purple-700">{item.forecast_demand.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <p className="font-semibold text-gray-900">{item.total_demand.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight size={14} className="text-orange-600" />
                        <div>
                          <span className="text-gray-500">Buy:</span>
                          <p className="font-bold text-orange-700">{item.to_buy.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Cost */}
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        ৳{item.unit_cost.toFixed(2)} per {item.unit}
                      </span>
                      <span className="font-bold text-teal-600">
                        Subtotal: ৳{item.estimated_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-orange-700">
                      {item.to_buy.toFixed(2)} {item.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">৳{item.estimated_cost.toFixed(2)}</p>
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
              <p className="text-xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Checked Off</p>
              <p className="text-xl font-bold text-green-600">{checkedCount}/{totalItems}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Budget</p>
              <p className="text-xl font-bold text-teal-700">৳{data.summary.total_estimated_cost.toFixed(2)}</p>
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

"use client";

import { InventoryItem } from "@/lib/dummy-data/chef";
import { Edit2, Plus, TrendingDown, TrendingUp } from "lucide-react";

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (item: InventoryItem) => void;
}

export default function InventoryTable({ items, onUpdateStock }: InventoryTableProps) {
  const calculateRequiredQty = (item: InventoryItem) => {
    return item.demandFromOrders + item.forecastDemand;
  };

  const calculateToBuy = (item: InventoryItem) => {
    const required = calculateRequiredQty(item);
    return Math.max(0, required - item.currentStock);
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock <= item.reorderLevel * 0.5) return "critical";
    if (item.currentStock <= item.reorderLevel) return "low";
    return "healthy";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "low":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-green-50 border-green-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">Critical</span>;
      case "low":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">Low</span>;
      default:
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Healthy</span>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Item</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Current Stock</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Demand</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Required</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">To Buy</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const requiredQty = calculateRequiredQty(item);
              const toBuy = calculateToBuy(item);
              const status = getStockStatus(item);

              return (
                <tr key={item.id} className={`border-b ${getStatusColor(status)}`}>
                  {/* Item Name */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Unit: {item.unit}</p>
                    </div>
                  </td>

                  {/* Current Stock */}
                  <td className="px-6 py-4 text-center">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {item.currentStock}
                      </p>
                      <p className="text-xs text-gray-500">{item.unit}</p>
                    </div>
                  </td>

                  {/* Demand (Orders + Forecast) */}
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp size={14} className="text-blue-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {item.demandFromOrders}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Orders</p>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingDown size={14} className="text-purple-600" />
                        <span className="text-sm font-semibold text-gray-900">
                          {item.forecastDemand}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Forecast</p>
                    </div>
                  </td>

                  {/* Required Qty */}
                  <td className="px-6 py-4 text-center">
                    <div>
                      <p className="font-bold text-teal-700 text-lg">
                        {requiredQty.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500">needed</p>
                    </div>
                  </td>

                  {/* To Buy (Gap) */}
                  <td className="px-6 py-4 text-center">
                    <div className={`font-bold text-lg ${toBuy > 0 ? "text-orange-700" : "text-green-700"}`}>
                      {toBuy > 0 ? (
                        <>
                          <p>+{toBuy.toFixed(1)}</p>
                          <p className="text-xs text-gray-500">to buy</p>
                        </>
                      ) : (
                        <>
                          <p>✓</p>
                          <p className="text-xs text-gray-500">sufficient</p>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(status)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onUpdateStock(item)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                      <Edit2 size={16} />
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { InventoryItem } from "@/lib/dummy-data/chef";
import { X } from "lucide-react";
import { useState } from "react";

interface StockUpdateModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (newStock: number) => void;
}

export default function StockUpdateModal({
  item,
  onClose,
  onSave,
}: StockUpdateModalProps) {
  const [newStock, setNewStock] = useState<string>(item.currentStock.toString());
  const [change, setChange] = useState<string>("0");

  const handleByQuantity = () => {
    const changeQty = parseFloat(change) || 0;
    const updated = item.currentStock + changeQty;
    setNewStock(Math.max(0, updated).toString());
    setChange("0");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = parseFloat(newStock) || 0;
    if (stock >= 0) {
      onSave(stock);
      onClose();
    }
  };

  const required = item.demandFromOrders + item.forecastDemand;
  const updatedStock = parseFloat(newStock) || 0;
  const gap = Math.max(0, required - updatedStock);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Update Stock</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* Item Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{item.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Current Stock</p>
                  <p className="font-bold text-blue-700">{item.currentStock} {item.unit}</p>
                </div>
                <div>
                  <p className="text-gray-600">Unit Cost</p>
                  <p className="font-bold text-blue-700">৳{item.unitCost}</p>
                </div>
              </div>
            </div>

            {/* Update Methods */}
            <div className="space-y-3">
              {/* Method 1: Direct Entry */}
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                  Set New Stock Level
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter quantity"
                    min="0"
                    step="0.1"
                  />
                  <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                    {item.unit}
                  </span>
                </div>
              </div>

              {/* Method 2: Quick Buttons */}
              <div>
                <p className="text-xs font-semibold text-gray-900 mb-2">Quick adjust</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(newStock) || 0;
                      setNewStock((current + 1).toFixed(2));
                    }}
                    className="py-1.5 bg-green-100 text-green-700 font-semibold text-sm rounded-lg hover:bg-green-200 transition"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = parseFloat(newStock) || 0;
                      setNewStock(Math.max(0, current - 1).toFixed(2));
                    }}
                    className="py-1.5 bg-red-100 text-red-700 font-semibold text-sm rounded-lg hover:bg-red-200 transition"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStock("0")}
                    className="py-1.5 bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-200 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Method 3: Adjustment */}
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-semibold text-gray-900 mb-2">Or adjust by quantity</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={change}
                    onChange={(e) => setChange(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter change (+/-)"
                    step="0.1"
                  />
                  <button
                    type="button"
                    onClick={handleByQuantity}
                    className="px-3 py-2 bg-blue-600 text-white font-semibold text-sm rounded-lg hover:bg-blue-700 transition"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Gap Analysis Preview */}
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
              <h4 className="text-xs font-semibold text-teal-900 mb-2">Demand Analysis</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-teal-700 mb-0.5">Required</p>
                  <p className="font-bold text-teal-900">{required.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-teal-700 mb-0.5">New Stock</p>
                  <p className="font-bold text-teal-900">{updatedStock.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-teal-700 mb-0.5">Gap</p>
                  <p className={`font-bold ${gap > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {gap > 0 ? `+${gap.toFixed(1)}` : "✓"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Actions - Fixed */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 py-2 bg-teal-600 text-white font-semibold text-sm rounded-lg hover:bg-teal-700 transition"
          >
            Update Stock
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

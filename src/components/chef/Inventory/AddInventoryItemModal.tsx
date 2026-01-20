"use client";

import { useToast } from "@/contexts/ToastContext";
import { InventoryItem } from "@/lib/dummy-data/chef";
import { X } from "lucide-react";
import { useState } from "react";

interface AddInventoryItemModalProps {
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}

export default function AddInventoryItemModal({
  onClose,
  onSave,
}: AddInventoryItemModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    currentStock: "0",
    demandFromOrders: "0",
    forecastDemand: "0",
    reorderLevel: "1",
    unitCost: "100",
  });
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.warning("Validation Error", "Item name is required");
      return;
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: formData.name.trim(),
      unit: formData.unit,
      currentStock: parseFloat(formData.currentStock) || 0,
      demandFromOrders: parseFloat(formData.demandFromOrders) || 0,
      forecastDemand: parseFloat(formData.forecastDemand) || 0,
      reorderLevel: parseFloat(formData.reorderLevel) || 1,
      unitCost: parseFloat(formData.unitCost) || 0,
    };

    onSave(newItem);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

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
            {/* Item Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Chicken"
                required
              />
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

            {/* Current Stock */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Current Stock
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.currentStock}
                  onChange={(e) => handleChange("currentStock", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                  {formData.unit}
                </span>
              </div>
            </div>

            {/* Demand Section Header */}
            <div className="pt-2 pb-1 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-900 text-teal-900">Demand Forecast</p>
            </div>

            {/* Demand from Orders */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Pending Orders Demand
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.demandFromOrders}
                  onChange={(e) => handleChange("demandFromOrders", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                  {formData.unit}
                </span>
              </div>
            </div>

            {/* Forecast Demand */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Tomorrow's Forecast Demand
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.forecastDemand}
                  onChange={(e) => handleChange("forecastDemand", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                  {formData.unit}
                </span>
              </div>
            </div>

            {/* Reorder Level Section Header */}
            <div className="pt-2 pb-1 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-900 text-teal-900">Inventory Settings</p>
            </div>

            {/* Reorder Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1.5">
                Reorder Level (Minimum Stock)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange("reorderLevel", e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="1"
                  min="0.1"
                  step="0.1"
                />
                <span className="flex items-center px-3 py-2 bg-gray-100 rounded-lg font-semibold text-gray-700 text-xs">
                  {formData.unit}
                </span>
              </div>
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
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-blue-700">Current Value</p>
                  <p className="font-bold text-blue-900">
                    ৳{(parseFloat(formData.currentStock) * parseFloat(formData.unitCost)).toFixed(0)}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700">Total Demand</p>
                  <p className="font-bold text-blue-900">
                    {(parseFloat(formData.demandFromOrders) + parseFloat(formData.forecastDemand)).toFixed(1)} {formData.unit}
                  </p>
                </div>
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

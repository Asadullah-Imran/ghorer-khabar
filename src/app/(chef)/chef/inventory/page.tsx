"use client";

import InventoryTable from "@/components/chef/Inventory/InventoryTable";
import SmartShoppingList from "@/components/chef/Inventory/SmartShoppingList";
import StockUpdateModal from "@/components/chef/Inventory/StockUpdateModal";
import AddInventoryItemModal from "@/components/chef/Inventory/AddInventoryItemModal";
import { InventoryItem, INVENTORY_ITEMS } from "@/lib/dummy-data/chef";
import { AlertCircle, Package, TrendingUp, ShoppingCart, Plus } from "lucide-react";
import { useState } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_ITEMS);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleSaveStock = (newStock: number) => {
    if (selectedItem) {
      setItems(
        items.map((item) =>
          item.id === selectedItem.id ? { ...item, currentStock: newStock } : item
        )
      );
      setSelectedItem(null);
    }
  };

  const handleAddItem = (newItem: InventoryItem) => {
    setItems([...items, newItem]);
  };

  // Calculate metrics
  const criticalItems = items.filter((item) => item.currentStock <= item.reorderLevel * 0.5);
  const lowItems = items.filter((item) => item.currentStock <= item.reorderLevel && item.currentStock > item.reorderLevel * 0.5);
  const totalInventoryValue = items.reduce((sum, item) => sum + item.currentStock * item.unitCost, 0);
  const itemsNeeded = items.filter((item) => {
    const required = item.demandFromOrders + item.forecastDemand;
    return Math.max(0, required - item.currentStock) > 0;
  });
  const estimatedProcurementCost = itemsNeeded.reduce((sum, item) => {
    const required = item.demandFromOrders + item.forecastDemand;
    const toBuy = Math.max(0, required - item.currentStock);
    return sum + toBuy * item.unitCost;
  }, 0);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Smart Bazar (Inventory)</h1>
          <p className="text-gray-500 mt-2">
            Automated procurement based on demand forecasts and pending orders
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition whitespace-nowrap"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

      {/* Alert Banner */}
      {criticalItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-4">
          <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">Critical Stock Alert</h3>
            <p className="text-sm text-red-800">
              {criticalItems.length} item{criticalItems.length > 1 ? "s" : ""} are at critical levels: {" "}
              {criticalItems.map((item) => item.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package size={24} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Total Items</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{items.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle size={24} className="text-red-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Critical Stock</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{criticalItems.length}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">Inventory Value</span>
          </div>
          <p className="text-3xl font-bold text-green-600">৳{(totalInventoryValue / 1000).toFixed(1)}K</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <ShoppingCart size={24} className="text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-600">To Procure</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">৳{estimatedProcurementCost.toFixed(0)}</p>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="space-y-6">
        {/* Inventory Table */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Status</h2>
          <InventoryTable items={items} onUpdateStock={handleUpdateStock} />
        </div>

        {/* Smart Shopping List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Shopping List</h2>
          <SmartShoppingList items={items} />
        </div>
      </div>

      {/* Stock Update Modal */}
      {selectedItem && (
        <StockUpdateModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={handleSaveStock}
        />
      )}

      {/* Add Inventory Item Modal */}
      {isAddModalOpen && (
        <AddInventoryItemModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddItem}
        />
      )}
    </div>
  );
}

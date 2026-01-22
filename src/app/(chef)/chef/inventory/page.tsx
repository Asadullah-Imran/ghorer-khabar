"use client";

import AddInventoryItemModal from "@/components/chef/Inventory/AddInventoryItemModal";
import DemandForecastChart from "@/components/chef/Inventory/DemandForecastChart";
import InventoryTable from "@/components/chef/Inventory/InventoryTable";
import MLSmartShoppingList from "@/components/chef/Inventory/MLSmartShoppingList";
import StockUpdateModal from "@/components/chef/Inventory/StockUpdateModal";
import { InventoryItem } from "@/lib/dummy-data/chef";
import { AlertCircle, BarChart3, Loader2, Package, Plus, ShoppingCart, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inventory" | "shopping" | "forecast">("shopping");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/chef/inventory");
      const data = await res.json();
      
      if (data.success) {
        setItems(data.data || []);
      } else {
        setError(data.error || "Failed to fetch inventory");
      }
    } catch (err) {
      setError("Failed to fetch inventory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleSaveStock = async (newStock: number) => {
    if (!selectedItem?.id) return;
    
    try {
      const res = await fetch(`/api/chef/inventory/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentStock: newStock }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchItems();
        setSelectedItem(null);
      } else {
        setError(data.error || "Failed to update stock");
      }
    } catch (err) {
      setError("Failed to update stock");
      console.error(err);
    }
  };

  const handleAddItem = async (newItem: InventoryItem) => {
    try {
      const res = await fetch("/api/chef/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newItem.name,
          unit: newItem.unit,
          currentStock: newItem.currentStock,
          demandFromOrders: newItem.demandFromOrders,
          forecastDemand: newItem.forecastDemand,
          reorderLevel: newItem.reorderLevel,
          unitCost: newItem.unitCost,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchItems();
        setIsAddModalOpen(false);
      } else {
        setError(data.error || "Failed to add item");
      }
    } catch (err) {
      setError("Failed to add item");
      console.error(err);
    }
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
      {/* Loading State - Inline */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
          <p className="text-lg font-semibold text-gray-900">Loading inventory...</p>
        </div>
      ) : (
        <>
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
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("shopping")}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === "shopping"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              ML Shopping List
            </div>
          </button>
          <button
            onClick={() => setActiveTab("forecast")}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === "forecast"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 size={18} />
              Demand Forecast
            </div>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition ${
              activeTab === "inventory"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Package size={18} />
              Inventory Table
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "shopping" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-teal-600" size={24} />
              ML-Powered Smart Shopping List
            </h2>
            <MLSmartShoppingList />
          </div>
        )}

        {activeTab === "forecast" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="text-purple-600" size={24} />
              7-Day Demand Forecast
            </h2>
            <DemandForecastChart />
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Inventory Status</h2>
            <InventoryTable items={items} onUpdateStock={handleUpdateStock} />
          </div>
        )}
      </div>
        </>
      )}

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

      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
}

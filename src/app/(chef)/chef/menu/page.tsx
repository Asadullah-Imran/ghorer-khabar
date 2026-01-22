"use client";

import { MenuItemCard } from "@/components/chef/Menu/MenuItemCard.memo";
import MenuItemForm from "@/components/chef/Menu/MenuItemForm";
import DeleteConfirmDialog from "@/components/chef/Menu/DeleteConfirmDialog";
import MenuInsightsModal from "@/components/chef/Menu/MenuInsightsModal";
import { Filter, Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useChefMenu } from "@/lib/hooks/useChefMenu";

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
  images?: Array<{ id?: string; imageUrl?: string; order?: number }>;
  ingredients?: Array<{ id?: string; name: string; quantity: number; unit: string; cost?: number }>;
  deletedImageIds?: string[];
}

export default function MenuPage() {
  const {
    menuItems,
    loading,
    error,
    saving,
    saveMenuItem,
    deleteMenuItem,
    toggleAvailability,
  } = useChefMenu();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [insightsItemId, setInsightsItemId] = useState<string | null>(null);
  const [insightsReviews, setInsightsReviews] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Memoize filtered items to prevent recalculation
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, searchQuery, categoryFilter]);

  // Memoize stats to prevent recalculation
  const stats = useMemo(() => {
    return {
      total: menuItems.length,
      available: menuItems.filter((i) => i.isAvailable).length,
      unavailable: menuItems.filter((i) => !i.isAvailable).length,
      avgPrice: menuItems.length > 0
        ? Math.round(menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length)
        : 0,
    };
  }, [menuItems]);

  const handleSave = useCallback(async (formItem: MenuItem) => {
    const success = await saveMenuItem(formItem, editingItem?.id);
    if (success) {
      setIsFormOpen(false);
      setEditingItem(undefined);
    }
  }, [saveMenuItem, editingItem?.id]);

  const handleEdit = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((item: MenuItem) => {
    setItemToDelete(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!itemToDelete?.id) return;
    const success = await deleteMenuItem(itemToDelete.id);
    if (success) {
      setItemToDelete(null);
    }
  }, [itemToDelete?.id, deleteMenuItem]);

  const handleToggleAvailabilityCallback = useCallback(async (id: string) => {
    await toggleAvailability(id);
  }, [toggleAvailability]);

  const fetchReviewsForItem = async (menuItemId: string) => {
    try {
      setLoadingInsights(true);
      const res = await fetch(`/api/chef/menu/${menuItemId}/reviews`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setInsightsReviews(data.data || []);
      } else {
        console.error("Failed to fetch reviews:", data.error);
        setInsightsReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setInsightsReviews([]);
    } finally {
      setLoadingInsights(false);
    }
  };

  const categories = ["All", "Rice", "Beef", "Chicken", "Fish", "Vegetarian", "Seafood"];

  return (
    <div className="p-6 space-y-8">
      {/* Loading State - Inline */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-teal-600 mb-4" size={48} />
          <p className="text-lg font-semibold text-gray-900">Loading menu...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900">Menu Management</h1>
              <p className="text-gray-500 mt-2">
                Total Items: {stats.total} • Active Chefs: {stats.available} • Categories: {categories.length} • Available Status: {stats.available}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(undefined);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition shadow-md"
            >
              <Plus size={20} />
              Add New Item
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3">
              <Filter size={20} className="text-gray-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-sm font-medium text-gray-700"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-700">{stats.available}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Unavailable</p>
              <p className="text-2xl font-bold text-red-700">{stats.unavailable}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Avg Price</p>
              <p className="text-2xl font-bold text-blue-700">৳{stats.avgPrice}</p>
            </div>
          </div>

          {/* Menu Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                  onToggleAvailability={() => item.id && handleToggleAvailabilityCallback(item.id)}
                  onViewInsights={async () => {
                    if (item.id) {
                      setInsightsItemId(item.id);
                      await fetchReviewsForItem(item.id);
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Form Modal */}
          {isFormOpen && (
            <MenuItemForm
              item={editingItem}
              onClose={() => {
                setIsFormOpen(false);
                setEditingItem(undefined);
              }}
              onSave={handleSave}
              uploading={saving}
              isLoading={saving}
            />
          )}

          {/* Delete Confirmation Dialog */}
          {itemToDelete && (
            <DeleteConfirmDialog
              item={itemToDelete}
              onConfirm={confirmDelete}
              onCancel={() => setItemToDelete(null)}
            />
          )}

          {/* Menu Insights Modal */}
          {insightsItemId && (
            <MenuInsightsModal
              menuItem={menuItems.find((item) => item.id === insightsItemId)!}
              reviews={insightsReviews}
              isOpen={!!insightsItemId}
              loading={loadingInsights}
              onClose={() => {
                setInsightsItemId(null);
                setInsightsReviews([]);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

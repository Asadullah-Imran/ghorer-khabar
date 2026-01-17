"use client";

import MenuItemCard from "@/components/chef/Menu/MenuItemCard";
import MenuItemForm from "@/components/chef/Menu/MenuItemForm";
import DeleteConfirmDialog from "@/components/chef/Menu/DeleteConfirmDialog";
import MenuInsightsModal from "@/components/chef/Menu/MenuInsightsModal";
import { Filter, Plus, Search, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [insightsItemId, setInsightsItemId] = useState<string | null>(null);
  const [insightsReviews, setInsightsReviews] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items on mount
  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/chef/menu");
      const data = await res.json();

      //console.log("=== FETCH MENU ITEMS RESPONSE ===");
      //console.log("Status:", res.status);
     // console.log("Response data:", data);
      // if (data.data) {
      //  // console.log("Menu items count:", data.data.length);
      //   // data.data.forEach((item: any, idx: number) => {
      //   //   // console.log(`Item ${idx}:`, {
      //   //   //   id: item.id,
      //   //   //   name: item.name,
      //   //   //   images: item.menu_item_images,
      //   //   //   imagesCount: item.menu_item_images?.length || 0,
      //   //   // });
      //   // });
      // }

      if (data.success) {
        setMenuItems(data.data || []);
      } else {
        setError(data.error || "Failed to fetch menu items");
      }
    } catch (err) {
      setError("Failed to fetch menu items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async (formItem: MenuItem) => {
    try {
      setSaving(true);
      setError(null);

      console.log("\n=== FRONTEND: handleSave STARTED ===");
      console.log("Mode:", editingItem?.id ? "EDIT" : "CREATE");
      console.log("Form Item Data:", {
        name: formItem.name,
        category: formItem.category,
        price: formItem.price,
        description: formItem.description,
        prepTime: formItem.prepTime,
        calories: formItem.calories,
        spiciness: formItem.spiciness,
        isVegetarian: formItem.isVegetarian,
        ingredientsCount: formItem.ingredients?.length || 0,
        imagesCount: formItem.images?.length || 0,
      });

      const formData = new FormData();
      formData.append("name", formItem.name);
      formData.append("description", formItem.description || "");
      formData.append("category", formItem.category);
      formData.append("price", formItem.price.toString());
      formData.append("prepTime", (formItem.prepTime || 0).toString());
      formData.append("calories", (formItem.calories || 0).toString());
      formData.append("spiciness", formItem.spiciness || "Medium");
      formData.append("isVegetarian", (formItem.isVegetarian || false).toString());
      formData.append("ingredients", JSON.stringify(formItem.ingredients || []));
      console.log("Ingredients being sent:", formItem.ingredients || []);
      
      // Send deleted image IDs
      if (formItem.deletedImageIds && formItem.deletedImageIds.length > 0) {
        formItem.deletedImageIds.forEach(id => formData.append("deleteImages", id));
        console.log("Deleted image IDs:", formItem.deletedImageIds);
      }

      // Handle images (prefer the File object from the form; fallback to preview blob)
      let newImagesCount = 0;
      if (formItem.images) {
        for (const img of formItem.images as any[]) {
          if (img.id === undefined) {
            let fileToUpload: File | null = img.file ?? null;

            // Fallback: fetch from preview URL if the File is missing
            if (!fileToUpload && img.preview) {
              console.log("Processing new image from preview:", img.preview);
              const blob = await fetch(img.preview).then((res) => res.blob());
              fileToUpload = new File([blob], `image-${Date.now()}.png`, {
                type: blob.type || "image/png",
              });
            }

            if (fileToUpload) {
              formData.append("images", fileToUpload);
              newImagesCount++;
            } else {
              console.warn("Skipping image without file/preview", img);
            }
          }
        }
      }
      console.log("Total new images to upload:", newImagesCount);

      const url = editingItem?.id ? `/api/chef/menu/${editingItem.id}` : "/api/chef/menu";
      const method = editingItem ? "PUT" : "POST";
      console.log("API Endpoint:", method, url);
      console.log("Sending FormData to backend...");

      const res = await fetch(url, {
        method,
        body: formData,
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        console.log("Menu item saved successfully!", data.data);
        await fetchMenuItems();
        setIsFormOpen(false);
        setEditingItem(undefined);
      } else {
        console.error("Backend returned error:", data.error);
        setError(data.error || "Failed to save menu item");
      }
    } catch (err) {
      console.error("Error in handleSave:", err);
      setError("Failed to save menu item");
      console.error(err);
    } finally {
      setSaving(false);
      console.log("=== FRONTEND: handleSave ENDED ===");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/chef/menu/${itemToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        await fetchMenuItems();
        setItemToDelete(null);
      } else {
        setError(data.error || "Failed to delete menu item");
      }
    } catch (err) {
      setError("Failed to delete menu item");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/chef/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchMenuItems();
      } else {
        setError(data.error || "Failed to update availability");
      }
    } catch (err) {
      setError("Failed to update availability");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

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
                {menuItems.length} items • {filteredItems.length} showing
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
              <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-green-700">
                {menuItems.filter((i) => i.isAvailable).length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 mb-1">Unavailable</p>
              <p className="text-2xl font-bold text-red-700">
                {menuItems.filter((i) => !i.isAvailable).length}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">Avg Price</p>
              <p className="text-2xl font-bold text-blue-700">
                ৳
                {menuItems.length > 0
                  ? Math.round(
                      menuItems.reduce((sum, i) => sum + i.price, 0) / menuItems.length
                    )
                  : 0}
              </p>
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
                  onToggleAvailability={() => item.id && handleToggleAvailability(item.id)}
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

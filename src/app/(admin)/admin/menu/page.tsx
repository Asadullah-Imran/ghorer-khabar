"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Search,
  Eye,
  Trash2,
  Edit,
  Star,
  DollarSign,
  Shield,
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  users: {
    id: string;
    name: string;
  };
  menu_item_images: Array<{
    id: string;
    imageUrl: string;
  }>;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/admin/menu");
      const data = await res.json();
      setMenuItems(data.menuItems);
      setFilteredItems(data.menuItems);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    const filtered = menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.description?.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      try {
        const res = await fetch(`/api/admin/menu?id=${itemId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setMenuItems(menuItems.filter((item) => item.id !== itemId));
          setFilteredItems(filteredItems.filter((item) => item.id !== itemId));
          setSelectedItem(null);
        }
      } catch (error) {
        console.error("Failed to delete menu item:", error);
      }
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId: itemId,
          isAvailable: !currentStatus,
        }),
      });

      if (res.ok) {
        setMenuItems(
          menuItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: !currentStatus }
              : item
          )
        );
        setFilteredItems(
          filteredItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: !currentStatus }
              : item
          )
        );
        if (selectedItem?.id === itemId) {
          setSelectedItem({ ...selectedItem, isAvailable: !currentStatus });
        }
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-background-dark">
        <AdminSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading menu items...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-dark text-white">
      <AdminSidebar />

      <main className="flex-1 overflow-y-auto flex flex-col">
        <AdminHeader title="Menu Management" />

        <div className="p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Menu Items</h2>
            <p className="text-text-muted">
              Manage and review all menu items across all kitchens
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search by name, description, or category..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-surface-dark border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            />
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length === 0 ? (
              <div className="lg:col-span-3 text-center py-12 bg-surface-dark border border-border-dark rounded-xl">
                <p className="text-text-muted text-lg">No menu items found</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
                >
                  {/* Image */}
                  {item.menu_item_images[0] ? (
                    <div className="relative h-40 bg-background-dark overflow-hidden">
                      <img
                        src={item.menu_item_images[0].imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            item.isAvailable
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 bg-background-dark flex items-center justify-center">
                      <p className="text-text-muted">No image</p>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg line-clamp-2">{item.name}</h3>
                      <p className="text-xs text-text-muted mt-1">
                        Chef: {item.users.name}
                      </p>
                    </div>

                    <p className="text-sm text-text-muted line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-primary" />
                        <span className="font-bold">৳{item.price}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{item.rating}</span>
                        <span className="text-xs text-text-muted">
                          ({item.reviewCount})
                        </span>
                      </div>
                    </div>

                    <span className="block text-xs text-text-muted">
                      Category: {item.category}
                    </span>

                    <div className="flex gap-2 pt-3 border-t border-border-dark">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors font-medium text-sm"
                      >
                        <Eye size={16} /> View
                      </button>
                      <button
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors font-medium text-sm ${
                          item.isAvailable
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        }`}
                      >
                        <Shield size={16} />{" "}
                        {item.isAvailable ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface-dark border border-border-dark rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedItem.name}</h2>
                    <p className="text-text-muted">{selectedItem.category}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-text-muted hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Image */}
                {selectedItem.menu_item_images[0] && (
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedItem.menu_item_images[0].imageUrl}
                      alt={selectedItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div className="bg-background-dark rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Description</h3>
                  <p className="text-text-muted">{selectedItem.description}</p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background-dark rounded-lg p-4">
                    <p className="text-text-muted text-sm mb-1">Price</p>
                    <p className="text-2xl font-bold text-primary">
                      ৳{selectedItem.price}
                    </p>
                  </div>
                  <div className="bg-background-dark rounded-lg p-4">
                    <p className="text-text-muted text-sm mb-1">Status</p>
                    <p
                      className={`font-bold ${
                        selectedItem.isAvailable
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {selectedItem.isAvailable ? "Available" : "Unavailable"}
                    </p>
                  </div>
                  <div className="bg-background-dark rounded-lg p-4">
                    <p className="text-text-muted text-sm mb-1">Rating</p>
                    <div className="flex items-center gap-2">
                      <Star size={20} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-2xl font-bold">{selectedItem.rating}</span>
                    </div>
                  </div>
                  <div className="bg-background-dark rounded-lg p-4">
                    <p className="text-text-muted text-sm mb-1">Reviews</p>
                    <p className="text-2xl font-bold">{selectedItem.reviewCount}</p>
                  </div>
                </div>

                {/* Chef Info */}
                <div className="bg-background-dark rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-2">Chef</h3>
                  <p className="font-medium">{selectedItem.users.name}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-dark">
                  <button
                    onClick={() => {
                      toggleAvailability(
                        selectedItem.id,
                        selectedItem.isAvailable
                      );
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${
                      selectedItem.isAvailable
                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                    }`}
                  >
                    {selectedItem.isAvailable ? "Disable Item" : "Enable Item"}
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

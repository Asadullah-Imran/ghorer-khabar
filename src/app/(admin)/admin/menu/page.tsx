"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import { useConfirmation } from "@/contexts/ConfirmationContext";
import { useToast } from "@/contexts/ToastContext";
import {
  DollarSign,
  Eye,
  Filter,
  Heart,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

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
  _count?: {
    orderItems: number;
    favorites: number;
  };
}

export default function MenuManagement() {
  const { confirm, setLoading: setConfirmLoading } = useConfirmation();
  const toast = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedChef, setSelectedChef] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("all");
  const [chefs, setChefs] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    activeChefs: 0,
    totalCategories: 0,
    totalAvailable: 0
  });
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setSkip(0);
    setMenuItems([]);
    setFilteredItems([]);
    // Only fetch stats on initial load if we don't have them yet or if it's the very first render
    const isFirstLoad = chefs.length === 0 && categories.length === 0;
    fetchMenuItems(0, isFirstLoad);
  }, [selectedChef, selectedCategory, sortBy]);

  const fetchMenuItems = async (skipValue: number = 0, fetchStats: boolean = false) => {
    try {
      skipValue === 0 ? setLoading(true) : setLoadingMore(true);

      const params = new URLSearchParams();
      params.append("skip", skipValue.toString());
      params.append("take", "10");
      if (selectedChef) params.append("chefId", selectedChef);
      if (selectedCategory) params.append("category", selectedCategory);
      if (sortBy !== "all") params.append("sortBy", sortBy);
      if (fetchStats) params.append("includeStats", "true");

      const res = await fetch(`/api/admin/menu?${params.toString()}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch menu items");
      }
      const data = await res.json();

      if (skipValue === 0) {
        setMenuItems(data.menuItems);
        setFilteredItems(data.menuItems);
      } else {
        setMenuItems((prev) => [...prev, ...data.menuItems]);
        setFilteredItems((prev) => [...prev, ...data.menuItems]);
      }

      setHasMore(data.hasMore);
      setSkip(skipValue + 10);

      // Update global stats and filters if provided
      if (data.stats) {
        setStats(data.stats);
      }

      if (data.filters) {
        setChefs(data.filters.chefs);
        setCategories(data.filters.categories);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to load menu items", error instanceof Error ? error.message : "");
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
    const confirmed = await confirm({
      title: "Delete Menu Item",
      message: "This menu item will be permanently deleted. This action cannot be undone.",
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (confirmed) {
      try {
        setConfirmLoading(true);
        const res = await fetch(`/api/admin/menu?id=${itemId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to delete menu item");
        }

        setMenuItems(menuItems.filter((item) => item.id !== itemId));
        setFilteredItems(filteredItems.filter((item) => item.id !== itemId));
        setSelectedItem(null);
        toast.success("Menu item deleted", "The menu item has been removed successfully");
      } catch (error) {
        console.error("Failed to delete menu item:", error);
        toast.error("Failed to delete menu item", error instanceof Error ? error.message : "");
      } finally {
        setConfirmLoading(false);
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

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update menu item");
      }

      const data = await res.json();

      if (data.success) {
        // Update local state with the new availability
        const updatedAvailability = !currentStatus;

        setMenuItems(
          menuItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: updatedAvailability }
              : item
          )
        );
        setFilteredItems(
          filteredItems.map((item) =>
            item.id === itemId
              ? { ...item, isAvailable: updatedAvailability }
              : item
          )
        );
        if (selectedItem?.id === itemId) {
          setSelectedItem({ ...selectedItem, isAvailable: updatedAvailability });
        }

        toast.success(
          updatedAvailability ? "Menu item enabled" : "Menu item disabled",
          `The item is now ${updatedAvailability ? "available" : "unavailable"} for customers`
        );
      }
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Failed to update menu item", error instanceof Error ? error.message : "");
    }
  };

  if (loading && menuItems.length === 0) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading menu items...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto flex flex-col">
      <AdminHeader title="Menu Management" />

      <div className="p-8 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold mb-2">Menu Items</h2>
          <p className="text-text-muted">
            Manage and review all menu items across all kitchens
          </p>
          {(selectedChef || selectedCategory || sortBy !== "all" || search) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  Search: "{search}"
                </span>
              )}
              {selectedChef && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                  Chef: {chefs.find(c => c.id === selectedChef)?.name}
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
              {sortBy !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm">
                  <TrendingUp size={14} />
                  {sortBy === "sales" && "Sorted by Sales"}
                  {sortBy === "favorites" && "Sorted by Favorites"}
                  {sortBy === "rating" && "Sorted by Rating"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name, description, or category..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            >
              <option value="all">See All (Latest)</option>
              <option value="sales">Max Sales</option>
              <option value="favorites">Most Favorited</option>
              <option value="rating">Top Rating</option>
            </select>
          </div>

          {/* Chef Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Filter by Chef
            </label>
            <select
              value={selectedChef}
              onChange={(e) => setSelectedChef(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            >
              <option value="">All Chefs</option>
              {chefs.map((chef) => (
                <option key={chef.id} value={chef.id}>
                  {chef.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-text-muted">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-surface-dark bg-neutral-900 border border-border-dark rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none text-white"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedChef("");
                setSelectedCategory("");
                setSortBy("all");
                setSearch("");
              }}
              className="w-full px-4 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-text-muted hover:text-white hover:border-primary transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-dark border border-border-dark rounded-lg p-4">
            <p className="text-text-muted text-xs mb-1">Total Items</p>
            <p className="text-2xl font-bold text-white">{stats.totalItems || filteredItems.length}</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-lg p-4">
            <p className="text-text-muted text-xs mb-1">Active Chefs</p>
            <p className="text-2xl font-bold text-primary">{stats.activeChefs || chefs.length}</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-lg p-4">
            <p className="text-text-muted text-xs mb-1">Categories</p>
            <p className="text-2xl font-bold text-green-400">{stats.totalCategories || categories.length}</p>
          </div>
          <div className="bg-surface-dark border border-border-dark rounded-lg p-4">
            <p className="text-text-muted text-xs mb-1">Available</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.totalAvailable || filteredItems.filter(item => item.isAvailable).length}
            </p>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && menuItems.length === 0 ? (
            <div className="lg:col-span-3 text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4"></div>
                <p className="text-text-muted">Loading menu items...</p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
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
                        className={`px-2 py-1 rounded text-xs font-bold ${item.isAvailable
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

                  {/* Sales and Favorites Stats */}
                  {item._count && (
                    <div className="flex gap-2">
                      <div className="flex-1 bg-background-dark rounded px-2 py-1.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <ShoppingCart size={12} className="text-blue-400" />
                          <p className="text-xs text-text-muted">Sales</p>
                        </div>
                        <p className="text-sm font-bold text-blue-400">
                          {item._count.orderItems || 0}
                        </p>
                      </div>
                      <div className="flex-1 bg-background-dark rounded px-2 py-1.5">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Heart size={12} className="text-pink-400" />
                          <p className="text-xs text-text-muted">Favorites</p>
                        </div>
                        <p className="text-sm font-bold text-pink-400">
                          {item._count.favorites || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-border-dark">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors font-medium text-sm"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => toggleAvailability(item.id, item.isAvailable)}
                      className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded transition-colors font-medium text-sm ${item.isAvailable
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

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => fetchMenuItems(skip)}
              disabled={loadingMore}
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? "Loading..." : `See More`}
            </button>
          </div>
        )}
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
                    className={`font-bold ${selectedItem.isAvailable
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
                {selectedItem._count && (
                  <>
                    <div className="bg-background-dark rounded-lg p-4">
                      <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                        <ShoppingCart size={16} />
                        <p>Total Sales</p>
                      </div>
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedItem._count.orderItems || 0}
                      </p>
                    </div>
                    <div className="bg-background-dark rounded-lg p-4">
                      <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                        <Heart size={16} />
                        <p>Favorites</p>
                      </div>
                      <p className="text-2xl font-bold text-pink-400">
                        {selectedItem._count.favorites || 0}
                      </p>
                    </div>
                  </>
                )}
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
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors ${selectedItem.isAvailable
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
  );
}

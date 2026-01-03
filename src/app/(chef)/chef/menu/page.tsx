"use client";

import MenuItemCard from "@/components/chef/Menu/MenuItemCard";
import MenuItemForm from "@/components/chef/Menu/MenuItemForm";
import DeleteConfirmDialog from "@/components/chef/Menu/DeleteConfirmDialog";
import MenuInsightsModal from "@/components/chef/Menu/MenuInsightsModal";
import { MenuItem, MENU_ITEMS, MENU_ITEM_REVIEWS } from "@/lib/dummy-data/chef";
import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [insightsItemId, setInsightsItemId] = useState<string | null>(null);

  // Filter menu items
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSave = (data: Partial<MenuItem>) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id ? { ...item, ...data } : item
        )
      );
    } else {
      // Add new item
      setMenuItems([...menuItems, data as MenuItem]);
    }
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (item: MenuItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setMenuItems(menuItems.filter((item) => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const categories = ["All", "Rice", "Beef", "Chicken", "Fish", "Vegetarian"];

  return (
    <div className="p-6 space-y-8">
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
            {Math.round(
              menuItems.reduce((sum, i) => sum + i.currentPrice, 0) /
                menuItems.length
            )}
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
              onToggleAvailability={() => handleToggleAvailability(item.id)}
              onViewInsights={() => setInsightsItemId(item.id)}
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
          reviews={MENU_ITEM_REVIEWS[insightsItemId] || []}
          isOpen={!!insightsItemId}
          onClose={() => setInsightsItemId(null)}
        />
      )}
    </div>
  );
}

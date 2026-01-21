"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

interface UseChefMenuReturn {
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  fetchMenuItems: () => Promise<void>;
  saveMenuItem: (item: MenuItem, editingId?: string) => Promise<boolean>;
  deleteMenuItem: (id: string) => Promise<boolean>;
  toggleAvailability: (id: string) => Promise<boolean>;
}

// Cache for menu items
let menuCache: MenuItem[] = [];
let menuCacheTimestamp = 0;
const MENU_CACHE_DURATION = 5000; // 5 seconds

export function useChefMenu(): UseChefMenuReturn {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuCache);
  const [loading, setLoading] = useState(!menuCache.length);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const isMountedRef = useRef(true);

  const fetchMenuItems = useCallback(async () => {
    // Use cache if still valid
    const now = Date.now();
    if (menuCache.length > 0 && now - menuCacheTimestamp < MENU_CACHE_DURATION) {
      setMenuItems(menuCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/chef/menu", { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        menuCache = data.data || [];
        menuCacheTimestamp = now;
        if (isMountedRef.current) {
          setMenuItems(menuCache);
        }
      } else {
        throw new Error(data.error || "Failed to fetch menu items");
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch menu items");
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const saveMenuItem = useCallback(async (formItem: MenuItem, editingId?: string): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

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
      
      if (formItem.deletedImageIds && formItem.deletedImageIds.length > 0) {
        formItem.deletedImageIds.forEach(id => formData.append("deleteImages", id));
      }

      // Handle images
      if (formItem.images) {
        for (const img of formItem.images as any[]) {
          if (img.id === undefined) {
            let fileToUpload: File | null = img.file ?? null;

            if (!fileToUpload && img.preview) {
              const blob = await fetch(img.preview).then((res) => res.blob());
              fileToUpload = new File([blob], `image-${Date.now()}.png`, {
                type: blob.type || "image/png",
              });
            }

            if (fileToUpload) {
              formData.append("images", fileToUpload);
            }
          }
        }
      }

      const url = editingId ? `/api/chef/menu/${editingId}` : "/api/chef/menu";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Invalidate cache and refetch
        menuCacheTimestamp = 0;
        await fetchMenuItems();
        return true;
      } else {
        setError(data.error || "Failed to save menu item");
        return false;
      }
    } catch (err) {
      console.error("Error saving menu item:", err);
      setError("Failed to save menu item");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMenuItems]);

  const deleteMenuItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/chef/menu/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Invalidate cache and refetch
        menuCacheTimestamp = 0;
        await fetchMenuItems();
        return true;
      } else {
        setError(data.error || "Failed to delete menu item");
        return false;
      }
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setError("Failed to delete menu item");
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMenuItems]);

  const toggleAvailability = useCallback(async (id: string): Promise<boolean> => {
    const item = menuItems.find((i) => i.id === id);
    if (!item) return false;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/chef/menu/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.isAvailable,
        }),
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        // Optimistically update cache
        menuCache = menuCache.map((i) =>
          i.id === id ? { ...i, isAvailable: !i.isAvailable } : i
        );
        setMenuItems(menuCache);
        return true;
      } else {
        setError(data.error || "Failed to update availability");
        return false;
      }
    } catch (err) {
      console.error("Error updating availability:", err);
      setError("Failed to update availability");
      return false;
    } finally {
      setSaving(false);
    }
  }, [menuItems]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchMenuItems();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchMenuItems]);

  return {
    menuItems,
    loading,
    error,
    saving,
    fetchMenuItems,
    saveMenuItem,
    deleteMenuItem,
    toggleAvailability,
  };
}

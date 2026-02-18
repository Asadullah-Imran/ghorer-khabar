# Manual Updates Required for Tags System

## ✅ Already Completed:
1. ✅ Database schema updated (DishCategory enum + tags field)
2. ✅ Migration applied successfully
3. ✅ Prisma Client generated
4. ✅ MenuItemForm.tsx updated with tags UI
5. ✅ useChefMenu.ts updated to send tags

## 🔧 Remaining Updates Needed:

### 1. Update API Route: `/api/chef/menu/[id]/route.ts`

**File:** `src/app/api/chef/menu/[id]/route.ts`

**Line 206** - Add tags field after allergyAlerts:

```typescript
// FIND THIS (around line 188-207):
      const allergyAlertsJson = formData.get("allergyAlerts") as string;
      const allergyAlerts = allergyAlertsJson ? JSON.parse(allergyAlertsJson).filter((alert: string) => alert.trim() !== "") : [];
      
      updateData = {
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        price: formData.get("price")
          ? parseFloat(formData.get("price") as string)
          : undefined,
        prepTime: formData.get("prepTime")
          ? parseInt(formData.get("prepTime") as string)
          : undefined,
        calories: formData.get("calories")
          ? parseInt(formData.get("calories") as string)
          : undefined,
        spiciness: formData.get("spiciness"),
        isVegetarian: formData.get("isVegetarian") === "true",
        allergyAlerts: allergyAlerts.length > 0 ? allergyAlerts : [],
      };

// REPLACE WITH:
      const allergyAlertsJson = formData.get("allergyAlerts") as string;
      const allergyAlerts = allergyAlertsJson ? JSON.parse(allergyAlertsJson).filter((alert: string) => alert.trim() !== "") : [];
      const tagsJson = formData.get("tags") as string;
      const tags = tagsJson ? JSON.parse(tagsJson).filter((tag: string) => tag.trim() !== "") : [];
      
      updateData = {
        name: formData.get("name"),
        description: formData.get("description"),
        category: formData.get("category"),
        price: formData.get("price")
          ? parseFloat(formData.get("price") as string)
          : undefined,
        prepTime: formData.get("prepTime")
          ? parseInt(formData.get("prepTime") as string)
          : undefined,
        calories: formData.get("calories")
          ? parseInt(formData.get("calories") as string)
          : undefined,
        spiciness: formData.get("spiciness"),
        isVegetarian: formData.get("isVegetarian") === "true",
        allergyAlerts: allergyAlerts.length > 0 ? allergyAlerts : [],
        tags: tags.length > 0 ? tags : [],  // ← ADD THIS LINE
      };
```

---

### 2. Update POST Route: `/api/chef/menu/route.ts`

**File:** `src/app/api/chef/menu/route.ts`

Find the section where you parse FormData (similar to above) and add tags parsing there too.

---

### 3. Update Menu Page Filter: `/chef/menu/page.tsx`

**File:** `src/app/(chef)/chef/menu/page.tsx`

**Add tag-based search** to the filtering logic:

```typescript
// FIND the filteredItems useMemo (around line 50-60):
const filteredItems = useMemo(() => {
  return menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
}, [menuItems, searchQuery, categoryFilter]);

// REPLACE WITH:
const filteredItems = useMemo(() => {
  return menuItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
}, [menuItems, searchQuery, categoryFilter]);
```

---

### 4. Update Explore Page Search

**File:** `src/app/(main)/explore/page.tsx`

Add tag-based search similar to the menu page.

---

### 5. Update Feed Page Search

**File:** `src/app/(main)/feed/page.tsx`

Add tag-based search similar to the menu page.

---

## 🧪 Testing Checklist:

After making these changes:

1. ✅ Go to `/chef/menu`
2. ✅ Click "Add New Menu Item"
3. ✅ Select a category from dropdown (should show emojis)
4. ✅ Add tags (type and press Enter)
5. ✅ Save the dish
6. ✅ Verify tags are saved (edit the dish again)
7. ✅ Search for a tag in the search box
8. ✅ Verify tag-based search works

---

## 📝 Quick Summary:

**What's Working:**
- ✅ Database has `tags` field and `DishCategory` enum
- ✅ UI shows tags input with chips
- ✅ Form sends tags to backend

**What Needs Manual Fix:**
- 🔧 API route needs to parse and save tags (1 line addition)
- 🔧 Search needs to include tags (3-4 line update)

The changes are minimal! Just add tags parsing in the API routes and update search filters to include tags.

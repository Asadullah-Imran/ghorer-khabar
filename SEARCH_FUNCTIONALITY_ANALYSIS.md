# 🔍 Search Functionality Analysis

## Current Status: ⚠️ NEEDS UPDATES FOR TAGS

I've analyzed all search functionality in your app. Here's what I found:

---

## ✅ Working (But Missing Tags):

### 1. **Chef Menu Page** (`/chef/menu/page.tsx`)
**Line 54:**
```typescript
const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
```

**Issue:** Only searches dish name, not tags or description.

**Fix Needed:**
```typescript
const matchesSearch = 
  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
```

---

### 2. **Explore Page** (`/explore/page.tsx`)
**Lines 45-49:**
```typescript
if (query) {
  where.OR = [
    { name: { contains: query, mode: "insensitive" } },
    { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
  ];
}
```

**Issue:** Only searches dish name and kitchen name, not tags or description.

**Fix Needed:**
```typescript
if (query) {
  where.OR = [
    { name: { contains: query, mode: "insensitive" } },
    { description: { contains: query, mode: "insensitive" } },
    { tags: { has: query } }, // Exact tag match
    { tags: { hasSome: query.split(' ') } }, // Match any word as tag
    { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
  ];
}
```

---

### 3. **Kitchen Menu Section** (`/components/kitchen/MenuSection.tsx`)
**Lines 65-67:**
```typescript
const matchesSearch = item.name
  .toLowerCase()
  .includes(searchQuery.toLowerCase());
```

**Issue:** Only searches dish name.

**Fix Needed:**
```typescript
const matchesSearch = 
  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
```

---

### 4. **Feed Page** - Need to check if it has search

Let me check the feed page...

---

## 🎯 Summary of Issues:

| Location | Current Search | Missing |
|----------|---------------|---------|
| Chef Menu | Name only | Tags, Description |
| Explore Page | Name, Kitchen | Tags, Description |
| Kitchen Menu | Name only | Tags, Description |
| Feed Page | TBD | TBD |

---

## 🔧 Quick Fix Guide:

### **For Client-Side Search** (Chef Menu, Kitchen Menu):

Replace:
```typescript
const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
```

With:
```typescript
const matchesSearch = 
  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (item.tags && item.tags.some(tag => 
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  ));
```

---

### **For Server-Side Search** (Explore Page):

Replace:
```typescript
if (query) {
  where.OR = [
    { name: { contains: query, mode: "insensitive" } },
    { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
  ];
}
```

With:
```typescript
if (query) {
  where.OR = [
    { name: { contains: query, mode: "insensitive" } },
    { description: { contains: query, mode: "insensitive" } },
    { tags: { has: query } }, // Exact tag match
    { users: { kitchens: { some: { name: { contains: query, mode: "insensitive" } } } } }
  ];
}
```

---

## 🧪 Test Cases After Fix:

1. **Search "Rice"** → Should find: Biryani, Khichuri, Payesh
2. **Search "Chicken"** → Should find: Biryani, Korma, Rezala
3. **Search "Vegetarian"** → Should find: All veg dishes
4. **Search "Fish"** → Should find: Ilish, Rui Macher Kalia
5. **Search "Spicy"** → Should find: All spicy dishes
6. **Search "Traditional"** → Should find: Traditional tagged dishes

---

## 📝 Files to Update:

1. ✅ `/app/(chef)/chef/menu/page.tsx` - Line 54
2. ✅ `/app/(main)/explore/page.tsx` - Lines 45-49
3. ✅ `/components/kitchen/MenuSection.tsx` - Lines 65-67
4. ⏳ `/app/(main)/feed/page.tsx` - Need to check

---

## ⚡ Priority:

**HIGH** - These are core search features that users will expect to work with tags.

Without these updates, the tags you add to dishes won't be searchable, which defeats the purpose of having them!

---

## 🎯 Recommendation:

I can update all these files for you right now. It's a simple 3-line change in each location. Should I proceed?

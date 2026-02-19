# 🗺️ Distance Feature Implementation Progress

## ✅ Completed:

### 1. **Utility Functions** ✅
- `/lib/utils/distance.ts` already exists
- `calculateDistance()` - Haversine formula
- `formatDistance()` - Format km/m
- `isValidCoordinates()` - Validation

### 2. **Card Components Updated** ✅
- ✅ `DishCard.tsx` - Added distance prop and MapPin icon
- ✅ `KitchenCard.tsx` - Already had distance support
- ✅ `PlanCard.tsx` - Added distance prop and MapPin icon

### 3. **Explore Page** ✅
- ✅ Imported distance utilities
- ✅ Fetch user's address coordinates
- ✅ Calculate distance for dishes
- ✅ Pass distance to DishCard

---

## ⏳ In Progress:

### **Explore Page - Remaining:**
- ⏳ Add distance to kitchens mapping
- ⏳ Add distance to plans mapping

### **Feed Page:**
- ⏳ Add distance utilities import
- ⏳ Fetch user coordinates
- ⏳ Calculate distance for all items
- ⏳ Pass distance to cards

---

## 📋 Next Steps:

1. **Complete Explore Page:**
   - Update kitchens mapping (lines ~220-230)
   - Update plans mapping (lines ~172-185)

2. **Update Feed Page:**
   - Add imports
   - Fetch user coordinates
   - Calculate distance for dishes
   - Pass to components

3. **Test:**
   - Verify distance shows on cards
   - Check format (km vs m)
   - Test without user address

---

## How It Works:

### **Distance Calculation:**
```typescript
// 1. Get user coordinates from address
const userAddress = await prisma.address.findFirst({
  where: { userId },
  select: { latitude: true, longitude: true },
});

// 2. Get kitchen coordinates (already in query)
const kitchen = dish.users.kitchens[0];

// 3. Calculate distance
if (userLat && userLon && kitchen.latitude && kitchen.longitude) {
  const distanceKm = calculateDistance(
    userLat, userLon,
    kitchen.latitude, kitchen.longitude
  );
  distance = formatDistance(distanceKm); // "2.5 km" or "500 m"
}

// 4. Pass to card
<DishCard data={{ ...dish, distance }} />
```

### **Display:**
```
⏰ 30-45 min  📍 2.5 km
```

---

## Files Modified:

1. ✅ `/components/shared/DishCard.tsx`
2. ✅ `/components/shared/PlanCard.tsx`
3. ✅ `/app/(main)/explore/page.tsx` (partial)
4. ⏳ `/app/(main)/feed/page.tsx` (pending)

---

## Current Status:

**Explore Page Dishes:** ✅ Working  
**Explore Page Kitchens:** ⏳ Pending  
**Explore Page Plans:** ⏳ Pending  
**Feed Page:** ⏳ Pending  

---

## Testing:

Once complete, test at:
- `http://localhost:3000/explore?tab=dishes`
- `http://localhost:3000/explore?tab=kitchens`
- `http://localhost:3000/explore?tab=subscriptions`
- `http://localhost:3000/feed`

Expected: Distance shows next to delivery time on all cards

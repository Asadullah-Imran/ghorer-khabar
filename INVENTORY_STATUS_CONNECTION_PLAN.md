# Inventory Status Table - Connection & Implementation Plan

## 📊 Current Structure Analysis

### ✅ What's Already Correct:

1. **Demand Column** ✅
   - Shows `demandFromOrders` (Orders) and `forecastDemand` (Forecast) separately
   - Visual distinction with icons (blue up arrow for orders, purple down arrow for forecast)
   - **Status**: GOOD - Clear separation of demand sources

2. **Required Column** ✅
   - Formula: `demandFromOrders + forecastDemand`
   - Shows total quantity needed
   - **Status**: GOOD - Correct calculation

3. **To Buy Column** ✅
   - Formula: `max(0, required - currentStock)`
   - Shows gap that needs to be purchased
   - Visual: Orange if > 0, Green checkmark if sufficient
   - **Status**: GOOD - Correct calculation and display

4. **Status Column** ⚠️ **NEEDS IMPROVEMENT**
   - Current: Only based on `currentStock <= reorderLevel`
   - Problem: If `reorderLevel = 0` (default), status is always "healthy"
   - Should also consider: `toBuy` amount and `required` vs `currentStock`
   - **Status**: NEEDS FIX

5. **Update Stock Modal** ✅
   - Has "Demand Analysis" section showing:
     - Required (demandFromOrders + forecastDemand)
     - New Stock (what user is setting)
     - Gap (required - newStock)
   - **Status**: GOOD - Shows real-time impact

---

## 🔗 How They Should Connect

### Data Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    INVENTORY STATUS TABLE                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Reads from
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              inventory_items table (Database)                 │
│  - currentStock                                              │
│  - demandFromOrders  ← Synced from orders                    │
│  - forecastDemand   ← Synced from forecast                   │
│  - reorderLevel      ← Set by chef (needs UI)                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Updated by
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SYNC APIS (Auto/Manual)                   │
│                                                               │
│  POST /api/chef/inventory/sync-demand                        │
│  └─ Calculates from pending orders                            │
│  └─ Updates demandFromOrders                                 │
│                                                               │
│  POST /api/chef/inventory/sync-forecast                      │
│  └─ Gets forecast from ML service                            │
│  └─ Updates forecastDemand                                    │
└─────────────────────────────────────────────────────────────┘
```

### Calculation Flow:

```
1. demandFromOrders (from sync-demand API)
   └─ Sum of ingredient requirements from pending orders

2. forecastDemand (from sync-forecast API)
   └─ 7-day predicted demand from ML service

3. required = demandFromOrders + forecastDemand
   └─ Total quantity needed

4. toBuy = max(0, required - currentStock)
   └─ Gap that needs purchasing

5. status = calculateStatus(currentStock, reorderLevel, toBuy, required)
   └─ Critical/Low/Healthy based on multiple factors
```

---

## 🎯 Issues to Fix

### Issue 1: Status Calculation is Too Simple

**Current Logic:**
```typescript
if (currentStock <= reorderLevel * 0.5) return "critical";
if (currentStock <= reorderLevel) return "low";
return "healthy";
```

**Problem:**
- If `reorderLevel = 0` (default), status is always "healthy"
- Doesn't consider `toBuy` amount
- Doesn't consider if `required > currentStock * 2` (severe shortage)

**Better Logic (from ML service):**
```typescript
function getStockStatus(item: InventoryItem) {
  const required = item.demandFromOrders + item.forecastDemand;
  const toBuy = Math.max(0, required - item.currentStock);
  
  // Critical if:
  // 1. Stock is below 50% of reorder level, OR
  // 2. Need to buy more than 2x current stock (severe shortage)
  if (item.currentStock <= item.reorderLevel * 0.5 || toBuy > item.currentStock * 2) {
    return "critical";
  }
  
  // Low if:
  // 1. Stock is below reorder level, OR
  // 2. Need to buy anything (gap exists)
  if (item.currentStock <= item.reorderLevel || toBuy > 0) {
    return "low";
  }
  
  return "healthy";
}
```

### Issue 2: Reorder Level is Always 0

**Problem:**
- New items have `reorderLevel = 0` by default
- No UI to set reorder level
- Status calculation fails when reorderLevel = 0

**Solution:**
- Add "Set Reorder Level" button/action in Inventory Table
- Or add reorder level field in Update Stock Modal
- Or auto-calculate based on average demand

### Issue 3: Demand Analysis Could Be More Detailed

**Current:**
- Shows: Required, New Stock, Gap

**Could Add:**
- Breakdown: Orders demand vs Forecast demand
- Visual indicator: "Will be sufficient" vs "Still need to buy"
- Cost impact: "Additional cost if gap remains"

---

## 📋 Implementation Plan

### Phase 1: Fix Status Calculation ✅

**File**: `src/components/chef/Inventory/InventoryTable.tsx`

**Changes:**
1. Update `getStockStatus()` function to use improved logic
2. Consider both `reorderLevel` AND `toBuy` amount
3. Handle case when `reorderLevel = 0` (use alternative logic)

**Code:**
```typescript
const getStockStatus = (item: InventoryItem) => {
  const required = item.demandFromOrders + item.forecastDemand;
  const toBuy = Math.max(0, required - item.currentStock);
  
  // If reorderLevel is 0 or not set, use alternative logic
  if (item.reorderLevel === 0) {
    // Use toBuy as primary indicator
    if (toBuy > item.currentStock * 2) return "critical";
    if (toBuy > 0) return "low";
    return "healthy";
  }
  
  // Standard logic with reorderLevel
  if (item.currentStock <= item.reorderLevel * 0.5 || toBuy > item.currentStock * 2) {
    return "critical";
  }
  if (item.currentStock <= item.reorderLevel || toBuy > 0) {
    return "low";
  }
  return "healthy";
};
```

### Phase 2: Add Reorder Level Management ✅

**Option A: Add to Update Stock Modal** (Recommended)

**File**: `src/components/chef/Inventory/StockUpdateModal.tsx`

**Changes:**
1. Add "Reorder Level" field in modal
2. Show current reorder level
3. Allow updating reorder level
4. Add helper text: "Stock will be marked 'Low' when below this level"

**Option B: Add Separate Action Button**

**File**: `src/components/chef/Inventory/InventoryTable.tsx`

**Changes:**
1. Add "Set Reorder Level" button next to "Update" button
2. Open modal to set reorder level only

**Recommendation**: Option A (add to Update Modal) - simpler UX

### Phase 3: Enhance Demand Analysis in Update Modal ✅

**File**: `src/components/chef/Inventory/StockUpdateModal.tsx`

**Changes:**
1. Expand "Demand Analysis" section
2. Show breakdown:
   - Orders Demand: X
   - Forecast Demand: Y
   - Total Required: X + Y
3. Add visual indicator:
   - Green if new stock >= required
   - Orange if new stock < required
4. Show cost impact (optional):
   - "If gap remains, estimated cost: ৳X"

### Phase 4: Ensure Auto-Sync is Working ✅

**File**: `src/app/(chef)/chef/inventory/page.tsx`

**Current**: ✅ Already implemented
- Auto-syncs when switching to Forecast tab
- Auto-syncs when switching to Shopping tab

**Enhancement:**
- Add manual "Refresh" button in Inventory Table
- Show last sync time
- Add loading indicator during sync

### Phase 5: Add Visual Indicators ✅

**Enhancements:**
1. **Demand Column**: Add color coding
   - Blue for orders (confirmed demand)
   - Purple for forecast (predicted demand)

2. **To Buy Column**: Add urgency indicator
   - Red if toBuy > currentStock * 2 (critical)
   - Orange if toBuy > 0 (needs attention)
   - Green if toBuy = 0 (sufficient)

3. **Status Badge**: Add icon
   - ⚠️ for Critical
   - ⚡ for Low
   - ✓ for Healthy

---

## 🔄 Connection Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    USER ACTIONS                               │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Switch to    │   │ Switch to    │   │ Click        │
│ Forecast Tab │   │ Shopping Tab │   │ Update Button│
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Auto-sync    │   │ Auto-sync    │   │ Open Update  │
│ Forecast     │   │ Order Demand │   │ Stock Modal  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Update       │   │ Update       │   │ Show Demand  │
│ forecastDemand│   │ demandFromOrders│ │ Analysis     │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│              INVENTORY TABLE RECALCULATES                     │
│  - Required = demandFromOrders + forecastDemand               │
│  - To Buy = max(0, required - currentStock)                   │
│  - Status = calculateStatus(...)                              │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    UI UPDATES                                 │
│  - Demand column shows updated values                         │
│  - Required column recalculates                               │
│  - To Buy column updates                                      │
│  - Status badge changes color                                 │
└──────────────────────────────────────────────────────────────┘
```

---

## ✅ Summary of Required Changes

### Must Fix (Critical):
1. ✅ **Status Calculation** - Use improved logic considering toBuy
2. ✅ **Reorder Level Management** - Add UI to set reorder level
3. ✅ **Handle reorderLevel = 0** - Use alternative logic when not set

### Should Enhance (Important):
4. ✅ **Demand Analysis** - Show breakdown in Update Modal
5. ✅ **Visual Indicators** - Add colors/icons for better UX
6. ✅ **Manual Refresh** - Add refresh button in Inventory Table

### Nice to Have (Optional):
7. ⚪ **Cost Impact** - Show estimated cost in Update Modal
8. ⚪ **Last Sync Time** - Display when data was last synced
9. ⚪ **Sync Status Indicator** - Show if data is fresh or stale

---

## 🎯 Implementation Priority

1. **High Priority** (Core Functionality):
   - Fix status calculation logic
   - Add reorder level management

2. **Medium Priority** (UX Improvements):
   - Enhance demand analysis in modal
   - Add visual indicators

3. **Low Priority** (Polish):
   - Manual refresh button
   - Last sync time display

---

## 📝 Files to Modify

1. `src/components/chef/Inventory/InventoryTable.tsx`
   - Update `getStockStatus()` function
   - Add visual enhancements

2. `src/components/chef/Inventory/StockUpdateModal.tsx`
   - Add reorder level field
   - Enhance demand analysis section

3. `src/app/(chef)/chef/inventory/page.tsx`
   - Add manual refresh button (optional)
   - Show sync status (optional)

---

## ✅ Current Status Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| Demand Column | ✅ Good | Shows orders + forecast correctly |
| Required Column | ✅ Good | Calculation is correct |
| To Buy Column | ✅ Good | Shows gap correctly |
| Status Column | ⚠️ Needs Fix | Logic too simple, doesn't consider toBuy |
| Update Modal | ✅ Good | Has demand analysis, could be enhanced |
| Auto-Sync | ✅ Good | Already implemented |
| Reorder Level | ❌ Missing | No UI to set it, defaults to 0 |

---

## 🚀 Ready to Implement?

**Current Structure**: ✅ Mostly correct, needs improvements

**Main Issues**:
1. Status calculation needs to consider `toBuy` amount
2. Reorder level needs UI to set it
3. Demand analysis could be more detailed

**Recommendation**: Implement Phase 1 & 2 first (status fix + reorder level), then Phase 3 (enhancements).

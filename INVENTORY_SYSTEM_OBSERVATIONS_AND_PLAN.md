# Inventory System - Observations & Fix Plan

## 🔍 Current Issues & Observations

### 1. **Tab Order Inconsistency**
- **Current**: Shopping List (1st) → Demand Forecast (2nd) → Inventory Table (3rd)
- **Should Be**: Inventory Table (1st) → Demand Forecast (2nd) → Shopping List (3rd)
- **Reason**: Inventory table is the core view; other tabs are supporting features

### 2. **Add Inventory Modal - Wrong Fields**
**Current Issues:**
- ❌ "Current Stock" field - Should be "Stock to Add" (incremental)
- ❌ "Demand Forecast" section - Should NOT be in add modal (comes from forecast tab)
- ❌ "Reorder Level" field - Should NOT be in add modal (should be set separately)
- ❌ "Pending Orders Demand" - Should NOT be in add modal (calculated automatically)

**Should Only Have:**
- ✅ Item Name (with menu dish dropdown)
- ✅ Unit of Measurement
- ✅ Stock to Add (incremental quantity)
- ✅ Unit Cost

### 3. **Data Flow Confusion**

**Current Flow (Incorrect):**
```
Add Item → User manually enters demandFromOrders, forecastDemand, reorderLevel
```

**Correct Flow Should Be:**
```
1. Add Item → Only name, unit, stock to add, unit cost
2. Demand Forecast Tab → Calculates forecastDemand → Updates inventory_items.forecastDemand
3. Orders → Calculates demandFromOrders → Updates inventory_items.demandFromOrders (via API)
4. Shopping List → Reads inventory + orders + forecast → Shows shortages
```

### 4. **Naming Inconsistency**
- "ML Shopping List" → Should be "Smart Shopping List" or "Procurement List"
- Not using ML, just mathematical calculations

### 5. **Stock Update Logic**
- **Current**: StockUpdateModal allows setting absolute stock value
- **Should Also Support**: Adding incremental stock (like "Add 5 kg")
- **Current Behavior**: ✅ Already supports both (absolute + incremental)

### 6. **Missing Data Synchronization**

**Problem**: 
- Demand forecasting calculates `forecastDemand` but doesn't update inventory_items table
- Shopping list reads from inventory but doesn't update `demandFromOrders`
- Need API endpoints to sync this data

**Required APIs:**
1. `POST /api/chef/inventory/sync-demand` - Sync demandFromOrders from pending orders
2. `POST /api/chef/inventory/sync-forecast` - Sync forecastDemand from forecast service

---

## 📋 Fix Plan

### Phase 1: Fix Add Inventory Modal ✅

**File**: `src/components/chef/Inventory/AddInventoryItemModal.tsx`

**Changes:**
1. Remove "Demand Forecast" section (lines 310-355)
2. Remove "Reorder Level" field (lines 357-381)
3. Change "Current Stock" to "Stock to Add" (line 291-308)
   - Label: "Stock to Add"
   - Placeholder: "Enter quantity to add"
   - Default: "0"
4. Remove `demandFromOrders`, `forecastDemand`, `reorderLevel` from form state
5. Update API call to only send: `name`, `unit`, `currentStock` (as stock to add), `unitCost`
6. Remove summary section that shows demand calculations

**API Change**: `POST /api/chef/inventory`
- Accept `stockToAdd` instead of `currentStock`
- Set `currentStock = stockToAdd` (for new items, this is the initial stock)
- Set `demandFromOrders = 0`, `forecastDemand = 0`, `reorderLevel = 0` (defaults)

### Phase 2: Reorder Tab Order ✅

**File**: `src/app/(chef)/chef/inventory/page.tsx`

**Changes:**
1. Change default tab: `"inventory"` instead of `"shopping"` (line 18)
2. Reorder tab buttons:
   - 1st: Inventory Table
   - 2nd: Demand Forecast  
   - 3rd: Shopping List
3. Update tab button order in JSX (lines 203-242)

### Phase 3: Rename "ML Shopping List" ✅

**Files to Update:**
1. `src/app/(chef)/chef/inventory/page.tsx`
   - Line 214: "ML Shopping List" → "Smart Shopping List"
   - Line 250: "ML-Powered Smart Shopping List" → "Smart Shopping List"
2. `src/components/chef/Inventory/MLSmartShoppingList.tsx`
   - Component name can stay (internal)
   - But display text should say "Smart Shopping List"

### Phase 4: Create Demand Sync APIs ✅

**New File**: `src/app/api/chef/inventory/sync-demand/route.ts`

**Purpose**: Calculate `demandFromOrders` from pending orders and update inventory_items

**Logic:**
```typescript
1. Get all pending orders (PENDING, CONFIRMED, COOKING)
2. For each order item:
   - Get menu item ingredients
   - Calculate: ingredient.quantity * orderItem.quantity
   - Sum by ingredient name
3. Update inventory_items:
   - Match by ingredient name
   - Set demandFromOrders = calculated demand
```

**New File**: `src/app/api/chef/inventory/sync-forecast/route.ts`

**Purpose**: Get forecast from ML service and update inventory_items.forecastDemand

**Logic:**
```typescript
1. Call /api/chef/forecast?days=7
2. Extract ingredient_forecast from response
3. Update inventory_items:
   - Match by ingredient name
   - Set forecastDemand = forecast value
```

### Phase 5: Auto-Sync on Tab Switch ✅

**File**: `src/app/(chef)/chef/inventory/page.tsx`

**Changes:**
1. Add `useEffect` to sync demand when switching to "forecast" tab
2. Add `useEffect` to sync demand when switching to "shopping" tab
3. Show loading state during sync

**Implementation:**
```typescript
useEffect(() => {
  if (activeTab === "forecast") {
    syncForecastDemand();
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab === "shopping") {
    syncOrderDemand();
  }
}, [activeTab]);
```

### Phase 6: Update Inventory Table Display ✅

**File**: `src/components/chef/Inventory/InventoryTable.tsx`

**Current**: ✅ Already shows demand correctly
- Shows `demandFromOrders` and `forecastDemand` separately
- Calculates `required = demandFromOrders + forecastDemand`
- Shows `toBuy = max(0, required - currentStock)`

**No changes needed** - Display logic is correct

---

## 🔄 Data Flow After Fixes

### Adding New Inventory Item:
```
User clicks "Add Item"
  ↓
Modal opens with: Name, Unit, Stock to Add, Unit Cost
  ↓
User selects ingredient from menu dropdown
  ↓
User enters stock to add (e.g., 10 kg)
  ↓
API creates item: currentStock = 10, demandFromOrders = 0, forecastDemand = 0
  ↓
Item appears in Inventory Table
```

### Viewing Demand Forecast:
```
User switches to "Demand Forecast" tab
  ↓
useEffect triggers → Calls /api/chef/inventory/sync-forecast
  ↓
API fetches forecast from ML service
  ↓
API updates inventory_items.forecastDemand for matching ingredients
  ↓
DemandForecastChart displays forecast
  ↓
Inventory Table now shows updated forecastDemand
```

### Viewing Shopping List:
```
User switches to "Shopping List" tab
  ↓
useEffect triggers → Calls /api/chef/inventory/sync-demand
  ↓
API calculates demand from pending orders
  ↓
API updates inventory_items.demandFromOrders
  ↓
Shopping List API reads inventory + orders + forecast
  ↓
Shopping List displays items to buy
```

### Updating Stock:
```
User clicks "Update" on inventory item
  ↓
StockUpdateModal opens
  ↓
User can:
  - Set absolute stock value
  - Add incremental stock (+5 kg)
  - Subtract stock (-2 kg)
  ↓
API updates currentStock
  ↓
Shopping List recalculates "to buy" automatically
```

---

## ✅ Summary of Changes

### Files to Modify:
1. ✅ `src/components/chef/Inventory/AddInventoryItemModal.tsx` - Remove unnecessary fields
2. ✅ `src/app/(chef)/chef/inventory/page.tsx` - Reorder tabs, add sync logic
3. ✅ `src/app/api/chef/inventory/route.ts` - Update POST to handle stockToAdd
4. ✅ `src/app/api/chef/inventory/sync-demand/route.ts` - **NEW** - Sync order demand
5. ✅ `src/app/api/chef/inventory/sync-forecast/route.ts` - **NEW** - Sync forecast demand

### Files to Rename/Update Text:
1. ✅ `src/app/(chef)/chef/inventory/page.tsx` - "ML Shopping List" → "Smart Shopping List"
2. ✅ `src/components/chef/Inventory/MLSmartShoppingList.tsx` - Update display text

### Files That Are Correct (No Changes):
- ✅ `src/components/chef/Inventory/InventoryTable.tsx` - Display logic is correct
- ✅ `src/components/chef/Inventory/StockUpdateModal.tsx` - Already supports incremental updates
- ✅ `src/components/chef/Inventory/DemandForecastChart.tsx` - Display is correct

---

## 🎯 Expected Outcome

After fixes:
1. ✅ Inventory Table is the first tab (primary view)
2. ✅ Add modal only asks for: Name, Unit, Stock to Add, Unit Cost
3. ✅ Demand values auto-sync from orders and forecast
4. ✅ Shopping list shows accurate shortages
5. ✅ Clear data flow: Add → Forecast → Shopping List
6. ✅ No manual entry of demand values
7. ✅ "Smart Shopping List" instead of "ML Shopping List"

---

## 📝 Implementation Priority

1. **High Priority** (Core Functionality):
   - Fix Add Inventory Modal
   - Reorder tabs
   - Create sync APIs

2. **Medium Priority** (UX Improvements):
   - Auto-sync on tab switch
   - Rename "ML Shopping List"

3. **Low Priority** (Polish):
   - Add loading states during sync
   - Add success/error toasts for sync operations

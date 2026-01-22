# Database Schema Changes Analysis & Impact Assessment

## 📋 Schema Changes Summary

You've made the following changes to the Prisma schema:

### Order Model Changes:
- ✅ `deliveryDate` → `delivery_date` (snake_case, required)
- ✅ `deliveryTimeSlot` → `delivery_time_slot` (snake_case, optional)
- ✅ `subscriptionId` → `subscription_id` (snake_case, optional)
- ✅ Removed `@map("subscription_id")` - now using direct snake_case

### Kitchen Model Changes:
- ✅ `maxCapacity` → `max_capacity` (snake_case, default 6)
- ✅ `minPrepTimeHours` → `min_prep_time_hours` (snake_case, default 4)
- ✅ Removed `@map()` decorators - now using direct snake_case

### Relation Changes:
- ✅ `subscription` relation field renamed to `user_subscriptions`
- ✅ Index updated: `[delivery_date, delivery_time_slot, kitchenId]`

---

## 🔍 Impact Analysis

### ✅ ML Recommendation Service - **NO CHANGES NEEDED**

**Finding:** The ML service uses raw SQL queries and doesn't reference any of the changed fields.

**Queries Used:**
- `o.user_id` ✅ (unchanged)
- `o.kitchen_id` ✅ (unchanged)
- `o."createdAt"` ✅ (unchanged)
- `o.status` ✅ (unchanged)
- `o.total` ✅ (unchanged)

**Fields NOT Used by ML Service:**
- ❌ `delivery_date` / `deliveryDate` - Not queried
- ❌ `delivery_time_slot` / `deliveryTimeSlot` - Not queried
- ❌ `subscription_id` / `subscriptionId` - Not queried
- ❌ `max_capacity` / `maxCapacity` - Not queried
- ❌ `min_prep_time_hours` / `minPrepTimeHours` - Not queried

**Conclusion:** ✅ ML service is **completely unaffected** by these schema changes.

---

## ⚠️ Next.js Codebase - **CHANGES REQUIRED**

### Issues Found:

#### 1. **subscriptionId → subscription_id** (CRITICAL)
The schema uses `subscription_id` but code still references `subscriptionId`:

**Files to Update:**
- ✅ `/src/app/api/cron/generate-subscription-orders/route.ts` - Lines 153, 241
- ✅ `/src/app/api/subscriptions/create/route.ts` - Line 176
- ✅ `/src/lib/seed-data/types.ts` - Line 61 (if used)
- ✅ `/src/lib/seed-data/*.json` - Multiple references (if used)

#### 2. **deliveryDate → delivery_date** (CRITICAL)
The schema uses `delivery_date` but code still references `deliveryDate`:

**Files to Update:**
- ✅ `/src/app/api/orders/route.ts` - Line 144
- ✅ `/src/app/api/cron/generate-subscription-orders/route.ts` - Multiple references
- ✅ `/src/app/api/chef/orders/kanban/route.ts` - Lines 84, 110, 142
- ✅ `/src/lib/services/orderValidation.ts` - All references

#### 3. **deliveryTimeSlot → delivery_time_slot** (CRITICAL)
The schema uses `delivery_time_slot` but code still references `deliveryTimeSlot`:

**Files to Update:**
- ✅ `/src/app/api/orders/route.ts` - Line 145
- ✅ `/src/app/api/cron/generate-subscription-orders/route.ts` - Multiple references
- ✅ `/src/app/api/chef/orders/kanban/route.ts` - Lines 85, 110, 143
- ✅ `/src/lib/services/orderValidation.ts` - All references

#### 4. **maxCapacity → max_capacity** (CRITICAL)
The schema uses `max_capacity` but code still references `maxCapacity`:

**Files to Update:**
- ✅ `/src/lib/services/orderValidation.ts` - All references

#### 5. **minPrepTimeHours → min_prep_time_hours** (CRITICAL)
The schema uses `min_prep_time_hours` but code still references `minPrepTimeHours`:

**Files to Update:**
- ✅ `/src/lib/services/orderValidation.ts` - All references

---

## 🔧 Required Fixes

### Priority 1: Critical (Breaks Functionality)

1. **Update Prisma Client Usage**
   - All Prisma queries must use snake_case field names
   - Update all `select`, `where`, `data` clauses

2. **Update TypeScript Code**
   - Change `subscriptionId` → `subscription_id`
   - Change `deliveryDate` → `delivery_date`
   - Change `deliveryTimeSlot` → `delivery_time_slot`
   - Change `maxCapacity` → `max_capacity`
   - Change `minPrepTimeHours` → `min_prep_time_hours`

### Priority 2: Data Files (If Used)

- Update seed data JSON files if they reference old field names
- Update any TypeScript types/interfaces

---

## 📝 Integration Status

### ML Service Integration ✅
- **Status:** No changes needed
- **Reason:** ML service uses raw SQL with column names that match database (snake_case)
- **Action:** None required

### Next.js Integration ⚠️
- **Status:** Requires updates
- **Reason:** Prisma client uses schema field names (now snake_case)
- **Action:** Update all Prisma queries and TypeScript code

---

## 🎯 Recommended Action Plan

1. **Regenerate Prisma Client** (Already done)
   ```bash
   npx prisma generate
   ```

2. **Update All Prisma Queries**
   - Search and replace field names in all API routes
   - Update validation service
   - Update cron job

3. **Test Build**
   ```bash
   npm run build
   ```

4. **Test Functionality**
   - Test order creation
   - Test subscription order generation
   - Test chef order view
   - Test validation service

---

## 📊 Summary

| Component | Status | Action Required |
|-----------|--------|----------------|
| ML Service | ✅ OK | None |
| Next.js API Routes | ⚠️ Needs Fix | Update field names |
| Validation Service | ⚠️ Needs Fix | Update field names |
| Seed Data | ⚠️ Check | Update if used |
| Prisma Client | ✅ OK | Already regenerated |

---

## 🔍 Files Requiring Updates

### High Priority:
1. `/src/app/api/orders/route.ts`
2. `/src/app/api/cron/generate-subscription-orders/route.ts`
3. `/src/app/api/chef/orders/kanban/route.ts`
4. `/src/lib/services/orderValidation.ts`

### Medium Priority:
5. `/src/app/api/subscriptions/create/route.ts`
6. `/src/lib/seed-data/types.ts` (if used)

### Low Priority:
7. Seed data JSON files (if actively used)

---

**Next Steps:** I'll fix all the critical issues in the Next.js codebase now.

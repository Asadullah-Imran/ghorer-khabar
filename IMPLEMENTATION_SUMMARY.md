# Order Time Slot & Capacity Management - Implementation Summary

## ✅ Completed Implementation

### Phase 1: Database Schema ✅
- ✅ Added `deliveryDate` (DateTime) to Order model
- ✅ Added `deliveryTimeSlot` (MealType enum) to Order model
- ✅ Added `maxCapacity` (Int, default 6) to Kitchen model
- ✅ Added `minPrepTimeHours` (Int, default 4) to Kitchen model
- ✅ Added composite index for capacity queries: `[deliveryDate, deliveryTimeSlot, kitchenId]`

### Phase 2: Validation Service ✅
- ✅ Created `/src/lib/constants/mealTimeSlots.ts` - Meal time slot configuration
- ✅ Created `/src/lib/services/orderValidation.ts` - Complete validation service with:
  - `validateOrderTiming()` - 36 hours rule validation
  - `validatePrepTime()` - Prep time vs delivery time validation
  - `checkKitchenCapacity()` - Capacity checking per time slot
  - `getAvailableTimeSlots()` - Get all available slots for a kitchen/items
  - `validateOrder()` - Comprehensive validation

### Phase 3: Order Creation API ✅
- ✅ Updated `/api/orders/route.ts` to:
  - Accept `deliveryDate` and `deliveryTimeSlot` in request
  - Validate timing (36 hours rule)
  - Validate prep time for all dishes
  - Check kitchen capacity
  - Create order with delivery date and time slot

### Phase 4: Available Slots API ✅
- ✅ Created `/api/orders/available-slots/route.ts`
- ✅ Supports both GET (query params) and POST (JSON body)
- ✅ Returns available time slots with:
  - Availability status
  - Remaining capacity
  - Reason if unavailable

### Phase 5: Checkout UI ✅
- ✅ Updated `/src/components/checkout/CheckoutPageContent.tsx`:
  - Added delivery date picker (defaults to tomorrow, min date = tomorrow)
  - Added time slot selector with 4 meal options
  - Real-time fetching of available slots
  - Visual indicators for available/unavailable slots
  - Auto-selects first available slot
  - Shows capacity and reasons for unavailable slots

### Phase 6: Chef Order View ✅
- ✅ Updated `/api/chef/orders/kanban/route.ts`:
  - Includes `deliveryDate`, `deliveryTimeSlot`, and `deliveryTimeDisplay` in response
- ✅ Updated `/src/components/chef/Kanban/OrderCard.tsx`:
  - Prominent display of delivery time in teal badge
  - Shows formatted delivery date and meal time

### Phase 7: Subscription Order Generation ✅
- ✅ Updated `/api/cron/generate-subscription-orders/route.ts`:
  - Creates separate orders for each meal type (breakfast, lunch, snacks, dinner)
  - Sets `deliveryDate` to tomorrow
  - Sets `deliveryTimeSlot` based on meal type from schedule
  - Checks capacity before creating each order
  - Skips if kitchen is full for that time slot

---

## 🚀 Next Steps (Required)

### 1. Run Database Migration

**IMPORTANT:** You must run the Prisma migration before using this feature:

```bash
cd /Users/meherinsohani/meherinLovesAsad/ghorer-khabar
npx prisma migrate dev --name add_order_time_slots_and_capacity
npx prisma generate
```

This will:
- Add `delivery_date` and `delivery_time_slot` columns to `orders` table
- Add `max_capacity` and `min_prep_time_hours` columns to `kitchens` table
- Add composite index for efficient capacity queries

### 2. Backfill Existing Data (Optional but Recommended)

After migration, you may want to backfill existing orders:

```sql
-- Set default delivery date to tomorrow for existing orders
UPDATE orders 
SET delivery_date = created_at + INTERVAL '1 day'
WHERE delivery_date IS NULL;

-- Set default time slot to LUNCH for existing orders
UPDATE orders 
SET delivery_time_slot = 'LUNCH'
WHERE delivery_time_slot IS NULL;

-- Set default capacity for existing kitchens
UPDATE kitchens 
SET max_capacity = 6 
WHERE max_capacity IS NULL;

UPDATE kitchens 
SET min_prep_time_hours = 4 
WHERE min_prep_time_hours IS NULL;
```

### 3. Test the Implementation

1. **Test Order Creation:**
   - Go to checkout page
   - Select delivery date (tomorrow)
   - Select time slot
   - Place order
   - Verify order is created with delivery date and time slot

2. **Test Capacity:**
   - Create 6 orders for same kitchen, date, and time slot
   - Try to create 7th order → Should show "Kitchen Full"

3. **Test Prep Time Validation:**
   - Create a dish with 4 hours prep time
   - Try to order for breakfast (if < 6 hours until delivery) → Should be blocked
   - Try to order for lunch (if > 6 hours until delivery) → Should work

4. **Test Chef View:**
   - Login as chef
   - Go to orders page
   - Verify delivery times are displayed on order cards

5. **Test Subscription Orders:**
   - Create active subscription with weekly schedule
   - Run cron job manually or wait for scheduled run
   - Verify orders are created with correct time slots

---

## 📋 Files Created/Modified

### Created:
- `/src/lib/constants/mealTimeSlots.ts`
- `/src/lib/services/orderValidation.ts`
- `/src/app/api/orders/available-slots/route.ts`
- `/ORDER_TIME_SLOT_EXECUTION_PLAN.md`
- `/IMPLEMENTATION_SUMMARY.md` (this file)

### Modified:
- `/prisma/schema.prisma` - Added fields to Order and Kitchen models
- `/src/app/api/orders/route.ts` - Added validation and time slot support
- `/src/components/checkout/CheckoutPageContent.tsx` - Added time slot selector
- `/src/app/api/chef/orders/kanban/route.ts` - Added delivery time to response
- `/src/components/chef/Kanban/OrderCard.tsx` - Added delivery time display
- `/src/app/api/cron/generate-subscription-orders/route.ts` - Updated to create orders per meal slot

---

## 🎯 Features Implemented

### ✅ User Side:
- [x] Select delivery date (tomorrow or later)
- [x] Select meal time slot (Breakfast, Lunch, Snacks, Dinner)
- [x] See available slots with capacity
- [x] See reasons for unavailable slots
- [x] Validation prevents ordering when:
  - Less than 36 hours before delivery
  - Kitchen is full for that time slot
  - Dish prep time is insufficient

### ✅ Chef Side:
- [x] See delivery time prominently on each order
- [x] Know when to serve each meal
- [x] Capacity automatically enforced

### ✅ System:
- [x] 36-hour advance ordering rule
- [x] Prep time validation (dish prepTime + kitchen minPrepTime <= hours until delivery)
- [x] Kitchen capacity per time slot (default 6 orders)
- [x] Subscription orders create separate orders per meal type
- [x] Capacity checking before order creation

---

## 🔧 Configuration

### Default Values:
- **Meal Times:**
  - Breakfast: 8:00 AM
  - Lunch: 1:00 PM
  - Snacks: 4:00 PM
  - Dinner: 8:00 PM

- **Kitchen Defaults:**
  - Max Capacity: 6 orders per time slot
  - Min Prep Time: 4 hours

- **Order Rules:**
  - Minimum advance: 36 hours before delivery
  - Can only order for tomorrow or later

### Customization:
- Meal times can be customized per kitchen (future enhancement)
- Capacity can be set per kitchen via settings
- Min prep time can be set per kitchen via settings

---

## 🐛 Known Issues / Future Enhancements

1. **Delivery Fee:** Currently added to each subscription order. May want to charge once per day instead of per meal.

2. **Multiple Meals Same Order:** Currently creates separate orders. Could be enhanced to create one order with multiple time slots (requires schema change).

3. **Custom Meal Times:** Currently fixed times. Can be enhanced to allow chefs to customize.

4. **Timezone:** All times are in local timezone. May need UTC conversion for production.

5. **Capacity Settings UI:** Not yet implemented. Chefs can't change capacity via UI yet (can be done via database).

---

## 📝 Testing Checklist

- [ ] Run database migration
- [ ] Test order creation with time slot
- [ ] Test capacity limit (create 6+ orders)
- [ ] Test prep time validation
- [ ] Test 36-hour rule
- [ ] Test chef order view shows delivery times
- [ ] Test subscription order generation
- [ ] Test available slots API
- [ ] Test checkout UI time slot selector

---

## 🎉 Success!

All core features have been implemented. The system now supports:
- ✅ Time-based delivery slots
- ✅ Kitchen capacity management
- ✅ Prep time validation
- ✅ 36-hour advance ordering
- ✅ Chef visibility of delivery times

**Next:** Run the migration and test!

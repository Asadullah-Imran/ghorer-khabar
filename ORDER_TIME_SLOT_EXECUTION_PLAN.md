# Order Time Slot & Capacity Management - Execution Plan

## Overview

This plan implements a time-based ordering system with:
- **4 Meal Time Slots**: Breakfast, Lunch, Snacks, Dinner
- **Kitchen Capacity Management**: Max 5-6 orders per time slot
- **Order Timing Restrictions**: 36 hours advance ordering, prep time validation
- **Chef Visibility**: Clear delivery time information

---

## Current State Analysis

### What Exists:
✅ Orders table with basic fields (userId, kitchenId, total, status, notes)  
✅ Menu items have `prepTime` (in minutes)  
✅ Subscriptions have `weekly_schedule` with meal times  
✅ Chef kanban board for order management  
✅ Order creation API (`/api/orders`)

### What's Missing:
❌ Delivery date and time slot in orders  
❌ Kitchen capacity tracking  
❌ Chef minimum prep time setting  
❌ Order deadline validation (36 hours)  
❌ Prep time vs delivery time validation  
❌ Capacity checking per time slot  
❌ Time slot selection in checkout UI  
❌ Chef view of delivery times

---

## Database Schema Changes

### 1. Update `Order` Model

```prisma
model Order {
  id             String              @id @default(cuid())
  userId         String              @map("user_id")
  kitchenId      String              @map("kitchen_id")
  subscriptionId String?             @map("subscription_id")
  total          Float
  status         OrderStatus          @default(PENDING)
  notes          String?
  
  // NEW FIELDS
  deliveryDate   DateTime            @map("delivery_date")        // Date of delivery
  deliveryTimeSlot MealType?          @map("delivery_time_slot")    // BREAKFAST, LUNCH, SNACKS, DINNER
  
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  items          OrderItem[]
  kitchen        Kitchen              @relation(fields: [kitchenId], references: [id])
  user           User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription   user_subscriptions?  @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  reviews        Review[]

  @@index([userId])
  @@index([kitchenId])
  @@index([subscriptionId])
  @@index([deliveryDate, deliveryTimeSlot, kitchenId])  // For capacity queries
  @@map("orders")
}
```

### 2. Update `Kitchen` Model

```prisma
model Kitchen {
  // ... existing fields ...
  
  // NEW FIELDS
  maxCapacity        Int       @default(6)              @map("max_capacity")        // Max orders per time slot
  minPrepTimeHours   Int       @default(4)              @map("min_prep_time_hours")  // Chef's minimum prep time
  
  // ... rest of fields ...
}
```

### 3. Meal Time Slot Configuration

Create a configuration file or add to Kitchen settings:

```typescript
// Default meal time slots (can be customized per kitchen)
const MEAL_TIME_SLOTS = {
  BREAKFAST: { time: "08:00", name: "Breakfast" },
  LUNCH: { time: "13:00", name: "Lunch" },
  SNACKS: { time: "16:00", name: "Snacks" },
  DINNER: { time: "20:00", name: "Dinner" },
};
```

---

## Implementation Steps

### Phase 1: Database Schema Updates

**Task 1.1: Update Prisma Schema**
- Add `deliveryDate` and `deliveryTimeSlot` to Order
- Add `maxCapacity` and `minPrepTimeHours` to Kitchen
- Add index for capacity queries
- Run migration: `npx prisma migrate dev --name add_order_time_slots_and_capacity`

**Task 1.2: Update Prisma Client**
- Run `npx prisma generate`

---

### Phase 2: Order Validation Logic

**Task 2.1: Create Order Validation Service**
- File: `/src/lib/services/orderValidation.ts`
- Functions:
  - `validateOrderTiming(deliveryDate, deliveryTimeSlot)` - Check 36 hours rule
  - `validatePrepTime(menuItems, deliveryDate, deliveryTimeSlot, kitchen)` - Check prep time vs delivery time
  - `checkKitchenCapacity(kitchenId, deliveryDate, deliveryTimeSlot)` - Check if kitchen is full
  - `getAvailableTimeSlots(kitchenId, menuItems)` - Get available slots for items

**Task 2.2: Helper Functions**
```typescript
// Calculate time until delivery slot
function getHoursUntilDelivery(deliveryDate: Date, timeSlot: MealType): number {
  const slotTime = MEAL_TIME_SLOTS[timeSlot].time; // "08:00"
  const deliveryDateTime = new Date(deliveryDate);
  const [hours, minutes] = slotTime.split(':').map(Number);
  deliveryDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const diffMs = deliveryDateTime.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60); // Convert to hours
}

// Check if dish can be ordered for time slot
function canOrderDishForSlot(
  dishPrepTimeMinutes: number,
  kitchenMinPrepHours: number,
  hoursUntilDelivery: number
): boolean {
  const totalPrepHours = (dishPrepTimeMinutes / 60) + kitchenMinPrepHours;
  return hoursUntilDelivery >= totalPrepHours;
}
```

---

### Phase 3: Update Order Creation API

**Task 3.1: Modify `/api/orders/route.ts`**
- Accept `deliveryDate` and `deliveryTimeSlot` in request body
- Validate:
  1. Order is for tomorrow (36 hours before)
  2. Kitchen capacity not exceeded
  3. All dishes can be prepared in time
- Return appropriate error messages

**Task 3.2: Validation Flow**
```typescript
// 1. Validate delivery date (must be tomorrow, 36 hours before)
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(0, 0, 0, 0);

if (deliveryDate < tomorrow) {
  return error("Orders can only be placed for tomorrow or later");
}

// 2. Check kitchen capacity
const existingOrders = await prisma.order.count({
  where: {
    kitchenId,
    deliveryDate: tomorrow,
    deliveryTimeSlot,
    status: { notIn: ["CANCELLED"] }
  }
});

if (existingOrders >= kitchen.maxCapacity) {
  return error("Kitchen is full for this time slot. Please choose another time.");
}

// 3. Validate prep time for each dish
for (const item of dbItems) {
  const hoursUntilDelivery = getHoursUntilDelivery(tomorrow, deliveryTimeSlot);
  const canOrder = canOrderDishForSlot(
    item.prepTime || 0,
    kitchen.minPrepTimeHours,
    hoursUntilDelivery
  );
  
  if (!canOrder) {
    return error(
      `${item.name} requires ${item.prepTime} minutes + ${kitchen.minPrepTimeHours} hours prep time. ` +
      `Cannot be ordered for ${deliveryTimeSlot} (only ${hoursUntilDelivery.toFixed(1)} hours until delivery).`
    );
  }
}
```

---

### Phase 4: Update Checkout UI

**Task 4.1: Add Time Slot Selection**
- File: `/src/components/checkout/CheckoutPageContent.tsx`
- Add delivery date picker (only tomorrow selectable)
- Add time slot selector (Breakfast, Lunch, Snacks, Dinner)
- Show available slots based on:
  - Kitchen capacity
  - Dish prep times
  - Current time

**Task 4.2: Real-time Validation**
- Fetch available time slots when items change
- Disable unavailable slots
- Show reasons (e.g., "Kitchen Full", "Prep time too short")

**Task 4.3: UI Components**
```typescript
// Time slot selector component
<TimeSlotSelector
  selectedSlot={deliveryTimeSlot}
  onSelect={setDeliveryTimeSlot}
  availableSlots={availableSlots}
  kitchenCapacity={kitchen.maxCapacity}
/>
```

---

### Phase 5: API for Available Time Slots

**Task 5.1: Create `/api/orders/available-slots`**
- Input: `kitchenId`, `menuItemIds[]`
- Output: Available time slots with:
  - Slot name (Breakfast, Lunch, etc.)
  - Time
  - Available capacity
  - Can order (boolean)
  - Reason if unavailable

**Task 5.2: Logic**
```typescript
export async function POST(req: NextRequest) {
  const { kitchenId, menuItemIds } = await req.json();
  
  const kitchen = await prisma.kitchen.findUnique({ where: { id: kitchenId } });
  const menuItems = await prisma.menu_items.findMany({
    where: { id: { in: menuItemIds } }
  });
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const availableSlots = [];
  
  for (const slot of Object.keys(MEAL_TIME_SLOTS)) {
    const hoursUntil = getHoursUntilDelivery(tomorrow, slot);
    const currentOrders = await getOrderCount(kitchenId, tomorrow, slot);
    const isFull = currentOrders >= kitchen.maxCapacity;
    
    // Check if all dishes can be prepared
    const canPrepareAll = menuItems.every(item => 
      canOrderDishForSlot(item.prepTime || 0, kitchen.minPrepTimeHours, hoursUntil)
    );
    
    availableSlots.push({
      slot,
      time: MEAL_TIME_SLOTS[slot].time,
      available: !isFull && canPrepareAll && hoursUntil >= 36,
      capacity: kitchen.maxCapacity - currentOrders,
      reason: isFull ? "Kitchen Full" : 
              !canPrepareAll ? "Prep time insufficient" :
              hoursUntil < 36 ? "Order deadline passed" : null
    });
  }
  
  return NextResponse.json({ success: true, slots: availableSlots });
}
```

---

### Phase 6: Update Chef Order View

**Task 6.1: Add Delivery Time to Kanban**
- File: `/src/app/api/chef/orders/kanban/route.ts`
- Include `deliveryDate` and `deliveryTimeSlot` in response
- Format: "Tomorrow, 8:00 AM - Breakfast"

**Task 6.2: Update Order Card Component**
- File: `/src/components/chef/Kanban/OrderCard.tsx`
- Display delivery time prominently
- Show time slot badge (Breakfast/Lunch/Snacks/Dinner)

**Task 6.3: Group Orders by Time Slot**
- Optional: Add filter/group by time slot in chef orders page
- Help chef prioritize orders by delivery time

---

### Phase 7: Update Subscription Order Generation

**Task 7.1: Modify `/api/cron/generate-subscription-orders/route.ts`
- When creating orders from subscriptions:
  - Set `deliveryDate` to tomorrow
  - Set `deliveryTimeSlot` based on meal type from schedule
  - Check capacity before creating order
  - Skip if kitchen is full (log warning)

**Task 7.2: Handle Multiple Meals**
- If subscription has breakfast + lunch for same day:
  - Create separate orders for each meal slot
  - Or create one order with multiple time slots (if schema supports)

---

### Phase 8: Kitchen Settings UI

**Task 8.1: Add Capacity Settings**
- File: `/src/app/(chef)/chef/settings/page.tsx` or new page
- Allow chef to set:
  - `maxCapacity` (default 6)
  - `minPrepTimeHours` (default 4)
  - Meal time slots (optional customization)

**Task 8.2: API Endpoint**
- `PATCH /api/chef/settings/capacity`
- Update kitchen capacity and prep time settings

---

## Detailed Implementation Files

### File Structure

```
src/
├── lib/
│   ├── services/
│   │   └── orderValidation.ts          # NEW: Validation logic
│   └── constants/
│       └── mealTimeSlots.ts            # NEW: Time slot config
├── app/
│   ├── api/
│   │   ├── orders/
│   │   │   ├── route.ts                 # MODIFY: Add time slot validation
│   │   │   └── available-slots/
│   │   │       └── route.ts             # NEW: Get available slots
│   │   └── chef/
│   │       └── settings/
│   │           └── capacity/
│   │               └── route.ts         # NEW: Update capacity settings
│   └── (chef)/
│       └── chef/
│           └── settings/
│               └── capacity/
│                   └── page.tsx        # NEW: Capacity settings UI
├── components/
│   ├── checkout/
│   │   ├── CheckoutPageContent.tsx     # MODIFY: Add time slot selector
│   │   └── TimeSlotSelector.tsx         # NEW: Time slot picker component
│   └── chef/
│       └── Kanban/
│           └── OrderCard.tsx            # MODIFY: Show delivery time
└── prisma/
    └── schema.prisma                    # MODIFY: Add new fields
```

---

## Validation Rules Summary

### 1. Order Timing (36 Hours Rule)
- ✅ Order must be placed at least 36 hours before delivery
- ✅ Can only order for tomorrow or later
- ❌ Cannot order for today

### 2. Prep Time Validation
- ✅ `dishPrepTime + kitchenMinPrepTime <= hoursUntilDelivery`
- Example: Dish needs 4 hours, kitchen needs 2 hours = 6 hours total
- If breakfast is in 3 hours → ❌ Cannot order
- If lunch is in 8 hours → ✅ Can order

### 3. Kitchen Capacity
- ✅ Count orders for same `kitchenId`, `deliveryDate`, `deliveryTimeSlot`
- ✅ Exclude CANCELLED orders from count
- ✅ If count >= `maxCapacity` → Kitchen Full
- ✅ Show "Kitchen Full" message to user

### 4. Time Slot Selection
- ✅ Only show available slots
- ✅ Disable unavailable slots with reason
- ✅ Real-time updates when items change

---

## User Flow Examples

### Example 1: User Orders Breakfast
1. User adds items to cart
2. Goes to checkout
3. Sees time slot selector:
   - ✅ Breakfast (8:00 AM) - Available (3 slots left)
   - ✅ Lunch (1:00 PM) - Available (5 slots left)
   - ❌ Snacks (4:00 PM) - Kitchen Full
   - ✅ Dinner (8:00 PM) - Available (6 slots left)
4. Selects Breakfast
5. System validates:
   - Order is for tomorrow ✅
   - 36+ hours until delivery ✅
   - Kitchen has capacity ✅
   - All dishes can be prepared ✅
6. Order created with `deliveryTimeSlot: "BREAKFAST"`

### Example 2: Dish with Long Prep Time
1. User adds "Slow-cooked Beef Curry" (prepTime: 240 minutes = 4 hours)
2. Kitchen minPrepTime: 2 hours
3. Total needed: 6 hours
4. Current time: 2:00 AM
5. Breakfast (8:00 AM) = 6 hours away → ✅ Can order
6. If current time was 3:00 AM:
   - Breakfast = 5 hours away → ❌ Cannot order
   - Lunch = 11 hours away → ✅ Can order

### Example 3: Kitchen Capacity Reached
1. Chef has maxCapacity: 6
2. 6 breakfast orders already placed for tomorrow
3. User tries to order breakfast → ❌ "Kitchen Full for Breakfast"
4. User can select Lunch, Snacks, or Dinner instead

---

## Chef View Enhancements

### Order Display
```
Order #ABC123
Customer: John Doe
Items: Beef Curry (x2), Rice (x2)
Delivery: Tomorrow, 8:00 AM - Breakfast
Prep Time: 45 min
Status: PENDING
```

### Grouped by Time Slot (Optional)
```
📅 Tomorrow's Orders

🌅 Breakfast (8:00 AM) - 3 orders
  - Order #ABC123 - PENDING
  - Order #DEF456 - PREPARING
  - Order #GHI789 - PENDING

🍽️ Lunch (1:00 PM) - 2 orders
  - Order #JKL012 - PENDING
  - Order #MNO345 - CONFIRMED

🍰 Snacks (4:00 PM) - 1 order
  - Order #PQR678 - PENDING

🌙 Dinner (8:00 PM) - 0 orders
```

---

## Testing Checklist

### Unit Tests
- [ ] `validateOrderTiming()` - 36 hours rule
- [ ] `validatePrepTime()` - Prep time calculation
- [ ] `checkKitchenCapacity()` - Capacity counting
- [ ] `getAvailableTimeSlots()` - Slot availability

### Integration Tests
- [ ] Order creation with valid time slot
- [ ] Order creation rejected when kitchen full
- [ ] Order creation rejected when prep time insufficient
- [ ] Order creation rejected when < 36 hours
- [ ] Available slots API returns correct data
- [ ] Chef can see delivery times in orders

### E2E Tests
- [ ] User can select time slot in checkout
- [ ] Unavailable slots are disabled
- [ ] Order created with correct delivery time
- [ ] Chef sees delivery time in order view
- [ ] Kitchen capacity updates correctly

---

## Migration Steps

1. **Update Schema**
   ```bash
   npx prisma migrate dev --name add_order_time_slots_and_capacity
   npx prisma generate
   ```

2. **Backfill Existing Data**
   - Set default `deliveryDate` = `createdAt + 1 day` for existing orders
   - Set default `deliveryTimeSlot` = "LUNCH" for existing orders
   - Set default `maxCapacity` = 6 for existing kitchens
   - Set default `minPrepTimeHours` = 4 for existing kitchens

3. **Deploy API Changes**
   - Deploy updated order creation API
   - Deploy available slots API
   - Deploy capacity settings API

4. **Deploy UI Changes**
   - Deploy updated checkout page
   - Deploy updated chef order view
   - Deploy capacity settings page

---

## Rollout Plan

### Phase 1: Backend (Week 1)
- Database migration
- Order validation service
- Updated order creation API
- Available slots API

### Phase 2: Frontend - User Side (Week 2)
- Time slot selector in checkout
- Real-time validation
- Error messages

### Phase 3: Frontend - Chef Side (Week 3)
- Delivery time display in orders
- Capacity settings UI
- Time slot grouping (optional)

### Phase 4: Subscription Integration (Week 4)
- Update subscription order generation
- Handle multiple meals per day

### Phase 5: Testing & Refinement (Week 5)
- End-to-end testing
- Bug fixes
- Performance optimization

---

## Edge Cases & Considerations

### 1. Timezone Handling
- Store all times in UTC
- Convert to local timezone for display
- Consider chef's location for meal times

### 2. Order Cancellation
- When order cancelled, capacity is freed
- Update available slots immediately

### 3. Multiple Items with Different Prep Times
- Use maximum prep time for validation
- If any item can't be prepared, reject entire order

### 4. Subscription Orders
- Auto-assign time slot based on meal type
- If capacity full, skip that meal (log warning)
- Notify chef of capacity issues

### 5. Chef Changes Capacity
- Existing orders not affected
- New orders use updated capacity
- Show warning if reducing below current orders

---

## Success Metrics

- ✅ Orders include delivery time slot
- ✅ Kitchen capacity enforced
- ✅ Prep time validation working
- ✅ 36-hour rule enforced
- ✅ Chef can see delivery times
- ✅ Users see available slots
- ✅ No orders created when capacity full
- ✅ No orders created when prep time insufficient

---

## Next Steps

1. Review and approve this plan
2. Start with Phase 1 (Database Schema)
3. Implement validation logic
4. Update APIs
5. Build UI components
6. Test thoroughly
7. Deploy incrementally

---

## Questions to Resolve

1. **Multiple meals in one order?** 
   - Option A: One order per meal slot (recommended)
   - Option B: One order with multiple time slots

2. **Custom meal times per kitchen?**
   - Option A: Fixed times for all kitchens
   - Option B: Chef can customize times

3. **What happens if subscription order can't be created?**
   - Option A: Skip that meal, notify chef
   - Option B: Queue for next available slot

4. **Capacity per day or per time slot?**
   - Current plan: Per time slot (6 breakfast, 6 lunch, etc.)
   - Alternative: Total per day (24 orders total)

---

**Ready to proceed? Let me know which phase you'd like to start with!**

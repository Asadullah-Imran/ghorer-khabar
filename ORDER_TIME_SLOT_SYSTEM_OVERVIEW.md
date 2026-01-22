# Order Time Slot & Capacity Management System - Overview

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Core Features](#core-features)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [Business Rules](#business-rules)
6. [API Endpoints](#api-endpoints)
7. [User Flows](#user-flows)
8. [Chef Flows](#chef-flows)
9. [Validation Logic](#validation-logic)
10. [Configuration](#configuration)
11. [Technical Implementation](#technical-implementation)

---

## 🎯 System Overview

The **Order Time Slot & Capacity Management System** is a comprehensive solution that enables:

- **Time-based delivery scheduling** with 4 meal time slots (Breakfast, Lunch, Snacks, Dinner)
- **Kitchen capacity management** to prevent overbooking
- **Prep time validation** to ensure dishes can be prepared in time
- **36-hour advance ordering** requirement for better planning
- **Chef visibility** into delivery times for efficient meal preparation

This system ensures quality service delivery by managing kitchen resources, preventing overbooking, and giving chefs clear visibility into when meals need to be ready.

---

## ✨ Core Features

### 1. **Meal Time Slots**
- **Breakfast**: 8:00 AM
- **Lunch**: 1:00 PM
- **Snacks**: 4:00 PM
- **Dinner**: 8:00 PM

Each order must specify a delivery date and time slot.

### 2. **Kitchen Capacity Management**
- Default capacity: **6 orders per time slot**
- Configurable per kitchen via `maxCapacity` field
- Real-time capacity checking before order creation
- Prevents overbooking and ensures quality service

### 3. **Prep Time Validation**
- Each dish has a `prepTime` (in minutes)
- Each kitchen has a `minPrepTimeHours` (default: 4 hours)
- System validates: `(dish prepTime + kitchen minPrepTime) <= hours until delivery`
- Prevents ordering dishes that can't be prepared in time

### 4. **36-Hour Advance Ordering**
- Orders must be placed at least **36 hours** before delivery
- Ensures adequate preparation time
- Prevents last-minute orders that can't be fulfilled

### 5. **Chef Delivery Time Visibility**
- Chefs see delivery date and time slot prominently on each order
- Formatted as: "Mon, Jan 17, Breakfast"
- Helps chefs plan preparation schedules

### 6. **Subscription Order Integration**
- Subscription orders automatically create separate orders per meal type
- Each order gets the correct time slot based on weekly schedule
- Capacity checking applied to subscription orders

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
├─────────────────────────────────────────────────────────────┤
│  Checkout Page          │  Chef Order View                   │
│  - Date Picker          │  - Delivery Time Display           │
│  - Time Slot Selector   │  - Order Cards                     │
│  - Available Slots API  │                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
├─────────────────────────────────────────────────────────────┤
│  /api/orders              │  /api/orders/available-slots     │
│  - Create Order            │  - Get Available Slots           │
│  - Validation             │  - Capacity Check                │
│                           │                                  │
│  /api/cron/...            │  /api/chef/orders/kanban        │
│  - Subscription Orders     │  - Order List with Times        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Validation Service Layer                     │
├─────────────────────────────────────────────────────────────┤
│  orderValidation.ts                                         │
│  - validateOrderTiming()     - 36 hour rule                 │
│  - validatePrepTime()         - Prep time check             │
│  - checkKitchenCapacity()     - Capacity check              │
│  - getAvailableTimeSlots()    - Slot availability           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                             │
├─────────────────────────────────────────────────────────────┤
│  Order Model              │  Kitchen Model                    │
│  - deliveryDate           │  - maxCapacity                   │
│  - deliveryTimeSlot       │  - minPrepTimeHours              │
│  - Composite Index        │                                  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User selects items** → Checkout page
2. **System fetches available slots** → `/api/orders/available-slots`
3. **User selects date & time slot** → UI updates
4. **User submits order** → `/api/orders` POST
5. **Validation runs** → Timing, capacity, prep time
6. **Order created** → Database with deliveryDate & deliveryTimeSlot
7. **Chef views order** → Sees delivery time prominently

---

## 🗄️ Database Schema

### Order Model Changes

```prisma
model Order {
  // ... existing fields ...
  deliveryDate   DateTime    @map("delivery_date")
  deliveryTimeSlot MealType?  @map("delivery_time_slot")
  
  @@index([deliveryDate, deliveryTimeSlot, kitchenId])
}
```

**Fields:**
- `deliveryDate`: Date when order should be delivered
- `deliveryTimeSlot`: Meal type (BREAKFAST, LUNCH, SNACKS, DINNER)
- **Index**: Composite index for efficient capacity queries

### Kitchen Model Changes

```prisma
model Kitchen {
  // ... existing fields ...
  maxCapacity         Int  @default(6) @map("max_capacity")
  minPrepTimeHours    Int  @default(4) @map("min_prep_time_hours")
}
```

**Fields:**
- `maxCapacity`: Maximum orders per time slot (default: 6)
- `minPrepTimeHours`: Minimum prep time buffer (default: 4 hours)

### Relationships

- `Order.deliveryTimeSlot` → `MealType` enum
- `Order.deliveryDate` + `Order.deliveryTimeSlot` + `Order.kitchenId` → Indexed for capacity queries

---

## 📐 Business Rules

### Rule 1: 36-Hour Advance Ordering
- **Requirement**: Orders must be placed at least 36 hours before delivery
- **Calculation**: `hours until delivery >= 36`
- **Enforcement**: Validation in order creation API
- **Error Message**: "Orders must be placed at least 36 hours before delivery. Only X hours remaining."

### Rule 2: Kitchen Capacity
- **Requirement**: Maximum N orders per time slot per day (default: 6)
- **Calculation**: Count existing orders for `(kitchenId, deliveryDate, deliveryTimeSlot)`
- **Enforcement**: Check before order creation
- **Error Message**: "Kitchen is full for [Meal Time]. X/Y orders already placed."

### Rule 3: Prep Time Validation
- **Requirement**: Dish prep time + kitchen buffer <= hours until delivery
- **Calculation**: `(dish.prepTime / 60) + kitchen.minPrepTimeHours <= hoursUntilDelivery`
- **Enforcement**: Validate all dishes in order
- **Error Message**: "[Dish Name] requires X hours prep time. Cannot be ordered for [Meal Time] (only Y hours until delivery)."

### Rule 4: Delivery Date Restriction
- **Requirement**: Orders can only be placed for tomorrow or later
- **Enforcement**: Date picker minimum date + validation
- **Error Message**: "Orders can only be placed for tomorrow or later dates."

### Rule 5: Time Slot Requirement
- **Requirement**: All orders must have a delivery time slot
- **Enforcement**: Required field in order creation
- **Error Message**: "deliveryTimeSlot is required (BREAKFAST, LUNCH, SNACKS, or DINNER)"

---

## 🔌 API Endpoints

### 1. Create Order
**Endpoint**: `POST /api/orders`

**Request Body:**
```json
{
  "items": [
    { "id": "item1", "quantity": 2 }
  ],
  "deliveryDate": "2024-01-18",
  "deliveryTimeSlot": "LUNCH",
  "notes": "Optional note",
  "deliveryDetails": {
    "name": "John Doe",
    "phone": "+8801234567890",
    "address": "123 Main St"
  }
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "clx123..."
}
```

**Validation:**
- Checks 36-hour rule
- Checks kitchen capacity
- Validates prep time for all dishes
- Returns error if any validation fails

---

### 2. Get Available Time Slots
**Endpoint**: `GET /api/orders/available-slots`

**Query Parameters:**
- `kitchenId` (required): Kitchen ID
- `menuItemIds` (required): JSON array or comma-separated
- `deliveryDate` (optional): ISO date string, defaults to tomorrow

**Example:**
```
GET /api/orders/available-slots?kitchenId=abc123&menuItemIds=["item1","item2"]&deliveryDate=2024-01-18
```

**Response:**
```json
{
  "success": true,
  "data": {
    "deliveryDate": "2024-01-18",
    "slots": [
      {
        "slot": "BREAKFAST",
        "time": "08:00",
        "displayName": "Breakfast",
        "available": true,
        "capacity": 3,
        "reason": null
      },
      {
        "slot": "LUNCH",
        "time": "13:00",
        "displayName": "Lunch",
        "available": false,
        "capacity": 0,
        "reason": "Kitchen full (6/6 orders)"
      }
    ]
  }
}
```

**Also supports POST** with JSON body:
```json
{
  "kitchenId": "abc123",
  "menuItemIds": ["item1", "item2"],
  "deliveryDate": "2024-01-18"
}
```

---

### 3. Chef Orders (Kanban)
**Endpoint**: `GET /api/chef/orders/kanban`

**Response includes:**
```json
{
  "success": true,
  "data": {
    "new": [
      {
        "id": "order123",
        "deliveryDate": "2024-01-18T00:00:00Z",
        "deliveryTimeSlot": "LUNCH",
        "deliveryTimeDisplay": "Thu, Jan 18, Lunch",
        // ... other order fields
      }
    ]
  }
}
```

---

### 4. Subscription Order Generation
**Endpoint**: `GET /api/cron/generate-subscription-orders`

**Behavior:**
- Creates separate orders for each meal type (BREAKFAST, LUNCH, SNACKS, DINNER)
- Sets `deliveryDate` to tomorrow
- Sets `deliveryTimeSlot` based on meal type from weekly schedule
- Checks capacity before creating each order
- Skips if kitchen is full for that time slot

---

## 👤 User Flows

### Flow 1: Placing an Order

```
1. User adds items to cart
   ↓
2. User navigates to checkout
   ↓
3. System auto-selects tomorrow as delivery date
   ↓
4. System fetches available time slots
   ↓
5. User sees 4 time slots with availability:
   - ✅ Breakfast (3 slots left)
   - ✅ Lunch (2 slots left)
   - ❌ Snacks (Kitchen full)
   - ✅ Dinner (5 slots left)
   ↓
6. User selects "Lunch" time slot
   ↓
7. User fills delivery details
   ↓
8. User clicks "Place Order"
   ↓
9. System validates:
   - ✅ 36 hours rule: Pass
   - ✅ Capacity: Pass (2 slots available)
   - ✅ Prep time: Pass (all dishes can be prepared)
   ↓
10. Order created successfully
    ↓
11. User redirected to order confirmation
```

### Flow 2: Order Blocked (Capacity Full)

```
1. User selects items and time slot
   ↓
2. User clicks "Place Order"
   ↓
3. System validates capacity
   ↓
4. ❌ Kitchen full for selected time slot
   ↓
5. Error shown: "Kitchen is full for Lunch. 6/6 orders already placed."
   ↓
6. User can:
   - Select different time slot
   - Select different date
   - Try again later
```

### Flow 3: Order Blocked (Prep Time)

```
1. User selects dish with 4-hour prep time
   ↓
2. User selects "Breakfast" (only 3 hours until delivery)
   ↓
3. System validates prep time
   ↓
4. ❌ Validation fails: Dish needs 4 hours + 4 hours buffer = 8 hours
   ↓
5. Error shown: "[Dish Name] requires 8 hours total prep time. Cannot be ordered for Breakfast (only 3 hours until delivery)."
   ↓
6. User selects "Lunch" instead (13 hours until delivery) ✅
```

---

## 👨‍🍳 Chef Flows

### Flow 1: Viewing Orders with Delivery Times

```
1. Chef logs in
   ↓
2. Chef navigates to Orders page
   ↓
3. Chef sees Kanban board with orders
   ↓
4. Each order card shows:
   ┌─────────────────────────────┐
   │ #ORDER12                    │
   │                             │
   │ John Doe                    │
   │ 📞 +8801234567890           │
   │                             │
   │ ⏰ DELIVERY TIME            │
   │ Thu, Jan 18, Lunch          │
   │                             │
   │ 2x Biryani                  │
   │ 1x Curry                    │
   │                             │
   │ Total: ৳450                 │
   │ [Accept] [Reject]           │
   └─────────────────────────────┘
   ↓
5. Chef knows exactly when to prepare each meal
```

### Flow 2: Processing Orders by Time

```
1. Chef views orders for today
   ↓
2. Chef groups orders by time slot:
   - Breakfast (8:00 AM): 3 orders
   - Lunch (1:00 PM): 5 orders
   - Snacks (4:00 PM): 2 orders
   - Dinner (8:00 PM): 4 orders
   ↓
3. Chef plans preparation schedule:
   - Morning: Prepare breakfast orders
   - Midday: Prepare lunch orders
   - Afternoon: Prepare snacks
   - Evening: Prepare dinner
   ↓
4. Chef can efficiently manage kitchen resources
```

---

## ✅ Validation Logic

### Validation Service Functions

#### 1. `validateOrderTiming()`
```typescript
function validateOrderTiming(
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): ValidationResult
```

**Checks:**
- Hours until delivery >= 36
- Delivery date is not in the past
- Delivery date is tomorrow or later

**Returns:**
- `{ valid: true }` or `{ valid: false, error: "..." }`

---

#### 2. `validatePrepTime()`
```typescript
async function validatePrepTime(
  menuItemIds: string[],
  deliveryDate: Date,
  timeSlot: MealTimeSlot,
  kitchenId: string
): Promise<ValidationResult>
```

**Checks:**
- For each dish: `(prepTime / 60) + kitchen.minPrepTimeHours <= hoursUntilDelivery`

**Returns:**
- `{ valid: true }` or `{ valid: false, error: "Dish X requires Y hours..." }`

---

#### 3. `checkKitchenCapacity()`
```typescript
async function checkKitchenCapacity(
  kitchenId: string,
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): Promise<{ available: boolean, currentCount: number, maxCapacity: number }>
```

**Checks:**
- Count existing orders for `(kitchenId, deliveryDate, deliveryTimeSlot)`
- Compare with `kitchen.maxCapacity`

**Returns:**
- `{ available: true/false, currentCount: X, maxCapacity: Y }`

---

#### 4. `getAvailableTimeSlots()`
```typescript
async function getAvailableTimeSlots(
  kitchenId: string,
  menuItemIds: string[],
  deliveryDate: Date
): Promise<AvailableSlot[]>
```

**Checks all 4 time slots:**
- Timing validation (36 hours)
- Capacity availability
- Prep time for all dishes

**Returns:**
- Array of 4 slots with availability status and reasons

---

#### 5. `validateOrder()` (Comprehensive)
```typescript
async function validateOrder(
  kitchenId: string,
  menuItemIds: string[],
  deliveryDate: Date,
  timeSlot: MealTimeSlot
): Promise<ValidationResult>
```

**Runs all validations:**
1. Timing (36 hours)
2. Capacity
3. Prep time

**Returns:**
- `{ valid: true }` or first error encountered

---

## ⚙️ Configuration

### Meal Time Slots
**File**: `/src/lib/constants/mealTimeSlots.ts`

```typescript
export const MEAL_TIME_SLOTS = {
  BREAKFAST: { time: "08:00", displayName: "Breakfast" },
  LUNCH: { time: "13:00", displayName: "Lunch" },
  SNACKS: { time: "16:00", displayName: "Snacks" },
  DINNER: { time: "20:00", displayName: "Dinner" },
};
```

**Customization:**
- Times can be modified in this file
- Future: Per-kitchen customization

---

### Kitchen Defaults
**Database**: `Kitchen` model

- `maxCapacity`: Default 6, can be set per kitchen
- `minPrepTimeHours`: Default 4, can be set per kitchen

**Setting via Database:**
```sql
UPDATE kitchens 
SET max_capacity = 10, 
    min_prep_time_hours = 6 
WHERE id = 'kitchen123';
```

**Future Enhancement:**
- Admin UI for kitchen settings
- Chef dashboard for capacity management

---

### Order Rules
**File**: `/src/lib/constants/mealTimeSlots.ts`

```typescript
export const MIN_ORDER_ADVANCE_HOURS = 36;
```

**Customization:**
- Modify constant to change advance ordering requirement

---

## 🛠️ Technical Implementation

### Key Files

#### 1. Constants
- **`/src/lib/constants/mealTimeSlots.ts`**
  - Meal slot definitions
  - Helper functions
  - Configuration constants

#### 2. Validation Service
- **`/src/lib/services/orderValidation.ts`**
  - All validation logic
  - Capacity checking
  - Prep time validation
  - Available slots calculation

#### 3. API Endpoints
- **`/src/app/api/orders/route.ts`** - Order creation with validation
- **`/src/app/api/orders/available-slots/route.ts`** - Slot availability
- **`/src/app/api/chef/orders/kanban/route.ts`** - Chef order list
- **`/src/app/api/cron/generate-subscription-orders/route.ts`** - Subscription orders

#### 4. UI Components
- **`/src/components/checkout/CheckoutPageContent.tsx`** - Checkout with time slot selector
- **`/src/components/chef/Kanban/OrderCard.tsx`** - Order card with delivery time

#### 5. Database Schema
- **`/prisma/schema.prisma`** - Order and Kitchen model updates

---

### Database Indexes

**Composite Index for Capacity Queries:**
```prisma
@@index([deliveryDate, deliveryTimeSlot, kitchenId])
```

**Purpose:**
- Efficient queries for capacity checking
- Fast lookups: "How many orders for kitchen X, date Y, slot Z?"

**Query Example:**
```typescript
const count = await prisma.order.count({
  where: {
    kitchenId: "abc123",
    deliveryDate: { gte: dateStart, lte: dateEnd },
    deliveryTimeSlot: "LUNCH",
    status: { notIn: ["CANCELLED"] },
  },
});
```

---

### Error Handling

**Validation Errors:**
- Returned as JSON with `error` field
- HTTP status 400 (Bad Request)
- User-friendly error messages

**Example:**
```json
{
  "error": "Kitchen is full for Lunch. 6/6 orders already placed."
}
```

**Frontend Handling:**
- Displayed via toast notifications
- User can retry with different options

---

## 📊 Performance Considerations

### Capacity Queries
- **Indexed**: Composite index on `(deliveryDate, deliveryTimeSlot, kitchenId)`
- **Efficient**: O(log n) lookup time
- **Scalable**: Handles thousands of orders per day

### Available Slots Calculation
- **Cached**: Results can be cached for a few minutes
- **Optimized**: Single query per time slot
- **Future**: Redis caching for high-traffic scenarios

### Subscription Order Generation
- **Batch Processing**: Processes all subscriptions in one run
- **Efficient**: Checks capacity before creating orders
- **Idempotent**: Skips if order already exists

---

## 🔮 Future Enhancements

### 1. Per-Kitchen Meal Times
- Allow chefs to customize meal delivery times
- Store in `Kitchen` model or separate `KitchenSchedule` model

### 2. Capacity Management UI
- Chef dashboard to adjust capacity
- Real-time capacity monitoring
- Capacity alerts when approaching limit

### 3. Dynamic Prep Time Calculation
- Consider kitchen workload
- Adjust prep time based on order volume
- Machine learning for optimal prep time

### 4. Time Slot Recommendations
- Suggest best time slots based on:
  - User preferences
  - Kitchen availability
  - Prep time requirements

### 5. Multi-Day Ordering
- Allow ordering for multiple days
- Bulk order creation
- Subscription-like ordering for one-time orders

### 6. Time Slot Waitlist
- When kitchen is full, add to waitlist
- Notify user when slot becomes available
- Auto-convert waitlist to order

---

## 📝 Testing Checklist

### Unit Tests
- [ ] `validateOrderTiming()` - 36 hour rule
- [ ] `validatePrepTime()` - Prep time calculation
- [ ] `checkKitchenCapacity()` - Capacity counting
- [ ] `getAvailableTimeSlots()` - All slot availability

### Integration Tests
- [ ] Order creation with valid data
- [ ] Order creation blocked by capacity
- [ ] Order creation blocked by prep time
- [ ] Order creation blocked by timing
- [ ] Available slots API response
- [ ] Chef order view with delivery times

### E2E Tests
- [ ] User places order with time slot
- [ ] User sees unavailable slots
- [ ] Chef sees delivery times
- [ ] Subscription orders created with time slots

---

## 🎉 Summary

The **Order Time Slot & Capacity Management System** provides:

✅ **4 meal time slots** for structured delivery  
✅ **Kitchen capacity management** to prevent overbooking  
✅ **Prep time validation** to ensure quality  
✅ **36-hour advance ordering** for better planning  
✅ **Chef visibility** into delivery times  
✅ **Subscription integration** with automatic time slot assignment  

This system ensures efficient kitchen operations, prevents overbooking, and provides clear visibility for both users and chefs.

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (after migration)

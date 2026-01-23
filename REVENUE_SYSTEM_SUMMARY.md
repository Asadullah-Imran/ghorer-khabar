# Revenue System Summary

## ✅ Implementation: Function-Based (No Database Changes)

**Decision:** We use **function-based calculation** instead of storing revenue breakdown in the database.

### Why Function-Based?

✅ **Advantages:**
- **No migration needed** - works with existing data
- **Always accurate** - calculates from source data (order.items)
- **Flexible** - easy to change commission rates without data migration
- **Historical accuracy** - can recalculate any time period
- **No data inconsistency risk** - single source of truth (order data)

❌ **Trade-offs:**
- Slightly slower for very large datasets (but acceptable for most use cases)
- Need to recalculate each time (but orders are immutable once completed)

## Revenue Model

### Order Structure
```
Order Total = Items Total + Delivery Fee + Platform Fee (৳10)
```

### Revenue Split

**Chef Revenue:**
```
Chef Revenue = Items Total - Platform Fee (৳10)
```
- Chef gets: 100% of menu item sales minus platform fee
- **Delivery fee does NOT go to chef** (operational cost)

**Platform Revenue:**
```
Platform Revenue = Delivery Fee + Platform Fee (৳10) + Commission (if any)
```
- Platform gets: All delivery fees (operational cost) + platform fee + commission

## Implementation Files

### 1. Revenue Calculation Service
**File:** `src/lib/services/revenueCalculation.ts`

**Functions:**
- `calculateOrderRevenue()` - Calculate breakdown for new orders
- `calculateChefRevenue()` - Calculate chef revenue from completed orders
- `calculatePlatformRevenue()` - Calculate platform revenue from completed orders
- `calculateChefRevenueForOrder()` - Calculate revenue for specific order
- `getOrderRevenueBreakdown()` - Get full breakdown for an order

### 2. Chef Revenue API
**File:** `src/app/api/chef/revenue/route.ts`

**Endpoint:** `GET /api/chef/revenue?startDate=&endDate=&period=`

**Returns:**
- Total chef revenue
- Order count
- Monthly breakdown (last 12 months)

### 3. Platform Revenue API (Admin)
**File:** `src/app/api/admin/revenue/route.ts`

**Endpoint:** `GET /api/admin/revenue?startDate=&endDate=&period=`

**Returns:**
- Total platform revenue
- Breakdown by source (orders vs subscriptions)
- Delivery fees vs platform fees
- Monthly breakdown
- Top kitchens

### 4. Fixed Order Completion
**File:** `src/app/api/chef/orders/[id]/status/route.ts`

**Updated:** Now correctly calculates chef revenue (Items - Platform Fee) instead of using full order.total

## How It Works

### For Existing Orders (Completed)
```typescript
// Calculate from order.items
const itemsTotal = order.items.reduce(
  (sum, item) => sum + item.price * item.quantity, 0
);

// Chef revenue = itemsTotal - platformFee
const chefRevenue = itemsTotal - 10; // ৳10 platform fee

// Platform revenue = deliveryFee + platformFee
// deliveryFee = order.total - itemsTotal - platformFee
const deliveryFee = order.total - itemsTotal - 10;
const platformRevenue = deliveryFee + 10;
```

### For New Orders
When creating orders, ensure:
- `order.total` includes: itemsTotal + deliveryFee + platformFee
- Order completion uses `calculateChefRevenueForOrder()` to credit chef correctly

## Configuration

To change revenue model, update in `src/lib/services/revenueCalculation.ts`:

```typescript
// Fixed platform fee per order
export const PLATFORM_FEE_PER_ORDER = 10;

// Commission percentage (0 = no commission, 0.05 = 5%)
// If > 0, chef revenue = itemsTotal - (itemsTotal * commission)
// If = 0, chef revenue = itemsTotal - platformFee
export const PLATFORM_COMMISSION_PERCENT = 0;
```

## Usage Examples

### Calculate Chef Revenue
```typescript
import { calculateChefRevenue } from "@/lib/services/revenueCalculation";

// All time
const revenue = await calculateChefRevenue(kitchenId);

// Date range
const revenue = await calculateChefRevenue(
  kitchenId, 
  new Date("2024-01-01"), 
  new Date("2024-01-31")
);
```

### Calculate Platform Revenue
```typescript
import { calculatePlatformRevenue } from "@/lib/services/revenueCalculation";

const revenue = await calculatePlatformRevenue(startDate, endDate);
```

### API Calls
```bash
# Chef revenue (last month)
GET /api/chef/revenue?period=monthly

# Platform revenue (custom range)
GET /api/admin/revenue?startDate=2024-01-01&endDate=2024-01-31
```

## Next Steps

1. ✅ Revenue calculation service created
2. ✅ Chef revenue API created
3. ✅ Platform revenue API created
4. ✅ Order completion logic fixed
5. ⏳ Update analytics/dashboard to use new calculations
6. ⏳ Test with real orders

## Testing

To verify the system:
1. Create a test order with known values
2. Complete the order
3. Check chef revenue API - should show: itemsTotal - ৳10
4. Check platform revenue API - should show: deliveryFee + ৳10
5. Verify kitchen.totalRevenue is updated correctly

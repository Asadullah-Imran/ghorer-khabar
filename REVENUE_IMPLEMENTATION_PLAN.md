# Revenue Calculation Implementation Plan

## Revenue Model (Clarified)

### Order Total Breakdown
```
Order Total = Items Total + Delivery Fee + Platform Fee (৳10)
```

### Revenue Split

**Chef Revenue:**
- Items Total - Platform Fee (৳10)
- OR Items Total - Commission % (if using percentage)
- **Note:** Delivery Fee does NOT go to chef (it's operational cost for platform)

**Platform Revenue:**
- Delivery Fee (operational cost - goes to platform)
- Platform Fee (৳10 per order)
- Commission (if using percentage)

## Implementation Approach: **Function-Based (No DB Changes)**

### Why Function-Based?
✅ **Advantages:**
- No database migration needed
- Can calculate from existing data
- Flexible - easy to change commission rates
- Historical data remains accurate
- No risk of data inconsistency

❌ **Disadvantages:**
- Slightly slower for large datasets (but acceptable for most use cases)
- Need to recalculate each time (but orders are immutable once completed)

### Recommendation: **Use Functions (No DB Storage)**

Since orders are immutable once completed, we can always calculate revenue accurately from:
- `order.items` (price × quantity = itemsTotal)
- `order.total` (can derive deliveryFee = total - itemsTotal - platformFee)

## Implementation Steps

### ✅ Step 1: Create Revenue Calculation Service (DONE)
File: `src/lib/services/revenueCalculation.ts`

Functions:
- `calculateOrderRevenue()` - Calculate breakdown for a new order
- `calculateChefRevenue()` - Calculate chef revenue from completed orders
- `calculatePlatformRevenue()` - Calculate platform revenue from completed orders
- `calculateChefRevenueForOrder()` - Calculate revenue for a specific order
- `getOrderRevenueBreakdown()` - Get full breakdown for an order

### ✅ Step 2: Create Chef Revenue API (DONE)
File: `src/app/api/chef/revenue/route.ts`

Endpoint: `GET /api/chef/revenue?startDate=&endDate=&period=`

Returns:
- Total chef revenue
- Order count
- Monthly breakdown (last 12 months)

### ✅ Step 3: Create Platform Revenue API (DONE)
File: `src/app/api/admin/revenue/route.ts`

Endpoint: `GET /api/admin/revenue?startDate=&endDate=&period=`

Returns:
- Total platform revenue
- Breakdown by source (orders vs subscriptions)
- Delivery fees vs platform fees
- Monthly breakdown
- Top kitchens

### ✅ Step 4: Fix Order Completion Logic (DONE)
File: `src/app/api/chef/orders/[id]/status/route.ts`

Updated to calculate chef revenue correctly:
- Chef revenue = Items Total - Platform Fee (৳10)
- Only chef revenue is added to kitchen.totalRevenue

### ⏳ Step 5: Update Order Creation
Files to update:
- `src/app/api/orders/route.ts` - Regular orders
- `src/app/api/cron/generate-subscription-orders/route.ts` - Subscription orders

**Note:** We don't need to store revenue breakdown, but we should ensure:
- Platform fee (৳10) is added to order.total
- Delivery fee is included in order.total
- Order completion uses correct calculation

### ⏳ Step 6: Update Analytics/Dashboard
Files to update:
- `src/app/api/chef/analytics/route.ts` - Use new revenue calculation
- `src/app/api/chef/dashboard/route.ts` - Use new revenue calculation
- `src/app/api/admin/stats/route.ts` - Use platform revenue calculation

## Revenue Calculation Examples

### Regular Order:
```
Items: 2 × ৳150 = ৳300
Delivery Fee: ৳30 (operational cost - goes to platform)
Platform Fee: ৳10
Order Total: ৳340

Chef Revenue: ৳300 - ৳10 = ৳290 (Items - Platform Fee)
Platform Revenue: ৳30 + ৳10 = ৳40 (Delivery Fee + Platform Fee)
```

### Subscription Order (per delivery):
```
Items: ৳500 (from subscription menu items)
Delivery Fee: ৳30 (per delivery - operational cost - goes to platform)
Platform Fee: ৳10
Order Total: ৳540

Chef Revenue: ৳500 - ৳10 = ৳490 (Items - Platform Fee)
Platform Revenue: ৳30 + ৳10 = ৳40 (Delivery Fee + Platform Fee)
```

**Note:** Delivery fee does NOT go to chef - it's operational cost for the platform.

### With Commission (if enabled):
```
Items: ৳300
Commission (5%): ৳15
Delivery Fee: ৳30
Platform Fee: ৳10
Order Total: ৳340

Chef Revenue: ৳300 - ৳15 = ৳285
Platform Revenue: ৳30 + ৳10 + ৳15 = ৳55
```

## Usage Examples

### Calculate Chef Revenue (All Time)
```typescript
import { calculateChefRevenue } from "@/lib/services/revenueCalculation";

const revenue = await calculateChefRevenue(kitchenId);
```

### Calculate Chef Revenue (Date Range)
```typescript
const startDate = new Date("2024-01-01");
const endDate = new Date("2024-01-31");
const revenue = await calculateChefRevenue(kitchenId, startDate, endDate);
```

### Calculate Platform Revenue
```typescript
import { calculatePlatformRevenue } from "@/lib/services/revenueCalculation";

const revenue = await calculatePlatformRevenue(startDate, endDate);
```

### Get Order Breakdown
```typescript
import { getOrderRevenueBreakdown } from "@/lib/services/revenueCalculation";

const breakdown = await getOrderRevenueBreakdown(orderId);
// Returns: { itemsTotal, deliveryFee, platformFee, chefRevenue, platformRevenue, orderTotal }
```

## API Usage

### Chef Revenue Endpoint
```bash
# All time
GET /api/chef/revenue

# Last month
GET /api/chef/revenue?period=monthly

# Custom range
GET /api/chef/revenue?startDate=2024-01-01&endDate=2024-01-31
```

### Platform Revenue Endpoint (Admin)
```bash
# All time
GET /api/admin/revenue

# Last week
GET /api/admin/revenue?period=weekly

# Custom range
GET /api/admin/revenue?startDate=2024-01-01&endDate=2024-01-31
```

## Configuration

To change revenue model, update constants in `revenueCalculation.ts`:

```typescript
// Fixed platform fee per order
export const PLATFORM_FEE_PER_ORDER = 10;

// Commission percentage (0 = no commission, 0.05 = 5%)
export const PLATFORM_COMMISSION_PERCENT = 0;
```

## Testing

Test the revenue calculation:
1. Create a test order
2. Complete the order
3. Check chef revenue API
4. Verify calculation matches expected values

## Next Steps

1. ✅ Create revenue calculation service
2. ✅ Create chef revenue API
3. ✅ Create platform revenue API
4. ✅ Fix order completion logic
5. ⏳ Update analytics to use new calculations
6. ⏳ Update dashboard displays
7. ⏳ Test with real orders

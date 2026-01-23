# Revenue Calculation System Guide

## Overview

This document explains how revenue is calculated and split between chefs and the platform in the Ghorer Khabar system.

## Revenue Components

### Order Total Breakdown

For each order, the total amount consists of:

1. **Items Total** = Sum of (menu item price × quantity)
2. **Delivery Fee** = Calculated based on distance (৳10-৳60)
3. **Platform Fee** = Fixed fee (৳10 per order)
4. **Subscription Discount** = 10% discount (for subscription orders only)

**Order Total = Items Total + Delivery Fee + Platform Fee - Discount**

## Revenue Split

### Chef Revenue

Chef receives:
- **Items Total** (100% of menu item sales)
- **Delivery Fee** (100% - chefs handle delivery)

**Chef Revenue = Items Total + Delivery Fee**

### Platform Revenue

Platform receives:
- **Platform Fee** (৳10 per order)
- **Commission** (optional - percentage of items total, currently 0%)

**Platform Revenue = Platform Fee + Commission**

## Current Implementation Issues

⚠️ **Current Problem:**
- The full `order.total` (including platform fee) is being added to chef's `totalRevenue`
- Platform fee (৳10) is incorrectly credited to chefs
- No tracking of platform revenue

## Recommended Solution

### 1. Add Revenue Fields to Order Model

Add these fields to track revenue breakdown:
```prisma
model Order {
  // ... existing fields
  itemsTotal      Float   // Sum of menu items
  deliveryFee     Float   // Delivery charge
  platformFee     Float   // Platform fee (৳10)
  chefRevenue     Float   // Items Total + Delivery Fee
  platformRevenue Float   // Platform Fee + Commission
}
```

### 2. Update Order Creation

When creating an order:
```typescript
const itemsTotal = calculatedTotal; // Sum of items
const deliveryFee = calculatedDeliveryFee;
const platformFee = 10;
const chefRevenue = itemsTotal + deliveryFee;
const platformRevenue = platformFee; // + commission if applicable

const order = await prisma.order.create({
  data: {
    total: itemsTotal + deliveryFee + platformFee - discount,
    itemsTotal,
    deliveryFee,
    platformFee,
    chefRevenue,
    platformRevenue,
    // ... other fields
  }
});
```

### 3. Update Order Completion

When order status becomes COMPLETED:
```typescript
// Add only chef revenue to kitchen
await prisma.kitchen.update({
  where: { id: kitchen.id },
  data: {
    totalRevenue: {
      increment: order.chefRevenue, // NOT order.total
    }
  }
});

// Track platform revenue separately (in a platform_revenue table or aggregate)
```

### 4. Calculate Chef Revenue

**For a specific chef:**
```typescript
const chefRevenue = await prisma.order.aggregate({
  _sum: { chefRevenue: true },
  where: {
    kitchenId: kitchenId,
    status: "COMPLETED"
  }
});
```

**For a date range:**
```typescript
const chefRevenue = await prisma.order.aggregate({
  _sum: { chefRevenue: true },
  where: {
    kitchenId: kitchenId,
    status: "COMPLETED",
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }
});
```

### 5. Calculate Platform Revenue

**Total platform revenue:**
```typescript
const platformRevenue = await prisma.order.aggregate({
  _sum: { platformRevenue: true },
  where: {
    status: "COMPLETED"
  }
});
```

**For a date range:**
```typescript
const platformRevenue = await prisma.order.aggregate({
  _sum: { platformRevenue: true },
  where: {
    status: "COMPLETED",
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }
});
```

## Subscription Orders

For subscription orders:
- **Items Total** = Sum of menu items from subscription
- **Delivery Fee** = Total delivery fee (per delivery × deliveries per month)
- **Discount** = 10% of (Items Total + Delivery Fee)
- **Platform Fee** = ৳10 per order (each subscription order)

**Subscription Order Total = Items Total + Delivery Fee + Platform Fee - Discount**

**Chef Revenue = Items Total + Delivery Fee - Discount**

**Platform Revenue = Platform Fee**

## Example Calculation

### Regular Order Example:
- Items: 2 dishes × ৳150 = ৳300
- Delivery Fee: ৳30 (2.5 km away)
- Platform Fee: ৳10
- **Order Total = ৳340**
- **Chef Revenue = ৳330** (৳300 + ৳30)
- **Platform Revenue = ৳10**

### Subscription Order Example:
- Monthly Plan: ৳5000
- Delivery Fee: ৳30 × 20 deliveries = ৳600
- Subtotal: ৳5600
- Discount (10%): ৳560
- Platform Fee: ৳10 per order (each delivery)
- **Chef Revenue = ৳5040** (৳5000 + ৳600 - ৳560)
- **Platform Revenue = ৳10 per delivery**

## API Endpoints Needed

### 1. Chef Revenue Endpoint
`GET /api/chef/revenue?startDate=&endDate=`

Returns:
- Total chef revenue
- Revenue by period (daily/weekly/monthly)
- Breakdown by orders vs subscriptions

### 2. Platform Revenue Endpoint (Admin)
`GET /api/admin/revenue?startDate=&endDate=`

Returns:
- Total platform revenue
- Revenue by period
- Revenue by source (orders, subscriptions)
- Top earning chefs

## Database Migration Required

Add these fields to the `Order` model:
- `itemsTotal` (Float)
- `deliveryFee` (Float)
- `platformFee` (Float)
- `chefRevenue` (Float)
- `platformRevenue` (Float)

## Implementation Priority

1. **High Priority:**
   - Add revenue fields to Order model
   - Update order creation to calculate breakdown
   - Fix order completion to credit only chef revenue

2. **Medium Priority:**
   - Create chef revenue API endpoint
   - Create platform revenue API endpoint
   - Update analytics to use correct revenue

3. **Low Priority:**
   - Add commission percentage system
   - Revenue reporting dashboard
   - Historical revenue migration

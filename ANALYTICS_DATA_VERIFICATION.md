# Analytics Data Verification & Fixes

## Summary

This document verifies which analytics metrics are fetching from real database data and explains the calculations.

---

## ✅ **Verified: All Data is Real (with fixes applied)**

### 1. **Revenue vs. Profit Chart** (`/api/chef/analytics/chart`)

**Status:** ✅ **FIXED** - Now uses real data with correct calculations

**Previous Issue:**
- Revenue was using `order.total` (which includes delivery fee + platform fee)
- This was **NOT** chef revenue

**Fixed Calculation:**
- **Revenue**: Now uses `calculateChefRevenue()` function
  - Formula: `Items Total - Platform Fee (৳10)`
  - Does NOT include delivery fee (operational cost for platform)
- **Profit**: `Chef Revenue - Ingredient Costs`
  - If ingredient costs are not set by chef, uses estimated 35% profit margin as fallback

**Data Source:**
- Fetches real orders from database
- Groups by month
- Calculates chef revenue per month using proper revenue calculation service

---

### 2. **Top Selling Dishes** (`/api/chef/analytics/dishes`)

**Status:** ✅ **Already using real data**

**Calculation:**
- Fetches all orders from database
- Counts actual sales from `order.items` (quantity × price)
- Sorts by sales count
- Shows top 4 dishes

**Data Source:**
- Real order items from database
- Accurate sales count and revenue per dish

---

### 3. **Key Performance Indicators (KPIs)** (`/api/chef/analytics/kpis`)

**Status:** ✅ **FIXED** - All metrics use real data

#### **Total Revenue**
- **Fixed**: Now uses `calculateChefRevenue()` instead of `order.total`
- **Formula**: `Items Total - Platform Fee (৳10)` per completed order
- **Data Source**: Real completed orders from database

#### **Total Orders**
- ✅ Uses real data
- **Formula**: Count of completed orders
- **Data Source**: Real orders from database

#### **Average Rating**
- ✅ Uses real data
- **Formula**: Average of all review ratings
- **Data Source**: Real reviews from orders

#### **Customer Retention**
- ✅ Uses real data
- **Meaning**: Percentage of customers who ordered in the current period who also ordered in the previous period
- **Formula**: `(Returning Customers / Current Customers) × 100`
- **Calculation**:
  ```typescript
  const currentCustomers = new Set(orders.map(o => o.userId));
  const previousCustomers = new Set(previousOrders.map(o => o.userId));
  const returningCustomers = new Set([...currentCustomers].filter(id => previousCustomers.has(id)));
  const customerRetention = (returningCustomers.size / currentCustomers.size) * 100;
  ```
- **Example**: 
  - Current period: 10 unique customers
  - Previous period: 8 unique customers
  - Returning customers: 5 (ordered in both periods)
  - Customer Retention = (5 / 10) × 100 = **50%**

#### **Average Order Value**
- ✅ Uses real data
- **Formula**: `Total Chef Revenue / Total Orders`
- **Data Source**: Real completed orders

#### **Fulfillment Rate**
- ✅ Uses real data
- **Meaning**: Percentage of orders that were successfully completed (not cancelled)
- **Formula**: `(Completed Orders / Total Orders) × 100`
- **Calculation**:
  ```typescript
  const fulfillmentRate = orders.length > 0 
    ? Math.round((completedOrders.length / orders.length) * 100)
    : 0;
  ```
- **Example**:
  - Total orders: 100
  - Completed orders: 85
  - Cancelled orders: 15
  - Fulfillment Rate = (85 / 100) × 100 = **85%**

---

## 📊 **Metric Definitions**

### **Customer Retention**
**What it means:**
- Measures how many of your current customers are repeat customers
- Shows if customers are coming back to order again
- Higher percentage = more loyal customers

**How it's calculated:**
1. Get all unique customers from current period (e.g., last 30 days)
2. Get all unique customers from previous period (e.g., 30-60 days ago)
3. Count how many customers appear in BOTH periods (returning customers)
4. Calculate: `(Returning Customers / Current Customers) × 100`

**Example:**
- Last 30 days: 20 unique customers
- Previous 30 days: 15 unique customers
- 8 customers ordered in BOTH periods
- Customer Retention = (8 / 20) × 100 = **40%**

---

### **Fulfillment Rate**
**What it means:**
- Measures how successfully you complete orders
- Shows the percentage of orders that reach "COMPLETED" status
- Higher percentage = better order completion

**How it's calculated:**
1. Count all orders (any status)
2. Count orders with status = "COMPLETED"
3. Calculate: `(Completed Orders / Total Orders) × 100`

**What affects it:**
- ✅ Orders that are completed successfully → Increases rate
- ❌ Orders that are cancelled → Decreases rate
- ❌ Orders that are pending/confirmed but not completed → Decreases rate

**Example:**
- Total orders: 50
- Completed: 45
- Cancelled: 3
- Pending: 2
- Fulfillment Rate = (45 / 50) × 100 = **90%**

**Note:** Only orders with status "COMPLETED" count as fulfilled. Orders that are cancelled, pending, or in other statuses do NOT count as fulfilled.

---

## 🔧 **Fixes Applied**

### 1. Revenue Calculation Fix
**File:** `src/app/api/chef/analytics/kpis/route.ts`
- **Before**: `totalRevenue = sum(order.total)` ❌ (includes delivery fee)
- **After**: `totalRevenue = await calculateChefRevenue(kitchen.id, startDate)` ✅ (chef revenue only)

### 2. Chart Revenue Fix
**File:** `src/app/api/chef/analytics/chart/route.ts`
- **Before**: `monthRevenue += order.total` ❌ (includes delivery fee)
- **After**: `monthRevenue = await calculateChefRevenue(kitchen.id, monthStart, monthEnd)` ✅ (chef revenue only)

### 3. Profit Calculation Improvement
**File:** `src/app/api/chef/analytics/chart/route.ts`
- **Before**: `profit = revenue - ingredientCost` (but revenue was wrong)
- **After**: `profit = chefRevenue - ingredientCost` ✅
- **Fallback**: If ingredient costs not set, uses 35% profit margin estimate

---

## ✅ **Verification Checklist**

- [x] Revenue vs. Profit Chart - **FIXED** - Uses real data with correct chef revenue calculation
- [x] Top Selling Dishes - **VERIFIED** - Uses real data from order items
- [x] Total Revenue KPI - **FIXED** - Uses real data with correct chef revenue calculation
- [x] Total Orders KPI - **VERIFIED** - Uses real data
- [x] Average Rating KPI - **VERIFIED** - Uses real review data
- [x] Customer Retention KPI - **VERIFIED** - Uses real customer data
- [x] Average Order Value KPI - **VERIFIED** - Uses real order data
- [x] Fulfillment Rate KPI - **VERIFIED** - Uses real order status data

---

## 📝 **Notes**

1. **Revenue Calculation**: 
   - Chef revenue = Items Total - Platform Fee (৳10)
   - Delivery fee does NOT go to chef (it's platform operational cost)
   - This is now correctly calculated using the `calculateChefRevenue()` function

2. **Profit Calculation**:
   - Profit = Chef Revenue - Ingredient Costs
   - If chefs haven't set ingredient costs, system uses 35% profit margin as estimate
   - More accurate profit can be calculated once chefs fill in ingredient costs

3. **Fulfillment Rate**:
   - Only counts orders with status "COMPLETED"
   - Cancelled, pending, or other statuses do NOT count as fulfilled
   - This is the correct calculation for measuring order completion success

4. **Customer Retention**:
   - Compares current period customers with previous period customers
   - Shows percentage of customers who are repeat buyers
   - Higher percentage indicates better customer loyalty

---

## 🎯 **Conclusion**

All analytics metrics are now fetching from **real database data** with **correct calculations**. The revenue and profit calculations have been fixed to use the proper revenue calculation service, ensuring accurate chef revenue (excluding delivery fees) and profit calculations.

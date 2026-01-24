# KRI (Kitchen Reliability Index) Implementation Summary

## Overview

KRI calculation has been integrated throughout the project. All places that display KRI scores now use the dynamic calculation function instead of stored values.

## ✅ Files Updated

### 1. Core Service
- **`src/lib/services/kriCalculation.ts`** ✅
  - Main KRI calculation function
  - Handles new chef base score (50 points)
  - Fixed-time delivery logic
  - Review-based satisfaction calculation

### 2. API Endpoints

#### Dashboard APIs
- **`src/app/api/chef/dashboard/route.ts`** ✅
  - Calculates KRI on-the-fly for dashboard
  - Removed dependency on stored `kriScore`

- **`src/app/api/chef/dashboard/metrics/route.ts`** ✅
  - Calculates KRI on-the-fly for metrics
  - Removed dependency on stored `kriScore`

#### KRI API
- **`src/app/api/chef/kri/route.ts`** ✅
  - GET: Returns calculated KRI with breakdown
  - POST: Calculates and updates KRI in database

#### Order & Review APIs
- **`src/app/api/chef/orders/[id]/status/route.ts`** ✅
  - Updates KRI when order is completed (async)
  - Ensures KRI reflects latest delivery performance

- **`src/app/api/reviews/route.ts`** ✅
  - Updates KRI when review is created (async)
  - Ensures KRI reflects latest ratings and satisfaction

### 3. Page Components

#### Chef Pages
- **`src/app/(chef)/chef/dashboard/page.tsx`** ✅
  - Uses KRI from dashboard API (already calculated)

- **`src/app/(chef)/chef-profile/page.tsx`** ✅
  - Calculates KRI on-the-fly for chef profile view

#### User/Buyer Pages
- **`src/app/(main)/explore/kitchen/[id]/page.tsx`** ✅
  - Calculates KRI on-the-fly for kitchen profile page

- **`src/app/(main)/explore/dish/[id]/page.tsx`** ✅
  - Calculates KRI for chef's kitchen on dish page

## 🔄 Automatic KRI Updates

KRI is automatically recalculated and updated in the database when:

1. **Order Completed** (`/api/chef/orders/[id]/status`)
   - Updates KRI to reflect new completion/delivery metrics
   - Runs asynchronously (doesn't block order completion)

2. **Review Created** (`/api/reviews`)
   - Updates KRI to reflect new ratings and satisfaction
   - Runs asynchronously (doesn't block review creation)

## 📊 KRI Calculation Details

### Components (Total: 100 points)
1. **Rating Score** (0-30): Average customer rating
2. **Fulfillment Score** (0-25): Order completion rate minus cancellation penalty
3. **Delivery Score** (0-20): On-time delivery for fixed-time delivery
4. **Response Score** (0-15): Average response time (faster = better)
5. **Satisfaction Score** (0-10): Positive review rate (4-5 stars)

### New Chef Handling
- **Base Score**: 50/100 for new chefs (< 5 orders OR < 3 reviews)
- **Blended Scoring**: Gradually transitions from base to actual score
- **Established**: Uses full calculated score (5+ orders AND 3+ reviews)

### Fixed-Time Delivery Logic
- Orders must be completed on the same day as `delivery_date`
- Allows 2-hour buffer after delivery_date time
- Late = completed on different day or after buffer

## 🎯 Where KRI is Displayed

1. **Chef Dashboard** - Main dashboard card
2. **Chef Profile** - Performance section
3. **Kitchen Profile** (Explore) - Performance stats sidebar
4. **Dish Page** - Chef card with KRI badge
5. **Kitchen Header** - KRI badge on profile image

## 📝 Usage Examples

### Calculate KRI (without updating DB)
```typescript
import { calculateKRI } from "@/lib/services/kriCalculation";

const result = await calculateKRI(kitchenId);
console.log(result.kriScore); // 0-100
console.log(result.breakdown); // Component breakdown
console.log(result.metrics); // All metrics
console.log(result.isNewChef); // true/false
```

### Update KRI in Database
```typescript
import { updateKRIScore } from "@/lib/services/kriCalculation";

const newKriScore = await updateKRIScore(kitchenId);
// Updates kitchen.kriScore in database
```

### Batch Update All Kitchens
```typescript
import { updateAllKRIScores } from "@/lib/services/kriCalculation";

await updateAllKRIScores();
// Useful for cron jobs
```

## 🔧 Performance Considerations

- **On-the-fly calculation**: KRI is calculated when needed (not cached)
- **Async updates**: KRI updates after order/review don't block the main operation
- **Error handling**: Falls back to 0 if calculation fails (doesn't break pages)

## 📋 Next Steps (Optional)

1. **Caching**: Consider caching KRI scores for better performance
2. **Cron Job**: Set up daily batch update for all kitchens
3. **Response Time Calculation**: Automatically calculate response time from order history
4. **KRI History**: Track KRI score changes over time

## 📚 Documentation

- **`KRI_CALCULATION_GUIDE.md`** - Complete calculation guide
- **`src/lib/services/kriCalculation.ts`** - Implementation with comments

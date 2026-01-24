# Kitchen Reliability Index (KRI) Calculation Guide

## Overview

The **Kitchen Reliability Index (KRI)** is a composite score (0-100) that measures how reliable and trustworthy a kitchen is based on multiple performance metrics. A higher KRI score indicates better reliability and customer satisfaction.

**Important Notes:**
- This system uses **fixed time delivery** (not instant delivery)
- Satisfaction is calculated from **actual review ratings**, not a stored satisfactionRate field

## KRI Score Components

The KRI score is calculated from **5 main components**, totaling **100 points**:

### 1. Rating Score (0-30 points)
- **Based on**: Average customer rating (1-5 scale)
- **Formula**: `(averageRating / 5) * 30`
- **Example**: 
  - Rating 5.0 = 30 points
  - Rating 4.0 = 24 points
  - Rating 3.0 = 18 points

### 2. Fulfillment Score (0-25 points)
- **Based on**: Order completion rate and cancellation rate
- **Formula**: `(completionRate / 100) * 25 - (cancellationRate / 100) * 5`
- **Metrics**:
  - Completion Rate = (Completed Orders / Total Orders) × 100
  - Cancellation Rate = (Cancelled Orders / Total Orders) × 100
- **Example**:
  - 100% completion, 0% cancellation = 25 points
  - 90% completion, 5% cancellation = 22.5 points
  - 80% completion, 10% cancellation = 19.5 points

### 3. Delivery Score (0-20 points)
- **Based on**: On-time delivery rate for **fixed time delivery**
- **Formula**: `(onTimeDeliveryRate / 100) * 20`
- **On-time Definition**: Order completed on the same day as `delivery_date` (with 2-hour buffer)
  - Orders are scheduled for a specific delivery date/time
  - On-time = completed on the delivery date (up to 2 hours after delivery_date time)
  - Late = completed after delivery date or on a different day
- **Example**:
  - 100% on-time = 20 points
  - 90% on-time = 18 points
  - 80% on-time = 16 points

### 4. Response Score (0-15 points)
- **Based on**: Average response time (time from order creation to CONFIRMED status)
- **Formula**: `Max(0, 15 - (responseTime / 60) * 2)`
- **Scoring**:
  - 0 minutes = 15 points
  - 30 minutes = 14 points
  - 60 minutes = 13 points
  - 120+ minutes = 0 points

### 5. Satisfaction Score (0-10 points)
- **Based on**: Positive review rate (calculated from actual reviews)
- **Formula**: `(positiveReviewRate / 100) * 10`
- **Calculation**: 
  - Positive reviews = Reviews with 4-5 star ratings
  - Positive Review Rate = (Positive Reviews / Total Reviews) × 100
  - If no reviews, satisfaction rate = 0%
- **Example**:
  - 100% positive reviews (all 4-5 stars) = 10 points
  - 90% positive reviews = 9 points
  - 80% positive reviews = 8 points
  - 50% positive reviews = 5 points

## Final KRI Score

```
KRI Score = Rating Score + Fulfillment Score + Delivery Score + Response Score + Satisfaction Score
```

**Range**: 0-100 (rounded to nearest integer)

## Database Fields Used

The KRI calculation uses the following fields from the `Kitchen` model:

| Field | Type | Description |
|-------|------|-------------|
| `rating` | Decimal | Average customer rating |
| `reviewCount` | Int | Total number of reviews |
| `totalOrders` | Int | Total orders placed |
| `satisfactionRate` | Decimal | **Not used** - Calculated from reviews instead |
| `responseTime` | Int | Average response time in minutes |
| `deliveryRate` | Decimal | On-time delivery percentage |

Additionally, it queries:
- **Orders**: To calculate completion and cancellation rates
- **Reviews**: To get actual average rating from review data

## Usage

### Calculate KRI (without updating database)

```typescript
import { calculateKRI } from "@/lib/services/kriCalculation";

const result = await calculateKRI(kitchenId);

console.log(result.kriScore); // Final KRI score (0-100)
console.log(result.breakdown); // Score breakdown by component
console.log(result.metrics); // All calculated metrics
```

### Update KRI in Database

```typescript
import { updateKRIScore } from "@/lib/services/kriCalculation";

const newKriScore = await updateKRIScore(kitchenId);
// This updates kitchen.kriScore in the database
```

### API Endpoints

#### GET `/api/chef/kri`
Get current KRI score and breakdown (doesn't update database)

**Response:**
```json
{
  "success": true,
  "data": {
    "kriScore": 85,
    "breakdown": {
      "ratingScore": 27.0,
      "fulfillmentScore": 23.5,
      "deliveryScore": 18.0,
      "responseScore": 12.0,
      "satisfactionScore": 8.5
    },
    "metrics": {
      "averageRating": 4.5,
      "totalOrders": 150,
      "completedOrders": 145,
      "cancelledOrders": 5,
      "completionRate": 96.67,
      "onTimeDeliveryRate": 90.0,
      "averageResponseTime": 15.0,
      "satisfactionRate": 85.0, // Derived from positive reviews (4-5 stars)
      "positiveReviewRate": 85.0,
      "reviewCount": 120
    }
  }
}
```

#### POST `/api/chef/kri`
Calculate and update KRI score in the database

**Response:**
```json
{
  "success": true,
  "message": "KRI score updated successfully",
  "data": {
    "kriScore": 85,
    "breakdown": { ... },
    "metrics": { ... }
  }
}
```

## When to Update KRI

KRI should be recalculated and updated:

1. **After order completion** - To reflect new completion/delivery metrics
2. **After new review** - To update rating score
3. **Periodically (cron job)** - Daily or weekly batch update for all kitchens
4. **On demand** - When chef/admin requests update

### Example: Update KRI after order completion

```typescript
// In order status update route
if (status === "COMPLETED") {
  // ... existing order completion logic ...
  
  // Update KRI score
  await updateKRIScore(kitchen.id);
}
```

### Example: Batch update all kitchens (cron job)

```typescript
import { updateAllKRIScores } from "@/lib/services/kriCalculation";

// Run daily at 2 AM
await updateAllKRIScores();
```

## KRI Score Interpretation

| Score Range | Interpretation | Description |
|-------------|----------------|-------------|
| 90-100 | Excellent | Highly reliable, excellent performance |
| 80-89 | Very Good | Reliable with minor areas for improvement |
| 70-79 | Good | Generally reliable, some improvements needed |
| 60-69 | Fair | Moderate reliability, needs attention |
| 50-59 | Poor | Low reliability, significant issues |
| 0-49 | Very Poor | Critical issues, may need intervention |

## Improving KRI Score

To improve KRI score, focus on:

1. **Rating Score**: Encourage satisfied customers to leave reviews
2. **Fulfillment Score**: Reduce order cancellations, complete all orders
3. **Delivery Score**: Deliver orders on time or early
4. **Response Score**: Respond to orders quickly (confirm within 30 minutes)
5. **Satisfaction Score**: Encourage positive reviews (4-5 stars) from satisfied customers

## New Chef Handling

For **new chefs** (kitchens with < 5 orders OR < 3 reviews), the KRI calculation uses a **base score system**:

### Base Score: 50 points
- New chefs start with a **neutral base score of 50/100**
- This gives them a fair starting point until they have enough data

### Blended Scoring
- As new chefs get orders/reviews, their score gradually transitions from base score to actual calculated score
- **Formula**: `Base Score × (1 - dataWeight) + Actual Score × dataWeight`
- **Data Weight**: Increases as they get more orders and reviews
  - Max weight (1.0) when they have **5+ orders AND 3+ reviews**
  - At this point, they're considered "established" and use full calculated score

### Example Progression

| Orders | Reviews | Status | KRI Score |
|--------|---------|--------|-----------|
| 0 | 0 | New Chef | 50 (base) |
| 2 | 1 | New Chef | ~52 (blended) |
| 4 | 2 | New Chef | ~55 (blended) |
| 5+ | 3+ | Established | Actual calculated score |

### Why This Approach?
- **Fairness**: New chefs don't start at 0, which would be unfair
- **Encouragement**: Gives new chefs a chance to build reputation
- **Gradual Transition**: Smoothly moves from base to actual score as data accumulates
- **Trust Building**: Customers see a reasonable starting score, not a red flag

## Notes

- KRI is calculated **on-the-fly** from actual order and review data
- The score is **not stored** in the database by default (use `updateKRIScore()` to store it)
- For **new chefs** (< 5 orders or < 3 reviews), KRI uses a **base score of 50** with blended actual data
- For **established chefs** (5+ orders AND 3+ reviews), KRI uses **fully calculated score**
- The calculation handles **edge cases** (division by zero, null values, etc.)

## Future Enhancements

Potential improvements to KRI calculation:

1. **Weighted scoring** based on recency (recent orders/reviews weighted more)
2. **Volume bonus** for kitchens with high order volume
3. **Trend analysis** (improving vs declining performance)
4. **Category-specific metrics** (different weights for different kitchen types)
5. **Customer retention rate** as an additional component

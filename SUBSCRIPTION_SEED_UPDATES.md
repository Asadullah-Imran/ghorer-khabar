# Subscription Seed File Updates

## Overview
Updated `seedForSubscriptionPlans.ts` to dynamically calculate nutritional data (calories, protein, carbs, fats) from menu items instead of using hardcoded values, and changed to use SELLER_ID instead of KITCHEN_ID.

## Changes Made

### 1. **Environment Variable Change**
**Before:**
```typescript
const KITCHEN_ID = process.env.TEMP_KITCHEN_ID || "cmkgtg8ow0001h495l0q1hquu"
```

**After:**
```typescript
const SELLER_ID = process.env.TEMP_Seller_ID || "cmkgtg8ow0001h495l0q1hquu"
```

**Why:** Using the seller/user ID is more flexible as it automatically looks up the associated kitchen, avoiding the need to manually find kitchen IDs.

### 2. **Database Query Changes**
**Before:**
- Verified kitchen exists by ID
- Fetched menu items for `kitchen.sellerId`
- Menu items didn't include calories

**After:**
- Verify seller/user exists by ID
- Find kitchen associated with the seller
- Fetch menu items for the seller with `calories` field included
- Better error handling for missing kitchen

### 3. **New Helper Functions**

#### `calculateNutritionFromDishes(dishIds)`
Calculates nutritional values from a list of dish IDs:
- **Calories**: Sum of all dish calories
- **Protein/Carbs/Fats**: Estimated using typical distribution:
  - Protein: 25% of calories (4 cal/g)
  - Carbs: 50% of calories (4 cal/g)  
  - Fats: 25% of calories (9 cal/g)

```typescript
const calculateNutritionFromDishes = (dishIds: string[]): { 
  calories: number; 
  protein: string; 
  carbs: string; 
  fats: string 
} => {
  // Aggregates nutrition from menu items
  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein) + 'g',
    carbs: Math.round(totalCarbs) + 'g',
    fats: Math.round(totalFats) + 'g',
  }
}
```

#### `calculateDailyNutrition(schedule)`
Calculates total daily nutrition from the entire weekly schedule:
- Collects all unique dish IDs from all days and meal types
- Calls `calculateNutritionFromDishes()` with the unique list
- Returns aggregated daily nutrition values

### 4. **Removed Hardcoded Nutrition**
Removed hardcoded nutrition values from all 6 subscription plans:
- ✅ Daily Deluxe Pack
- ✅ Weekly Family Plan
- ✅ Executive Lunch Box
- ✅ Premium Full Week
- ✅ Vegetarian Delight
- ✅ Weekend Special

### 5. **Updated Plan Creation Logic**
**Before:**
```typescript
const plan = await prisma.subscription_plans.create({
  data: {
    kitchen_id: KITCHEN_ID,
    calories: planData.calories,
    protein: planData.protein,
    carbs: planData.carbs,
    fats: planData.fats,
    // ...
  }
})
```

**After:**
```typescript
const nutrition = calculateDailyNutrition(planData.weeklySchedule)
const plan = await prisma.subscription_plans.create({
  data: {
    kitchen_id: kitchen.id,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fats: nutrition.fats,
    // ...
  }
})
```

### 6. **Enhanced Console Output**
Now displays calculated nutrition data:
```
✅ Created: Daily Deluxe Pack
   - Price: ৳8500
   - Meals per day: 3
   - Servings per meal: 1
   - Nutrition: 2450 cal | Protein: 152g | Carbs: 306g | Fats: 85g
   - Status: Active
   - ID: clxxx...
```

## Environment Variable Setup

To use this updated seed file, set the environment variable:

```bash
# .env.local or .env
TEMP_Seller_ID=your_seller_user_id
```

Or use the default fallback:
```bash
npm run seed:subscriptions
# Will use the hardcoded default if TEMP_Seller_ID is not set
```

## Benefits

✅ **Dynamic Nutrition**: Nutrition data is calculated from actual menu items, ensuring accuracy
✅ **Flexibility**: Using SELLER_ID allows automatic kitchen lookup
✅ **Maintainability**: No need to update hardcoded values when menu items change
✅ **Accuracy**: Real calorie data from menu items drives macro estimates
✅ **Better Logging**: Console output shows actual calculated nutrition values

## Nutrition Calculation Notes

The macro estimation uses a standard distribution:
- **Protein**: 25% of calories → divided by 4 (cal per gram)
- **Carbs**: 50% of calories → divided by 4 (cal per gram)
- **Fats**: 25% of calories → divided by 9 (cal per gram)

This can be adjusted in the `calculateNutritionFromDishes()` function if you need different ratios:
```typescript
totalProtein += (dish.calories || 0) * 0.25 / 4  // Change the multiplier
totalCarbs += (dish.calories || 0) * 0.50 / 4
totalFats += (dish.calories || 0) * 0.25 / 9
```

## Database Schema

The subscription_plans table stores:
- `calories` (Int, nullable)
- `protein` (String, nullable) - e.g., "65g"
- `carbs` (String, nullable) - e.g., "180g"
- `fats` (String, nullable) - e.g., "45g"

## Testing

Run the updated seed:
```bash
npm run seed:subscriptions
# Or with custom seller ID
TEMP_Seller_ID=your_user_id npm run seed:subscriptions
```

Check created plans in the database:
```sql
SELECT 
  id, 
  name, 
  calories, 
  protein, 
  carbs, 
  fats 
FROM subscription_plans 
ORDER BY created_at DESC 
LIMIT 10;
```

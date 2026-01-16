# Subscription Meal Plan Seed File

## Overview

This seed file creates realistic subscription meal plans for the **Ghorer Khabar** platform. It demonstrates the complete data flow from:
- **Kitchen** → **Menu Items** → **Subscription Plans** with weekly schedules

## Key Features

### Database Integration
- ✅ Links to existing `Kitchen` via `kitchen_id`
- ✅ References actual `menu_items` (dishes) via `dishIds` in schedules
- ✅ Validates kitchen and menu items exist before seeding
- ✅ Smart dish selection by category (breakfast, main course, vegetarian)

### Subscription Plans Created
The seed file creates **6 diverse subscription plans**:

1. **Daily Deluxe Pack** (৳8,500)
   - 3 meals/day × 7 days
   - Single serving
   - Full week coverage with breakfast, lunch, dinner

2. **Weekly Family Plan** (৳12,000)
   - 2-3 meals/day × 7 days
   - 4 servings per meal
   - Family-sized portions

3. **Executive Lunch Box** (৳2,500)
   - 1 meal/day (lunch only)
   - Single serving
   - Monday-Saturday delivery

4. **Premium Full Week** (৳15,000)
   - 3 meals/day × 7 days
   - 2 servings per meal
   - Complete weekly meal solution

5. **Vegetarian Delight** (৳7,000)
   - 2 meals/day (lunch & dinner)
   - Vegetarian dishes only
   - 5 days coverage

6. **Weekend Special** (৳3,500) - *Inactive*
   - 2 meals/day × 2 days
   - 3 servings per meal
   - Saturday & Sunday only

### Data Structure

Each plan includes:
- Basic info: name, description, price
- Serving details: `servings_per_meal`, `meals_per_day`
- Nutritional info: calories, protein, carbs, fats
- Chef's personal quote
- Cover image URL
- Active status
- **Weekly schedule** with:
  - Days: SATURDAY through FRIDAY
  - Meal slots: breakfast, lunch, snacks, dinner
  - Time slots (e.g., "08:30", "13:00")
  - Dish IDs referencing actual menu items

## Prerequisites

Before running this seed:

### 1. Create Menu Items First
```bash
npm run seed:menu
# or
tsx prisma/seedForAddMenuDishes.ts
```

### 2. Set Environment Variable
You need a valid kitchen ID. Add to your `.env`:
```env
TEMP_KITCHEN_ID=your-actual-kitchen-id-here
```

To find your kitchen ID:
```sql
SELECT id, name FROM kitchens LIMIT 1;
```

Or update line 23 in the seed file directly:
```typescript
const KITCHEN_ID = "your-kitchen-id-here"
```

## Usage

### Run the Seed

**Option 1: Using npm script** (add to package.json):
```bash
npm run seed:subscriptions
```

**Option 2: Direct execution**:
```bash
tsx prisma/seedForSubscriptionPlans.ts
```

### Expected Output
```
🌱 Seeding subscription meal plans...
✅ Found kitchen: Nazia's Kitchen (ID: clhw8x7yz0000uo01abc12345)
✅ Found 10 menu items to use in plans

📝 Creating 6 subscription plans...

✅ Created: Daily Deluxe Pack
   - Price: ৳8500
   - Meals per day: 3
   - Servings per meal: 1
   - Status: Active
   - ID: clpx1y2z30001abc...

...

🎉 Seeding completed!
   - Total plans created: 6/6
   - Kitchen ID: clhw8x7yz0000uo01abc12345
```

## How It Works

### 1. Validation Phase
```typescript
// Checks if kitchen exists
const kitchen = await prisma.kitchen.findUnique({ where: { id: KITCHEN_ID } })

// Gets menu items for the kitchen's chef
const menuItems = await prisma.menu_items.findMany({
  where: { chef_id: kitchen.sellerId }
})
```

### 2. Dish Selection Helpers
The seed file provides smart dish selection:

```typescript
// Get dishes by category
getDishIdsByCategory("breakfast", 1)  // Finds breakfast items
getDishIdsByCategory("main", 1)       // Finds main course items

// Get vegetarian dishes only
getVegetarianDishes(1)

// Get random dishes
getRandomDishIds(1)
```

### 3. Schedule Structure
Each day can have multiple meal slots:

```typescript
weeklySchedule: {
  SATURDAY: {
    breakfast: {
      time: "08:30",
      dishIds: ["dish-id-1"]  // References actual menu items
    },
    lunch: {
      time: "13:30",
      dishIds: ["dish-id-2"]
    },
    dinner: {
      time: "20:30",
      dishIds: ["dish-id-3"]
    }
  },
  // ... other days
}
```

### 4. Auto-calculated Fields
- `meals_per_day`: Calculated from max meal slots in weekly schedule
- `subscriber_count`: Random number (0-50) for demo purposes
- `monthly_revenue`: Starts at 0
- `rating`: Starts at 0

## Integration with Existing System

### Chef Input System
This seed file follows the same pattern as your chef menu input system:
- Uses same Prisma client setup
- References existing user (chef) via `sellerId`
- Links to actual menu items created by the chef
- Follows validation schema from `/lib/validation.ts`

### API Compatibility
The seeded data works with your existing API routes:
- `GET /api/chef/subscriptions` - Lists all plans
- `POST /api/chef/subscriptions` - Creates new plan (same structure)
- `PATCH /api/chef/subscriptions/[id]` - Updates plan
- `PATCH /api/chef/subscriptions/[id]/status` - Toggle active status

### Database Schema
Matches your Prisma schema:
```prisma
model subscription_plans {
  id                String   @id @default(cuid())
  kitchen_id        String
  name              String
  description       String?
  price             Float
  meals_per_day     Int      @default(1)
  servings_per_meal Int      @default(1)
  is_active         Boolean  @default(true)
  weekly_schedule   Json     @default("{}")
  // ... nutritional info, images, etc.
}
```

## Troubleshooting

### Error: Kitchen not found
```bash
❌ Kitchen with ID clhw8x7yz0000uo01abc12345 not found!
```
**Solution**: Update `KITCHEN_ID` or set `TEMP_KITCHEN_ID` env variable.

### Error: No menu items found
```bash
❌ No menu items found for this kitchen's chef!
```
**Solution**: Run the menu items seed first:
```bash
tsx prisma/seedForAddMenuDishes.ts
```

### Error: Database connection failed
**Solution**: Check your `.env` file has correct `DATABASE_URL`.

## Customization

### Add More Plans
Edit the `subscriptionPlans` array in the seed file (line 89+):

```typescript
const subscriptionPlans = [
  // ... existing plans
  {
    name: "Your Custom Plan",
    description: "Plan description",
    price: 5000,
    servingsPerMeal: 2,
    isActive: true,
    weeklySchedule: {
      // Your custom schedule
    }
  }
]
```

### Modify Dish Selection
Update the helper functions to customize how dishes are selected:

```typescript
const getDishIdsByCategory = (category: string, count: number = 1) => {
  // Your custom logic
}
```

## Next Steps

After seeding:

1. **View in your app**: Navigate to the subscriptions page
2. **Test the flow**: Create, edit, toggle status via the UI
3. **Verify data**: Check database with Prisma Studio
   ```bash
   npx prisma studio
   ```
4. **Adjust schedules**: Modify meal times and dish selections as needed
5. **Update prices**: Adjust based on your market research

## Related Files

- **Schema**: `/prisma/schema.prisma` (lines 165-190)
- **API Routes**: `/src/app/api/chef/subscriptions/route.ts`
- **Validation**: `/src/lib/validation.ts` (lines 14-76)
- **Menu Seed**: `/prisma/seedForAddMenuDishes.ts`
- **Dummy Data**: `/src/lib/dummy-data/newSubscriptionData.ts`

---

**Created**: January 2026  
**Purpose**: Seed realistic subscription meal plan data for development and testing

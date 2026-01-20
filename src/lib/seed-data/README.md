# Ghorer Khabar Seed Data

This directory contains comprehensive seed data for the Ghorer Khabar platform, including kitchens, dishes, customers, orders, subscriptions, and reviews.

## Generated Data Summary

- **5 Kitchens** - Verified home kitchens across Dhaka
- **59 Dishes** - 10-14 dishes per kitchen covering all categories
- **11 Subscription Plans** - Lunch and dinner plans for each kitchen
- **25 Customers** - Realistic Bangladeshi customer profiles
- **198 Orders** - Order history with various statuses
- **12 Subscriptions** - Active customer subscriptions
- **113 Reviews** - Customer reviews for completed orders

## File Structure

```
seed-data/
├── types.ts              # TypeScript type definitions
├── index.ts              # Data loader and helper functions
├── kitchens.json         # Kitchen data
├── dishes.json           # Dish data with full details
├── plans.json            # Subscription plans
├── customers.json        # Customer profiles
├── orders.json           # Order history
├── subscriptions.json    # Customer subscriptions
├── reviews.json          # Customer reviews
└── complete-seed.json    # All data in one file
```

## Data Features

### Kitchens
- Kitchen Reliability Index (KRI) scores
- Area coverage across Dhaka
- Specialty cuisines
- Verification badges

### Dishes
- 5 categories: Beef, Chicken, Fish, Rice, Vegetarian
- Spice levels: High, Medium, Mild
- Detailed ingredient information
- Multiple images per dish
- Preparation time and calories

### Customers
- Realistic Bangladeshi names
- Dhaka area addresses
- Order history and subscriptions
- Avatar images

### Reviews
- Generated only for completed orders
- Rating distribution based on dish quality
- Realistic review comments
- Helpful vote counts

### Orders & Subscriptions
- Multiple order statuses
- Subscription tracking
- Meal delivery progress

## Usage

### Import the data loader
```typescript
import seedData, { 
  getKitchens, 
  getDishes, 
  getKitchenById,
  getDishesByCategory 
} from '@/lib/seed-data';
```

### Common operations
```typescript
// Get all kitchens
const kitchens = getKitchens();

// Find a specific dish
const dish = getDishById('d1');

// Get dishes by category
const beefDishes = getDishesByCategory('Beef');

// Get customer's order history
const customerOrders = getOrdersByCustomer('c1');

// Get reviews for a dish
const dishReviews = getReviewsByDish('d1');

// Search dishes
const searchResults = searchDishes('biryani');

// Get kitchen statistics
const kitchenStats = getKitchenStats('k1');
```

## Data Relationships

- **Orders** → belong to **Customers** and **Kitchens**
- **Reviews** → written by **Customers** for **Dishes** from completed **Orders**
- **Subscriptions** → belong to **Customers** for specific **Plans**
- **Plans** → offered by **Kitchens**
- **Dishes** → offered by **Kitchens**

## Regenerating Data

To regenerate the seed data with new random values:

```bash
cd /path/to/project
npx tsx scripts/generate-seed.ts
```

This will:
1. Generate new random data following the same structure
2. Maintain realistic relationships between entities
3. Update all JSON files in this directory
4. Preserve the existing TypeScript types and helper functions

## Integration Notes

This seed data is designed to be easily replaceable with a real database. The helper functions in `index.ts` provide a clean API that can be swapped with database calls without changing the application code.

The data structure matches the existing dummy data format used in the application, making it a drop-in replacement for development and testing purposes.
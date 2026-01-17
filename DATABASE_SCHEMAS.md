# Database Schemas - Complete Reference

This document provides a comprehensive overview of all database tables and their record formats in the Ghorer Khabar application.

---

## Table of Contents
1. [User Management](#user-management)
2. [Chef Onboarding](#chef-onboarding)
3. [Menu Management](#menu-management)
4. [Inventory Management](#inventory-management)
5. [Orders & Payments](#orders--payments)
6. [Subscriptions](#subscriptions)
7. [Reviews & Favorites](#reviews--favorites)
8. [Notifications](#notifications)

---

## User Management

### users

Primary user table for authentication and profile management.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | Generated | Primary key (from Supabase Auth) |
| `name` | String | ❌ | null | Full name |
| `email` | String | ✅ | - | Unique email address |
| `password` | String | ❌ | null | Hashed password (for email auth) |
| `createdAt` | DateTime | ✅ | now() | Account creation timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |
| `role` | Role | ✅ | BUYER | BUYER, SELLER, ADMIN |
| `authProvider` | AuthProvider | ✅ | EMAIL | EMAIL, GOOGLE, FACEBOOK |
| `avatar` | String | ❌ | null | Profile image URL |
| `emailVerified` | Boolean | ✅ | false | Email verification status |
| `providerId` | String | ❌ | null | OAuth provider ID |
| `resetToken` | String | ❌ | null | Password reset token (unique) |
| `resetTokenExpiry` | DateTime | ❌ | null | Reset token expiration |
| `verificationExpiry` | DateTime | ❌ | null | Email verification expiry |
| `verificationToken` | String | ❌ | null | Email verification token (unique) |
| `phone` | String | ❌ | null | Phone number (unique) |

**Example Record:**
```json
{
  "id": "user_abc123xyz789",
  "name": "Mohammad Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "$2b$10$hashed_password_here",
  "createdAt": "2026-01-10T08:00:00.000Z",
  "updatedAt": "2026-01-16T10:30:45.500Z",
  "role": "SELLER",
  "authProvider": "EMAIL",
  "avatar": "https://storage.supabase.co/avatars/user123.jpg",
  "emailVerified": true,
  "providerId": null,
  "resetToken": null,
  "resetTokenExpiry": null,
  "verificationExpiry": null,
  "verificationToken": null,
  "phone": "8801712345678"
}
```

**Relations:**
- `addresses` → Address[] (one-to-many)
- `favorites` → Favorite[] (one-to-many)
- `kitchens` → Kitchen[] (one-to-many)
- `menu_items` → menu_items[] (one-to-many)
- `inventory_items` → inventory_items[] (one-to-many)
- `orders` → Order[] (one-to-many)
- `reviews` → Review[] (one-to-many)
- `notifications` → Notification[] (one-to-many)

---

## Chef Onboarding

### kitchens

Kitchen profiles created during chef onboarding process.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `sellerId` | String | ✅ | - | Foreign key to User.id |
| `name` | String | ✅ | - | Kitchen/business name |
| `type` | String | ❌ | null | Kitchen type/category |
| `description` | String | ❌ | null | Kitchen description |
| `location` | String | ❌ | null | Full address text |
| `area` | String | ❌ | null | Zone/area name |
| `distance` | Float | ❌ | null | Distance from user (calculated) |
| `nidName` | String | ❌ | null | Name on National ID |
| `nidFrontImage` | String | ❌ | null | NID front image URL |
| `nidBackImage` | String | ❌ | null | NID back image URL |
| `onboardingCompleted` | Boolean | ✅ | false | Onboarding completion status |
| `isVerified` | Boolean | ✅ | false | Admin verification status |
| `isActive` | Boolean | ✅ | true | Active/suspended status |
| `isOpen` | Boolean | ✅ | true | Currently accepting orders |
| `coverImage` | String | ❌ | null | Cover photo URL |
| `profileImage` | String | ❌ | null | Profile logo URL |
| `kriScore` | Int | ✅ | 0 | Kitchen Reliability Index |
| `rating` | Decimal | ✅ | 0.00 | Average rating (3,2) |
| `reviewCount` | Int | ✅ | 0 | Total review count |
| `totalOrders` | Int | ✅ | 0 | Lifetime order count |
| `totalRevenue` | Decimal | ✅ | 0.00 | Lifetime revenue (10,2) |
| `satisfactionRate` | Decimal | ❌ | null | Customer satisfaction % (3,2) |
| `responseTime` | Int | ❌ | null | Avg response time (minutes) |
| `deliveryRate` | Decimal | ❌ | null | On-time delivery % (3,2) |
| `operatingDays` | Json | ❌ | null | Operating schedule JSON |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |

**Example Record:**
```json
{
  "id": "cluk12ab34cd56ef78gh90ij",
  "sellerId": "user_abc123xyz789",
  "name": "Spice & Flavor Kitchen",
  "type": "Home Kitchen",
  "description": "Authentic Bengali and Mughlai cuisine",
  "location": "House #42, Road #5, Gulshan, Dhaka-1212",
  "area": "Gulshan",
  "distance": null,
  "nidName": "Mohammad Ahmed Hassan",
  "nidFrontImage": "https://storage.supabase.co/nid-documents/front123.jpg",
  "nidBackImage": "https://storage.supabase.co/nid-documents/back123.jpg",
  "onboardingCompleted": true,
  "isVerified": false,
  "isActive": false,
  "isOpen": true,
  "coverImage": "https://storage.supabase.co/kitchen-images/cover1.jpg",
  "profileImage": null,
  "kriScore": 0,
  "rating": "0.00",
  "reviewCount": 0,
  "totalOrders": 0,
  "totalRevenue": "0.00",
  "satisfactionRate": null,
  "responseTime": null,
  "deliveryRate": null,
  "operatingDays": null,
  "createdAt": "2026-01-16T10:30:45.123Z",
  "updatedAt": "2026-01-16T10:30:45.123Z"
}
```

**Relations:**
- `seller` → User (many-to-one)
- `gallery` → KitchenGallery[] (one-to-many)
- `orders` → Order[] (one-to-many)
- `subscription_plans` → subscription_plans[] (one-to-many)
- `favorites` → Favorite[] (one-to-many)
- `notifications` → Notification[] (one-to-many)

---

### addresses

User addresses for delivery and kitchen locations.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `userId` | String | ✅ | - | Foreign key to User.id |
| `label` | String | ✅ | - | Address label (Home, Work, Kitchen) |
| `address` | String | ✅ | - | Full address text |
| `zone` | String | ❌ | null | Zone/area name |
| `latitude` | Float | ❌ | null | GPS latitude |
| `longitude` | Float | ❌ | null | GPS longitude |
| `isDefault` | Boolean | ✅ | false | Default address flag |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |

**Example Record:**
```json
{
  "id": "addr_xyz789abc123",
  "userId": "user_abc123xyz789",
  "label": "Kitchen Location",
  "address": "House #42, Road #5, Gulshan, Dhaka-1212",
  "zone": "Gulshan",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "isDefault": true,
  "createdAt": "2026-01-16T10:30:44.500Z",
  "updatedAt": "2026-01-16T10:30:44.500Z"
}
```

**Relations:**
- `user` → User (many-to-one)

**Indexes:**
- `userId` (for user lookups)
- `latitude, longitude` (for geo queries)

---

### kitchen_gallery

Kitchen image gallery from onboarding and updates.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `kitchenId` | String | ✅ | - | Foreign key to Kitchen.id |
| `imageUrl` | String | ✅ | - | Image URL |
| `order` | Int | ✅ | 0 | Display order |
| `createdAt` | DateTime | ✅ | now() | Upload timestamp |

**Example Record:**
```json
{
  "id": "gal_001",
  "kitchenId": "cluk12ab34cd56ef78gh90ij",
  "imageUrl": "https://storage.supabase.co/kitchen-images/img1.jpg",
  "order": 0,
  "createdAt": "2026-01-16T10:30:45.300Z"
}
```

**Relations:**
- `kitchen` → Kitchen (many-to-one, cascade delete)

**Index:**
- `kitchenId` (for kitchen lookups)

---

## Menu Management

### menu_items

Chef's menu items/dishes.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `chef_id` | String | ✅ | - | Foreign key to User.id |
| `name` | String | ✅ | - | Dish name |
| `description` | String | ❌ | null | Dish description |
| `category` | String | ✅ | - | Category (Rice, Curry, etc.) |
| `price` | Float | ✅ | - | Price in BDT |
| `prepTime` | Int | ❌ | null | Preparation time (minutes) |
| `calories` | Int | ❌ | null | Calorie count |
| `spiciness` | String | ❌ | null | Spice level (Mild, Medium, Hot) |
| `isVegetarian` | Boolean | ✅ | false | Vegetarian flag |
| `isAvailable` | Boolean | ✅ | true | Availability status |
| `rating` | Float | ✅ | 0 | Average rating |
| `reviewCount` | Int | ✅ | 0 | Total reviews |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |

**Example Record:**
```json
{
  "id": "clzk89abc123def456gh78ij",
  "chef_id": "user_abc123xyz789",
  "name": "Hyderabadi Chicken Biryani",
  "description": "Authentic aromatic rice dish with tender chicken",
  "category": "Rice",
  "price": 450.0,
  "prepTime": 30,
  "calories": 650,
  "spiciness": "Medium",
  "isVegetarian": false,
  "isAvailable": true,
  "rating": 0.0,
  "reviewCount": 0,
  "createdAt": "2026-01-16T11:45:30.123Z",
  "updatedAt": "2026-01-16T11:45:30.123Z"
}
```

**Relations:**
- `users` → User (many-to-one, cascade delete)
- `ingredients` → ingredients[] (one-to-many)
- `menu_item_images` → menu_item_images[] (one-to-many)
- `orderItems` → OrderItem[] (one-to-many)
- `reviews` → Review[] (one-to-many)
- `favorites` → Favorite[] (one-to-many)

**Index:**
- `chef_id` (for chef lookups)

---

### ingredients

Recipe ingredients for menu items.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `menu_item_id` | String | ✅ | - | Foreign key to menu_items.id |
| `name` | String | ✅ | - | Ingredient name |
| `quantity` | Float | ✅ | - | Quantity amount |
| `unit` | String | ✅ | - | Unit (kg, gm, ml, pcs) |
| `cost` | Float | ❌ | null | Cost for this quantity |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |

**Example Record:**
```json
{
  "id": "ing_abc123",
  "menu_item_id": "clzk89abc123def456gh78ij",
  "name": "Basmati Rice",
  "quantity": 250.0,
  "unit": "gm",
  "cost": 80.0,
  "createdAt": "2026-01-16T11:45:30.200Z"
}
```

**Relations:**
- `menu_items` → menu_items (many-to-one, cascade delete)

**Index:**
- `menu_item_id` (for menu item lookups)

---

### menu_item_images

Images for menu items/dishes.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `menu_item_id` | String | ✅ | - | Foreign key to menu_items.id |
| `imageUrl` | String | ✅ | - | Image URL |
| `order` | Int | ✅ | 0 | Display order |
| `createdAt` | DateTime | ✅ | now() | Upload timestamp |

**Example Record:**
```json
{
  "id": "img_xyz001",
  "menu_item_id": "clzk89abc123def456gh78ij",
  "imageUrl": "https://storage.supabase.co/menu-image/biryani-1.jpg",
  "order": 0,
  "createdAt": "2026-01-16T11:45:30.500Z"
}
```

**Relations:**
- `menu_items` → menu_items (many-to-one, cascade delete)

**Index:**
- `menu_item_id` (for menu item lookups)

---

## Inventory Management

### inventory_items

Chef's ingredient inventory tracking.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `chef_id` | String | ✅ | - | Foreign key to User.id |
| `name` | String | ✅ | - | Ingredient/item name |
| `unit` | String | ✅ | - | Unit (kg, gm, liter, pcs) |
| `currentStock` | Float | ✅ | 0 | Current stock quantity |
| `demandFromOrders` | Float | ✅ | 0 | Needed for pending orders |
| `forecastDemand` | Float | ✅ | 0 | Predicted future demand |
| `reorderLevel` | Float | ✅ | 0 | Reorder alert threshold |
| `unitCost` | Float | ✅ | 0 | Cost per unit (BDT) |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |

**Example Record:**
```json
{
  "id": "clyk12xyz789abc456def012",
  "chef_id": "user_abc123xyz789",
  "name": "Basmati Rice",
  "unit": "kg",
  "currentStock": 25.5,
  "demandFromOrders": 5.2,
  "forecastDemand": 8.0,
  "reorderLevel": 10.0,
  "unitCost": 120.0,
  "createdAt": "2026-01-16T12:30:45.123Z",
  "updatedAt": "2026-01-16T12:30:45.123Z"
}
```

**Relations:**
- `users` → User (many-to-one, cascade delete)

**Index:**
- `chef_id` (for chef lookups)

---

## Orders & Payments

### orders

Customer orders.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `userId` | String | ✅ | - | Foreign key to User.id |
| `kitchenId` | String | ✅ | - | Foreign key to Kitchen.id |
| `total` | Float | ✅ | - | Total order amount |
| `status` | OrderStatus | ✅ | PENDING | Order status enum |
| `notes` | String | ❌ | null | Customer notes |
| `createdAt` | DateTime | ✅ | now() | Order timestamp |
| `updatedAt` | DateTime | ✅ | Auto | Last update timestamp |

**OrderStatus Enum:**
- `PENDING`
- `CONFIRMED`
- `PREPARING`
- `READY`
- `DELIVERED`
- `CANCELLED`

**Example Record:**
```json
{
  "id": "order_xyz123",
  "userId": "user_buyer_456",
  "kitchenId": "cluk12ab34cd56ef78gh90ij",
  "total": 890.0,
  "status": "PENDING",
  "notes": "Please make it less spicy",
  "createdAt": "2026-01-16T13:00:00.000Z",
  "updatedAt": "2026-01-16T13:00:00.000Z"
}
```

**Relations:**
- `user` → User (many-to-one)
- `kitchen` → Kitchen (many-to-one)
- `items` → OrderItem[] (one-to-many)
- `reviews` → Review[] (one-to-many)

**Indexes:**
- `userId` (for user orders)
- `kitchenId` (for kitchen orders)

---

### order_items

Individual items within an order.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `orderId` | String | ✅ | - | Foreign key to Order.id |
| `menuItemId` | String | ✅ | - | Foreign key to menu_items.id |
| `quantity` | Int | ✅ | - | Item quantity |
| `price` | Float | ✅ | - | Price at time of order |

**Example Record:**
```json
{
  "id": "oi_abc123",
  "orderId": "order_xyz123",
  "menuItemId": "clzk89abc123def456gh78ij",
  "quantity": 2,
  "price": 450.0
}
```

**Relations:**
- `order` → Order (many-to-one, cascade delete)
- `menuItem` → menu_items (many-to-one)

**Indexes:**
- `orderId` (for order lookups)
- `menuItemId` (for menu item lookups)

---

## Subscriptions

### subscription_plans

Chef's meal subscription plans.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `kitchen_id` | String | ✅ | - | Foreign key to Kitchen.id |
| `name` | String | ✅ | - | Plan name |
| `description` | String | ❌ | null | Plan description |
| `price` | Float | ✅ | - | Monthly price (BDT) |
| `meals_per_day` | Int | ✅ | 1 | Meals per day |
| `servings_per_meal` | Int | ✅ | 1 | Servings per meal |
| `is_active` | Boolean | ✅ | true | Active status |
| `subscriber_count` | Int | ✅ | 0 | Total subscribers |
| `monthly_revenue` | Float | ✅ | 0 | Monthly revenue |
| `rating` | Decimal | ✅ | 0.00 | Average rating (3,2) |
| `cover_image` | String | ❌ | null | Cover image URL |
| `calories` | Int | ❌ | null | Average calories per meal |
| `protein` | String | ❌ | null | Protein content |
| `carbs` | String | ❌ | null | Carbs content |
| `fats` | String | ❌ | null | Fats content |
| `chef_quote` | String | ❌ | null | Chef's description |
| `created_at` | DateTime | ✅ | now() | Creation timestamp |
| `updated_at` | DateTime | ✅ | Auto | Last update timestamp |
| `weekly_schedule` | Json | ✅ | {} | Weekly meal schedule |

**Example Record:**
```json
{
  "id": "sub_plan_123",
  "kitchen_id": "cluk12ab34cd56ef78gh90ij",
  "name": "Daily Lunch Plan",
  "description": "Fresh home-cooked lunch delivered daily",
  "price": 3500.0,
  "meals_per_day": 1,
  "servings_per_meal": 1,
  "is_active": true,
  "subscriber_count": 0,
  "monthly_revenue": 0.0,
  "rating": "0.00",
  "cover_image": "https://storage.supabase.co/plans/lunch.jpg",
  "calories": 650,
  "protein": "35g",
  "carbs": "80g",
  "fats": "20g",
  "chef_quote": "Authentic Bengali home cooking",
  "created_at": "2026-01-16T14:00:00.000Z",
  "updated_at": "2026-01-16T14:00:00.000Z",
  "weekly_schedule": {
    "SATURDAY": {
      "lunch": {
        "time": "13:00",
        "dishIds": ["dish1", "dish2"]
      }
    }
  }
}
```

**Relations:**
- `kitchen` → Kitchen (many-to-one, cascade delete)
- `favorites` → Favorite[] (one-to-many)

**Index:**
- `kitchen_id` (for kitchen lookups)

---

### Creating a New Subscription Plan

**API Endpoint:** `POST /api/chef/subscriptions`

**Request Format:**
```json
{
  "name": "Daily Deluxe Pack",
  "description": "Complete daily meal solution with breakfast, lunch, and dinner",
  "price": 8500,
  "servingsPerMeal": 1,
  "isActive": true,
  "coverImage": "https://storage.supabase.co/subscription-covers/deluxe-pack.jpg",
  "calories": 650,
  "protein": "35g",
  "carbs": "80g",
  "fats": "20g",
  "chefQuote": "Fresh ingredients, authentic recipes, delivered with love",
  "schedule": {
    "SATURDAY": {
      "breakfast": { "time": "08:30", "dishIds": ["dish_001"] },
      "lunch": { "time": "13:00", "dishIds": ["dish_002", "dish_003"] },
      "dinner": { "time": "20:00", "dishIds": ["dish_004"] }
    },
    "SUNDAY": {
      "breakfast": { "time": "08:30", "dishIds": ["dish_005"] },
      "lunch": { "time": "13:00", "dishIds": ["dish_006"] },
      "dinner": { "time": "20:00", "dishIds": ["dish_007"] }
    }
  }
}
```

**Validation Rules:**
- `name`: Required, min 1 char, max 255 chars
- `description`: Optional, max 1000 chars
- `price`: Required, must be > 0
- `servingsPerMeal`: Required, must be positive integer
- `isActive`: Optional, defaults to true
- `schedule`: Required, valid weekly schedule object
- `schedule[DAY][MEAL].time`: Must be in HH:mm format (e.g., "08:30", "13:00")
- `schedule[DAY][MEAL].dishIds`: Array of valid menu item IDs
- Valid days: SATURDAY, SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY
- Valid meals: breakfast, lunch, snacks, dinner

**Auto-calculated Fields:**
- `meals_per_day`: Calculated from maximum meal slots in any single day of the schedule
- `kitchen_id`: Automatically set from authenticated chef's kitchen
- `subscriber_count`: Defaults to 0
- `monthly_revenue`: Defaults to 0
- `rating`: Defaults to 0.00

**Response Format:**
```json
{
  "success": true,
  "data": {
    "id": "sub_plan_abc123xyz789",
    "name": "Daily Deluxe Pack",
    "price": 8500,
    "mealsPerDay": 3,
    "servingsPerMeal": 1,
    "isActive": true,
    "schedule": { /* full schedule object */ }
  }
}
```

**Database Changes:**
When a subscription plan is created, one record is inserted into `subscription_plans` table with:
- All provided fields
- `kitchen_id` from authenticated user's kitchen
- `meals_per_day` auto-calculated from schedule
- `weekly_schedule` stored as JSON
- Default values for counters (subscriber_count, monthly_revenue, rating)
- Timestamps (created_at, updated_at)

**Prerequisites:**
1. User must be authenticated
2. User must have SELLER role
3. User must have a verified kitchen (completed onboarding)
4. All `dishIds` in schedule must reference existing menu items
5. Menu items must belong to the same chef

---

## Reviews & Favorites

### reviews

Customer reviews for menu items.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `userId` | String | ✅ | - | Foreign key to User.id |
| `menuItemId` | String | ❌ | null | Foreign key to menu_items.id |
| `orderId` | String | ❌ | null | Foreign key to Order.id |
| `rating` | Int | ✅ | - | Rating (1-5) |
| `comment` | String | ❌ | null | Review text |
| `createdAt` | DateTime | ✅ | now() | Review timestamp |

**Example Record:**
```json
{
  "id": "review_abc123",
  "userId": "user_buyer_456",
  "menuItemId": "clzk89abc123def456gh78ij",
  "orderId": "order_xyz123",
  "rating": 5,
  "comment": "Excellent biryani! Very authentic taste.",
  "createdAt": "2026-01-16T15:00:00.000Z"
}
```

**Relations:**
- `user` → User (many-to-one, cascade delete)
- `menuItem` → menu_items (many-to-one, set null)
- `order` → Order (many-to-one, set null)

**Indexes:**
- `userId` (for user reviews)
- `menuItemId` (for menu item reviews)
- `orderId` (for order reviews)

---

### favorites

User favorites (menu items, kitchens, subscription plans).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `userId` | String | ✅ | - | Foreign key to User.id |
| `menuItemId` | String | ❌ | null | Foreign key to menu_items.id |
| `kitchenId` | String | ❌ | null | Foreign key to Kitchen.id |
| `subscriptionPlanId` | String | ❌ | null | Foreign key to subscription_plans.id |
| `createdAt` | DateTime | ✅ | now() | Favorite timestamp |

**Example Record:**
```json
{
  "id": "fav_abc123",
  "userId": "user_buyer_456",
  "menuItemId": "clzk89abc123def456gh78ij",
  "kitchenId": null,
  "subscriptionPlanId": null,
  "createdAt": "2026-01-16T16:00:00.000Z"
}
```

**Relations:**
- `user` → User (many-to-one, cascade delete)
- `menuItem` → menu_items (many-to-one, set null)
- `kitchen` → Kitchen (many-to-one, set null)
- `subscriptionPlan` → subscription_plans (many-to-one, set null)

**Indexes:**
- `userId` (for user favorites)
- `menuItemId` (for menu item favorites)
- `kitchenId` (for kitchen favorites)
- `subscriptionPlanId` (for plan favorites)

---

## Notifications

### notifications

System notifications for users.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | String | ✅ | cuid() | Primary key |
| `userId` | String | ✅ | - | Foreign key to User.id |
| `kitchenId` | String | ❌ | null | Related kitchen (optional) |
| `title` | String | ✅ | - | Notification title |
| `message` | String | ✅ | - | Notification message |
| `type` | String | ✅ | - | Type (order, review, system) |
| `isRead` | Boolean | ✅ | false | Read status |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |

**Example Record:**
```json
{
  "id": "notif_abc123",
  "userId": "user_abc123xyz789",
  "kitchenId": "cluk12ab34cd56ef78gh90ij",
  "title": "New Order Received",
  "message": "You have a new order for Chicken Biryani",
  "type": "order",
  "isRead": false,
  "createdAt": "2026-01-16T17:00:00.000Z"
}
```

**Relations:**
- `user` → User (many-to-one, cascade delete)
- `kitchen` → Kitchen (many-to-one, set null)

**Indexes:**
- `userId` (for user notifications)
- `kitchenId` (for kitchen notifications)

---

## Email Verification

### forget_password_otps

OTP storage for password reset.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | Int | ✅ | Auto | Primary key |
| `otp` | String | ✅ | - | OTP code |
| `createdAt` | DateTime | ✅ | now() | Creation timestamp |
| `expiresAt` | DateTime | ✅ | - | Expiration timestamp |
| `userId` | String | ✅ | - | Foreign key to User.id |

**Example Record:**
```json
{
  "id": 1,
  "otp": "123456",
  "createdAt": "2026-01-16T18:00:00.000Z",
  "expiresAt": "2026-01-16T18:10:00.000Z",
  "userId": "user_abc123xyz789"
}
```

**Relations:**
- `user` → User (many-to-one, cascade delete)

**Index:**
- `userId` (for user lookups)

---

## Enums

### Role
```typescript
enum Role {
  BUYER
  SELLER
  ADMIN
}
```

### AuthProvider
```typescript
enum AuthProvider {
  EMAIL
  GOOGLE
  FACEBOOK
}
```

### OrderStatus
```typescript
enum OrderStatus {
  PENDING
  CONFIRMED
  PREPARING
  READY
  DELIVERED
  CANCELLED
}
```

---

## Database Relationships Diagram

```
User
├── addresses (1:N)
├── kitchens (1:N) [if SELLER]
│   ├── kitchen_gallery (1:N)
│   └── subscription_plans (1:N)
├── menu_items (1:N) [if SELLER]
│   ├── ingredients (1:N)
│   └── menu_item_images (1:N)
├── inventory_items (1:N) [if SELLER]
├── orders (1:N)
│   └── order_items (1:N)
│       └── menu_items (N:1)
├── reviews (1:N)
├── favorites (1:N)
├── notifications (1:N)
└── forget_password_otps (1:N)
```

---

## Common Patterns

### Timestamps
All tables include:
- `createdAt` - Automatically set on creation
- `updatedAt` - Automatically updated on modification (where applicable)

### Cascade Deletes
When a user is deleted:
- ✅ All addresses deleted
- ✅ All kitchens deleted
  - ✅ All kitchen gallery images deleted
  - ✅ All subscription plans deleted
- ✅ All menu items deleted
  - ✅ All ingredients deleted
  - ✅ All menu item images deleted
- ✅ All inventory items deleted
- ✅ All reviews deleted
- ✅ All favorites deleted
- ✅ All notifications deleted

### Soft Deletes
Some tables use status flags instead of deletion:
- `Kitchen.isActive` - Can be deactivated
- `menu_items.isAvailable` - Can be hidden
- `subscription_plans.is_active` - Can be paused

---

## Storage Buckets (Supabase)

### nid-documents (Private)
- **Path**: `nid-documents/{userId}/{filename}`
- **Purpose**: Store NID images from chef onboarding
- **Access**: Private (authenticated users only)

### kitchen-images (Public)
- **Path**: `kitchen-images/{userId}/{timestamp}-{filename}`
- **Purpose**: Kitchen gallery and cover images
- **Access**: Public

### menu-image (Public)
- **Path**: `menu-image/chef-menu/{userId}/{timestamp}-{filename}`
- **Purpose**: Menu item/dish images
- **Access**: Public

### avatars (Public)
- **Path**: `avatars/{userId}/{filename}`
- **Purpose**: User profile pictures
- **Access**: Public

---

## Best Practices

1. **Always use transactions** for multi-table operations (e.g., creating menu item with ingredients)
2. **Validate foreign keys** before insertion
3. **Use indexes** for frequently queried fields
4. **Soft delete** where possible instead of hard delete
5. **Normalize data** but denormalize for performance where needed
6. **Use enums** for fixed value sets
7. **Store prices** at time of order in order_items
8. **Include timestamps** for audit trails
9. **Use cascade deletes** carefully to prevent data loss
10. **Back up regularly** especially before migrations

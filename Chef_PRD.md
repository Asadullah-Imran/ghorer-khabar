# Chef Portal - Product Requirements Document (PRD)

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Feature Specifications](#feature-specifications)
4. [Database Schema](#database-schema)
5. [API Requirements](#api-requirements)
6. [Implementation Guide](#implementation-guide)
7. [Technical Architecture](#technical-architecture)

---

## Executive Summary

### Product Vision
Ghorer Khabar's Chef Portal is a comprehensive kitchen management system that empowers home chefs to run their food businesses efficiently. The platform combines order management, inventory tracking, menu customization, analytics, and subscription planning into a unified dashboard.

### Key Objectives
- Enable home chefs to manage their entire kitchen operation from a single platform
- Provide AI-powered insights and demand forecasting for inventory management
- Streamline order processing with a kanban-style workflow
- Offer advanced analytics for business growth
- Support subscription-based meal plans for recurring revenue

### Target Users
- Home-based chefs and kitchen operators
- Small-scale food businesses
- Subscription meal service providers

---

## System Overview

### Current Implementation Status
The Chef Portal currently has **UI-only implementation** with dummy data. All components are built but need backend integration.

### Module Structure
```
Chef Portal
├── Dashboard (Home)
├── Menu Management
├── Smart Inventory (Bazar)
├── Live Orders (Kanban)
├── Analytics & Insights
├── Subscriptions
└── Business Settings
```

---

## Feature Specifications

### 1. Dashboard Module

#### Purpose
Central command center providing at-a-glance metrics and real-time notifications.

#### Features
- **Real-time Kitchen Status Toggle**
  - Open/Closed status
  - Affects order acceptance
  
- **Key Metrics Cards**
  - Today's Revenue (with trend %)
  - Active Orders count
  - Kitchen Reliability Index (KRI) score
  
- **Monthly Revenue Chart**
  - Interactive bar chart
  - 12-month data visualization
  - Hover tooltips with exact values
  
- **Notification Feed**
  - Real-time order updates
  - Inventory alerts
  - Payment confirmations
  - Customer reviews
  - Color-coded by type (success, info, warning, error)

#### UI Components
- `StatCard.tsx` - Reusable metric display
- `RevenueChart.tsx` - Revenue visualization
- `NotificationFeed.tsx` - Activity stream
- `KitchenStatusToggle.tsx` - Status switcher

---

### 2. Menu Management Module

#### Purpose
Complete menu CRUD operations with pricing intelligence and performance insights.

#### Features

##### A. Menu Item Management
- **Add/Edit Menu Items**
  - Dish name, description, category
  - Image upload
  - Preparation time (minutes)
  - Spiciness level (Mild/Medium/High)
  - Vegetarian flag
  - Allergen information
  
- **Ingredient Transparency**
  - List of ingredients with quantities
  - Unit costs for each ingredient
  - Total ingredient cost calculation
  - Profit margin display

- **Dynamic Pricing**
  - Market price range slider
  - Manual price override option
  - Real-time profit margin calculation
  - Competitive pricing suggestions

- **Availability Toggle**
  - Quick enable/disable for dishes
  - Visual indicators

##### B. Menu Insights & Analytics
- **Per-Item Performance**
  - Average rating display
  - Rating distribution (5-star breakdown)
  - Customer review management
  - Review appeal system (fraud flagging)

- **Search & Filtering**
  - Text search by dish name
  - Category filter dropdown
  - Status filter (available/unavailable)

##### C. Review Management
- **Review Display**
  - Customer name, rating, date
  - Review text
  - Three-dot menu for actions
  
- **Appeal System**
  - Flag reviews for fraud
  - Submit appeal with reason
  - Track appeal status
  - Admin review workflow

#### UI Components
- `MenuItemCard.tsx` - Dish display card
- `MenuItemForm.tsx` - Add/Edit form
- `MenuInsightsModal.tsx` - Performance insights
- `DeleteConfirmDialog.tsx` - Deletion confirmation

---

### 3. Smart Inventory (Bazar) Module

#### Purpose
AI-powered inventory management with demand forecasting and automated procurement lists.

#### Features

##### A. Inventory Tracking
- **Item Management**
  - Add/Edit/Remove inventory items
  - Current stock levels
  - Unit of measurement (kg, grams, ml, liters, pieces, etc.)
  - Unit cost tracking
  - Reorder level threshold

##### B. Demand Forecasting
- **Multi-source Demand Calculation**
  - Pending orders demand (confirmed orders)
  - Forecast demand (AI prediction for tomorrow)
  - Required quantity = Orders + Forecast
  - Stock gap = Required - Current Stock

##### C. Smart Shopping List
- **Auto-generated Purchase List**
  - Items with insufficient stock
  - Quantity to buy calculation
  - Estimated procurement cost
  - Interactive checklist
  - Progress tracking

##### D. Inventory Insights
- **Health Status**
  - Critical (≤50% of reorder level) - Red
  - Low (≤100% of reorder level) - Yellow
  - Healthy (>reorder level) - Green

- **Metrics Dashboard**
  - Total items count
  - Critical stock count
  - Total inventory value
  - Procurement cost estimate

#### UI Components
- `InventoryTable.tsx` - Stock overview table
- `SmartShoppingList.tsx` - Purchase recommendations
- `AddInventoryItemModal.tsx` - Add new items
- `StockUpdateModal.tsx` - Update stock levels

#### Algorithms Needed
```javascript
// Demand Calculation
requiredQty = demandFromOrders + forecastDemand

// Stock Gap
toBuy = max(0, requiredQty - currentStock)

// Status Determination
if (currentStock <= reorderLevel * 0.5) => "critical"
if (currentStock <= reorderLevel) => "low"
else => "healthy"
```

---

### 4. Live Orders (Kanban) Module

#### Purpose
Real-time order workflow management with visual kanban board.

#### Features

##### A. Kanban Columns
1. **New Requests**
   - Accept/Reject buttons
   - Order details preview
   
2. **Cooking**
   - Live timer (starts on accept)
   - Red pulse warning if >20 minutes
   - "Mark Ready" action
   
3. **Ready for Pickup**
   - Timer continues
   - "Handover" action
   
4. **Handed Over**
   - Runner/Tiffin ID assignment
   - Completion confirmation

##### B. Order Card Information
- Order number
- Customer name & phone
- Items with quantities and prices
- Total amount
- Special notes (highlighted)
- Cooking timer (for active orders)
- Runner & Tiffin ID (for completed)

##### C. Workflow Actions
- Drag-and-drop (future enhancement)
- Button-based status updates
- Auto-timer on status changes

#### UI Components
- `KanbanColumn.tsx` - Column container
- `OrderCard.tsx` - Individual order display
- `TimerBadge.tsx` - Live cooking timer

---

### 5. Analytics & Insights Module

#### Purpose
Business intelligence dashboard with AI-driven recommendations.

#### Features

##### A. KPI Overview (4 Cards)
- **Total Revenue**
  - Monthly total
  - Growth percentage
  
- **Net Profit**
  - Estimated profit
  - Growth percentage
  
- **Total Orders**
  - Order count
  - Growth percentage
  
- **Average Rating**
  - Out of 5 stars
  - Overall performance

##### B. Performance Charts
- **Revenue vs. Profit Chart**
  - Weekly breakdown
  - Dual-bar visualization
  - Hover tooltips
  - Y-axis scaling
  
- **Top Selling Dishes**
  - Ranked list (#1-5)
  - Sales count
  - Progress bar visualization
  - Percentage calculation

##### C. AI Kitchen Intelligence
- **Sentiment Analysis**
  - Positive feedback tags
  - Areas for improvement tags
  - Word cloud visualization
  
- **Actionable Insights**
  - AI-generated recommendations
  - Impact rating (High/Medium)
  - One-click apply suggestions
  - Specific actions to take

##### D. Additional Metrics
- Customer retention rate
- Average order value
- Fulfillment rate

#### UI Components
- Revenue/Profit dual-bar chart
- Top dishes ranking list
- Sentiment tag clouds
- AI recommendation cards

---

### 6. Subscriptions Module

#### Purpose
Manage recurring meal subscription plans with complex scheduling.

#### Features

##### A. Subscription Plan Management
- **Basic Information**
  - Plan name
  - Description
  - Price (monthly)
  - Servings per meal
  - Auto-calculated meals per day

- **Weekly Schedule Builder**
  - 7-day scheduler (Saturday-Friday)
  - 4 meal slots per day: Breakfast, Lunch, Snacks, Dinner
  - Delivery time configuration
  - Multi-dish selection per slot

##### B. Plan Configuration
- **Meal Assignment**
  - Browse available menu items
  - Add dishes to specific time slots
  - Remove dishes
  - Visual schedule grid (2x2 per day)

- **Auto-calculations**
  - Total dishes = meals/day × servings × 7 days
  - Weekly schedule summary
  - Pricing per serving

##### C. Subscription Analytics
- **Metrics**
  - Total subscribers
  - Monthly revenue
  - Active plans count
  - Average subscribers per plan

- **Plan Status**
  - Active/Inactive toggle
  - Subscriber count per plan
  - Revenue contribution

#### UI Components
- `SubscriptionModal.tsx` - Plan creator/editor
- Day tabs for schedule navigation
- Meal slot grid (breakfast/lunch/snacks/dinner)
- Available dishes sidebar

#### Complex Data Structure
```typescript
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  mealsPerDay: number;
  servingsPerMeal: number;
  price: number;
  subscriberCount: number;
  monthlyRevenue: number;
  isActive: boolean;
  schedule: {
    [day: string]: {
      breakfast?: { time: string; dishIds: string[] };
      lunch?: { time: string; dishIds: string[] };
      snacks?: { time: string; dishIds: string[] };
      dinner?: { time: string; dishIds: string[] };
    };
  };
}
```

---

### 7. Business Settings Module

#### Purpose
Chef profile and operational configuration.

#### Features

##### A. General Information
- Kitchen name (editable)
- Full address (editable)
- Owner name (read-only)
- Phone number (read-only)

##### B. Operating Hours
- **Day-wise Configuration**
  - 7 days (Saturday-Friday)
  - Open/Closed toggle per day
  - Opening time picker
  - Closing time picker

##### C. Legal & Verification
- **Verification Status Badge**
  - Verified (green check)
  - Pending (orange warning)
  - Rejected (red X)
  
- **Documents (Read-only)**
  - Trade License/TIN (masked)
  - NID Number (masked)
  - Contact support to update

##### D. Danger Zone
- **Account Deletion**
  - Permanent deletion warning
  - Confirmation dialog
  - Data removal notice

#### UI Components
- Form sections for each category
- Toggle switches for operating hours
- Time pickers
- Verification status badges

---

## Database Schema

### 1. Chef/User Schema
```prisma
model Chef {
  id                String    @id @default(uuid())
  userId            String    @unique
  kitchenName       String
  ownerName         String
  phoneNumber       String
  email             String    @unique
  address           String
  
  // Verification
  isVerified        Boolean   @default(false)
  verificationStatus VerificationStatus @default(PENDING)
  tradeLicense      String?
  nidNumber         String?
  
  // Kitchen Status
  isKitchenOpen     Boolean   @default(true)
  kriScore          Int       @default(0)
  
  // Operating Hours (JSON)
  operatingHours    Json
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  menuItems         MenuItem[]
  inventoryItems    InventoryItem[]
  orders            Order[]
  subscriptions     SubscriptionPlan[]
  notifications     Notification[]
  analytics         ChefAnalytics[]
}

enum VerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}
```

### 2. MenuItem Schema
```prisma
model MenuItem {
  id                String    @id @default(uuid())
  chefId            String
  chef              Chef      @relation(fields: [chefId], references: [id])
  
  // Basic Info
  name              String
  description       String?
  category          String
  image             String?
  
  // Attributes
  prepTime          Int       // minutes
  spiciness         String    // Mild, Medium, High
  isVegetarian      Boolean   @default(false)
  allergens         String[]  // Array of allergens
  
  // Pricing
  currentPrice      Float
  marketPriceMin    Float
  marketPriceMax    Float
  
  // Ingredients (JSON array)
  ingredients       Json
  
  // Status
  isAvailable       Boolean   @default(true)
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  reviews           MenuItemReview[]
  orderItems        OrderItem[]
  subscriptionMeals SubscriptionMeal[]
}

model Ingredient {
  id        String   @id @default(uuid())
  menuItemId String
  name      String
  quantity  String
  unit      String
  cost      Float?
  createdAt DateTime @default(now())
}
```

### 3. InventoryItem Schema
```prisma
model InventoryItem {
  id                String   @id @default(uuid())
  chefId            String
  chef              Chef     @relation(fields: [chefId], references: [id])
  
  // Item Details
  name              String
  unit              String   // kg, grams, ml, liters, pieces
  currentStock      Float
  reorderLevel      Float
  unitCost          Float
  
  // Demand Tracking
  demandFromOrders  Float    @default(0)
  forecastDemand    Float    @default(0)
  
  // Timestamps
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([chefId])
}
```

### 4. Order Schema
```prisma
model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique
  chefId          String
  chef            Chef        @relation(fields: [chefId], references: [id])
  customerId      String
  
  // Customer Info
  customerName    String
  customerPhone   String
  
  // Order Details
  status          OrderStatus @default(NEW)
  totalPrice      Float
  specialNotes    String?
  
  // Fulfillment
  startTime       DateTime?
  readyTime       DateTime?
  handoverTime    DateTime?
  runnerId        String?
  tiffinId        String?
  
  // Timestamps
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  // Relations
  items           OrderItem[]
}

enum OrderStatus {
  NEW
  COOKING
  READY
  HANDOVER
  COMPLETED
  CANCELLED
}

model OrderItem {
  id          String    @id @default(uuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id])
  menuItemId  String
  menuItem    MenuItem  @relation(fields: [menuItemId], references: [id])
  quantity    Int
  price       Float
  createdAt   DateTime  @default(now())
}
```

### 5. SubscriptionPlan Schema
```prisma
model SubscriptionPlan {
  id                String    @id @default(uuid())
  chefId            String
  chef              Chef      @relation(fields: [chefId], references: [id])
  
  // Plan Details
  name              String
  description       String?
  price             Float
  mealsPerDay       Int
  servingsPerMeal   Int
  
  // Status
  isActive          Boolean   @default(true)
  
  // Metrics
  subscriberCount   Int       @default(0)
  monthlyRevenue    Float     @default(0)
  
  // Schedule (JSON)
  schedule          Json
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  subscribers       Subscriber[]
}

model Subscriber {
  id                    String            @id @default(uuid())
  subscriptionPlanId    String
  subscriptionPlan      SubscriptionPlan  @relation(fields: [subscriptionPlanId], references: [id])
  customerId            String
  
  // Subscription Status
  startDate             DateTime
  endDate               DateTime?
  isActive              Boolean           @default(true)
  
  // Timestamps
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
}
```

### 6. Analytics Schema
```prisma
model ChefAnalytics {
  id                String    @id @default(uuid())
  chefId            String
  chef              Chef      @relation(fields: [chefId], references: [id])
  
  // Daily Metrics
  date              DateTime
  revenue           Float     @default(0)
  profit            Float     @default(0)
  orderCount        Int       @default(0)
  
  // Performance
  avgRating         Float?
  fulfillmentRate   Float?
  avgOrderValue     Float?
  
  // Timestamps
  createdAt         DateTime  @default(now())
  
  @@unique([chefId, date])
}

model MenuItemReview {
  id                String    @id @default(uuid())
  menuItemId        String
  menuItem          MenuItem  @relation(fields: [menuItemId], references: [id])
  customerId        String
  
  // Review Details
  customerName      String
  rating            Int       // 1-5
  text              String
  
  // Appeal System
  isAppealedByChef  Boolean   @default(false)
  appealReason      String?
  appealStatus      AppealStatus @default(NONE)
  
  // Timestamps
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum AppealStatus {
  NONE
  PENDING
  APPROVED
  REJECTED
}
```

### 7. Notification Schema
```prisma
model Notification {
  id          String           @id @default(uuid())
  chefId      String
  chef        Chef             @relation(fields: [chefId], references: [id])
  
  type        NotificationType
  title       String
  message     String
  read        Boolean          @default(false)
  
  // Timestamps
  createdAt   DateTime         @default(now())
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}
```

---

## API Requirements

### Authentication APIs
```
POST   /api/chef/auth/login
POST   /api/chef/auth/register
POST   /api/chef/auth/logout
GET    /api/chef/auth/me
```

### Dashboard APIs
```
GET    /api/chef/dashboard/metrics
GET    /api/chef/dashboard/notifications
PATCH  /api/chef/dashboard/kitchen-status
POST   /api/chef/dashboard/notifications/:id/read
```

### Menu APIs
```
GET    /api/chef/menu
POST   /api/chef/menu
GET    /api/chef/menu/:id
PUT    /api/chef/menu/:id
DELETE /api/chef/menu/:id
PATCH  /api/chef/menu/:id/availability
GET    /api/chef/menu/:id/insights
GET    /api/chef/menu/:id/reviews
POST   /api/chef/menu/reviews/:reviewId/appeal
```

### Inventory APIs
```
GET    /api/chef/inventory
POST   /api/chef/inventory
GET    /api/chef/inventory/:id
PUT    /api/chef/inventory/:id
DELETE /api/chef/inventory/:id
PATCH  /api/chef/inventory/:id/stock
GET    /api/chef/inventory/shopping-list
GET    /api/chef/inventory/metrics
```

### Orders APIs
```
GET    /api/chef/orders
GET    /api/chef/orders/:id
PATCH  /api/chef/orders/:id/status
POST   /api/chef/orders/:id/accept
POST   /api/chef/orders/:id/reject
POST   /api/chef/orders/:id/handover
GET    /api/chef/orders/kanban
```

### Analytics APIs
```
GET    /api/chef/analytics/kpis
GET    /api/chef/analytics/revenue-chart
GET    /api/chef/analytics/top-dishes
GET    /api/chef/analytics/sentiment
GET    /api/chef/analytics/ai-insights
GET    /api/chef/analytics/export
```

### Subscriptions APIs
```
GET    /api/chef/subscriptions
POST   /api/chef/subscriptions
GET    /api/chef/subscriptions/:id
PUT    /api/chef/subscriptions/:id
DELETE /api/chef/subscriptions/:id
PATCH  /api/chef/subscriptions/:id/status
GET    /api/chef/subscriptions/metrics
GET    /api/chef/subscriptions/:id/subscribers
```

### Settings APIs
```
GET    /api/chef/settings
PUT    /api/chef/settings/general
PUT    /api/chef/settings/operating-hours
GET    /api/chef/settings/verification
DELETE /api/chef/settings/account
```

---

## Implementation Guide

### Phase 1: Core Infrastructure (Week 1-2)

#### 1.1 Database Setup
```bash
# Update prisma/schema.prisma with all schemas above
npx prisma migrate dev --name init_chef_portal
npx prisma generate
```

#### 1.2 API Route Structure
```
src/app/api/chef/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── me/route.ts
├── dashboard/
│   ├── metrics/route.ts
│   └── notifications/route.ts
├── menu/
│   ├── route.ts (GET, POST)
│   ├── [id]/route.ts (GET, PUT, DELETE)
│   └── [id]/reviews/route.ts
├── inventory/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── shopping-list/route.ts
├── orders/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── kanban/route.ts
├── analytics/
│   ├── kpis/route.ts
│   └── insights/route.ts
├── subscriptions/
│   ├── route.ts
│   └── [id]/route.ts
└── settings/
    ├── route.ts
    └── operating-hours/route.ts
```

---

### Phase 2: Authentication & Authorization (Week 2)

#### 2.1 Auth Middleware
```typescript
// src/lib/auth/chef-auth.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

export async function requireChefAuth(req: NextRequest) {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'CHEF') {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}
```

#### 2.2 Protected Route Wrapper
```typescript
// src/lib/api/protected-route.ts
export function withChefAuth(handler: Function) {
  return async (req: NextRequest, context: any) => {
    try {
      const chef = await requireChefAuth(req);
      return await handler(req, context, chef);
    } catch (error) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  };
}
```

---

### Phase 3: Dashboard Implementation (Week 3)

#### 3.1 Dashboard Metrics API
```typescript
// src/app/api/chef/dashboard/metrics/route.ts
import { withChefAuth } from '@/lib/api/protected-route';
import { prisma } from '@/lib/prisma';

export const GET = withChefAuth(async (req, context, chef) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Today's Revenue
  const todayOrders = await prisma.order.findMany({
    where: {
      chefId: chef.id,
      createdAt: { gte: today },
      status: { not: 'CANCELLED' }
    }
  });
  
  const revenueToday = todayOrders.reduce(
    (sum, order) => sum + order.totalPrice,
    0
  );
  
  // Active Orders
  const activeOrders = await prisma.order.count({
    where: {
      chefId: chef.id,
      status: { in: ['NEW', 'COOKING', 'READY'] }
    }
  });
  
  // KRI Score (calculate from ratings, fulfillment, etc.)
  const kriScore = await calculateKRIScore(chef.id);
  
  // Monthly Revenue
  const monthlyRevenue = await getMonthlyRevenue(chef.id);
  
  return Response.json({
    revenueToday,
    activeOrders,
    kriScore,
    monthlyRevenue
  });
});
```

#### 3.2 Kitchen Status Toggle
```typescript
// src/app/api/chef/dashboard/kitchen-status/route.ts
export const PATCH = withChefAuth(async (req, context, chef) => {
  const { isOpen } = await req.json();
  
  await prisma.chef.update({
    where: { id: chef.id },
    data: { isKitchenOpen: isOpen }
  });
  
  return Response.json({ success: true, isOpen });
});
```

---

### Phase 4: Menu Management (Week 4-5)

#### 4.1 Create Menu Item
```typescript
// src/app/api/chef/menu/route.ts
export const POST = withChefAuth(async (req, context, chef) => {
  const data = await req.json();
  
  const menuItem = await prisma.menuItem.create({
    data: {
      chefId: chef.id,
      name: data.name,
      description: data.description,
      category: data.category,
      image: data.image,
      prepTime: data.prepTime,
      spiciness: data.spiciness,
      isVegetarian: data.isVegetarian,
      allergens: data.allergens,
      currentPrice: data.currentPrice,
      marketPriceMin: data.marketPriceMin,
      marketPriceMax: data.marketPriceMax,
      ingredients: data.ingredients, // JSON
      isAvailable: true
    }
  });
  
  return Response.json(menuItem, { status: 201 });
});
```

#### 4.2 Menu Insights
```typescript
// src/app/api/chef/menu/[id]/insights/route.ts
export const GET = withChefAuth(async (req, { params }, chef) => {
  const reviews = await prisma.menuItemReview.findMany({
    where: { menuItemId: params.id },
    orderBy: { createdAt: 'desc' }
  });
  
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  
  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };
  
  return Response.json({
    avgRating,
    distribution,
    reviews,
    totalReviews: reviews.length
  });
});
```

#### 4.3 Review Appeal
```typescript
// src/app/api/chef/menu/reviews/[reviewId]/appeal/route.ts
export const POST = withChefAuth(async (req, { params }, chef) => {
  const { reason } = await req.json();
  
  await prisma.menuItemReview.update({
    where: { id: params.reviewId },
    data: {
      isAppealedByChef: true,
      appealReason: reason,
      appealStatus: 'PENDING'
    }
  });
  
  return Response.json({ success: true });
});
```

---

### Phase 5: Smart Inventory (Week 5-6)

#### 5.1 Demand Forecasting Service
```typescript
// src/services/inventory-forecast.service.ts
export class InventoryForecastService {
  
  // Calculate demand from pending orders
  async calculateOrderDemand(chefId: string): Promise<Map<string, number>> {
    const pendingOrders = await prisma.order.findMany({
      where: {
        chefId,
        status: { in: ['NEW', 'COOKING'] }
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: { ingredients: true }
            }
          }
        }
      }
    });
    
    // Aggregate ingredients from all pending orders
    const demand = new Map<string, number>();
    
    for (const order of pendingOrders) {
      for (const item of order.items) {
        for (const ingredient of item.menuItem.ingredients) {
          const current = demand.get(ingredient.name) || 0;
          demand.set(
            ingredient.name,
            current + (ingredient.quantity * item.quantity)
          );
        }
      }
    }
    
    return demand;
  }
  
  // AI-based forecast for tomorrow
  async forecastTomorrowDemand(chefId: string): Promise<Map<string, number>> {
    // Get historical data (last 30 days)
    const history = await prisma.order.findMany({
      where: {
        chefId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        items: {
          include: {
            menuItem: {
              include: { ingredients: true }
            }
          }
        }
      }
    });
    
    // Simple moving average forecast
    // In production, use ML models
    const forecast = new Map<string, number>();
    
    // Calculate average daily consumption
    // Return predicted quantities
    
    return forecast;
  }
  
  // Generate smart shopping list
  async generateShoppingList(chefId: string) {
    const inventory = await prisma.inventoryItem.findMany({
      where: { chefId }
    });
    
    const orderDemand = await this.calculateOrderDemand(chefId);
    const forecastDemand = await this.forecastTomorrowDemand(chefId);
    
    const shoppingList = [];
    
    for (const item of inventory) {
      const orderQty = orderDemand.get(item.name) || 0;
      const forecastQty = forecastDemand.get(item.name) || 0;
      const required = orderQty + forecastQty;
      const toBuy = Math.max(0, required - item.currentStock);
      
      if (toBuy > 0) {
        shoppingList.push({
          ...item,
          demandFromOrders: orderQty,
          forecastDemand: forecastQty,
          required,
          toBuy,
          estimatedCost: toBuy * item.unitCost
        });
      }
    }
    
    return shoppingList;
  }
}
```

#### 5.2 Shopping List API
```typescript
// src/app/api/chef/inventory/shopping-list/route.ts
import { InventoryForecastService } from '@/services/inventory-forecast.service';

export const GET = withChefAuth(async (req, context, chef) => {
  const service = new InventoryForecastService();
  const shoppingList = await service.generateShoppingList(chef.id);
  
  const totalItems = shoppingList.length;
  const totalCost = shoppingList.reduce(
    (sum, item) => sum + item.estimatedCost,
    0
  );
  
  return Response.json({
    items: shoppingList,
    totalItems,
    totalCost
  });
});
```

---

### Phase 6: Order Management (Week 6-7)

#### 6.1 Kanban View API
```typescript
// src/app/api/chef/orders/kanban/route.ts
export const GET = withChefAuth(async (req, context, chef) => {
  const orders = await prisma.order.findMany({
    where: {
      chefId: chef.id,
      status: { in: ['NEW', 'COOKING', 'READY', 'HANDOVER'] }
    },
    include: {
      items: {
        include: { menuItem: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Group by status
  const kanban = {
    new: orders.filter(o => o.status === 'NEW'),
    cooking: orders.filter(o => o.status === 'COOKING'),
    ready: orders.filter(o => o.status === 'READY'),
    handover: orders.filter(o => o.status === 'HANDOVER')
  };
  
  return Response.json(kanban);
});
```

#### 6.2 Update Order Status
```typescript
// src/app/api/chef/orders/[id]/status/route.ts
export const PATCH = withChefAuth(async (req, { params }, chef) => {
  const { status, runnerId, tiffinId } = await req.json();
  
  const updateData: any = { status };
  
  // Set timestamps based on status
  if (status === 'COOKING') {
    updateData.startTime = new Date();
  } else if (status === 'READY') {
    updateData.readyTime = new Date();
  } else if (status === 'HANDOVER') {
    updateData.handoverTime = new Date();
    updateData.runnerId = runnerId;
    updateData.tiffinId = tiffinId;
  }
  
  const order = await prisma.order.update({
    where: { id: params.id },
    data: updateData
  });
  
  // Send notification to customer
  await sendOrderStatusNotification(order.customerId, status);
  
  return Response.json(order);
});
```

#### 6.3 Real-time Updates (Optional - Socket.io)
```typescript
// src/lib/socket/order-events.ts
import { Server } from 'socket.io';

export function setupOrderEvents(io: Server) {
  io.on('connection', (socket) => {
    socket.on('subscribe:chef', (chefId) => {
      socket.join(`chef:${chefId}`);
    });
    
    socket.on('order:update', async (data) => {
      // Broadcast to chef's room
      io.to(`chef:${data.chefId}`).emit('order:updated', data);
    });
  });
}
```

---

### Phase 7: Analytics & AI (Week 7-8)

#### 7.1 KPI Calculation
```typescript
// src/services/analytics.service.ts
export class AnalyticsService {
  
  async calculateKPIs(chefId: string, period: 'month' | 'week' = 'month') {
    const startDate = period === 'month'
      ? new Date(new Date().setDate(1))
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const orders = await prisma.order.findMany({
      where: {
        chefId,
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      include: {
        items: {
          include: {
            menuItem: { include: { ingredients: true } }
          }
        }
      }
    });
    
    // Total Revenue
    const totalRevenue = orders.reduce(
      (sum, o) => sum + o.totalPrice,
      0
    );
    
    // Calculate Profit (Revenue - Ingredient Costs)
    let totalCost = 0;
    for (const order of orders) {
      for (const item of order.items) {
        const ingredientCost = item.menuItem.ingredients.reduce(
          (sum: number, ing: any) => sum + (ing.cost || 0),
          0
        );
        totalCost += ingredientCost * item.quantity;
      }
    }
    const netProfit = totalRevenue - totalCost;
    
    // Total Orders
    const totalOrders = orders.length;
    
    // Average Rating
    const reviews = await prisma.menuItemReview.findMany({
      where: {
        menuItem: {
          chefId
        },
        createdAt: { gte: startDate }
      }
    });
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;
    
    // Growth calculations (compare to previous period)
    const previousPeriodStart = period === 'month'
      ? new Date(new Date().setMonth(new Date().getMonth() - 1))
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    
    const previousPeriodEnd = startDate;
    
    // ... calculate previous period metrics
    
    return {
      totalRevenue,
      revenueGrowth: 12, // Calculate actual %
      netProfit,
      profitGrowth: 8,
      totalOrders,
      ordersGrowth: 15,
      avgRating,
      maxRating: 5
    };
  }
  
  async getTopDishes(chefId: string, limit: number = 5) {
    const orders = await prisma.order.findMany({
      where: {
        chefId,
        status: { not: 'CANCELLED' }
      },
      include: {
        items: {
          include: { menuItem: true }
        }
      }
    });
    
    // Aggregate sales by dish
    const dishSales = new Map<string, { name: string; count: number }>();
    
    for (const order of orders) {
      for (const item of order.items) {
        const current = dishSales.get(item.menuItemId) || {
          name: item.menuItem.name,
          count: 0
        };
        current.count += item.quantity;
        dishSales.set(item.menuItemId, current);
      }
    }
    
    // Sort and limit
    const sorted = Array.from(dishSales.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    const maxSales = sorted[0]?.count || 1;
    
    return sorted.map(dish => ({
      name: dish.name,
      sales: dish.count,
      percentage: (dish.count / maxSales) * 100
    }));
  }
}
```

#### 7.2 AI Sentiment Analysis
```typescript
// src/services/ai-sentiment.service.ts
export class SentimentAnalysisService {
  
  async analyzeReviews(chefId: string) {
    const reviews = await prisma.menuItemReview.findMany({
      where: {
        menuItem: { chefId }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    // Extract keywords (basic implementation)
    // In production, use NLP libraries or OpenAI API
    
    const positive: string[] = [];
    const negative: string[] = [];
    
    const positiveKeywords = [
      'delicious', 'tasty', 'fresh', 'authentic',
      'perfect', 'amazing', 'excellent', 'great'
    ];
    
    const negativeKeywords = [
      'cold', 'late', 'salty', 'bland',
      'bad', 'poor', 'disappointing', 'overpriced'
    ];
    
    for (const review of reviews) {
      const text = review.text.toLowerCase();
      
      for (const keyword of positiveKeywords) {
        if (text.includes(keyword) && !positive.includes(keyword)) {
          positive.push(keyword);
        }
      }
      
      for (const keyword of negativeKeywords) {
        if (text.includes(keyword) && !negative.includes(keyword)) {
          negative.push(keyword);
        }
      }
    }
    
    return { positive, negative };
  }
  
  async generateInsights(chefId: string) {
    // AI-generated actionable insights
    // Use OpenAI API or rule-based system
    
    const insights = [
      {
        id: '1',
        title: 'Increase Beef Bhuna Price',
        description: 'Your Beef Bhuna is priced 15% below market average. Consider raising to ৳420.',
        impact: 'high' as const,
        action: 'adjust_price'
      },
      {
        id: '2',
        title: 'Stock More Chicken',
        description: 'Chicken dishes sell 30% faster. Increase inventory to meet demand.',
        impact: 'medium' as const,
        action: 'increase_stock'
      }
    ];
    
    return insights;
  }
}
```

---

### Phase 8: Subscriptions (Week 8-9)

#### 8.1 Create Subscription Plan
```typescript
// src/app/api/chef/subscriptions/route.ts
export const POST = withChefAuth(async (req, context, chef) => {
  const data = await req.json();
  
  const plan = await prisma.subscriptionPlan.create({
    data: {
      chefId: chef.id,
      name: data.name,
      description: data.description,
      price: data.price,
      mealsPerDay: data.mealsPerDay,
      servingsPerMeal: data.servingsPerMeal,
      schedule: data.schedule, // JSON
      isActive: true
    }
  });
  
  return Response.json(plan, { status: 201 });
});
```

#### 8.2 Subscription Metrics
```typescript
// src/app/api/chef/subscriptions/metrics/route.ts
export const GET = withChefAuth(async (req, context, chef) => {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { chefId: chef.id },
    include: {
      subscribers: {
        where: { isActive: true }
      }
    }
  });
  
  const totalSubscribers = plans.reduce(
    (sum, p) => sum + p.subscribers.length,
    0
  );
  
  const totalRevenue = plans.reduce(
    (sum, p) => sum + (p.price * p.subscribers.length),
    0
  );
  
  const activePlans = plans.filter(p => p.isActive).length;
  
  return Response.json({
    totalSubscribers,
    totalRevenue,
    activePlans,
    totalPlans: plans.length
  });
});
```

---

### Phase 9: Settings & Profile (Week 9)

#### 9.1 Update Operating Hours
```typescript
// src/app/api/chef/settings/operating-hours/route.ts
export const PUT = withChefAuth(async (req, context, chef) => {
  const { operatingHours } = await req.json();
  
  await prisma.chef.update({
    where: { id: chef.id },
    data: { operatingHours } // JSON
  });
  
  return Response.json({ success: true });
});
```

#### 9.2 Verification Status
```typescript
// src/app/api/chef/settings/verification/route.ts
export const GET = withChefAuth(async (req, context, chef) => {
  const chefData = await prisma.chef.findUnique({
    where: { id: chef.id },
    select: {
      verificationStatus: true,
      tradeLicense: true,
      nidNumber: true,
      isVerified: true
    }
  });
  
  return Response.json(chefData);
});
```

---

### Phase 10: Real-time Features (Week 10)

#### 10.1 WebSocket Setup
```typescript
// src/lib/socket/server.ts
import { Server } from 'socket.io';

export function setupSocketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Chef subscribes to their room
    socket.on('subscribe:chef', (chefId) => {
      socket.join(`chef:${chefId}`);
    });
    
    // Order updates
    socket.on('order:new', (data) => {
      io.to(`chef:${data.chefId}`).emit('order:received', data);
    });
    
    // Inventory alerts
    socket.on('inventory:low', (data) => {
      io.to(`chef:${data.chefId}`).emit('inventory:alert', data);
    });
  });
  
  return io;
}
```

---

## Technical Architecture

### Frontend Architecture

#### State Management
```typescript
// Use Zustand for global state
import create from 'zustand';

interface ChefStore {
  isKitchenOpen: boolean;
  notifications: Notification[];
  activeOrders: number;
  
  setKitchenStatus: (status: boolean) => void;
  addNotification: (notif: Notification) => void;
  updateActiveOrders: (count: number) => void;
}

export const useChefStore = create<ChefStore>((set) => ({
  isKitchenOpen: true,
  notifications: [],
  activeOrders: 0,
  
  setKitchenStatus: (status) => set({ isKitchenOpen: status }),
  addNotification: (notif) => set((state) => ({
    notifications: [notif, ...state.notifications]
  })),
  updateActiveOrders: (count) => set({ activeOrders: count })
}));
```

#### API Client
```typescript
// src/lib/api/chef-api.ts
export class ChefAPI {
  private baseURL = '/api/chef';
  
  async getMetrics() {
    const res = await fetch(`${this.baseURL}/dashboard/metrics`);
    return res.json();
  }
  
  async updateKitchenStatus(isOpen: boolean) {
    const res = await fetch(`${this.baseURL}/dashboard/kitchen-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen })
    });
    return res.json();
  }
  
  // ... more methods
}

export const chefAPI = new ChefAPI();
```

---

### Backend Architecture

#### Service Layer Pattern
```
src/
├── services/
│   ├── analytics.service.ts
│   ├── inventory-forecast.service.ts
│   ├── sentiment-analysis.service.ts
│   ├── order-management.service.ts
│   └── subscription.service.ts
├── lib/
│   ├── prisma/
│   ├── auth/
│   └── utils/
└── app/
    └── api/
        └── chef/
```

#### Error Handling
```typescript
// src/lib/api/error-handler.ts
export class APIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(error: any) {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }
  
  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

### Performance Optimizations

#### 1. Database Indexing
```prisma
model Order {
  // ... fields
  
  @@index([chefId, status])
  @@index([chefId, createdAt])
}

model MenuItem {
  @@index([chefId, isAvailable])
}

model InventoryItem {
  @@index([chefId])
}
```

#### 2. Caching Strategy
```typescript
// Use Redis for caching
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache dashboard metrics for 5 minutes
export async function getCachedMetrics(chefId: string) {
  const cached = await redis.get(`metrics:${chefId}`);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const metrics = await calculateMetrics(chefId);
  await redis.setex(`metrics:${chefId}`, 300, JSON.stringify(metrics));
  
  return metrics;
}
```

#### 3. Query Optimization
```typescript
// Use Prisma's include carefully
// Bad - over-fetching
const orders = await prisma.order.findMany({
  include: {
    items: {
      include: {
        menuItem: {
          include: {
            ingredients: true,
            reviews: true
          }
        }
      }
    }
  }
});

// Good - fetch only what's needed
const orders = await prisma.order.findMany({
  select: {
    id: true,
    orderNumber: true,
    status: true,
    items: {
      select: {
        quantity: true,
        menuItem: {
          select: {
            name: true,
            currentPrice: true
          }
        }
      }
    }
  }
});
```

---

### Testing Strategy

#### Unit Tests
```typescript
// __tests__/services/inventory-forecast.test.ts
import { InventoryForecastService } from '@/services/inventory-forecast.service';

describe('InventoryForecastService', () => {
  it('should calculate order demand correctly', async () => {
    const service = new InventoryForecastService();
    const demand = await service.calculateOrderDemand('chef-id');
    
    expect(demand.get('Chicken')).toBe(5);
  });
  
  it('should generate shopping list', async () => {
    const service = new InventoryForecastService();
    const list = await service.generateShoppingList('chef-id');
    
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('toBuy');
  });
});
```

#### Integration Tests
```typescript
// __tests__/api/menu.test.ts
import { POST } from '@/app/api/chef/menu/route';

describe('Menu API', () => {
  it('should create a menu item', async () => {
    const req = new Request('http://localhost/api/chef/menu', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Dish',
        category: 'Rice',
        currentPrice: 150
      })
    });
    
    const res = await POST(req);
    const data = await res.json();
    
    expect(res.status).toBe(201);
    expect(data.name).toBe('Test Dish');
  });
});
```

---

### Deployment Checklist

#### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-domain.com"

# Redis (optional)
REDIS_URL="redis://..."

# Socket.io (optional)
SOCKET_URL="wss://your-domain.com"

# AI Services (optional)
OPENAI_API_KEY="..."

# File Upload
CLOUDINARY_URL="..."
```

#### Build & Deploy
```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. Build Next.js
npm run build

# 5. Start production server
npm start
```

---

## Additional Features (Future Enhancements)

### 1. Mobile App
- React Native app for chefs
- Push notifications
- Offline order queue

### 2. Advanced Analytics
- ML-based demand prediction
- Customer segmentation
- Churn prediction

### 3. Integration APIs
- Payment gateways (Bkash, Nagad, Rocket)
- Delivery partners
- Accounting software

### 4. Gamification
- Chef badges and achievements
- Leaderboards
- Referral program

### 5. Multi-kitchen Support
- Manage multiple locations
- Centralized inventory
- Cross-kitchen analytics

---

## Support & Documentation

### API Documentation
- Use Swagger/OpenAPI for API docs
- Auto-generate from route handlers
- Include examples and schemas

### Developer Guide
- Setup instructions
- Architecture overview
- Contributing guidelines

### User Manual
- Chef onboarding guide
- Feature tutorials
- Troubleshooting FAQs

---

## Conclusion

This PRD provides a comprehensive blueprint for implementing the Chef Portal of Ghorer Khabar. The system is designed to be scalable, maintainable, and feature-rich, empowering home chefs to efficiently manage their food businesses.

### Next Steps
1. Review and approve PRD
2. Set up development environment
3. Begin Phase 1 implementation
4. Iterate based on feedback
5. Launch MVP with core features

### Success Metrics
- Chef onboarding rate
- Average orders processed per chef
- Kitchen uptime percentage
- Average KRI score
- Subscription plan adoption rate

---

**Document Version:** 1.0  
**Last Updated:** January 12, 2026  
**Author:** Development Team  
**Status:** Ready for Implementation

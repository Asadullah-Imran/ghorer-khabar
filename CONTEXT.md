# Ghorer Khabar - Complete Codebase Context for LLM

## PROJECT OVERVIEW

**Ghorer Khabar** is a Next.js-based home food delivery marketplace platform that connects health-conscious students and professionals with verified home chefs for authentic, transparently prepared meals. It's built with a modern tech stack focusing on user experience and trust.

---

## TECH STACK & CONFIGURATION

### Core Technologies
- **Framework**: Next.js 16.1.1 with App Router (React 19.2.3)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 (with Forms plugin)
- **UI Components**: Lucide React icons (v0.562.0)
- **Compiler**: React Compiler (Babel plugin enabled)

### Development Setup
- **Node Package Manager**: npm
- **Linting**: ESLint 9 with Next.js config
- **Image Optimization**: Next.js Image component with external image sources from Unsplash and Gravatar
- **Font**: Plus Jakarta Sans (Google Fonts, weights 200-800)

### Key Configuration Files
- **tsconfig.json**: Strict mode enabled, ES2017 target, path aliases `@/*` → `./src/*`
- **next.config.ts**: React compiler enabled, external image remotePatterns for Unsplash and Gravatar
- **tailwind.config**: Uses Tailwind CSS 4 with PostCSS

---

## PROJECT STRUCTURE

```
src/
├── app/
│   ├── globals.css                    # Global Tailwind styles
│   ├── layout.tsx                     # Root layout (Plus Jakarta Sans font)
│   ├── (marketing)/                   # Landing page group (layout with Navbar + Footer)
│   │   ├── layout.tsx
│   │   └── page.tsx                   # Hero with multiple sections
│   └── (main)/                        # Main app group (layout with simple Navbar)
│       ├── layout.tsx
│       ├── cart/
│       │   └── page.tsx               # Shopping cart page
│       ├── checkout/
│       │   └── page.tsx               # Checkout form
│       ├── feed/
│       │   └── page.tsx               # Home feed with recommendations
│       ├── explore/
│       │   └── page.tsx               # Browse dishes & kitchens
│       └── dish/[id]/
│           └── page.tsx               # Single dish detail page
├── components/
│   ├── landing/                       # Landing page components
│   │   ├── Hero.tsx                   # Main CTA section
│   │   ├── BuyerSection.tsx           # Benefits for buyers
│   │   ├── SellerSection.tsx          # Benefits for chefs
│   │   ├── FeaturedChefs.tsx          # Chef showcase
│   │   ├── HowItWorks.tsx             # Process explanation
│   │   ├── CTASection.tsx             # Call to action
│   │   ├── TrustBanner.tsx            # Trust badges
│   │   ├── PatternDivider.tsx         # Visual divider
│   │   └── navigation/
│   │       ├── Navbar.tsx             # Landing navbar (mobile aware)
│   │       └── Footer.tsx             # Landing footer
│   ├── navigation/
│   │   └── Navbar.tsx                 # App navbar (desktop + mobile bottom nav)
│   ├── shared/
│   │   ├── DishCard.tsx               # Reusable dish card component
│   │   ├── KitchenCard.tsx            # Kitchen profile card
│   │   └── SectionHeader.tsx          # Section title + link
│   ├── cart/
│   │   └── CartPageContent.tsx        # Client: Cart management logic
│   ├── checkout/
│   │   └── CheckoutPageContent.tsx    # Client: Checkout form
│   ├── dish/
│   │   ├── DishActions.tsx            # Client: Sticky add-to-cart button
│   │   ├── DishGallery.tsx            # Client: Image gallery
│   │   └── IngredientTransparency.tsx # Client: Ingredient details
│   ├── feed/
│   │   └── DishInteractions.tsx       # Client: Add to cart, favorites
│   └── explore/
│       └── FilterTabs.tsx             # Client: Filtering & sorting UI
└── lib/
    └── dummy-data/
        ├── feed.ts                    # WEEKLY_BEST_DISHES, MONTHLY_TOP_KITCHENS, RECOMMENDED_DISHES
        ├── explore.ts                 # ALL_DISHES, ALL_KITCHENS, CATEGORIES
        ├── dish.ts                    # DISH_DETAILS, getDishById()
        ├── cart.ts                    # INITIAL_CART_DATA
        └── checkout.ts                # CHECKOUT_USER_DATA
```

---

## ROUTING & PAGE STRUCTURE

### URL Architecture
```
/                              # Landing page (marketing layout with Navbar + Footer)
├── /feed                      # Main feed (buyer home)
├── /explore                   # Browse dishes & kitchens (filterable)
├── /dish/[id]                 # Single dish detail + reviews
├── /cart                      # Shopping cart
├── /checkout                  # Order confirmation
└── /profile                   # User profile (planned)
```

### Layout Groups
- **(marketing)**: Landing page → includes marketing navbar + footer
- **(main)**: App pages → includes functional navbar (desktop + mobile bottom nav)

---

## DATA MODELS & TYPES

### Dish
```typescript
{
  id: string
  name: string
  price: number
  rating: number
  image: string
  kitchen: string
  deliveryTime: string
  category?: string          // Rice, Beef, Fish, Chicken, Vegetarian
  spiciness?: string         // High, Medium, Mild
  reviewsCount?: number
  reviews?: Review[]
  prepTime?: string
  calories?: string
  description?: string
  ingredients?: Ingredient[]
  images?: string[]          // Multiple images
  chef?: ChefInfo
}
```

### Kitchen
```typescript
{
  id: string
  name: string
  rating: number
  reviews: number
  image: string
  specialty: string
  location?: string
  kri?: number               // Kitchen Reliability Index
  badge?: string
}
```

### CartItem
```typescript
{
  id: string
  name: string
  price: number
  quantity: number
  image: string
  tags?: string[]
  tagColors?: string[]
}
```

### Chef/Kitchen Owner
```typescript
{
  name: string
  id: string
  image: string
  location: string
  badge: string
  kri: number
}
```

---

## KEY FEATURES & FUNCTIONALITY

### 1. Landing Page (Marketing)
- **Hero Section**: Eye-catching CTA with two CTAs (Find a Meal, Open Your Kitchen)
- **Trust Banner**: Badges showing verification, consistency
- **Buyer/Seller Sections**: Benefits explained
- **Featured Chefs**: Showcase top chefs
- **How It Works**: Process flow
- **Responsive Design**: Mobile-first, smooth animations

### 2. Feed Page (/feed)
- **Greeting**: Personalized "Good Afternoon, [Name]" message
- **Weekly Best Dishes**: Horizontal scroll carousel
- **Top Kitchens**: Kitchen showcase cards
- **Recommended For You**: Grid of dishes (2x4 on desktop, responsive on mobile)
- **Load More**: CTA to explore page
- **Client Component**: DishCard with favorite + add-to-cart functionality

### 3. Explore Page (/explore)
- **Tab Switching**: Dishes ↔ Kitchens
- **Category Filtering**: All, Beef, Rice, Fish, Chicken, Vegetarian
- **Sorting**: Recommended, Price (Asc/Desc), Top Rated
- **Search**: Text search via query params (e.g., `?q=bhorta`)
- **Server-Side Filtering**: All filtering logic runs server-side
- **Empty State**: Friendly message when no results
- **Grid Layout**: 1 col mobile, 2 cols tablet, 4 cols desktop

### 4. Dish Detail Page (/dish/[id])
- **Breadcrumbs**: Navigation path
- **Image Gallery**: Multiple images, client-side switching
- **Chef Card**: Kitchen profile with KRI badge
- **Dish Info**: Name, price, prep time, calories
- **Allergen Alert**: Yellow warning box
- **Ingredient Transparency**: Detailed ingredient sourcing
- **Reviews Section**: User reviews with avatars
- **Add to Cart Button**: Sticky action bar (client component)
- **Responsive Layout**: 1 col mobile, 2 cols (7/5 split) desktop

### 5. Cart Page (/cart)
- **Empty State**: When cart is empty
- **Kitchen Header**: Chef info with rating
- **Items List**: Quantity controls (±), remove, tags
- **Price Breakdown**: Subtotal, delivery fee, platform fee
- **Order Summary**: Sticky sidebar on desktop
- **Clear Cart**: Button to empty all items
- **Checkout CTA**: Proceeds to /checkout

### 6. Checkout Page (/checkout)
- **Form Fields**: Name, phone, address, rider notes
- **Payment Method**: Bkash, Nagad, COD (radio buttons)
- **Order Summary**: Item list with images
- **Trust Badges**: Hygienic packaging, verified chefs, freshly cooked
- **Submit**: Order placement with loading state
- **Redirect**: Back to /feed after success

### 7. Navigation
- **Desktop Navbar** (/app/(main)/):
  - Logo + brand name
  - Search bar with live search to /explore
  - "Switch to Chef" button
  - Cart icon (with badge count)
  - Profile avatar
  - Hidden from /, /checkout
  
- **Mobile Bottom Navigation** (/app/(main)/):
  - Home, Explore, Orders, Profile
  - Sticky bottom bar
  - Active link highlighting
  
- **Landing Navbar** (/app/(marketing)/):
  - Logo + links (How It Works, Our Story, Safety, Browse Menu)
  - Log In, Sign Up, Become a Chef buttons

---

## COMPONENT PATTERNS & INTERACTIONS

### Client Components (Use "use client" directive)
- `CartPageContent.tsx` - Cart state management, quantity updates, item removal
- `CheckoutPageContent.tsx` - Form state, submit handler, redirect logic
- `DishActions.tsx` - Add-to-cart sticky button
- `DishGallery.tsx` - Image gallery with thumbnail switching
- `IngredientTransparency.tsx` - Expandable ingredient details
- `DishInteractions.tsx` - AddToCartBtn, FavoriteBtn (event handlers)
- `FilterTabs.tsx` - URL param management for filters/sorts
- `Navbar.tsx` (/navigation/) - Mobile menu toggle, search routing
- `Navbar.tsx` (/landing/navigation/) - Mobile menu toggle

### Server Components (Default in Next.js App Router)
- Page components (`page.tsx`)
- `ExplorePage` - Filtering, sorting logic (server-side)
- `SingleDishPage` - Data fetching via `getDishById()`
- All layout components

### Interaction Patterns
1. **Add to Cart**: Prevents default link navigation, stops propagation, logs action
2. **Favorites**: Toggle local state with Heart icon (filled/unfilled)
3. **Quantity Controls**: Min=1, increment/decrement buttons
4. **Search**: Enter key triggers router.push to /explore with query param
5. **URL Params**: Used to persist filter state (tab, category, sort, query)

---

## STYLING & DESIGN SYSTEM

### Color Palette
- **Primary**: Yellow (`#FEB728` / `primary` / `text-yellow-500`)
- **Secondary Teal**: `#477E77` / `brand-teal` / `teal-600-800`
- **Dark Background**: `brand-dark` / `text-gray-900`
- **Light Background**: `background-light` / `bg-gray-50`
- **Accents**: Red (alerts), Green (success), Orange (warnings)

### Typography
- **Font**: Plus Jakarta Sans (Google Fonts)
- **Weights**: 200-800 (light to black)
- **CSS Variable**: `--font-plus-jakarta`

### Tailwind Utilities
- **Spacing**: py-8, px-4, gap-6, etc.
- **Responsive**: `md:` (768px), `lg:` (1024px) breakpoints
- **Shadows**: `shadow-sm`, `shadow-md`, `shadow-lg`
- **Borders**: `border`, `border-gray-200`, `rounded-xl`, `rounded-full`
- **Transitions**: `transition`, `duration-500`, `hover:scale-105`
- **Flex Layouts**: `flex-col`, `lg:col-span-7`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### Icon System
- **Library**: Lucide React (18-24px typical sizes)
- **Material Symbols**: For some hero CTA icons (Material Design)
- **Fallbacks**: Emoji for empty states

---

## DUMMY DATA STRUCTURE

### feed.ts
- `WEEKLY_BEST_DISHES[]`: 8 dishes with ratings ~4.5-4.9
- `MONTHLY_TOP_KITCHENS[]`: 6 kitchens with specialties
- `RECOMMENDED_DISHES[]`: Personalized recommendations

### explore.ts
- `ALL_DISHES[]`: 13+ dishes with categories (Beef, Rice, Fish, Chicken, Vegetarian)
- `ALL_KITCHENS[]`: Kitchen listings
- `CATEGORIES[]`: Filter options

### dish.ts
- `DISH_DETAILS`: Single dish with full details (chef, ingredients, reviews)
- `getDishById(id)`: Async function (currently returns static data)
- `Ingredient`: {name, icon, detail}
- `Review`: {id, user, date, text, avatar}

### cart.ts
- `INITIAL_CART_DATA`: Kitchen info + 3 cart items with tags

### checkout.ts
- `CHECKOUT_USER_DATA`: User name, phone, address, cart summary

---

## API & STATE MANAGEMENT

### Current State
- **No Backend**: All data is hardcoded/dummy data
- **No Real Authentication**: User data is mocked
- **No Database**: Static TypeScript objects

### State Management Approach
- **React Hooks** (useState) for component-level state
- **Next.js URL Search Params** for persistent filter state (explore page)
- **Next.js Router** for navigation and search redirects

### Future Integration Points
- Replace `getDishById()` with real API call
- Implement user authentication
- Connect to backend for cart/checkout
- Real payment processing

---

## PERFORMANCE OPTIMIZATIONS

1. **React Compiler**: Enabled in `next.config.ts` for automatic memoization
2. **Next.js Image**: Optimized image loading from external CDNs
3. **CSS Optimization**: Tailwind with purging unused styles
4. **Code Splitting**: Route-based with App Router
5. **Scrollbar Hiding**: `.scrollbar-hide` class for horizontal carousels

---

## RESPONSIVE DESIGN STRATEGY

- **Mobile First**: Design starts at small screens
- **Breakpoints**: 
  - Base: 0-640px (mobile)
  - sm: 640px
  - md: 768px
  - lg: 1024px
- **Key Responsive Patterns**:
  - Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
  - Flex stacking: `flex-col md:flex-row`
  - Hidden elements: `hidden md:block`
  - Padding adjustments: `px-4 md:px-10 lg:px-40`

---

## BROWSER & ENVIRONMENT

- **Target**: Modern browsers (ES2017+)
- **Node.js**: Latest LTS recommended
- **External Image Sources**: 
  - Unsplash (photo library)
  - Gravatar (user avatars)

---

## KEY DEVELOPMENT WORKFLOW

1. **Run Dev Server**: `npm run dev` → http://localhost:3000
2. **Build for Production**: `npm run build`
3. **Start Production**: `npm start`
4. **Lint Code**: `npm run lint`

---

## IMPORTANT CONVENTIONS

1. **File Naming**: kebab-case for components (e.g., `CartPageContent.tsx`)
2. **Imports**: Use path alias `@/` instead of relative paths
3. **Client vs Server**: Explicitly mark client components with `"use client"`
4. **Event Handlers**: Stop propagation on buttons inside links to prevent navigation
5. **Image Sizes**: Use `fill` with `object-cover` for dynamic sizing
6. **Error Handling**: Basic error states (e.g., "Dish not found")

---

## FUTURE ROADMAP INDICATORS

- **Planned Routes**: `/profile`, `/orders`, `/kitchen/[id]` (referenced but not implemented)
- **Unimplemented Features**: Kitchen detail page, order history, user reviews submission
- **API Placeholders**: `getDishById()` ready for backend integration
- **Forms**: Checkout form prepared but not connected to real payment processor

---

## QUICK REFERENCE

### Pages Summary
| Route | File | Type | Purpose |
|-------|------|------|---------|
| / | `(marketing)/page.tsx` | Server | Landing page |
| /feed | `(main)/feed/page.tsx` | Server | Home feed |
| /explore | `(main)/explore/page.tsx` | Server | Browse/filter |
| /dish/[id] | `(main)/dish/[id]/page.tsx` | Server | Dish details |
| /cart | `(main)/cart/page.tsx` | Server | Shopping cart |
| /checkout | `(main)/checkout/page.tsx` | Server | Order form |

### Key Components Summary
| Component | Location | Type | Function |
|-----------|----------|------|----------|
| DishCard | `shared/` | Server | Display dish in grid |
| KitchenCard | `shared/` | Server | Display kitchen |
| CartPageContent | `cart/` | Client | Cart management |
| CheckoutPageContent | `checkout/` | Client | Checkout form |
| FilterTabs | `explore/` | Client | Filter UI |
| Navbar | `navigation/` | Client | App navigation |

---

**Last Updated**: January 3, 2026  
**Tech Stack Version**: Next.js 16.1.1, React 19.2.3, TypeScript 5, Tailwind CSS 4

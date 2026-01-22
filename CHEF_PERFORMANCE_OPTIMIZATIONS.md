# Chef Area Performance Optimizations

## Overview
This document outlines the performance optimizations implemented for the chef area to fix slow loading times and unnecessary component re-renders.

## Key Changes

### 1. Custom Hooks with Caching (`src/lib/hooks/`)

#### `useChefDashboard.ts`
- **Caching**: Implements 10-second cache for dashboard metrics and notifications
- **Parallel Fetching**: Fetches metrics and notifications simultaneously
- **Visibility-based Polling**: Only polls when tab is visible (saves resources)
- **Optimistic Updates**: Updates kitchen status immediately without waiting for server response

#### `useChefMenu.ts`
- **Caching**: 5-second cache for menu items
- **Optimistic Updates**: Toggle availability updates UI immediately
- **Batch Operations**: Handles save/delete operations efficiently

#### `useChefOrdersRealtime.ts`
- **Supabase Realtime**: Subscribes to order changes via Supabase Realtime subscriptions
- **Automatic Updates**: Orders update automatically when database changes occur
- **Fallback Polling**: Falls back to polling if realtime fails (only when tab visible)
- **Efficient State Management**: Prevents unnecessary re-renders

### 2. Memoized Components

#### `MenuItemCard.memo.tsx`
- Uses `React.memo` with custom comparison function
- Only re-renders when specific props change (id, name, price, availability, images, ingredients)
- Memoizes expensive calculations (profit margin, ingredient costs)

#### `KanbanColumn.memo.tsx`
- Memoized to prevent re-renders when parent updates
- Custom comparison checks order array length and order IDs/statuses

### 3. Optimized Pages

#### Dashboard (`src/app/(chef)/chef/dashboard/page.tsx`)
- Uses `useChefDashboard` hook instead of manual fetch logic
- Memoized StatCard components
- Memoized data calculations
- Removed console.log statements (production performance)

#### Menu (`src/app/(chef)/chef/menu/page.tsx`)
- Uses `useChefMenu` hook
- Memoized filtered items and stats calculations
- Callbacks wrapped in `useCallback` to prevent re-renders
- Uses memoized MenuItemCard component

#### Orders (`src/app/(chef)/chef/orders/page.tsx`)
- Uses `useChefOrdersRealtime` hook
- Real-time updates via Supabase subscriptions
- Memoized total orders count
- Callbacks wrapped in `useCallback`

## Performance Improvements

### Before:
- ❌ Full page refetch every 30 seconds
- ❌ Sequential API calls (metrics then notifications)
- ❌ All components re-render on any state change
- ❌ No caching - every navigation refetches data
- ❌ Polling continues even when tab is hidden
- ❌ Inline functions cause child re-renders

### After:
- ✅ Smart caching (10s dashboard, 5s menu)
- ✅ Parallel API calls
- ✅ Memoized components prevent unnecessary re-renders
- ✅ Real-time updates via Supabase (no polling needed)
- ✅ Visibility-based polling (only when tab visible)
- ✅ Stable callbacks prevent child re-renders

## Real-time Features

### Orders
- **Supabase Realtime Subscription**: Automatically updates when orders change
- **Channel**: `chef-orders-{kitchenId}`
- **Events**: INSERT, UPDATE, DELETE on `orders` table
- **Filter**: `kitchen_id=eq.{kitchenId}`

### Notifications (Future Enhancement)
- Can be extended to use Supabase Realtime for notifications
- Currently uses polling with caching

## Database Considerations

The optimizations work with your existing Prisma schema:
- `Order` table with `kitchenId` foreign key
- `Notification` table with `kitchenId` foreign key
- `menu_items` table with `chef_id` foreign key

## Supabase Realtime Setup

To enable realtime subscriptions, ensure:
1. Supabase Realtime is enabled for your project
2. Row Level Security (RLS) policies allow subscriptions
3. The `orders` table has realtime enabled in Supabase dashboard

### Enable Realtime in Supabase:
```sql
-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Ensure RLS policies allow chef to see their orders
CREATE POLICY "Chefs can view their own orders"
ON orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM kitchens
    WHERE kitchens.id = orders.kitchen_id
    AND kitchens.seller_id = auth.uid()
  )
);
```

## Usage

### Dashboard
```tsx
const { dashboardData, notifications, loading, updateKitchenStatus } = useChefDashboard();
```

### Menu
```tsx
const { menuItems, loading, saveMenuItem, deleteMenuItem, toggleAvailability } = useChefMenu();
```

### Orders (with Realtime)
```tsx
const { orders, loading, moveOrder, rejectOrder } = useChefOrdersRealtime();
```

## Future Enhancements

1. **React Query Integration**: Consider migrating to `@tanstack/react-query` for more advanced caching and synchronization
2. **WebSocket for Notifications**: Replace polling with WebSocket for instant notifications
3. **Optimistic Updates**: Add optimistic updates for all mutations
4. **Virtual Scrolling**: For large menu lists (100+ items)
5. **Image Lazy Loading**: Lazy load menu item images

## Testing

To verify improvements:
1. Open browser DevTools → Performance tab
2. Record while navigating chef pages
3. Check for:
   - Reduced re-renders (React DevTools Profiler)
   - Faster initial load times
   - Reduced network requests (Network tab)
   - Smooth real-time updates (no page refresh needed)

## Notes

- Cache durations can be adjusted in hook files (`CACHE_DURATION`, `MENU_CACHE_DURATION`)
- Realtime subscriptions automatically clean up on unmount
- Polling intervals respect document visibility API
- All hooks handle errors gracefully with fallback states

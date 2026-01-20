# Admin Process Overview

This document summarizes the admin experience: key pages, components, APIs, and where each is used.

## Entry & Auth
- Admin login: [/admin-login](admin-login) (uses Supabase/JWT via `getAuthUserId` and server actions)
- Redirects: admins hitting buyer/seller app routes are redirected to [/admin/dashboard](admin/dashboard) in [src/app/(main)/layout.tsx](../src/app/(main)/layout.tsx)

## Layout & Shared UI
- Admin header/nav: [src/components/admin/AdminHeader.tsx](../src/components/admin/AdminHeader.tsx)
- Confirmation dialogs: [src/contexts/ConfirmationContext.tsx](../src/contexts/ConfirmationContext.tsx)
- Icons: lucide-react

## Core Admin Pages
- Dashboard: [src/app/(admin)/admin/dashboard/page.tsx](../src/app/(admin)/admin/dashboard/page.tsx)
- Users: [src/app/(admin)/admin/users/page.tsx](../src/app/(admin)/admin/users/page.tsx)
  - Buyer export: GET /api/user/export-orders?buyerId=USER_ID
  - Seller export: GET /api/admin/export/seller?sellerId=KITCHEN_ID (kitchen is fetched via /api/admin/kitchens?sellerId=USER_ID)
- Orders: [src/app/(admin)/admin/orders/page.tsx](../src/app/(admin)/admin/orders/page.tsx)
- Menu management: [src/app/(admin)/admin/menu/page.tsx](../src/app/(admin)/admin/menu/page.tsx)
- Settings: [src/app/(admin)/admin/settings/page.tsx](../src/app/(admin)/admin/settings/page.tsx)
- Support: [src/app/(admin)/admin/support/page.tsx](../src/app/(admin)/admin/support/page.tsx)
- Onboarding: [src/app/(admin)/admin/onboarding/page.tsx](../src/app/(admin)/admin/onboarding/page.tsx)

## Key Admin APIs
- Users listing/filtering/top: [src/app/api/admin/users/route.ts](../src/app/api/admin/users/route.ts)
- Kitchens listing/filtering: [src/app/api/admin/kitchens/route.ts](../src/app/api/admin/kitchens/route.ts)
- Orders: [src/app/api/admin/orders/route.ts](../src/app/api/admin/orders/route.ts)
- Revenue/stats: [src/app/api/admin/revenue/route.ts](../src/app/api/admin/revenue/route.ts) and [src/app/api/admin/stats/route.ts](../src/app/api/admin/stats/route.ts)
- Notifications: [src/app/api/admin/notifications/*](../src/app/api/admin/notifications)
- Support tickets: [src/app/api/admin/support/route.ts](../src/app/api/admin/support/route.ts)
- Exports: buyer [src/app/api/user/export-orders/route.ts](../src/app/api/user/export-orders/route.ts), seller [src/app/api/admin/export/seller/route.ts](../src/app/api/admin/export/seller/route.ts)

## Notable Components/Flows
- User modals/actions: in [users page](../src/app/(admin)/admin/users/page.tsx)
- Export handlers: buyer/seller CSV logic inside [export routes](../src/app/api/user/export-orders/route.ts) and [../src/app/api/admin/export/seller/route.ts](../src/app/api/admin/export/seller/route.ts)
- Onboarding approvals/rejections: [src/app/api/admin/kitchens/route.ts](../src/app/api/admin/kitchens/route.ts) (sends approval/rejection emails)
- Auth guard for admin area: [src/components/auth/AdminGuard.tsx](../src/components/auth/AdminGuard.tsx) (if present in project)

## Data Notes
- Users table: role governs access (ADMIN | SELLER | BUYER)
- Kitchens: linked to seller; verification and onboarding flags drive redirects and admin approval
- Orders: linked to kitchen and buyer; exports leverage order items to show quantities and items sold

## How to Extend
- Add a new admin page under `src/app/(admin)/admin/{page}/page.tsx` and link from admin nav
- Expose data via `/api/admin/{resource}`; reuse `getAuthUserId` and admin role check
- For exports, follow the CSV helpers in the existing export routes and include required relations in Prisma queries

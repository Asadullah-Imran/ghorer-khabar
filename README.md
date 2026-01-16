# Ghorer Khabar

Home-cooked meal marketplace that connects health-conscious students and professionals with verified home chefs. Built with Next.js 16 (App Router), React 19, Tailwind CSS 4, Prisma, and Supabase.

## Highlights
- Landing experience with hero, trust banners, and buyer/chef benefit sections.
- Buyer app: feed, explore, dish detail with ingredient transparency, favorites, cart, and checkout flows.
- Rich kitchen and menu data model (chefs, menu items, subscriptions, orders, notifications) defined in Prisma.
- Mobile-first UI with responsive grids, carousels, sticky CTAs, and optimized images from remote sources.
- Supabase Auth helpers and email utilities (SMTP) ready for authentication, verification, and OTP flows.

## Tech Stack
- Framework: Next.js 16.1 (App Router) + React 19
- Language: TypeScript 5
- Styling: Tailwind CSS 4, Plus Jakarta Sans
- Data: Prisma ORM (PostgreSQL), Zod validation
- Auth/Storage: Supabase (browser/server/admin clients), JWT utilities
- State/UX: Zustand, Lucide icons, Recharts, Leaflet

## Project Layout
- `src/app/(marketing)` – Landing page with marketing navbar/footer
- `src/app/(main)` – App shell (feed, explore, dish/[id], cart, checkout)
- `src/components` – Reusable UI (cards, navigation, dish gallery/actions, filters, cart/checkout forms)
- `src/lib/dummy-data` – Static data powering current UI
- `src/lib/supabase` – Browser, server, and admin Supabase clients
- `src/lib/auth` – JWT/session helpers
- `prisma` – Schema, migrations, and seeds; generated client in `generated/prisma`

## Getting Started
1) Install dependencies
```bash
npm install
```

2) Create environment file `.env.local`
Populate the variables listed below.

3) Generate client + apply migrations
```bash
npx prisma generate
npx prisma migrate dev
```

4) Seed optional sample data
```bash
npm run seed:menu
npm run seed:subscriptions
```

5) Run the app
```bash
npm run dev
# http://localhost:3000
```

## Environment Variables
Set these in `.env.local` (or your deployment environment):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d
COOKIE_NAME=auth_token
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=app-password
```

Optional/dev helpers:
- `TEMP_KITCHEN_ID` – fallback kitchen id for debug seed routes.

## Scripts
- `npm run dev` – Start the Next.js dev server
- `npm run build` – Production build
- `npm run start` – Start the production build
- `npm run lint` – Run ESLint
- `npm run seed:menu` – Seed menu dishes
- `npm run seed:subscriptions` – Seed subscription plans

## Documentation
- Product and flows: `CONTEXT.md`, `AUTHENTICATION_FLOW.md`, `CHEF_MENU_FLOW.md`, `CHEF_ONBOARDING_SETUP.md`
- Supabase setup: `SUPABASE_STORAGE_SETUP.md`, `setup-avatars-bucket.sql`, `supabase-storage-setup.sql`
- Database: `prisma/schema.prisma`, migrations under `prisma/migrations`

## Status & Next Steps
- UI uses static data; hook up API/DB calls to replace dummy data and wire Supabase auth.
- Configure SMTP and app URL to enable verification/reset emails.
- Integrate kitchen/menu CRUD and ordering against the Prisma/PostgreSQL database.

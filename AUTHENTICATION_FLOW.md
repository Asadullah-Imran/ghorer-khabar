# Authentication System - Complete Flow Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication Methods](#authentication-methods)
3. [Database Schema](#database-schema)
4. [Registration Flows](#registration-flows)
5. [Login Flows](#login-flows)
6. [Logout Flow](#logout-flow)
7. [Session Management](#session-management)
8. [Route Protection](#route-protection)
9. [Data Flow Architecture](#data-flow-architecture)
10. [Security Features](#security-features)
11. [Technical Implementation](#technical-implementation)

---

## System Overview

This application implements a **dual authentication system** that supports:

- **Google OAuth** (via Supabase)
- **Email/Password** (manual registration with email verification)

### Key Features

- ✅ Single user database (no duplicate tables)
- ✅ Hybrid session management (Supabase + JWT)
- ✅ Email verification for manual signups
- ✅ 30-day persistent sessions
- ✅ Client-side route protection
- ✅ Automatic session refresh

---

## Authentication Methods

### Method 1: Google OAuth (Supabase)

- **Provider**: Supabase Auth
- **Session Storage**: HTTP-only cookies (Supabase managed)
- **Duration**: 30 days
- **Verification**: Automatic (Google pre-verified)

### Method 2: Email/Password (Manual)

- **Provider**: Custom implementation
- **Session Storage**: JWT in HTTP-only cookie (`auth_token`)
- **Duration**: 30 days
- **Verification**: Email link verification required

---

## Database Schema

### User Table (`users`)

```sql
model User {
  id        String   @id              // UUID for email users, Google ID for OAuth
  name      String?
  email     String   @unique
  password  String?                   // NULL for OAuth users
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  role      Role     @default(BUYER)  // BUYER | SELLER | ADMIN

  // Email Verification (for email/password signup)
  emailVerified      Boolean   @default(false)
  verificationToken  String?   @unique
  verificationExpiry DateTime?

  // OAuth Fields
  authProvider AuthProvider @default(EMAIL)  // EMAIL | GOOGLE
  providerId   String?                       // Google user ID
  avatar       String?                       // Profile picture URL

  // Password Reset Fields
  resetToken       String?   @unique
  resetTokenExpiry DateTime?

  @@map("users")
}
```

### Key Fields Explained

| Field               | Purpose                   | Used By                                     |
| ------------------- | ------------------------- | ------------------------------------------- |
| `id`                | User identifier           | Both (UUID for email, Google ID for OAuth)  |
| `password`          | Hashed password           | Email/Password only (NULL for OAuth)        |
| `emailVerified`     | Email confirmation status | Email/Password (always true for OAuth)      |
| `verificationToken` | Email verification token  | Email/Password (auto-deleted after use)     |
| `authProvider`      | Authentication method     | Both (EMAIL or GOOGLE)                      |
| `providerId`        | OAuth provider ID         | Google OAuth only                           |
| `avatar`            | Profile picture           | Google OAuth (can be added for email users) |

---

## Registration Flows

### Flow 1: Google OAuth Registration

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google" button                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend: Redirect to Google OAuth (Supabase)           │
│    Location: src/app/(authPages)/register/page.tsx         │
│    Function: handleGoogleLogin()                            │
│    Code:                                                    │
│    const roleQuery = formData.role.toLowerCase();          │
│    supabase.auth.signInWithOAuth({                         │
│      provider: 'google',                                   │
│      redirectTo: '/api/auth/callback?role=${roleQuery}'   │
│    })                                                       │
│    Note: Role (BUYER/SELLER) passed as query param         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Google: User authenticates with Google account          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Supabase: Creates/updates Supabase Auth user            │
│    - Stores user in Supabase Auth system                   │
│    - Generates session tokens                              │
│    - Sets HTTP-only cookies (30 days)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend: OAuth Callback Handler                         │
│    Location: src/app/api/auth/callback/route.ts            │
│    Process:                                                 │
│    a) Exchange code for session                            │
│    b) Extract role from URL query parameter                │
│    c) Extract user data from Google:                       │
│       - email                                               │
│       - full_name                                           │
│       - avatar_url                                          │
│       - user ID (providerId)                                │
│    d) Determine role priority:                             │
│       1. URL param (?role=seller)                          │
│       2. user_metadata.role (if exists)                    │
│       3. Default to BUYER                                  │
│    e) Call handleOAuthUser() with determined role          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Database: Save/Update User                              │
│    Location: src/services/authService.ts                   │
│    Function: handleOAuthUser()                             │
│    SQL: INSERT or UPDATE users table                       │
│    Data saved:                                              │
│    {                                                        │
│      id: Google ID,                                         │
│      email: user@gmail.com,                                 │
│      name: "John Doe",                                      │
│      role: "BUYER" or "SELLER" (from URL param),           │
│      authProvider: 'GOOGLE',                                │
│      providerId: Google ID,                                 │
│      avatar: "https://lh3.googleusercontent.com/...",       │
│      emailVerified: true,  // Auto-verified                 │
│      password: null        // No password for OAuth         │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirect: User sent to /feed page                       │
│    Status: Logged in with 30-day session                   │
└─────────────────────────────────────────────────────────────┘
```

**Where Data is Stored (OAuth):**

1. **Supabase Auth System**: Session tokens, refresh tokens
2. **Browser Cookies**: `sb-<project>-auth-token` (HTTP-only, 30 days)
3. **PostgreSQL (users table)**: User profile data

---

### Flow 2: Email/Password Registration

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User fills registration form                            │
│    - Name: "John Doe"                                       │
│    - Email: "john@example.com"                              │
│    - Password: "SecurePass123"                              │
│    - Role: BUYER (default)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend: Submit registration                           │
│    Location: src/app/(authPages)/register/page.tsx         │
│    API Call: POST /api/auth/register                       │
│    Body: { email, password, name, role }                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend: Registration API                               │
│    Location: src/app/api/auth/register/route.ts            │
│    Validation:                                              │
│    - Email format check                                     │
│    - Password length (min 8 chars)                          │
│    - Name required                                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Service: Registration Logic                             │
│    Location: src/services/authService.ts                   │
│    Function: registerWithEmail()                           │
│    Process:                                                 │
│    a) Check if email already exists                        │
│    b) Hash password with bcrypt (10 rounds)                │
│    c) Generate random verification token (32 bytes)        │
│    d) Set token expiry (24 hours from now)                 │
│    e) Generate UUID for user ID                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Database: Create User Record                            │
│    SQL: INSERT INTO users                                   │
│    Data saved:                                              │
│    {                                                        │
│      id: "uuid-v4-random",                                  │
│      email: "john@example.com",                             │
│      password: "$2b$10$hashed...",  // bcrypt hash          │
│      name: "John Doe",                                      │
│      role: "BUYER",                                         │
│      authProvider: 'EMAIL',                                 │
│      emailVerified: false,  // Not yet verified             │
│      verificationToken: "32-byte-hex-string",               │
│      verificationExpiry: "2026-01-13T12:00:00Z"             │
│    }                                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Email Service: Send Verification Email                  │
│    Location: src/lib/email/emailService.ts                 │
│    Function: sendVerificationEmail()                       │
│    Email Provider: Nodemailer (SMTP)                       │
│    Email Content:                                           │
│    - Subject: "Verify Your Email - Ghorer Khabar"          │
│    - Body: HTML template with verification link            │
│    - Link: /api/auth/verify-email?token=xxx                │
│    SMTP Configuration:                                      │
│    - Host: smtp.gmail.com                                   │
│    - Port: 587                                              │
│    - Auth: SMTP_USER, SMTP_PASS from .env                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. User receives email and clicks verification link        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Backend: Email Verification API                         │
│    Location: src/app/api/auth/verify-email/route.ts        │
│    Method: GET                                              │
│    Query Param: ?token=xxx                                  │
│    Process:                                                 │
│    a) Find user by verificationToken                       │
│    b) Check token not expired                              │
│    c) Check email not already verified                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Database: Update User as Verified                       │
│    SQL: UPDATE users                                        │
│    SET emailVerified = true,                                │
│        verificationToken = null,                            │
│        verificationExpiry = null                            │
│    WHERE verificationToken = 'xxx'                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Redirect: User sent to login page                      │
│     URL: /login?verified=true&email=john@example.com       │
│     Message: "Email verified! Please log in"               │
└─────────────────────────────────────────────────────────────┘
```

**Where Data is Stored (Email/Password):**

1. **PostgreSQL (users table)**: All user data including hashed password
2. **Email Inbox**: Verification link (temporary, 24 hours)
3. **Browser Cookies**: None yet (until login)

---

## Login Flows

### Flow 1: Google OAuth Login

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Sign in with Google"                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Same as Google OAuth Registration Flow                  │
│    (Steps 2-7 from registration)                            │
│    Note: If user exists, updates instead of creates        │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 2: Email/Password Login

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters credentials                                 │
│    - Email: "john@example.com"                              │
│    - Password: "SecurePass123"                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend: Submit login                                  │
│    Location: src/app/(authPages)/login/page.tsx            │
│    API Call: POST /api/auth/login                          │
│    Body: { email, password }                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend: Login API                                      │
│    Location: src/app/api/auth/login/route.ts               │
│    Validation: Zod schema (loginSchema)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Service: Login Logic                                    │
│    Location: src/services/auth.service.ts                  │
│    Function: loginUser()                                   │
│    Process:                                                 │
│    a) Find user by email in database                       │
│    b) Check user exists                                    │
│    c) Check user has password (not OAuth user)             │
│    d) Compare password with bcrypt                         │
│    e) Check if emailVerified = true                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. If emailVerified = false                                │
│    Return 403: "Please verify your email before logging in"│
└─────────────────────────────────────────────────────────────┘
                     │
                     │ emailVerified = true
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. JWT: Generate Access Token                              │
│    Location: src/lib/auth/jwt.ts                           │
│    Function: signToken()                                   │
│    Payload: { userId: user.id }                            │
│    Secret: JWT_SECRET from .env                            │
│    Expiry: 30 days                                          │
│    Algorithm: HS256                                         │
│    Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Backend: Set HTTP-only Cookie                           │
│    Cookie Name: auth_token                                  │
│    Cookie Value: JWT token                                  │
│    Options:                                                 │
│    - httpOnly: true  (JS cannot access)                    │
│    - secure: true in production                            │
│    - sameSite: 'lax'                                       │
│    - maxAge: 30 days (60*60*24*30 seconds)                 │
│    - path: '/'                                             │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Response: Success                                        │
│    Status: 200                                              │
│    Body: { message: "Login successful", user: {...} }      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Frontend: Wait 500ms for cookie to set                  │
│    Code: await new Promise(resolve => setTimeout(...))     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Frontend: Full page reload to /feed                    │
│     Code: window.location.href = '/feed'                   │
│     Purpose: Let AuthContext pick up new session           │
└─────────────────────────────────────────────────────────────┘
```

**Where Data is Stored (After Login):**

1. **Browser Cookies**: `auth_token` (JWT, HTTP-only, 30 days)
2. **Browser Memory**: None (no localStorage/sessionStorage)
3. **Server**: No session storage (stateless JWT)

---

## Logout Flow

### Universal Logout (Works for Both Auth Methods)

The logout flow is designed to handle both Google OAuth and Email/Password users seamlessly:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clicks "Logout" button                             │
│    Locations: Profile page, Chef navbar, Admin sidebar     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend: Loading State Activated                       │
│    Location: Component state (isLoggingOut = true)         │
│    UI Changes:                                              │
│    - Button shows spinner (Loader2 component)               │
│    - Button text: "Logging out..."                         │
│    - Button disabled to prevent double-clicks              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Frontend: Call signOut() from AuthContext               │
│    Location: src/contexts/AuthContext.tsx                  │
│    Function: signOut()                                     │
│    Code: await signOut()                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. AuthContext: Set Loading State                          │
│    Code: setLoading(true)                                  │
│    Purpose: Prevent UI flashes during logout               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Backend API Call: POST /api/auth/logout                 │
│    Location: src/app/api/auth/logout/route.ts              │
│    Method: POST                                             │
│    Process:                                                 │
│    a) Get cookie store                                      │
│    b) Create Supabase server client                        │
│    c) Delete JWT cookie: auth_token                        │
│    d) Call Supabase signOut() (clears OAuth cookies)       │
│    e) Return success response                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Cookies Cleared on Server                               │
│    For OAuth users:                                         │
│    - sb-<project>-auth-token (deleted by Supabase)         │
│    - All Supabase session cookies removed                  │
│                                                             │
│    For Email/Password users:                                │
│    - auth_token cookie deleted                             │
│                                                             │
│    Result: No valid session cookies remain                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. AuthContext: Clear Local State                          │
│    Code:                                                    │
│    - setUser(null)                                          │
│    - setLoading(false)                                      │
│    Console log: "User signed out successfully"            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Frontend: Redirect to Login                             │
│    Code: router.push('/login')                              │
│    Result: User sent to login page                         │
│    Status: Fully logged out ✅                              │
└─────────────────────────────────────────────────────────────┘
```

### Logout Implementation Details

**Frontend Components with Logout:**

1. **Profile Page** (`src/components/profile/ProfileHeader.tsx`)

   - Red "Logout" button with icon
   - Shows loading spinner during logout
   - Button disabled while processing

2. **Chef Navbar** (`src/components/chef/Navigation/Navbar.tsx`)

   - Desktop: Dropdown menu with logout option
   - Mobile: Bottom menu with logout button
   - Both show loading state

3. **Admin Sidebar** (`src/components/admin/AdminSidebar.tsx`)
   - Logout button in profile card at bottom
   - Shows admin user info above button
   - Red-themed button with loading state

**Error Handling:**

```typescript
const handleLogout = async () => {
  setIsLoggingOut(true);
  try {
    await signOut();
  } catch (error) {
    console.error("Logout failed:", error);
    // Reset loading state if logout fails
    setIsLoggingOut(false);
  }
};
```

**Key Features:**

- ✅ **Universal Logout**: Single API endpoint clears both OAuth and JWT cookies
- ✅ **Loading States**: Visual feedback during logout process
- ✅ **Error Recovery**: If logout fails, user can try again
- ✅ **Graceful Degradation**: Even if API fails, local state is cleared
- ✅ **Automatic Redirect**: User always sent to login page after logout
- ✅ **No Residual State**: All cookies and local state completely cleared
- ✅ **Console Logging**: Debug info for troubleshooting

**What Gets Cleared:**

| User Type          | Cookies Cleared                    | Local State   |
| ------------------ | ---------------------------------- | ------------- |
| **Google OAuth**   | All Supabase auth cookies          | user = null   |
| **Email/Password** | auth_token JWT cookie              | user = null   |
| **Both**           | All authentication cookies removed | loading reset |

**Post-Logout State:**

```typescript
// AuthContext after logout
{
  user: null,           // No user data
  loading: false,       // Not loading
  signOut: () => {...}  // Function still available
}
```

### Logout Button UI States

**Normal State:**

```tsx
<button>
  <LogOut size={16} />
  Logout
</button>
```

**Loading State:**

```tsx
<button disabled>
  <Loader2 size={16} className="animate-spin" />
  Logging out...
</button>
```

---

## Session Management

### How Sessions Work

#### Google OAuth Users

```
Session Storage: Supabase Cookies
├── Cookie Name: sb-<project-id>-auth-token
├── Cookie Type: HTTP-only, Secure, SameSite=lax
├── Duration: 30 days (maxAge: 60*60*24*30)
├── Auto-Refresh: Yes (via middleware)
└── Contains: Access token, Refresh token
```

#### Email/Password Users

```
Session Storage: JWT Cookie
├── Cookie Name: auth_token
├── Cookie Type: HTTP-only, Secure, SameSite=lax
├── Duration: 30 days (maxAge: 60*60*24*30)
├── Auto-Refresh: No (JWT expires after 30 days)
└── Contains: JWT with userId payload
```

### Session Refresh Mechanism

```
┌─────────────────────────────────────────────────────────────┐
│ User visits ANY page                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Middleware: Session Refresh                                │
│ Location: src/middleware.ts                                │
│ Runs on: Every request (except static files)               │
│ Process:                                                    │
│ 1. Create Supabase client                                  │
│ 2. Call supabase.auth.getUser()                            │
│ 3. If session near expiry, refresh automatically           │
│ 4. Update cookies with new tokens                          │
│ 5. Continue to page                                        │
└─────────────────────────────────────────────────────────────┘
```

**Configuration Location:** `src/middleware.ts`

### How Long Users Stay Logged In

| Scenario                      | Duration             | Details                          |
| ----------------------------- | -------------------- | -------------------------------- |
| **Google OAuth (Active)**     | 30 days              | Auto-refreshes on each visit     |
| **Google OAuth (Inactive)**   | 30 days              | Then requires re-login           |
| **Email/Password (Active)**   | 30 days              | No auto-refresh, hard expiry     |
| **Email/Password (Inactive)** | 30 days              | Then requires re-login           |
| **Browser Closed**            | Persists             | Sessions survive browser restart |
| **Cookies Cleared**           | Immediately logs out | Sessions depend on cookies       |

---

## Route Protection

### Client-Side Protection (All Protected Routes)

```
Protected Routes: Everything under (main) folder
├── /feed
├── /explore
├── /cart
├── /checkout
├── /orders
├── /profile
├── /subscriptions
└── /support
```

### Protection Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User navigates to /feed                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Layout: (main) Layout Wrapper                              │
│ Location: src/app/(main)/layout.tsx                        │
│ Wrapped with: <AuthGuard>                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Component: AuthGuard                                        │
│ Location: src/components/auth/AuthGuard.tsx                │
│ Type: Client Component ("use client")                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Hook: useAuth() from AuthContext                           │
│ Returns: { user, loading, signOut }                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Check 1: Is loading?                                        │
│ If YES: Show loading spinner                               │
└────────────────────┬────────────────────────────────────────┘
                     │ No
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Check 2: Is user authenticated?                            │
│ If NO: Redirect to /login?redirect=/feed                   │
└────────────────────┬────────────────────────────────────────┘
                     │ Yes
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Render: Show protected content                             │
│ User sees: /feed page with full access                     │
└─────────────────────────────────────────────────────────────┘
```

### AuthGuard Implementation

**Location:** `src/components/auth/AuthGuard.tsx`

```typescript
export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated - redirect to login
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading while checking auth
  if (loading) {
    return <Loader2 className="animate-spin" />;
  }

  // Don't show anything while redirecting
  if (!user) {
    return null;
  }

  // User authenticated - show content
  return <>{children}</>;
}
```

### Login/Register Page Protection (Reverse Guard)

**Purpose:** Prevent authenticated users from accessing login/register pages

**Location:** `src/app/(authPages)/login/page.tsx` and `register/page.tsx`

```typescript
export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get("redirect") || "/feed";
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);

  // Rest of login page component...
}
```

**How it works:**

1. User navigates to `/login` while already authenticated
2. `useAuth()` hook detects user is logged in
3. Checks for `redirect` query param (e.g., `/login?redirect=/explore`)
4. Redirects user to intended page or `/feed` by default
5. Prevents flash of login form to authenticated users

**Same logic applies to:**

- `/login` → Redirects authenticated users to /feed or redirect URL
- `/register` → Redirects authenticated users to /feed
- Prevents confusion and unnecessary re-authentication

---

## Data Flow Architecture

### Frontend → Backend → Database Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React Components (Client Components)                 │  │
│  │ - Login Form                                          │  │
│  │ - Register Form                                       │  │
│  │ - Protected Pages                                     │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│  ┌──────────────────▼───────────────────────────────────┐  │
│  │ AuthContext (Client-side state)                      │  │
│  │ Location: src/contexts/AuthContext.tsx               │  │
│  │ Provides:                                             │  │
│  │ - user: User | null                                   │  │
│  │ - loading: boolean                                    │  │
│  │ - signOut: () => Promise<void>                        │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ API Calls (fetch)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES (Backend)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ /api/auth/register                                    │  │
│  │ /api/auth/login                                       │  │
│  │ /api/auth/logout                                      │  │
│  │ /api/auth/me  (Get current user from JWT)            │  │
│  │ /api/auth/verify-email                                │  │
│  │ /api/auth/callback (OAuth)                            │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Service Layer
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ src/services/authService.ts                          │  │
│  │ - registerWithEmail()                                 │  │
│  │ - verifyEmail()                                       │  │
│  │ - handleOAuthUser()                                   │  │
│  │                                                        │  │
│  │ src/services/auth.service.ts                         │  │
│  │ - loginUser()                                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
└────────────────────┼────────────────────────────────────────┘
                     │
                     │ Database Queries (Prisma)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Table: users                                          │  │
│  │ - All user data                                       │  │
│  │ - Email verification tokens                           │  │
│  │ - Password hashes                                     │  │
│  │ - OAuth provider info                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Authentication State Management

```
┌─────────────────────────────────────────────────────────────┐
│ AuthContext Initialization (on app load)                   │
│ Location: src/contexts/AuthContext.tsx                     │
│ Race Condition Prevention: Uses mounted flag               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Set up auth state change listener                  │
│ Code: supabase.auth.onAuthStateChange((event, session))   │
│ Events: INITIAL_SESSION, SIGNED_IN, SIGNED_OUT,            │
│         TOKEN_REFRESHED                                     │
│ Purpose: Capture auth changes from Supabase                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Check Supabase Session via Server (OAuth users)    │
│ Code: const res = await fetch('/api/auth/session')         │
│ API: /api/auth/session reads HTTP-only cookies             │
│ If user found: Set user state ✅, setLoading(false)         │
│ If no user: Continue to Step 3                             │
└────────────────────┬────────────────────────────────────────┘
                     │ No Supabase session
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Check JWT Cookie (email/password users)            │
│ Code: const res = await fetch('/api/auth/me')              │
│ API checks: auth_token cookie, verifies JWT                │
│ If valid JWT: Create user object from DB data ✅            │
│               setLoading(false)                             │
└────────────────────┬────────────────────────────────────────┘
                     │ No valid session
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: No session found                                   │
│ Code: setUser(null), setLoading(false)                     │
│ Result: User not authenticated ❌                           │
│ AuthGuard will redirect to /login                          │
└─────────────────────────────────────────────────────────────┘
```

**Important Implementation Details:**

1. **Mounted Flag**: Prevents state updates after component unmount
2. **Loading State**: Stays true until all checks complete (prevents flash of login page)
3. **onAuthStateChange**: Does NOT set loading to false on INITIAL_SESSION (prevents race condition)
4. **API Endpoints**: Server-side endpoints can read HTTP-only cookies (client cannot)
5. **Session Priority**: Supabase session checked first, then JWT cookie

---

## Security Features

### 1. Password Security

- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Storage**: Only hashed passwords stored (never plaintext)
- **Comparison**: bcrypt.compare() for login

```typescript
// Password hashing
const hashedPassword = await hashPassword(password);
// Result: "$2b$10$abcdefgh..." (60 characters)

// Password verification
const isValid = await comparePassword(password, user.password);
// Returns: true or false
```

### 2. Token Security

#### Verification Tokens

- **Generation**: crypto.randomBytes(32).toString('hex')
- **Length**: 64 characters (32 bytes hex)
- **Storage**: Database (verificationToken field)
- **Expiry**: 24 hours
- **Auto-deletion**: Removed after successful verification

#### JWT Tokens

- **Algorithm**: HS256 (HMAC SHA256)
- **Secret**: JWT_SECRET from .env (never exposed)
- **Payload**: { userId: string }
- **Expiry**: 30 days
- **Storage**: HTTP-only cookie (JavaScript cannot access)

### 3. Cookie Security

| Setting    | Value             | Purpose                               |
| ---------- | ----------------- | ------------------------------------- |
| `httpOnly` | true              | Prevents XSS attacks (JS cannot read) |
| `secure`   | true (production) | Only sent over HTTPS                  |
| `sameSite` | 'lax'             | Prevents CSRF attacks                 |
| `maxAge`   | 30 days           | Session duration                      |
| `path`     | '/'               | Available site-wide                   |

### 4. Email Verification

- **Purpose**: Confirm email ownership
- **Required for**: Email/password login only
- **Bypassed for**: Google OAuth (Google already verified)
- **Link format**: `/api/auth/verify-email?token=xxx`
- **Token validation**:
  - Must exist in database
  - Must not be expired
  - User must not already be verified

### 5. HTTPS in Production

- All cookies marked `secure: true` in production
- Forces HTTPS for cookie transmission
- Prevents man-in-the-middle attacks

---

## Technical Implementation

### File Structure

```
src/
├── app/
│   ├── (authPages)/
│   │   ├── login/page.tsx           # Login form
│   │   ├── register/page.tsx        # Registration form
│   │   └── ...
│   ├── (main)/
│   │   ├── layout.tsx               # Protected layout with AuthGuard
│   │   ├── feed/
│   │   ├── profile/
│   │   └── ...
│   ├── api/
│   │   └── auth/
│   │       ├── register/route.ts    # Email/password registration
│   │       ├── login/route.ts       # Email/password login
│   │       ├── logout/route.ts      # Clear JWT cookie
│   │       ├── me/route.ts          # Get current user from JWT
│   │       ├── callback/route.ts    # OAuth callback
│   │       └── verify-email/route.ts # Email verification
│   └── layout.tsx                   # Root layout with AuthProvider
│
├── components/
│   ├── auth/
│   │   └── AuthGuard.tsx            # Route protection component
│   ├── navigation/
│   │   └── Navbar.tsx               # Uses useAuth() hook
│   └── profile/
│       └── ProfileHeader.tsx        # Shows user info
│
├── contexts/
│   └── AuthContext.tsx              # Global auth state
│
├── lib/
│   ├── auth/
│   │   ├── hash.ts                  # bcrypt functions
│   │   ├── jwt.ts                   # JWT sign/verify
│   │   └── server.ts                # Server auth helpers
│   ├── email/
│   │   └── emailService.ts          # Nodemailer setup
│   └── supabase/
│       ├── client.ts                # Client-side Supabase
│       └── server.ts                # Server-side Supabase
│
├── services/
│   ├── authService.ts               # Email/password & OAuth logic
│   └── auth.service.ts              # Login service
│
└── middleware.ts                    # Session refresh middleware
```

### Environment Variables Required

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="30d"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Next.js Configuration for Google Profile Images

**Location:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile images
      },
    ],
  },
};
```

**Why needed:**

- Google OAuth returns profile pictures from `lh3.googleusercontent.com`
- Next.js Image component requires whitelisted external domains
- Without this, Google profile images will fail to load
- Also allows other avatar services (ui-avatars.com for fallbacks)

### Key Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.89.0",
    "@supabase/ssr": "^0.8.0",
    "@prisma/client": "^7.2.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.3",
    "nodemailer": "^7.0.12",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/nodemailer": "^7.0.5",
    "prisma": "^7.2.0"
  }
}
```

---

## How to Verify Current User

### Method 1: Client-Side (React Components)

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Email: {user.email}</p>
      <p>Name: {user.user_metadata?.full_name}</p>
      <img src={user.user_metadata?.avatar_url} />
    </div>
  );
}
```

### Method 2: Server-Side (Server Components)

```typescript
import { getCurrentUser } from "@/lib/auth/server";

export default async function ServerComponent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <div>Welcome {user.email}</div>;
}
```

### Method 3: API Routes

```typescript
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyToken(token);
  // Use decoded.userId to fetch user from database
}
```

---

## Complete User Journey Examples

### Example 1: New User with Email/Password

```
Day 1, 10:00 AM
├── User visits /register
├── Fills form: john@example.com, password, name
├── Clicks "Register"
├── API creates user in database (emailVerified: false)
├── Email sent with verification link
├── User sees: "Check your email to verify"

Day 1, 10:05 AM
├── User opens email
├── Clicks verification link
├── API updates: emailVerified = true
├── Redirected to /login with success message

Day 1, 10:06 AM
├── User enters credentials on /login
├── API verifies password with bcrypt
├── API checks emailVerified = true ✅
├── API generates JWT token
├── JWT stored in HTTP-only cookie (30-day expiry)
├── Redirected to /feed
├── User is logged in ✅

Day 15 (User still active)
├── User visits /profile
├── Middleware checks Supabase session (none for email users)
├── AuthContext checks JWT cookie ✅
├── JWT still valid (15 days old, expires in 15 days)
├── User sees profile page ✅

Day 31 (JWT expired)
├── User visits /feed
├── JWT cookie expired ❌
├── AuthContext: user = null
├── AuthGuard redirects to /login
├── User must log in again
```

### Example 2: New User with Google OAuth

```
Day 1, 10:00 AM
├── User clicks "Sign in with Google"
├── Redirected to Google OAuth page
├── User approves access
├── Google redirects to /api/auth/callback
├── Supabase creates session (30-day expiry)
├── API saves user to database:
│   ├── emailVerified: true (auto)
│   ├── authProvider: GOOGLE
│   └── avatar: Google profile picture
├── Redirected to /feed
├── User is logged in ✅

Day 15 (User visits again)
├── User visits /feed
├── Middleware calls supabase.auth.getUser()
├── Supabase auto-refreshes session ✅
├── Session extended for another 30 days
├── User sees feed page ✅

Day 60 (User returns after long break)
├── User visits /feed
├── Middleware checks session
├── Session auto-refreshed ✅
├── User still logged in (as long as they visit within 30 days)
```

---

## Troubleshooting Common Issues

### Issue 1: User logged out after browser close

**Cause**: Cookies not persisting  
**Solution**: Check `maxAge` is set (not `expires`)  
**Location**: `src/lib/supabase/server.ts`, `src/app/api/auth/login/route.ts`

### Issue 2: Email verification link expired

**Cause**: Token older than 24 hours  
**Solution**: User must register again or request new verification email  
**Prevention**: Implement "resend verification" feature

### Issue 3: Cannot access protected routes

**Cause**: AuthContext not detecting user  
**Solution**: Check:

1. Is AuthProvider wrapping the app? (`src/app/layout.tsx`)
2. Is cookie being set properly?
3. Check browser dev tools → Application → Cookies

### Issue 4: OAuth redirect loop

**Cause**: Callback URL mismatch  
**Solution**: Ensure Supabase callback URL matches: `http://localhost:3000/api/auth/callback`

### Issue 5: Email not sending

**Cause**: SMTP credentials wrong or Gmail security blocking  
**Solution**:

1. Use App Password for Gmail (not regular password)
2. Enable "Less secure app access" if using regular password
3. Check SMTP_USER and SMTP_PASS in .env

### Issue 6: Flash of login page on reload

**Cause**: Race condition in AuthContext initialization  
**Solution**: Fixed by:

1. Using `mounted` flag to prevent state updates after unmount
2. Not setting `loading = false` on `INITIAL_SESSION` event
3. Only setting loading to false after API endpoint checks complete
4. Shows loading spinner until auth check finishes

### Issue 7: Google profile images not loading

**Cause**: `lh3.googleusercontent.com` not whitelisted in Next.js config  
**Solution**: Add to `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "lh3.googleusercontent.com",
    },
  ];
}
```

### Issue 8: Authenticated users see login page after OAuth

**Cause**: No redirect logic for already-authenticated users on login page  
**Solution**: Added in `login/page.tsx`:

```typescript
useEffect(() => {
  if (!authLoading && user) {
    const redirect = searchParams.get("redirect") || "/feed";
    router.push(redirect);
  }
}, [user, authLoading, router, searchParams]);
```

### Issue 9: OAuth users created with wrong role

**Cause**: Role query parameter not being read from callback URL  
**Solution**: Updated `api/auth/callback/route.ts` to:

1. Extract `role` from URL query params
2. Priority: URL param → user_metadata.role → default to BUYER
3. Pass correct role to `handleOAuthUser()`

---

## Summary Diagram: Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER AUTHENTICATION SYSTEM                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐                    ┌─────────────────────┐
│   GOOGLE OAUTH      │                    │  EMAIL/PASSWORD     │
│   - Click button    │                    │  - Fill form        │
│   - Google auth     │                    │  - Submit register  │
│   - Auto-verified   │                    │  - Email sent       │
│   - Saved to DB     │                    │  - Click link       │
│   - 30-day session  │                    │  - Verified         │
└──────────┬──────────┘                    └──────────┬──────────┘
           │                                          │
           └──────────────┬───────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │   LOGGED IN (30-day session)   │
         └────────────────┬───────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐
    │ Supabase  │  │    JWT    │  │ Database  │
    │  Cookies  │  │  Cookie   │  │   users   │
    │  (OAuth)  │  │  (Email)  │  │   table   │
    └───────────┘  └───────────┘  └───────────┘
           │              │              │
           └──────────────┼──────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  AuthContext  │
                  │  (Client-side │
                  │   State Mgmt) │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  AuthGuard    │
                  │  (Route       │
                  │   Protection) │
                  └───────┬───────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  /feed   │   │ /profile │   │  /orders │
    │  ✅      │   │  ✅      │   │  ✅      │
    └──────────┘   └──────────┘   └──────────┘
```

---

## Conclusion

This authentication system provides:

- ✅ **Dual authentication** (Google OAuth + Email/Password)
- ✅ **Email verification** for manual signups
- ✅ **30-day persistent sessions** across browser restarts
- ✅ **Client-side route protection** with AuthGuard
- ✅ **Reverse route protection** (login/register pages redirect authenticated users)
- ✅ **Automatic session refresh** for OAuth users via middleware
- ✅ **Server-side session API** to read HTTP-only cookies
- ✅ **Race condition prevention** with mounted flag and proper loading states
- ✅ **Secure cookie-based sessions** (HTTP-only, Secure, SameSite)
- ✅ **Single user database** for simplicity
- ✅ **Hybrid session management** (Supabase + JWT)
- ✅ **Role-based user creation** (BUYER/SELLER from OAuth registration)

**Security Features:**

- 🔒 bcrypt password hashing (10 rounds)
- 🔒 HTTP-only cookies (XSS protection)
- 🔒 SameSite cookies (CSRF protection)
- 🔒 Secure cookies in production (HTTPS only)
- 🔒 Email verification required for password users
- 🔒 JWT with secret signing
- 🔒 Token expiration (24 hours for email verification, 30 days for sessions)
- 🔒 Middleware session refresh prevents expiration

**User Experience:**

- 👍 One-click Google login with role selection
- 👍 Email verification with clear instructions
- 👍 Persistent sessions (30 days, survives browser restart)
- 👍 Automatic redirect after login to intended page
- 👍 Protected routes with loading states (no flash)
- 👍 Clean error messages
- 👍 Google profile pictures displayed correctly
- 👍 Smooth page reloads without authentication flashes

**Recent Fixes (January 2026):**

1. ✅ Added role parameter handling in OAuth callback
2. ✅ Fixed race condition in AuthContext with mounted flag
3. ✅ Added reverse guard for login/register pages
4. ✅ Configured Next.js image domains for Google CDN
5. ✅ Created /api/auth/session endpoint for server-side cookie reading
6. ✅ Prevented flash of login page on reload

---

_Last Updated: January 12, 2026_
_Version: 2.0_
_Updated with: Role-based OAuth, race condition fixes, and reverse auth guards_

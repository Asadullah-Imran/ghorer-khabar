# Admin System Documentation

## Overview

The admin system provides a secure portal for administrators to manage the platform. Only users with the `ADMIN` role can access admin pages.

## Features

- ✅ Secure admin login with email/password
- ✅ Role-based access control (ADMIN role required)
- ✅ Protected admin routes (middleware + layout protection)
- ✅ Admin logout functionality
- ✅ Session management with JWT tokens

## Access Points

### Admin Login
- **URL**: `/admin-login`
- **Description**: Dedicated login page for administrators
- **Features**:
  - Email and password authentication
  - Admin role verification
  - Secure session creation

### Admin Dashboard
- **URL**: `/admin/dashboard`
- **Description**: Main admin dashboard with analytics
- **Access**: Requires ADMIN role

### Other Admin Routes
- `/admin/users` - User management
- `/admin/orders` - Order management
- `/admin/menu` - Menu management
- `/admin/onboarding` - Chef onboarding approvals
- `/admin/support` - Support tickets

## Security

### Protection Layers

1. **Middleware Protection** ([middleware.ts](src/middleware.ts))
   - Intercepts all `/admin/*` requests
   - Verifies authentication token
   - Validates ADMIN role
   - Redirects unauthorized users

2. **Layout Protection** ([layout.tsx](src/app/(admin)/layout.tsx))
   - Client-side authentication check
   - Role verification using AuthContext
   - Loading states for better UX

3. **API Protection**
   - Admin login endpoint validates role
   - Only ADMIN users can login via `/api/auth/admin/login`

### Authentication Flow

```
User → /admin/dashboard
  ↓
Middleware checks auth_token
  ↓
If no token → Redirect to /admin-login
  ↓
If token exists → Verify ADMIN role
  ↓
If not ADMIN → Redirect to /
  ↓
If ADMIN → Allow access
  ↓
Layout performs additional client-side checks
  ↓
Render admin page
```

## Creating Admin Users

### Method 1: Using the Script (Recommended)

Run the admin creation script:

\`\`\`bash
node scripts/create-admin.mjs
\`\`\`

Follow the prompts to:
- Enter admin email
- Enter admin password
- Enter admin name (optional)

The script will:
- Create a new admin user, or
- Update an existing user to admin role

### Method 2: Manual Database Update

1. Create a user through normal registration
2. Update the user's role in the database:

\`\`\`sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';
\`\`\`

3. Ensure the user has a password set (for email/password authentication)

### Method 3: Using Prisma Studio

1. Open Prisma Studio:
   \`\`\`bash
   npx prisma studio
   \`\`\`

2. Navigate to the `users` table
3. Find or create a user
4. Set the `role` field to `ADMIN`
5. Ensure the user has a hashed password

## API Endpoints

### POST `/api/auth/admin/login`

Login endpoint for administrators.

**Request Body:**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "your-secure-password"
}
\`\`\`

**Response:**
\`\`\`json
{
  "message": "Login successful",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "name": "Admin Name",
    "role": "ADMIN",
    "avatar": null
  }
}
\`\`\`

**Errors:**
- `400`: Missing email or password
- `401`: Invalid credentials
- `403`: User is not an admin
- `500`: Server error

### POST `/api/auth/admin/logout`

Logout endpoint for administrators.

**Response:**
\`\`\`json
{
  "message": "Logout successful"
}
\`\`\`

## Environment Variables

Ensure these are set in your `.env` file:

\`\`\`env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
\`\`\`

## User Roles

The system uses the following roles (defined in [schema.prisma](prisma/schema.prisma)):

\`\`\`prisma
enum Role {
  BUYER
  SELLER
  ADMIN
}
\`\`\`

- **BUYER**: Regular customer
- **SELLER**: Chef/kitchen owner
- **ADMIN**: Platform administrator

## Testing Admin Access

1. Create an admin user (see "Creating Admin Users" above)
2. Navigate to `/admin-login`
3. Login with admin credentials
4. You should be redirected to `/admin/dashboard`
5. Try accessing other admin routes
6. Try accessing admin routes while logged out (should redirect to login)
7. Try accessing admin routes with a non-admin account (should redirect to home)

## Logout

Admins can logout by:
1. Clicking the user icon in the admin header
2. Selecting "Logout" from the dropdown menu
3. This clears the auth token and redirects to `/admin-login`

## Troubleshooting

### "Access denied" error when logging in
- Ensure the user's role is set to `ADMIN` in the database
- Check that the email matches exactly (case-insensitive)

### Redirected to login even after successful login
- Check browser cookies are enabled
- Verify JWT_SECRET is set in environment variables
- Check browser console for errors

### Cannot access admin pages
- Ensure middleware is running (check terminal logs)
- Verify the auth_token cookie is set (check browser DevTools → Application → Cookies)
- Confirm the user role is ADMIN in the database

### "This account uses OAuth authentication" error
- The admin account must use email/password authentication
- Create a new admin account with email/password
- Or add a password to the existing OAuth account

## Security Best Practices

1. **Strong Passwords**: Use strong, unique passwords for admin accounts
2. **Limited Admin Accounts**: Create only necessary admin accounts
3. **Regular Audits**: Periodically review admin user list
4. **Environment Variables**: Keep JWT_SECRET secure and never commit it
5. **HTTPS**: Always use HTTPS in production
6. **Session Duration**: JWT tokens expire after 7 days
7. **Logout**: Always logout when done with admin tasks

## Files Modified/Created

### New Files
- `src/app/(authPages)/admin-login/page.tsx` - Admin login page
- `src/app/(admin)/layout.tsx` - Admin layout with auth protection
- `src/app/api/auth/admin/login/route.ts` - Admin login API
- `src/app/api/auth/admin/logout/route.ts` - Admin logout API
- `scripts/create-admin.mjs` - Admin user creation script

### Modified Files
- `src/middleware.ts` - Added admin route protection
- `src/components/admin/AdminHeader.tsx` - Added logout functionality

## Next Steps

Consider implementing:
- Two-factor authentication for admins
- Admin activity logging
- IP whitelisting for admin access
- Session timeout warnings
- Admin user management interface
- Password reset for admin users

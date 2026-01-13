# Dual Authentication System - Complete Guide

## Overview

Your app supports **two authentication methods**:

1. **Google OAuth** (via Supabase) - No email verification needed
2. **Email/Password** (manual) - Requires email verification

---

## Database Schema

### User Table Fields

```typescript
{
  id: string; // UUID for email users, Google ID for OAuth
  email: string; // Unique email
  password: string | null; // NULL for OAuth users
  name: string | null;
  role: "BUYER" | "SELLER";

  // Email Verification (for email/password signup)
  emailVerified: boolean; // false until verified
  verificationToken: string; // Deleted after verification
  verificationExpiry: DateTime; // Token expires in 24h

  // OAuth Fields
  authProvider: "EMAIL" | "GOOGLE";
  providerId: string | null; // Google user ID
  avatar: string | null; // Google profile picture

  // Password Reset
  resetToken: string | null;
  resetTokenExpiry: DateTime | null;
}
```

---

## Authentication Flows

### Flow 1: Google OAuth (Supabase)

```
User clicks "Sign in with Google"
  ↓
Supabase handles OAuth
  ↓
Callback: /api/auth/callback
  ↓
Create/update user in Prisma:
  - authProvider: 'GOOGLE'
  - emailVerified: true (auto)
  - password: null
  - providerId: Google ID
  ↓
Redirect to /feed
```

### Flow 2: Email/Password Registration

```
User submits email + password
  ↓
POST /api/auth/register-email
  ↓
1. Hash password with bcrypt
2. Generate verification token
3. Create user:
   - authProvider: 'EMAIL'
   - emailVerified: false
   - verificationToken: random string
4. Send verification email (Nodemailer)
  ↓
User receives email
  ↓
User clicks verification link
  ↓
GET /api/auth/verify-email?token=xxx
  ↓
1. Find user by token
2. Check token not expired
3. Update user:
   - emailVerified: true
   - verificationToken: null (deleted)
   - verificationExpiry: null
  ↓
Redirect to /login?verified=true
  ↓
User can now log in with Supabase
```

---

## Why This Design?

### ✅ Pros

1. **Single User Table**

   - One source of truth
   - Easy queries
   - Simple relationships

2. **Auto-Cleanup**

   - Tokens stored in same table
   - Deleted immediately after use
   - No orphaned records

3. **Flexible Auth**

   - Users can use both methods
   - Link OAuth to existing account
   - Seamless experience

4. **Supabase for Sessions**
   - Let Supabase handle session management
   - You handle email verification only
   - Best of both worlds

### 🔒 Security

- Passwords hashed with bcrypt
- Tokens are cryptographically random (32 bytes)
- Tokens expire after 24 hours
- Verified users can't re-verify
- Email validation prevents fake accounts

---

## Do You Need Context API?

### Answer: **YES**, you already have it! ✅

You already implemented `AuthContext` which provides:

- `user` - Current Supabase user
- `loading` - Auth state loading
- `signOut()` - Logout function

**For email/password users**, they still use Supabase for sessions:

1. User verifies email
2. User logs in via Supabase with email/password
3. Supabase creates session
4. Your AuthContext works the same

No additional context needed! 🎉

---

## Implementation Checklist

### 1. Database

- [x] Updated Prisma schema
- [ ] Run `npx prisma migrate dev --name add-email-verification`
- [ ] Run `npx prisma generate`

### 2. Email Service

- [ ] Install: `npm install nodemailer`
- [ ] Install types: `npm install -D @types/nodemailer`
- [ ] Add SMTP credentials to `.env`
- [ ] Test email sending

### 3. API Routes

- [x] Created `/api/auth/register-email`
- [x] Created `/api/auth/verify-email`
- [ ] Update `/api/auth/callback` to use `handleOAuthUser`

### 4. Frontend

- [ ] Create email/password registration form
- [ ] Add "Verify Email" notice page
- [ ] Show success message after verification
- [ ] Handle login with unverified users

---

## Cron Job (Optional)

Clean up expired tokens daily:

```typescript
// app/api/cron/cleanup-tokens/route.ts
import { cleanupExpiredTokens } from "@/services/authService";

export async function GET() {
  const count = await cleanupExpiredTokens();
  return Response.json({ cleaned: count });
}
```

Use Vercel Cron or similar:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-tokens",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## Email Setup Guide

### Gmail (Easiest for Development)

1. Go to https://myaccount.google.com/apppasswords
2. Create "App Password" for "Mail"
3. Copy 16-character password
4. Add to `.env`:
   ```
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

### Production: Use SendGrid/Mailgun/SES

- More reliable
- Better deliverability
- Dedicated IP

---

## Testing

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/auth/register-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 2. Check email inbox for verification link

# 3. Click link or visit:
http://localhost:3000/api/auth/verify-email?token=<token>

# 4. User redirected to login, can now sign in
```

---

## Summary

✅ **Database**: Single User table with optional verification fields  
✅ **Email Verification**: Tokens auto-deleted after use  
✅ **OAuth**: Handled by Supabase  
✅ **Sessions**: Managed by Supabase  
✅ **Context API**: Already implemented  
✅ **Email Service**: Nodemailer with SMTP

**No separate table needed** - verification tokens live in User table and are cleaned up automatically!

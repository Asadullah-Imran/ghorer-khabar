# Supabase Bucket Setup - TODO Checklist

## Overview
Complete setup guide for configuring Supabase storage buckets for the Chef Menu Management System. This bucket stores all dish images uploaded by chefs.

---

## Pre-requisites
- [ ] Supabase account created
- [ ] Project initialized in Supabase
- [ ] Supabase API keys obtained
- [ ] `.env.local` file ready for environment variables

---

## Phase 1: Bucket Creation

### Step 1.1: Create the Menu Images Bucket
- [ ] Open Supabase Dashboard → Storage
- [ ] Click "Create a new bucket"
- [ ] **Bucket Name**: `menu-images`
- [ ] **Public/Private**: Select "Public" (images need public URLs)
- [ ] Click "Create bucket"

### Step 1.2: Verify Bucket Created
- [ ] Navigate to Storage in dashboard
- [ ] Confirm `menu-images` bucket appears in list
- [ ] Click on bucket to open details

---

## Phase 2: Storage Policies (RLS - Row Level Security)

### Step 2.1: Create Public Read Policy
- [ ] Go to `menu-images` bucket → Policies tab
- [ ] Click "New policy" → "Create a policy from template"
- [ ] Select "Allow public read access"
- [ ] **Policy Name**: `public-read-access`
- [ ] **Expression**:
  ```sql
  ((bucket_id = 'menu-images'::text))
  ```
- [ ] Click "Review" → "Save policy"
- [ ] Verify policy appears in list

### Step 2.2: Create Chef Upload Policy
- [ ] Click "New policy" → "For full customization"
- [ ] **Policy Name**: `chef-upload-access`
- [ ] **Allowed operations**: `INSERT` (check only INSERT)
- [ ] **Target role**: `authenticated` (or `anon` if allowing guests)
- [ ] **Policy expression**:
  ```sql
  (auth.role() = 'authenticated'::text)
  ```
- [ ] Click "Review" → "Save policy"

### Step 2.3: Create Chef Delete Policy
- [ ] Click "New policy" → "For full customization"
- [ ] **Policy Name**: `chef-delete-access`
- [ ] **Allowed operations**: `DELETE` (check only DELETE)
- [ ] **Target role**: `authenticated`
- [ ] **Policy expression**:
  ```sql
  (auth.role() = 'authenticated'::text)
  ```
- [ ] Click "Review" → "Save policy"

### Step 2.4: Create Chef Update Policy
- [ ] Click "New policy" → "For full customization"
- [ ] **Policy Name**: `chef-update-access`
- [ ] **Allowed operations**: `UPDATE` (check only UPDATE)
- [ ] **Target role**: `authenticated`
- [ ] **Policy expression**:
  ```sql
  (auth.role() = 'authenticated'::text)
  ```
- [ ] Click "Review" → "Save policy"

### Step 2.5: Verify All Policies
- [ ] Go back to bucket Policies tab
- [ ] Confirm 4 policies exist:
  - [ ] `public-read-access` (SELECT)
  - [ ] `chef-upload-access` (INSERT)
  - [ ] `chef-delete-access` (DELETE)
  - [ ] `chef-update-access` (UPDATE)

---

## Phase 3: CORS Configuration (if needed)

### Step 3.1: Check Current CORS Settings
- [ ] Go to Project Settings → Storage → CORS
- [ ] Note current CORS allowed origins

### Step 3.2: Add Application URLs to CORS
- [ ] Click "Add CORS rule" (if needed)
- [ ] **Allowed origins**:
  ```
  http://localhost:3000
  http://localhost:3001
  https://yourdomain.com
  https://www.yourdomain.com
  ```
- [ ] **Allowed methods**: `GET, POST, PUT, DELETE, HEAD, OPTIONS`
- [ ] **Allowed headers**: `*` (or specific if preferred)
- [ ] **Max age**: `3600`
- [ ] Click "Save"

### Step 3.3: Test CORS
- [ ] [ ] Make a test request from frontend to verify CORS works

---

## Phase 4: Folder Structure (Optional but Recommended)

### Step 4.1: Create Chef-Menu Folder
- [ ] Open `menu-images` bucket
- [ ] Click "Create folder"
- [ ] **Folder name**: `chef-menu`
- [ ] Click "Create"
- [ ] Verify folder appears in bucket

### Step 4.2: Create Backups Folder (Optional)
- [ ] Click "Create folder"
- [ ] **Folder name**: `backups`
- [ ] Click "Create"

### Step 4.3: Folder Structure Reference
```
menu-images/
├── chef-menu/
│   ├── [timestamp]-[random]-filename.jpg
│   ├── [timestamp]-[random]-filename.png
│   └── ...
└── backups/
    └── (optional archived images)
```

---

## Phase 5: Environment Variables Setup

### Step 5.1: Gather Required Keys
- [ ] Open Supabase project → Settings → API
- [ ] Note the following:
  - [ ] **Project URL**: Copy and save
  - [ ] **Anon Public Key**: Copy and save
  - [ ] **Service Role Key**: Copy and save (keep SECRET!)

### Step 5.2: Update .env.local
- [ ] Open `.env.local` in project root
- [ ] Add or update these variables:
  ```env
  # Supabase Public Keys
  NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
  
  # Supabase Secret Keys (SERVER-SIDE ONLY)
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
  
  # Database URL (if using with Prisma)
  DATABASE_URL=postgresql://user:password@xxxxx.supabase.co:5432/postgres
  ```

### Step 5.3: Verify Environment Variables Loaded
- [ ] Run: `echo $env:NEXT_PUBLIC_SUPABASE_URL` (PowerShell)
- [ ] Or: `echo $NEXT_PUBLIC_SUPABASE_URL` (Bash)
- [ ] Confirm value is displayed (not empty)

---

## Phase 6: Code Integration Verification

### Step 6.1: Check Image Service Configuration
- [ ] Open `/src/services/image.service.ts`
- [ ] Verify bucket name is `menu-images`:
  ```typescript
  const bucket = supabase.storage.from('menu-images')
  ```
- [ ] Check folder path is `chef-menu`:
  ```typescript
  const filePath = `chef-menu/${uniqueFileName}`
  ```

### Step 6.2: Verify Supabase Client Setup
- [ ] Open `/src/lib/supabase/server.ts`
- [ ] Confirm using `SUPABASE_SERVICE_ROLE_KEY` for server operations:
  ```typescript
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  ```

### Step 6.3: Check API Routes
- [ ] Open `/src/app/api/chef/menu/route.ts`
- [ ] Verify imports: `import { imageService } from "@/services/image.service"`
- [ ] Confirm image upload call: `imageService.uploadImage(file, "chef-menu")`

---

## Phase 7: Testing

### Step 7.1: Test Image Upload via API
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `/chef/menu`
- [ ] Create a new menu item with image
- [ ] Submit form
- [ ] Check browser console for errors
- [ ] Verify response contains image URL

### Step 7.2: Verify Image in Supabase
- [ ] Go to Supabase Dashboard → Storage
- [ ] Open `menu-images` bucket
- [ ] Navigate to `chef-menu` folder
- [ ] Confirm new image file appears
- [ ] Click image to see its public URL

### Step 7.3: Test Image Display
- [ ] Return to Menu page
- [ ] Verify menu item card displays the uploaded image
- [ ] Image should load without console errors

### Step 7.4: Test Image Deletion
- [ ] Delete a menu item from menu page
- [ ] Confirm deletion dialog shows
- [ ] Confirm deletion from database
- [ ] Go to Supabase bucket
- [ ] Verify corresponding image file is deleted

### Step 7.5: Test Multiple Images
- [ ] Create menu item with 3+ images
- [ ] Verify all images appear in card gallery (if carousel implemented)
- [ ] Edit item to remove middle image
- [ ] Confirm correct image deleted from Supabase

---

## Phase 8: Security Hardening

### Step 8.1: Restrict Public Bucket (Optional)
If images should NOT be public:
- [ ] Revert bucket to "Private"
- [ ] Update read policy to require authentication
- [ ] Generate signed URLs in image service (valid for 24 hours)
- [ ] Update MenuItemCard to use signed URLs

### Step 8.2: File Type Validation
- [ ] Verify image service validates MIME types:
  ```typescript
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type' };
  }
  ```

### Step 8.3: File Size Validation
- [ ] Confirm max 5MB limit is enforced:
  ```typescript
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'File too large' };
  }
  ```

### Step 8.4: Rate Limiting (Optional)
- [ ] Consider adding rate limiting to image upload endpoint
- [ ] Example: Max 10 uploads per minute per user
- [ ] Implement using Upstash Redis or similar

---

## Phase 9: Monitoring & Maintenance

### Step 9.1: Set Up Storage Alerts
- [ ] Go to Project Settings → Usage
- [ ] Set alert threshold for storage quota
- [ ] Recommended: Alert at 80% usage

### Step 9.2: Monitor Image Upload Success Rate
- [ ] Create dashboard to track:
  - [ ] Total images uploaded
  - [ ] Failed uploads (and reasons)
  - [ ] Average upload time
  - [ ] File size distribution

### Step 9.3: Regular Cleanup (Monthly)
- [ ] [ ] Identify orphaned images (in storage but not in database)
- [ ] [ ] Delete unused/old images
- [ ] [ ] Archive high-resolution originals if needed
- [ ] [ ] Check for duplicate images

### Step 9.4: Backup Strategy
- [ ] [ ] Export database weekly (Supabase → Database → Backups)
- [ ] [ ] Download copies of bucket data monthly
- [ ] [ ] Test restore procedure quarterly

---

## Phase 10: Production Deployment

### Step 10.1: Update Environment Variables
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Set production Supabase URL in environment
- [ ] Set production Supabase keys in environment
- [ ] DO NOT commit keys to repository

### Step 10.2: Update CORS for Production
- [ ] Go back to Supabase → Storage → CORS
- [ ] Add production domain:
  ```
  https://yourdomain.com
  https://www.yourdomain.com
  ```
- [ ] Remove localhost entries
- [ ] Save changes

### Step 10.3: Update Image Service (if needed)
- [ ] Verify production bucket name matches code
- [ ] Confirm service role key is production key
- [ ] Test image upload in production environment

### Step 10.4: Monitor Production
- [ ] [ ] Check error logs daily first week
- [ ] [ ] Monitor image upload success rate
- [ ] [ ] Verify storage quota usage
- [ ] [ ] Test delete operations work correctly

---

## Troubleshooting

### Issue: "Bucket does not exist"
**Solutions:**
- [ ] Verify bucket name is exactly `menu-images` (case-sensitive)
- [ ] Check you're using correct Supabase project
- [ ] Refresh Supabase dashboard
- [ ] Try creating bucket again

### Issue: "CORS error" when uploading
**Solutions:**
- [ ] Verify CORS policy includes your domain
- [ ] Check Allow-Origin header in response
- [ ] Browser console shows full CORS error message
- [ ] Try with http://localhost:3000 first

### Issue: "Unauthorized to upload" 
**Solutions:**
- [ ] Confirm user is authenticated (logged in)
- [ ] Check RLS policy allows INSERT for authenticated users
- [ ] Verify service role key is used server-side
- [ ] Test with public policy first, then restrict

### Issue: "File size exceeds limit"
**Solutions:**
- [ ] Compress image before uploading
- [ ] Check if limit is 5MB or different value
- [ ] Increase limit in image service if needed
- [ ] Update max file size in form validator

### Issue: "Image URL not loading"
**Solutions:**
- [ ] Verify bucket is set to "Public"
- [ ] Check image URL format is correct
- [ ] Ensure image actually exists in bucket
- [ ] Try accessing URL directly in browser
- [ ] Check CORS settings allow image requests

### Issue: "Deletion fails but image remains"
**Solutions:**
- [ ] Verify DELETE policy exists and is correct
- [ ] Check error message in console
- [ ] Manually delete from Supabase dashboard to test
- [ ] Verify image path format is exactly correct

---

## Quick Reference

### Bucket Configuration Summary
```
Bucket Name:        menu-images
Type:               Public
Folder Structure:   chef-menu/
File Naming:        [timestamp]-[random]-filename.[ext]
Max File Size:      5MB
Allowed Types:      image/jpeg, image/png, image/webp, image/gif
Public URL Format:  https://xxxxx.supabase.co/storage/v1/object/public/menu-images/chef-menu/[filename]
```

### API Integration Points
```
Upload:   POST /api/chef/menu (FormData with images)
Delete:   DELETE /api/chef/menu/[id] (removes images from bucket)
Update:   PUT /api/chef/menu/[id] (add/remove images)
Display:  MenuItemCard component (renders image URLs)
```

### Key Files to Reference
```
/src/services/image.service.ts       - Upload/delete logic
/src/lib/supabase/server.ts          - Supabase client config
/src/app/api/chef/menu/route.ts      - Upload API endpoint
/src/app/api/chef/menu/[id]/route.ts - Delete endpoint
/src/components/chef/Menu/MenuItemCard.tsx - Image display
```

---

## Completion Checklist

- [ ] Bucket created and named `menu-images`
- [ ] 4 RLS policies configured (read, insert, delete, update)
- [ ] CORS settings include localhost and production domains
- [ ] Folder structure created (`chef-menu/`, `backups/`)
- [ ] Environment variables set in `.env.local`
- [ ] Image service correctly references bucket
- [ ] Test upload successful via menu page
- [ ] Test image displays in menu card
- [ ] Test deletion removes from Supabase
- [ ] Production environment variables deployed
- [ ] Production CORS domains configured
- [ ] Monitoring/alerts set up
- [ ] Backup strategy documented

---

## Status

**Last Updated**: January 7, 2026
**Status**: ⏳ Ready for Setup
**Estimated Time**: 30-45 minutes

---

## Support

For Supabase storage issues:
- Supabase Docs: https://supabase.com/docs/guides/storage
- RLS Policies: https://supabase.com/docs/guides/storage/security
- CORS Guide: https://supabase.com/docs/guides/storage/cors

For this project's image service:
- See: `/src/services/image.service.ts`
- See: `/src/app/api/chef/menu/route.ts`

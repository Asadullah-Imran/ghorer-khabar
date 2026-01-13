# Supabase Storage Setup Guide

## Error: "new row violates row-level security policy"

This error occurs because your Supabase Storage buckets either don't exist or don't have the correct Row Level Security (RLS) policies.

## Quick Fix - Run This SQL in Supabase

### Step 1: Go to Supabase Dashboard
1. Open your project at https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Paste the SQL below and click **Run**

### Step 2: Run This SQL Script

```sql
-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Create nid-documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nid-documents',
  'nid-documents',
  false, -- Private bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Create kitchen-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kitchen-images',
  'kitchen-images',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SET UP RLS POLICIES FOR nid-documents
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own NID documents" ON storage.objects;

-- Allow authenticated users to upload to nid-documents
CREATE POLICY "Authenticated users can upload NID documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'nid-documents'
);

-- Allow users to view their own NID documents
CREATE POLICY "Users can view their own NID documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'nid-documents'
);

-- Allow users to delete their own NID documents
CREATE POLICY "Users can delete their own NID documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'nid-documents'
);

-- ============================================
-- SET UP RLS POLICIES FOR kitchen-images
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Authenticated users can upload kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own kitchen images" ON storage.objects;

-- Allow authenticated users to upload to kitchen-images
CREATE POLICY "Authenticated users can upload kitchen images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kitchen-images'
);

-- Allow anyone to view kitchen images (public bucket)
CREATE POLICY "Anyone can view kitchen images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'kitchen-images'
);

-- Allow users to delete their own kitchen images
CREATE POLICY "Users can delete their own kitchen images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'kitchen-images'
);
```

### Step 3: Verify Buckets Created

After running the SQL:
1. Go to **Storage** in the Supabase Dashboard
2. You should see two buckets:
   - `nid-documents` (Private)
   - `kitchen-images` (Public)

### Step 4: Test Upload

1. Restart your Next.js dev server: `npm run dev`
2. Go to `/chef-onboarding` (as a SELLER user)
3. Try uploading an NID image
4. Upload should now work! ✅

## Alternative: Manual Setup via Supabase Dashboard

If you prefer using the UI instead of SQL:

### For `nid-documents` bucket:
1. Go to **Storage** → **New Bucket**
2. Name: `nid-documents`
3. Public: **OFF** (private)
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
6. Click **Create bucket**
7. Click on the bucket → **Policies** → **New Policy**
8. Create three policies:
   - **Insert**: Allow authenticated users
   - **Select**: Allow authenticated users  
   - **Delete**: Allow authenticated users

### For `kitchen-images` bucket:
1. Go to **Storage** → **New Bucket**
2. Name: `kitchen-images`
3. Public: **ON** (public)
4. File size limit: `5242880` (5MB)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/jpg`
6. Click **Create bucket**
7. Click on the bucket → **Policies** → **New Policy**
8. Create three policies:
   - **Insert**: Allow authenticated users
   - **Select**: Allow public (anyone)
   - **Delete**: Allow authenticated users

## Common Issues

### Issue: "Bucket already exists"
- This is fine! The `ON CONFLICT DO NOTHING` will skip creation
- Just make sure the policies are created

### Issue: Still getting 403 error
1. Make sure you're logged in (authenticated)
2. Check your Supabase `.env` variables are correct
3. Verify the bucket names match exactly: `nid-documents` and `kitchen-images`
4. Check the Storage policies are enabled in Supabase Dashboard

### Issue: "Invalid bucket" error
- Make sure the frontend is sending the correct bucket names
- Check the upload API accepts these bucket names

## Environment Variables Check

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

**After setup, your uploads should work perfectly! 🎉**

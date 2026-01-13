-- ============================================
-- COMPLETE SUPABASE STORAGE FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- Step 1: Update bucket size limits to 10MB
UPDATE storage.buckets 
SET file_size_limit = 10485760 
WHERE id IN ('nid-documents', 'kitchen-images');

-- Step 2: Ensure buckets exist with correct settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('nid-documents', 'nid-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']),
  ('kitchen-images', 'kitchen-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- Step 3: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can upload NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own kitchen images" ON storage.objects;

-- Step 4: Create policies for NID documents bucket
CREATE POLICY "Authenticated users can upload NID documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'nid-documents');

CREATE POLICY "Users can view their own NID documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'nid-documents');

CREATE POLICY "Users can delete their own NID documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'nid-documents');

CREATE POLICY "Users can update their own NID documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'nid-documents');

-- Step 5: Create policies for kitchen images bucket
CREATE POLICY "Authenticated users can upload kitchen images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'kitchen-images');

CREATE POLICY "Anyone can view kitchen images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'kitchen-images');

CREATE POLICY "Users can delete their own kitchen images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'kitchen-images');

CREATE POLICY "Users can update their own kitchen images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'kitchen-images');

-- Step 6: Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- SUPABASE STORAGE SETUP FOR GHORER KHABAR
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- CREATE STORAGE BUCKETS
-- ============================================

-- Create nid-documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nid-documents',
  'nid-documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Create kitchen-images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kitchen-images',
  'kitchen-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- RLS POLICIES FOR nid-documents
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own NID documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own NID documents" ON storage.objects;

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

-- ============================================
-- RLS POLICIES FOR kitchen-images
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view kitchen images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own kitchen images" ON storage.objects;

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

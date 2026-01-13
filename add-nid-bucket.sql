-- ============================================
-- ADD MISSING NID-DOCUMENTS BUCKET
-- Run this in Supabase SQL Editor
-- ============================================

-- Create nid-documents bucket (PRIVATE)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nid-documents',
  'nid-documents',
  false,  -- PRIVATE bucket for security
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

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

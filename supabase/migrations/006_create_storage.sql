-- ============================================================================
-- ATELIER LAUNCH — Migration 006: Storage Buckets & Policies
-- ============================================================================
-- Creates public/private storage buckets with RLS
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. PROFILE IMAGES (Public)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload profile images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update their own profile image
CREATE POLICY "Users can update profile images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own profile image
CREATE POLICY "Users can delete profile images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view profile images (public bucket)
CREATE POLICY "Anyone can view profile images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-images');

-- ---------------------------------------------------------------------------
-- 2. PORTFOLIO IMAGES (Public)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Designers can upload to their own folder
CREATE POLICY "Designers can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Designers can update their own portfolio images
CREATE POLICY "Designers can update portfolio images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Designers can delete their own portfolio images
CREATE POLICY "Designers can delete portfolio images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Anyone can view portfolio images (public bucket)
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

-- ---------------------------------------------------------------------------
-- 3. PRODUCT IMAGES (Public)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Designers can upload product images to collections they own
CREATE POLICY "Designers can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = (storage.foldername(name))[1]::uuid
        AND collections.designer_id = auth.uid()
    )
  );

-- Designers can update product images for their collections
CREATE POLICY "Designers can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = (storage.foldername(name))[1]::uuid
        AND collections.designer_id = auth.uid()
    )
  );

-- Designers can delete product images from their collections
CREATE POLICY "Designers can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = (storage.foldername(name))[1]::uuid
        AND collections.designer_id = auth.uid()
    )
  );

-- Anyone can view product images (public bucket)
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- ---------------------------------------------------------------------------
-- 4. VERIFICATION DOCS (Private)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-docs',
  'verification-docs',
  false,
  5242880,  -- 5MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
);

-- Designers can upload their own verification docs
CREATE POLICY "Designers can upload verification docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Designers can view their own verification docs
CREATE POLICY "Designers can view own verification docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Designers can update their own verification docs
CREATE POLICY "Designers can update verification docs"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

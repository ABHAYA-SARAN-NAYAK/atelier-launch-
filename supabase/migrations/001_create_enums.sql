-- ============================================================================
-- ATELIER LAUNCH — Migration 001: Create Custom ENUM Types
-- ============================================================================
-- Run this migration FIRST before creating any tables.
-- ============================================================================

-- User types: buyers browse & purchase, students & pro designers sell
CREATE TYPE user_type_enum AS ENUM ('buyer', 'student', 'pro_designer');

-- Designer verification lifecycle
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');

-- Fashion design specializations
CREATE TYPE specialization_enum AS ENUM (
  'womenswear',
  'menswear',
  'accessories',
  'streetwear',
  'avant_garde',
  'sustainable',
  'other'
);

-- Collection drop lifecycle: draft → live → ended
CREATE TYPE collection_status_enum AS ENUM ('draft', 'live', 'ended');

-- Product availability
CREATE TYPE product_status_enum AS ENUM ('available', 'sold_out');

-- Order fulfillment lifecycle
CREATE TYPE order_status_enum AS ENUM (
  'pending',
  'paid',
  'shipped',
  'delivered',
  'refunded',
  'cancelled'
);

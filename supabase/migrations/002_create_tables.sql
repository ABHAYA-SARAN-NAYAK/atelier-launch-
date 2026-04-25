-- ============================================================================
-- ATELIER LAUNCH — Migration 002: Create Tables
-- ============================================================================
-- Depends on: 001_create_enums.sql
-- Creates: users, designer_profiles, collections, products, orders, follows, cart_items
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. USERS
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type   user_type_enum NOT NULL,
  full_name   TEXT NOT NULL,
  profile_image_url TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_user_type ON users (user_type);

-- ---------------------------------------------------------------------------
-- 2. DESIGNER PROFILES
-- ---------------------------------------------------------------------------
CREATE TABLE designer_profiles (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  school_name         TEXT NOT NULL,
  graduation_year     INTEGER NOT NULL,
  verification_status verification_status_enum DEFAULT 'pending',
  verification_doc_url TEXT,
  specialization      specialization_enum,
  bio                 TEXT CHECK (char_length(bio) <= 500),
  portfolio_images    JSONB DEFAULT '[]'::jsonb,
  instagram_handle    TEXT,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_designer_profiles_user_id ON designer_profiles (user_id);
CREATE INDEX idx_designer_profiles_verification ON designer_profiles (verification_status);
CREATE INDEX idx_designer_profiles_school ON designer_profiles (school_name);

-- ---------------------------------------------------------------------------
-- 3. COLLECTIONS
-- ---------------------------------------------------------------------------
CREATE TABLE collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL CHECK (char_length(title) <= 150),
  description     TEXT CHECK (char_length(description) <= 1000),
  drop_start_date TIMESTAMPTZ NOT NULL,
  drop_end_date   TIMESTAMPTZ NOT NULL,
  status          collection_status_enum DEFAULT 'draft',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT chk_drop_dates CHECK (drop_end_date > drop_start_date)
);

CREATE INDEX idx_collections_designer ON collections (designer_id);
CREATE INDEX idx_collections_status ON collections (status);
CREATE INDEX idx_collections_drop_start ON collections (drop_start_date);
CREATE INDEX idx_collections_drop_end ON collections (drop_end_date);
CREATE INDEX idx_collections_trending ON collections (drop_start_date DESC, status);

-- ---------------------------------------------------------------------------
-- 4. PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id      UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  name               TEXT NOT NULL CHECK (char_length(name) <= 200),
  description        TEXT CHECK (char_length(description) <= 2000),
  price              DECIMAL(10,2) NOT NULL CHECK (price > 0),
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  sizes_available    JSONB DEFAULT '[]'::jsonb,
  primary_image_url  TEXT NOT NULL,
  gallery_images     JSONB DEFAULT '[]'::jsonb,
  materials_used     TEXT,
  care_instructions  TEXT,
  status             product_status_enum DEFAULT 'available',
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_collection ON products (collection_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_composite ON products (collection_id, status, price);

-- ---------------------------------------------------------------------------
-- 5. ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id            UUID REFERENCES users(id) ON DELETE SET NULL,
  product_id          UUID REFERENCES products(id) ON DELETE SET NULL,
  designer_id         UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  quantity            INTEGER NOT NULL CHECK (quantity > 0),
  total_amount        DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
  platform_commission DECIMAL(10,2) NOT NULL CHECK (platform_commission >= 0),
  designer_payout     DECIMAL(10,2) NOT NULL CHECK (designer_payout >= 0),
  stripe_payment_id   TEXT UNIQUE,
  shipping_address    JSONB NOT NULL,
  status              order_status_enum DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON orders (buyer_id);
CREATE INDEX idx_orders_designer ON orders (designer_id);
CREATE INDEX idx_orders_product ON orders (product_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_stripe ON orders (stripe_payment_id);
CREATE INDEX idx_orders_designer_dashboard ON orders (designer_id, status, created_at DESC);
CREATE INDEX idx_orders_recent ON orders (created_at DESC, status);

-- ---------------------------------------------------------------------------
-- 6. FOLLOWS
-- ---------------------------------------------------------------------------
CREATE TABLE follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_follows UNIQUE (follower_id, designer_id),
  CONSTRAINT chk_no_self_follow CHECK (follower_id != designer_id)
);

CREATE INDEX idx_follows_follower ON follows (follower_id);
CREATE INDEX idx_follows_designer ON follows (designer_id);
CREATE INDEX idx_follows_designer_recent ON follows (designer_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 7. CART ITEMS
-- ---------------------------------------------------------------------------
CREATE TABLE cart_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  selected_size TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT uq_cart_item UNIQUE (user_id, product_id, selected_size)
);

CREATE INDEX idx_cart_user ON cart_items (user_id);
CREATE INDEX idx_cart_product ON cart_items (product_id);

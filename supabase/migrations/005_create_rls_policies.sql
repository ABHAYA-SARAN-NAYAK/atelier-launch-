-- ============================================================================
-- ATELIER LAUNCH — Migration 005: Row Level Security Policies
-- ============================================================================
-- Depends on: 002_create_tables.sql
-- ============================================================================

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows           ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items         ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own data
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Anyone can view basic designer info (public profiles)
CREATE POLICY "Public can view basic designer info"
  ON users FOR SELECT
  USING (user_type IN ('student', 'pro_designer'));

-- =============================================
-- DESIGNER PROFILES TABLE POLICIES
-- =============================================

-- Anyone can view verified designers
CREATE POLICY "Anyone can view verified designers"
  ON designer_profiles FOR SELECT
  USING (verification_status = 'verified');

-- Designers can view their own profile (even if unverified)
CREATE POLICY "Designers can view their own profile"
  ON designer_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Designers can update their own profile
CREATE POLICY "Designers can update their own profile"
  ON designer_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Designers can insert their own profile
CREATE POLICY "Designers can insert their own profile"
  ON designer_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- COLLECTIONS TABLE POLICIES
-- =============================================

-- Anyone can view live collections
CREATE POLICY "Anyone can view live collections"
  ON collections FOR SELECT
  USING (status = 'live');

-- Designers can view their own collections (any status)
CREATE POLICY "Designers can view their own collections"
  ON collections FOR SELECT
  USING (designer_id = auth.uid());

-- Designers can insert their own collections
CREATE POLICY "Designers can insert their own collections"
  ON collections FOR INSERT
  WITH CHECK (designer_id = auth.uid());

-- Designers can update their own collections
CREATE POLICY "Designers can update their own collections"
  ON collections FOR UPDATE
  USING (designer_id = auth.uid())
  WITH CHECK (designer_id = auth.uid());

-- Designers can delete their own collections
CREATE POLICY "Designers can delete their own collections"
  ON collections FOR DELETE
  USING (designer_id = auth.uid());

-- =============================================
-- PRODUCTS TABLE POLICIES
-- =============================================

-- Anyone can view products in live collections
CREATE POLICY "Anyone can view products in live collections"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.status = 'live'
    )
  );

-- Designers can view their own products (any collection status)
CREATE POLICY "Designers can view their own products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.designer_id = auth.uid()
    )
  );

-- Designers can insert products to their own collections
CREATE POLICY "Designers can insert products to their collections"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.designer_id = auth.uid()
    )
  );

-- Designers can update their own products
CREATE POLICY "Designers can update their own products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.designer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.designer_id = auth.uid()
    )
  );

-- Designers can delete their own products
CREATE POLICY "Designers can delete their own products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = products.collection_id
        AND collections.designer_id = auth.uid()
    )
  );

-- =============================================
-- ORDERS TABLE POLICIES
-- =============================================

-- Buyers can view their own orders
CREATE POLICY "Buyers can view their own orders"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid());

-- Designers can view orders for their products
CREATE POLICY "Designers can view orders for their products"
  ON orders FOR SELECT
  USING (designer_id = auth.uid());

-- Authenticated users can create orders (buyer_id must match)
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Designers can update order status (shipped/delivered)
CREATE POLICY "Designers can update their order status"
  ON orders FOR UPDATE
  USING (designer_id = auth.uid())
  WITH CHECK (designer_id = auth.uid());

-- =============================================
-- FOLLOWS TABLE POLICIES
-- =============================================

-- Users can view their own follows
CREATE POLICY "Users can view their own follows"
  ON follows FOR SELECT
  USING (follower_id = auth.uid());

-- Designers can see who follows them
CREATE POLICY "Designers can see who follows them"
  ON follows FOR SELECT
  USING (designer_id = auth.uid());

-- Users can insert their own follows
CREATE POLICY "Users can insert their own follows"
  ON follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

-- Users can delete their own follows
CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (follower_id = auth.uid());

-- Anyone can count designer followers (aggregate)
CREATE POLICY "Anyone can count designer followers"
  ON follows FOR SELECT
  USING (true);

-- =============================================
-- CART ITEMS TABLE POLICIES
-- =============================================

-- Users can view their own cart
CREATE POLICY "Users can view their own cart"
  ON cart_items FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert to their own cart
CREATE POLICY "Users can insert to their own cart"
  ON cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own cart
CREATE POLICY "Users can update their own cart"
  ON cart_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete from their own cart
CREATE POLICY "Users can delete from their own cart"
  ON cart_items FOR DELETE
  USING (user_id = auth.uid());

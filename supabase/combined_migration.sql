-- ============================================================================
-- ATELIER LAUNCH — COMPLETE COMBINED MIGRATION
-- ============================================================================
-- Paste this ENTIRE script into your Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/hmrsfdkczavozsdfvnlq/sql
-- Then click "Run" to create all tables, functions, triggers, and policies.
-- ============================================================================


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 001: ENUM TYPES                                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE TYPE user_type_enum AS ENUM ('buyer', 'student', 'pro_designer');
CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE specialization_enum AS ENUM (
  'womenswear', 'menswear', 'accessories', 'streetwear',
  'avant_garde', 'sustainable', 'other'
);
CREATE TYPE collection_status_enum AS ENUM ('draft', 'live', 'ended');
CREATE TYPE product_status_enum AS ENUM ('available', 'sold_out');
CREATE TYPE order_status_enum AS ENUM (
  'pending', 'paid', 'shipped', 'delivered', 'refunded', 'cancelled'
);


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 002: TABLES                                                    ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- 1. USERS
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type     user_type_enum NOT NULL,
  full_name     TEXT NOT NULL,
  profile_image_url TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_user_type ON users (user_type);

-- 2. DESIGNER PROFILES
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

-- 3. COLLECTIONS
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

-- 4. PRODUCTS
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

-- 5. ORDERS
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

-- 6. FOLLOWS
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

-- 7. CART ITEMS
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


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 003: DATABASE FUNCTIONS                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

-- 1. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Commission calculator (student=15%, pro=10%)
CREATE OR REPLACE FUNCTION calculate_commission(
  p_total_amount DECIMAL, p_user_type TEXT
) RETURNS DECIMAL AS $$
BEGIN
  IF p_user_type = 'student' THEN RETURN ROUND(p_total_amount * 0.15, 2);
  ELSE RETURN ROUND(p_total_amount * 0.10, 2);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Auto-update product status
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_available = 0 THEN
    NEW.status = 'sold_out';
  ELSIF NEW.quantity_available > 0 AND (OLD IS NULL OR OLD.status = 'sold_out') THEN
    NEW.status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Auto-transition collection status
CREATE OR REPLACE FUNCTION update_collection_status()
RETURNS void AS $$
BEGIN
  UPDATE collections SET status = 'ended', updated_at = now()
  WHERE drop_end_date < now() AND status = 'live';

  UPDATE collections SET status = 'live', updated_at = now()
  WHERE drop_start_date <= now() AND drop_end_date > now() AND status = 'draft';
END;
$$ LANGUAGE plpgsql;

-- 5. Decrement inventory on paid order
CREATE OR REPLACE FUNCTION decrement_product_quantity()
RETURNS TRIGGER AS $$
DECLARE v_available INTEGER;
BEGIN
  IF NEW.status = 'paid' AND (OLD IS NULL OR OLD.status != 'paid') THEN
    SELECT quantity_available INTO v_available FROM products WHERE id = NEW.product_id FOR UPDATE;
    IF v_available IS NULL THEN RAISE EXCEPTION 'Product not found: %', NEW.product_id; END IF;
    IF v_available < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', NEW.product_id, v_available, NEW.quantity;
    END IF;
    UPDATE products SET quantity_available = quantity_available - NEW.quantity WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Designer analytics
CREATE OR REPLACE FUNCTION get_designer_analytics(designer_uuid UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE((SELECT SUM(designer_payout) FROM orders WHERE designer_id = designer_uuid AND status IN ('paid','shipped','delivered')), 0),
    'total_orders', COALESCE((SELECT COUNT(*) FROM orders WHERE designer_id = designer_uuid AND status != 'cancelled'), 0),
    'products_sold', COALESCE((SELECT SUM(quantity) FROM orders WHERE designer_id = designer_uuid AND status IN ('paid','shipped','delivered')), 0),
    'active_collections', COALESCE((SELECT COUNT(*) FROM collections WHERE designer_id = designer_uuid AND status = 'live'), 0),
    'followers_count', COALESCE((SELECT COUNT(*) FROM follows WHERE designer_id = designer_uuid), 0)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Trending collections
CREATE OR REPLACE FUNCTION get_trending_collections(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  collection_id UUID, title TEXT, description TEXT, designer_id UUID,
  designer_name TEXT, drop_start_date TIMESTAMPTZ, drop_end_date TIMESTAMPTZ,
  status collection_status_enum, order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.title, c.description, c.designer_id, u.full_name,
    c.drop_start_date, c.drop_end_date, c.status, COUNT(o.id) AS order_count
  FROM collections c
  JOIN products p ON p.collection_id = c.id
  JOIN orders o ON o.product_id = p.id
  JOIN users u ON u.id = c.designer_id
  WHERE o.created_at > now() - INTERVAL '7 days' AND o.status != 'cancelled'
  GROUP BY c.id, c.title, c.description, c.designer_id, u.full_name, c.drop_start_date, c.drop_end_date, c.status
  ORDER BY order_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 004: TRIGGERS                                                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_designer_profiles_updated_at BEFORE UPDATE ON designer_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_product_status BEFORE INSERT OR UPDATE OF quantity_available ON products FOR EACH ROW EXECUTE FUNCTION update_product_status();
CREATE TRIGGER trg_decrement_quantity AFTER INSERT OR UPDATE OF status ON orders FOR EACH ROW EXECUTE FUNCTION decrement_product_quantity();


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 005: ROW LEVEL SECURITY                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE designer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- USERS
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Public can view basic designer info" ON users FOR SELECT USING (user_type IN ('student', 'pro_designer'));

-- DESIGNER PROFILES
CREATE POLICY "Anyone can view verified designers" ON designer_profiles FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Designers can view their own profile" ON designer_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Designers can update their own profile" ON designer_profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Designers can insert their own profile" ON designer_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- COLLECTIONS
CREATE POLICY "Anyone can view live collections" ON collections FOR SELECT USING (status = 'live');
CREATE POLICY "Designers can view their own collections" ON collections FOR SELECT USING (designer_id = auth.uid());
CREATE POLICY "Designers can insert their own collections" ON collections FOR INSERT WITH CHECK (designer_id = auth.uid());
CREATE POLICY "Designers can update their own collections" ON collections FOR UPDATE USING (designer_id = auth.uid()) WITH CHECK (designer_id = auth.uid());
CREATE POLICY "Designers can delete their own collections" ON collections FOR DELETE USING (designer_id = auth.uid());

-- PRODUCTS
CREATE POLICY "Anyone can view products in live collections" ON products FOR SELECT
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.status = 'live'));
CREATE POLICY "Designers can view their own products" ON products FOR SELECT
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.designer_id = auth.uid()));
CREATE POLICY "Designers can insert products to their collections" ON products FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.designer_id = auth.uid()));
CREATE POLICY "Designers can update their own products" ON products FOR UPDATE
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.designer_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.designer_id = auth.uid()));
CREATE POLICY "Designers can delete their own products" ON products FOR DELETE
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = products.collection_id AND collections.designer_id = auth.uid()));

-- ORDERS
CREATE POLICY "Buyers can view their own orders" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Designers can view orders for their products" ON orders FOR SELECT USING (designer_id = auth.uid());
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());

-- FOLLOWS
CREATE POLICY "Users can view their own follows" ON follows FOR SELECT USING (follower_id = auth.uid());
CREATE POLICY "Designers can see who follows them" ON follows FOR SELECT USING (designer_id = auth.uid());
CREATE POLICY "Users can insert their own follows" ON follows FOR INSERT WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can delete their own follows" ON follows FOR DELETE USING (follower_id = auth.uid());
CREATE POLICY "Anyone can count designer followers" ON follows FOR SELECT USING (true);

-- CART ITEMS
CREATE POLICY "Users can view their own cart" ON cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert to their own cart" ON cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own cart" ON cart_items FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete from their own cart" ON cart_items FOR DELETE USING (user_id = auth.uid());


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 006: STORAGE BUCKETS                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('portfolio-images', 'portfolio-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('verification-docs', 'verification-docs', false, 5242880, ARRAY['application/pdf','image/jpeg','image/png']);

-- PROFILE IMAGES storage policies
CREATE POLICY "Users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete profile images" ON storage.objects FOR DELETE USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');

-- PORTFOLIO IMAGES storage policies
CREATE POLICY "Designers can upload portfolio images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Designers can update portfolio images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Designers can delete portfolio images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-images' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view portfolio images" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-images');

-- PRODUCT IMAGES storage policies
CREATE POLICY "Designers can upload product images" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM collections WHERE collections.id = (storage.foldername(name))[1]::uuid AND collections.designer_id = auth.uid()));
CREATE POLICY "Designers can update product images" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM collections WHERE collections.id = (storage.foldername(name))[1]::uuid AND collections.designer_id = auth.uid()));
CREATE POLICY "Designers can delete product images" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM collections WHERE collections.id = (storage.foldername(name))[1]::uuid AND collections.designer_id = auth.uid()));
CREATE POLICY "Anyone can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

-- VERIFICATION DOCS storage policies
CREATE POLICY "Designers can upload verification docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Designers can view own verification docs" ON storage.objects FOR SELECT USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Designers can update verification docs" ON storage.objects FOR UPDATE USING (bucket_id = 'verification-docs' AND (storage.foldername(name))[1] = auth.uid()::text);


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 007: ENABLE REALTIME                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

ALTER PUBLICATION supabase_realtime ADD TABLE collections;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE follows;


-- ╔═══════════════════════════════════════════════════════════════════════════╗
-- ║  MIGRATION 008: ANALYTICS SNAPSHOT TABLE                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot    JSON NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_analytics_snapshot_designer ON analytics_snapshots (designer_id, created_at DESC);
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Designers can view their own analytics" ON analytics_snapshots FOR SELECT USING (designer_id = auth.uid());


-- ============================================================================
-- ✅ ALL MIGRATIONS COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Run the seed.sql file to populate test data
-- 2. Set up pg_cron jobs (if on Pro plan) or use Edge Function scheduled triggers
-- 3. Deploy Edge Functions via Supabase CLI
-- ============================================================================

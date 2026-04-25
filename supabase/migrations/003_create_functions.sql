-- ============================================================================
-- ATELIER LAUNCH — Migration 003: Create Database Functions
-- ============================================================================
-- Depends on: 002_create_tables.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. AUTO-UPDATE updated_at TIMESTAMP
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 2. COMMISSION CALCULATOR
-- Student designers: 15% platform commission
-- Pro designers:    10% platform commission
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_commission(
  p_total_amount DECIMAL,
  p_user_type    TEXT
)
RETURNS DECIMAL AS $$
BEGIN
  IF p_user_type = 'student' THEN
    RETURN ROUND(p_total_amount * 0.15, 2);
  ELSE
    RETURN ROUND(p_total_amount * 0.10, 2);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- 3. AUTO-UPDATE PRODUCT STATUS based on quantity
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_available = 0 THEN
    NEW.status = 'sold_out';
  ELSIF NEW.quantity_available > 0 AND OLD.status = 'sold_out' THEN
    NEW.status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 4. AUTO-TRANSITION COLLECTION STATUS (scheduled)
-- draft → live  when drop_start_date <= NOW()
-- live  → ended when drop_end_date < NOW()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_collection_status()
RETURNS void AS $$
BEGIN
  -- End collections whose drop window has passed
  UPDATE collections
  SET    status     = 'ended',
         updated_at = now()
  WHERE  drop_end_date < now()
    AND  status = 'live';

  -- Activate collections whose drop window has started
  UPDATE collections
  SET    status     = 'live',
         updated_at = now()
  WHERE  drop_start_date <= now()
    AND  drop_end_date > now()
    AND  status = 'draft';
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 5. DECREMENT PRODUCT QUANTITY on paid order
-- Raises exception if insufficient stock
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION decrement_product_quantity()
RETURNS TRIGGER AS $$
DECLARE
  v_available INTEGER;
BEGIN
  -- Only decrement when order status changes to 'paid'
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Lock the product row to prevent race conditions
    SELECT quantity_available INTO v_available
    FROM   products
    WHERE  id = NEW.product_id
    FOR UPDATE;

    IF v_available IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', NEW.product_id;
    END IF;

    IF v_available < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %',
        NEW.product_id, v_available, NEW.quantity;
    END IF;

    UPDATE products
    SET    quantity_available = quantity_available - NEW.quantity
    WHERE  id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- 6. DESIGNER ANALYTICS
-- Returns aggregated metrics for a designer's dashboard
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_designer_analytics(designer_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_revenue',      COALESCE(
      (SELECT SUM(designer_payout)
       FROM   orders
       WHERE  designer_id = designer_uuid
         AND  status IN ('paid', 'shipped', 'delivered')),
      0
    ),
    'total_orders',       COALESCE(
      (SELECT COUNT(*)
       FROM   orders
       WHERE  designer_id = designer_uuid
         AND  status != 'cancelled'),
      0
    ),
    'products_sold',      COALESCE(
      (SELECT SUM(quantity)
       FROM   orders
       WHERE  designer_id = designer_uuid
         AND  status IN ('paid', 'shipped', 'delivered')),
      0
    ),
    'active_collections', COALESCE(
      (SELECT COUNT(*)
       FROM   collections
       WHERE  designer_id = designer_uuid
         AND  status = 'live'),
      0
    ),
    'followers_count',    COALESCE(
      (SELECT COUNT(*)
       FROM   follows
       WHERE  designer_id = designer_uuid),
      0
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ---------------------------------------------------------------------------
-- 7. TRENDING COLLECTIONS
-- Collections with the most orders in the last 7 days
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_trending_collections(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  collection_id   UUID,
  title           TEXT,
  description     TEXT,
  designer_id     UUID,
  designer_name   TEXT,
  drop_start_date TIMESTAMPTZ,
  drop_end_date   TIMESTAMPTZ,
  status          collection_status_enum,
  order_count     BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id              AS collection_id,
    c.title,
    c.description,
    c.designer_id,
    u.full_name       AS designer_name,
    c.drop_start_date,
    c.drop_end_date,
    c.status,
    COUNT(o.id)       AS order_count
  FROM   collections c
  JOIN   products p ON p.collection_id = c.id
  JOIN   orders o   ON o.product_id = p.id
  JOIN   users u    ON u.id = c.designer_id
  WHERE  o.created_at > now() - INTERVAL '7 days'
    AND  o.status != 'cancelled'
  GROUP  BY c.id, c.title, c.description, c.designer_id,
            u.full_name, c.drop_start_date, c.drop_end_date, c.status
  ORDER  BY order_count DESC
  LIMIT  limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

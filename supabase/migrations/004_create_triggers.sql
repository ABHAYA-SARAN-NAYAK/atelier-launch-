-- ============================================================================
-- ATELIER LAUNCH — Migration 004: Create Triggers
-- ============================================================================
-- Depends on: 003_create_functions.sql
-- ============================================================================

-- ---------------------------------------------------------------------------
-- AUTO-UPDATE updated_at TRIGGERS
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_designer_profiles_updated_at
  BEFORE UPDATE ON designer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- PRODUCT STATUS AUTO-UPDATE TRIGGER
-- When quantity_available changes, auto-set status
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_product_status
  BEFORE INSERT OR UPDATE OF quantity_available ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_status();

-- ---------------------------------------------------------------------------
-- DECREMENT PRODUCT QUANTITY ON PAID ORDER
-- Fires when an order's status is set/changed to 'paid'
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_decrement_quantity
  AFTER INSERT OR UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_product_quantity();

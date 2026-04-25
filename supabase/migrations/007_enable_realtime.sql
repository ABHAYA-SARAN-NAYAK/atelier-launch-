-- ============================================================================
-- ATELIER LAUNCH — Migration 007: Enable Realtime
-- ============================================================================
-- Enable Supabase Realtime subscriptions on key tables
-- ============================================================================

-- Collections: live drop countdown updates
ALTER PUBLICATION supabase_realtime ADD TABLE collections;

-- Products: inventory changes (quantity_available, status)
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Orders: real-time order status updates
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Follows: follower count updates
ALTER PUBLICATION supabase_realtime ADD TABLE follows;

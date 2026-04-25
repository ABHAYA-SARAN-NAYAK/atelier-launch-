-- ============================================================================
-- ATELIER LAUNCH — Migration 008: Cron Jobs (pg_cron)
-- ============================================================================
-- Requires pg_cron extension (enabled by default on Supabase Pro+)
-- If not available, use Edge Functions with scheduled triggers instead.
-- ============================================================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------------------------------------------------------------------------
-- 1. UPDATE COLLECTION STATUSES (every hour)
-- Auto-transition: draft → live → ended based on timestamps
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'update-collection-statuses',
  '0 * * * *',              -- Every hour at minute 0
  $$SELECT update_collection_status()$$
);

-- ---------------------------------------------------------------------------
-- 2. CLEAN UP ABANDONED CARTS (daily at 2:00 AM UTC)
-- Remove cart items older than 7 days
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'cleanup-abandoned-carts',
  '0 2 * * *',              -- Daily at 2:00 AM UTC
  $$DELETE FROM cart_items WHERE created_at < now() - INTERVAL '7 days'$$
);

-- ---------------------------------------------------------------------------
-- 3. GENERATE ANALYTICS SNAPSHOT (daily at 3:00 AM UTC)
-- Optional: creates daily snapshot table if you want historical tracking
-- ---------------------------------------------------------------------------

-- Create analytics snapshot table (optional)
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  snapshot    JSON NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_snapshot_designer ON analytics_snapshots (designer_id, created_at DESC);

-- Enable RLS
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Designers can view their own analytics"
  ON analytics_snapshots FOR SELECT
  USING (designer_id = auth.uid());

-- Schedule daily analytics snapshot
SELECT cron.schedule(
  'daily-analytics-snapshot',
  '0 3 * * *',              -- Daily at 3:00 AM UTC
  $$
  INSERT INTO analytics_snapshots (designer_id, snapshot)
  SELECT
    u.id,
    get_designer_analytics(u.id)
  FROM users u
  WHERE u.user_type IN ('student', 'pro_designer')
  $$
);

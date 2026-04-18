CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── users (authentication + core profile) ───
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  phone             TEXT UNIQUE NOT NULL,
  password          TEXT NOT NULL,
  role              TEXT NOT NULL CHECK (role IN ('farmer','buyer','trader','admin')),

  -- Profile fields (editable by the user themselves)
  avatar_url        TEXT,
  birth_date        DATE,
  bio               TEXT,
  division          TEXT,
  district          TEXT,
  upazila           TEXT,
  union_name        TEXT,
  village           TEXT,

  -- Reputation (auto-computed as user completes deals)
  quality_score     NUMERIC(3,1) DEFAULT 0.0,
  completion_rate   NUMERIC(5,2) DEFAULT 100.0,
  deals_completed   INT DEFAULT 0,
  is_verified       BOOLEAN DEFAULT FALSE,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ─── listings (crops posted by farmers & traders) ───
CREATE TABLE IF NOT EXISTS listings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  crop_name         TEXT NOT NULL,
  quantity_min      NUMERIC NOT NULL,
  quantity_max      NUMERIC NOT NULL,
  price_per_kg      NUMERIC NOT NULL,
  market_price      NUMERIC,
  available_until   DATE NOT NULL,

  division          TEXT NOT NULL,
  district          TEXT NOT NULL,
  upazila           TEXT,
  union_name        TEXT,
  village           TEXT,

  road_access       TEXT DEFAULT 'paved' CHECK (road_access IN ('paved','unpaved','seasonal')),
  is_urgent         BOOLEAN DEFAULT FALSE,
  source            TEXT DEFAULT 'farmer' CHECK (source IN ('farmer','trader')),
  source_farm_price NUMERIC,
  source_info       TEXT,

  description       TEXT,
  contact_phone     TEXT,
  photos            TEXT[] DEFAULT '{}',

  status            TEXT DEFAULT 'active' CHECK (status IN ('active','negotiating','reserved','sold','cancelled','expired')),

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT qty_range_valid CHECK (quantity_max >= quantity_min)
);

CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_crop ON listings(crop_name, status);
CREATE INDEX IF NOT EXISTS idx_listings_geo ON listings(division, district, upazila, status);
CREATE INDEX IF NOT EXISTS idx_listings_urgent ON listings(is_urgent, status) WHERE is_urgent = TRUE;

-- ─── offers ───
CREATE TABLE IF NOT EXISTS offers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id     UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offered_price  NUMERIC NOT NULL,
  quantity       NUMERIC NOT NULL,
  message        TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_listing ON offers(listing_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON offers(buyer_id, status);

-- ─── notifications ───
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT DEFAULT 'info',
  related_id UUID,
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read, created_at DESC);

-- ─── orders ───
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id      UUID REFERENCES listings(id) ON DELETE SET NULL,
  seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  crop_name       TEXT NOT NULL,
  quantity        NUMERIC NOT NULL,
  final_price     NUMERIC NOT NULL,
  total_amount    NUMERIC NOT NULL,

  status          TEXT DEFAULT 'completed' CHECK (status IN ('completed','disputed','cancelled')),
  completed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, completed_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKETS for photos (listing photos + profile avatars)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('listing-photos', 'listing-photos', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: PostgreSQL does NOT support "CREATE POLICY IF NOT EXISTS".
-- We must drop any existing policy first, then create it.
DROP POLICY IF EXISTS "Public can view listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own listing photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

CREATE POLICY "Public can view listing photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated can upload listing photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "Users can delete own listing photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-photos');

CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars');

-- ─── updated_at trigger ───
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS listings_updated_at ON listings;
CREATE TRIGGER listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Crop aggregation function (for Geographic Browse) ───
CREATE OR REPLACE FUNCTION get_crop_aggregates(
  p_crop TEXT,
  p_level TEXT,
  p_division TEXT DEFAULT NULL,
  p_district TEXT DEFAULT NULL,
  p_upazila TEXT DEFAULT NULL
)
RETURNS TABLE (
  name TEXT,
  total_stock NUMERIC,
  farmer_count BIGINT,
  min_price NUMERIC,
  listing_count BIGINT
) AS $$
BEGIN
  IF p_level = 'division' THEN
    RETURN QUERY
    SELECT l.division AS name,
           COALESCE(SUM(l.quantity_max), 0)::NUMERIC AS total_stock,
           COUNT(DISTINCT l.owner_id) AS farmer_count,
           COALESCE(MIN(l.price_per_kg), 0)::NUMERIC AS min_price,
           COUNT(l.id) AS listing_count
    FROM listings l
    WHERE l.crop_name = p_crop AND l.status = 'active'
    GROUP BY l.division
    ORDER BY total_stock DESC;

  ELSIF p_level = 'district' AND p_division IS NOT NULL THEN
    RETURN QUERY
    SELECT l.district AS name,
           COALESCE(SUM(l.quantity_max), 0)::NUMERIC AS total_stock,
           COUNT(DISTINCT l.owner_id) AS farmer_count,
           COALESCE(MIN(l.price_per_kg), 0)::NUMERIC AS min_price,
           COUNT(l.id) AS listing_count
    FROM listings l
    WHERE l.crop_name = p_crop AND l.status = 'active' AND l.division = p_division
    GROUP BY l.district
    ORDER BY total_stock DESC;

  ELSIF p_level = 'upazila' AND p_division IS NOT NULL AND p_district IS NOT NULL THEN
    RETURN QUERY
    SELECT COALESCE(l.upazila, 'Unknown') AS name,
           COALESCE(SUM(l.quantity_max), 0)::NUMERIC AS total_stock,
           COUNT(DISTINCT l.owner_id) AS farmer_count,
           COALESCE(MIN(l.price_per_kg), 0)::NUMERIC AS min_price,
           COUNT(l.id) AS listing_count
    FROM listings l
    WHERE l.crop_name = p_crop AND l.status = 'active'
      AND l.division = p_division AND l.district = p_district
    GROUP BY l.upazila
    ORDER BY total_stock DESC;

  ELSIF p_level = 'union' AND p_division IS NOT NULL AND p_district IS NOT NULL AND p_upazila IS NOT NULL THEN
    RETURN QUERY
    SELECT COALESCE(l.union_name, 'Unknown') AS name,
           COALESCE(SUM(l.quantity_max), 0)::NUMERIC AS total_stock,
           COUNT(DISTINCT l.owner_id) AS farmer_count,
           COALESCE(MIN(l.price_per_kg), 0)::NUMERIC AS min_price,
           COUNT(l.id) AS listing_count
    FROM listings l
    WHERE l.crop_name = p_crop AND l.status = 'active'
      AND l.division = p_division AND l.district = p_district AND l.upazila = p_upazila
    GROUP BY l.union_name
    ORDER BY total_stock DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ─── Verify setup ───
SELECT 'Schema setup complete! Tables: ' ||
  (SELECT COUNT(*) FROM information_schema.tables
   WHERE table_schema = 'public'
     AND table_name IN ('users','listings','offers','notifications','orders'))::text ||
  ' / 5' AS status;

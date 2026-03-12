-- Before/After pairs table for multiple before & after comparisons
CREATE TABLE IF NOT EXISTS before_after_pairs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE before_after_pairs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view before_after_pairs"
  ON before_after_pairs FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage before_after_pairs"
  ON before_after_pairs FOR ALL USING (auth.role() = 'authenticated');

-- Migrate existing pair from site_settings into the new table
INSERT INTO before_after_pairs (title, before_image, after_image, display_order)
SELECT
  'Default',
  (SELECT value FROM site_settings WHERE key = 'before_after_before_image'),
  (SELECT value FROM site_settings WHERE key = 'before_after_after_image'),
  0
WHERE EXISTS (SELECT 1 FROM site_settings WHERE key = 'before_after_before_image')
  AND EXISTS (SELECT 1 FROM site_settings WHERE key = 'before_after_after_image');

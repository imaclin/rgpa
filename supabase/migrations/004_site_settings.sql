-- Site settings table for key-value configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

-- Authenticated users can manage settings
CREATE POLICY "Authenticated users can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default before/after images
INSERT INTO site_settings (key, value) VALUES
  ('before_after_before_image', 'https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/9f4b5397-d9d4-46d0-ba4f-d760fe35e922.jpeg?im_w=1200'),
  ('before_after_after_image', 'https://a0.muscache.com/im/pictures/miso/Hosting-1216698124792854681/original/52034d96-99fc-4a0f-9bff-90c6f573573b.jpeg?im_w=1200')
ON CONFLICT (key) DO NOTHING;

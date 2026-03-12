-- RGPA Database Schema
-- Run this in the Supabase SQL Editor for a fresh project.
-- This is a complete schema (replaces 001–012).

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROPERTIES (renamed from projects)
-- ============================================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('residential', 'commercial', 'mixed-use')) DEFAULT 'residential',
  status TEXT CHECK (status IN ('draft', 'completed', 'in-progress', 'coming-soon', 'archived', 'for-sale', 'for-rent', 'sold')) DEFAULT 'draft',
  location TEXT,
  year INTEGER,
  sq_footage INTEGER,
  website_url TEXT,
  featured_image_url TEXT,
  body_content JSONB,
  testimonial TEXT,
  client_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view properties" ON properties
  FOR SELECT USING (status != 'archived');

CREATE POLICY "Authenticated users can manage properties" ON properties
  FOR ALL USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- MEDIA (property_id instead of project_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video')) DEFAULT 'image',
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  file_size INTEGER,
  dimensions JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_property_id ON media(property_id);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  social_links JSONB,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(active);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view team members" ON team_members
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can manage team members" ON team_members
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  detail_hero_title TEXT,
  detail_hero_description TEXT,
  icon_name TEXT,
  featured_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can manage services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TESTIMONIALS (property_id instead of project_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- TASKS (property_id instead of project_id)
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_property_id ON tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage tasks" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- PROPERTY FILES (renamed from project_files)
-- ============================================================
CREATE TABLE IF NOT EXISTS property_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_files_property_id ON property_files(property_id);

ALTER TABLE property_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage property files" ON property_files
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- PROPERTY BEFORE/AFTER (renamed from project_before_after)
-- ============================================================
CREATE TABLE IF NOT EXISTS property_before_after (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_before_after_property_id ON property_before_after(property_id);

ALTER TABLE property_before_after ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view property_before_after" ON property_before_after
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage property_before_after" ON property_before_after
  FOR ALL USING (auth.role() = 'authenticated');

CREATE TRIGGER update_property_before_after_updated_at
  BEFORE UPDATE ON property_before_after
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage site settings" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit messages" ON messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can manage messages" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- ABOUT PAGE CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS about_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section TEXT UNIQUE NOT NULL,
  content JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view about content" ON about_content
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage about content" ON about_content
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA
-- ============================================================
INSERT INTO team_members (name, role, bio, sort_order) VALUES
  ('RG', 'Principal Advisor', 'With extensive experience in property acquisition and investment advisory, RG brings deep market knowledge and a track record of successful transactions.', 0)
ON CONFLICT DO NOTHING;

INSERT INTO services (title, slug, description, icon_name, featured_order) VALUES
  ('Property Acquisition', 'property-acquisition', 'Expert guidance through every step of the acquisition process, from sourcing to closing.', 'Building2', 0),
  ('Investment Advisory', 'investment-advisory', 'Strategic investment advice tailored to your portfolio goals and risk profile.', 'TrendingUp', 1),
  ('Portfolio Management', 'portfolio-management', 'Active management of your property portfolio to maximize returns and minimize risk.', 'BarChart3', 2),
  ('Market Analysis', 'market-analysis', 'In-depth market research and analysis to inform your investment decisions.', 'Search', 3)
ON CONFLICT DO NOTHING;

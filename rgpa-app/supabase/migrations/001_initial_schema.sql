-- REVIFI Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('residential', 'commercial', 'mixed-use')) DEFAULT 'residential',
  status TEXT CHECK (status IN ('draft', 'completed', 'in-progress', 'coming-soon', 'archived')) DEFAULT 'draft',
  location TEXT,
  year INTEGER,
  sq_footage INTEGER,
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

-- Media table
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video')) DEFAULT 'image',
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  file_size INTEGER,
  dimensions JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
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

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  featured_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_media_project_id ON media(project_id);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(active);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view projects" ON projects
  FOR SELECT USING (status != 'archived');

CREATE POLICY "Public can view media" ON media
  FOR SELECT USING (true);

CREATE POLICY "Public can view team members" ON team_members
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view services" ON services
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view testimonials" ON testimonials
  FOR SELECT USING (true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Authenticated users can manage projects" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage media" ON media
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage team members" ON team_members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage services" ON services
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage testimonials" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for team members
INSERT INTO team_members (name, role, bio, sort_order) VALUES
  ('KC Stitak', 'Architect & Construction Management', 'With extensive experience in architectural design and construction management, KC brings a unique perspective to every project, ensuring structural integrity meets aesthetic excellence.', 0),
  ('Kyle Lawrence', 'Designer & Client Relations', 'Kyle''s eye for design and dedication to client satisfaction ensures that every project reflects the unique vision and personality of its owners.', 1)
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (title, description, icon_name, featured_order) VALUES
  ('Commercial Building Restoration', 'Transform your vision into reality with our expert restoration services. From concept to construction, we specialize in crafting innovative and functional spaces.', 'Building2', 0),
  ('Interior Design Mastery', 'Curated interiors that blend elegance with functionality, creating spaces that inspire and delight.', 'Paintbrush', 1),
  ('Project Consultation', 'Expert guidance from concept to completion, ensuring your project meets all objectives.', 'Lightbulb', 2),
  ('Effortless Acquisition', 'Seamless property acquisition and development services tailored to your investment goals.', 'Users', 3)
ON CONFLICT DO NOTHING;

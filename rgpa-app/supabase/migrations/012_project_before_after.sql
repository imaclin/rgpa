-- Per-project before/after pairs
CREATE TABLE IF NOT EXISTS project_before_after (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT,
  before_image TEXT NOT NULL,
  after_image TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_before_after ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view project_before_after"
  ON project_before_after FOR SELECT USING (true);

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage project_before_after"
  ON project_before_after FOR ALL USING (auth.role() = 'authenticated');

-- Index for fast lookups by project
CREATE INDEX idx_project_before_after_project_id ON project_before_after(project_id);

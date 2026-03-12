-- Project files table for document uploads
CREATE TABLE IF NOT EXISTS project_files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);

-- Enable RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Authenticated users only (no public access)
CREATE POLICY "Authenticated users can manage project files" ON project_files
  FOR ALL USING (auth.role() = 'authenticated');

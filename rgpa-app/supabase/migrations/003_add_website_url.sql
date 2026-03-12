-- Add website_url field to projects table
ALTER TABLE projects
ADD COLUMN website_url TEXT;

COMMENT ON COLUMN projects.website_url IS 'External website link for the project (Airbnb, business site, etc.)';

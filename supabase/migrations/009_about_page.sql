-- About page content (key-value for intro text)
DROP TABLE IF EXISTS about_content CASCADE;

CREATE TABLE IF NOT EXISTS about_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE about_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view about_content" ON about_content;
CREATE POLICY "Public can view about_content"
  ON about_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage about_content" ON about_content;
CREATE POLICY "Authenticated users can manage about_content"
  ON about_content FOR ALL USING (auth.role() = 'authenticated');

-- About process steps
DROP TABLE IF EXISTS about_process_steps CASCADE;

CREATE TABLE IF NOT EXISTS about_process_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sort_order INTEGER DEFAULT 0,
  step_number TEXT NOT NULL DEFAULT '01',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Search',
  bg_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE about_process_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view about_process_steps" ON about_process_steps;
CREATE POLICY "Public can view about_process_steps"
  ON about_process_steps FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage about_process_steps" ON about_process_steps;
CREATE POLICY "Authenticated users can manage about_process_steps"
  ON about_process_steps FOR ALL USING (auth.role() = 'authenticated');

-- Seed intro paragraphs
INSERT INTO about_content (key, value) VALUES
  ('intro_paragraph_1', 'At REVIFI, we don''t just design spaces; we tell stories. Our journey is rooted in a passion for architectural innovation and interior design mastery. With a commitment to excellence, we transform your dreams into sophisticated, functional, and timeless realities.'),
  ('intro_paragraph_2', 'Our comprehensive start-to-finish approach sets us apart from many other investment companies and design firms, ensuring unparalleled dedication to every project.')
ON CONFLICT (key) DO NOTHING;

-- Seed process steps
INSERT INTO about_process_steps (sort_order, step_number, title, description, icon, bg_image) VALUES
(0, '01', 'Discovery and Acquisition',
  'Begin your design journey with an in-depth consultation. We explore your aspirations, preferences, and lifestyle, ensuring that every detail aligns with your unique vision.',
  'Search',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop'),
(1, '02', 'Conceptualization and Ideation',
  'Our creative team develops innovative concepts that capture the essence of your vision while pushing the boundaries of design excellence.',
  'Lightbulb',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=600&fit=crop'),
(2, '03', 'Design Development',
  'We refine and develop the chosen concept into detailed plans, selecting materials, finishes, and fixtures that bring your vision to life.',
  'PenTool',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop'),
(3, '04', 'Implementation and Construction',
  'Our skilled craftsmen execute the design with precision and care, ensuring every detail meets our exacting standards.',
  'Hammer',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop'),
(4, '05', 'Finishing Touches',
  'We add the final details that transform a space from complete to extraordinary, curating every element for maximum impact.',
  'Sparkles',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop'),
(5, '06', 'Presentation and Delivery',
  'Your transformed space is revealed, ready to inspire and delight for years to come.',
  'Gift',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop');

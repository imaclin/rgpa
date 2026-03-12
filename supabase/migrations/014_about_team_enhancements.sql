-- ============================================================
-- About & Team Enhancements Migration
-- ============================================================

-- 1. Add phone column to team_members table
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Create about_values table for core values
CREATE TABLE IF NOT EXISTS about_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on about_values
ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;

-- Create policies for about_values
CREATE POLICY "Public can view about_values" ON about_values
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage about_values" ON about_values
  FOR ALL USING (auth.role() = 'authenticated');

-- 3. Seed core values data
INSERT INTO about_values (sort_order, title, description) VALUES
  (0, 'Professionalism', 'We service all our clients and those we interact with in a professional manner guided by the Realtor Code of Ethics.'),
  (1, 'Integrity', 'Respecting our clients, treating them with honesty, loyalty, discretion, advocating for their best interests and following their lawful instructions.'),
  (2, 'Expertise', 'Provide the highest degree of real estate skill & knowledge in all real estate services. We will always strive for the best outcome attainable for our clients.'),
  (3, 'Service', 'We will be diligent, prompt, and timely in all communications and dealings affecting our client''s real estate transactions. The Red Group will always put the client''s interest first.'),
  (4, 'Education', 'Continuously educate our agents and clients in the knowledge and understanding of the real estate industry and its practices. This value will lead to a better outcome and more satisfying experience.'),
  (5, 'Innovation', 'Through education, technology, and the introduction of progressive methods in customer service, we assist our clients to gain a competitive advantage in the market.')
ON CONFLICT DO NOTHING;

-- 4. Handle about_content table schema compatibility
-- Check if table uses key/value schema (migration 009) or section/content schema (migration 013)
-- We'll handle both cases by checking which columns exist

-- Insert using section/content schema (migration 013)
-- This will fail if the table uses key/value schema, but that's OK
DO $$
BEGIN
    -- Try section/content schema first
    INSERT INTO about_content (section, content) VALUES
      ('intro_paragraphs', '{
        "intro_paragraph_1": "At RG Property Advisors, we don''t just close deals — we build lasting relationships.",
        "intro_paragraph_2": "Our deep knowledge of the Greater Cleveland market sets us apart."
      }'),
      ('mission', '{
        "mission": "RG Property Advisors are a team of agents who strive to provide our clients with unmatched representation and service in all aspects of the real estate experience. Our team is sculpted by our core values of integrity, professionalism, service, education and innovation. We will always put our clients interest first, for the betterment of their financial well being and quality of life."
      }'),
      ('understanding_clients', '{
        "understanding_clients": "RG Property Advisors would like to welcome you to an innovative and fresh real estate experience. The goal of our professionally trained realtors is to provide our clients with exceptional service which starts with getting to know the people we represent on a more personal level. Core values will shape your decisions when buying and selling a home. By better understanding what drives and motives the people we work with, the more effective our team can be at helping their clients reach their personal and financial goals. The Red Group will provide you with the type of information, expertise, and service that will make your real estate transaction seamless and worry free. Whether you are selling a lakefront home in Rocky River, or looking to sell a starter home in the City of Cleveland, we welcome you to navigate through our website, learn more about us, and see if we can be a fit!"
      }'),
      ('images', '{
        "hero_image_url": "https://rgpropertyadvisors.com/wp-content/uploads/2022/01/KW-44-scaled.jpg",
        "secondary_image_url": "https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-41.jpg"
      }'),
      ('contact_info', '{
        "contact_phone": "(216)-408-3082",
        "contact_email": "info@rgpropertyadvisors.com",
        "office_address": "Keller Williams Citywide, 2001 Crocker Rd #200, Westlake, OH 44145"
      }')
    ON CONFLICT (section) DO NOTHING;
EXCEPTION WHEN undefined_column THEN
    -- If section/content schema doesn't exist, try key/value schema (migration 009)
    INSERT INTO about_content (key, value) VALUES
      ('intro_paragraph_1', 'At RG Property Advisors, we don''t just close deals — we build lasting relationships.'),
      ('intro_paragraph_2', 'Our deep knowledge of the Greater Cleveland market sets us apart.'),
      ('mission', 'RG Property Advisors are a team of agents who strive to provide our clients with unmatched representation and service in all aspects of the real estate experience. Our team is sculpted by our core values of integrity, professionalism, service, education and innovation. We will always put our clients interest first, for the betterment of their financial well being and quality of life.'),
      ('understanding_clients', 'RG Property Advisors would like to welcome you to an innovative and fresh real estate experience. The goal of our professionally trained realtors is to provide our clients with exceptional service which starts with getting to know the people we represent on a more personal level. Core values will shape your decisions when buying and selling a home. By better understanding what drives and motives the people we work with, the more effective our team can be at helping their clients reach their personal and financial goals. The Red Group will provide you with the type of information, expertise, and service that will make your real estate transaction seamless and worry free. Whether you are selling a lakefront home in Rocky River, or looking to sell a starter home in the City of Cleveland, we welcome you to navigate through our website, learn more about us, and see if we can be a fit!'),
      ('hero_image_url', 'https://rgpropertyadvisors.com/wp-content/uploads/2022/01/KW-44-scaled.jpg'),
      ('secondary_image_url', 'https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-41.jpg'),
      ('contact_phone', '(216)-408-3082'),
      ('contact_email', 'info@rgpropertyadvisors.com'),
      ('office_address', 'Keller Williams Citywide, 2001 Crocker Rd #200, Westlake, OH 44145')
    ON CONFLICT (key) DO NOTHING;
END
$$;

-- 5. Clean up old seed data and insert RGPA team members
-- Delete old seed data that doesn't match RGPA team
DELETE FROM team_members WHERE name = 'RG' AND role = 'Principal Advisor';
DELETE FROM team_members WHERE name = 'KC Stitak';

-- Insert RGPA team members
INSERT INTO team_members (name, role, bio, phone, image_url, sort_order) VALUES
  ('Kyle Lawrence', 'Founding Partner', 'Kyle Lawrence is one of the founding partners of RG Property Advisors. He grew up in Bay Village, Ohio and graduated from Ohio University. Licensed since 2014 and Keller Williams Rookie of the Year in 2015, Kyle has successfully invested in real estate since 2010 — buying, renovating, and reselling over 100 properties in the Greater Cleveland area. His construction experience spans investment rehab, long-term holdings, leases, and commercial event spaces.', NULL, 'https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-8.jpg', 0),
  ('Michael Thies', 'Partner', 'Licensed since 1996, Michael''s track record and professionalism are well established. He is consistently a top-selling agent in the Cleveland market. His experience, knowledge, and work ethic guarantee a rewarding real estate experience, fully utilizing the resources provided by Keller Williams Greater Cleveland West for buyers and sellers.', NULL, 'https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-12.jpg', 1),
  ('Robert Thies', 'Realtor', 'Born and raised in Bay Village and currently residing in Lakewood, Bob graduated from Ohio University in 2016. After years in leasing, property management, and sales across Ohio and Arizona, he returned to Cleveland and joined RG Property Advisors in 2020. Skilled in both buying and selling, Bob excels at providing clear guidance to his clients.', NULL, 'https://rgpropertyadvisors.com/wp-content/uploads/2022/07/RedGroup2-41-scaled.jpg', 2),
  ('Ali Sullivan', 'Realtor', 'Ali began her career managing client relationships and leasing luxury apartments in New York City. After years as global account director for Hendrick''s Gin, Ali brought her marketing expertise back to real estate. A Bay Village native and Ohio State alum, she helps clients across Northeast Ohio — from starter homes to high-end luxury properties.', '440-821-8992', 'https://rgpropertyadvisors.com/wp-content/uploads/2022/11/RAW0042-Large-1.jpg', 3),
  ('Megan Sislowski', 'Realtor', 'Megan is a dedicated member of the RG Property Advisors team, bringing professionalism and a client-first approach to every transaction in the Greater Cleveland area.', NULL, 'https://rgpropertyadvisors.com/wp-content/uploads/2023/01/RedGroup2-9-scaled.jpg', 4)
ON CONFLICT DO NOTHING;

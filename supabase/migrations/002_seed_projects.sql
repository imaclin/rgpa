-- Seed initial projects from the existing projects page
INSERT INTO projects (title, subtitle, description, category, status, slug, location, year, featured, sort_order)
VALUES 
  (
    'Lake Tahoe Project',
    'Mountain Haven',
    'New build in America''s most marvelous outdoors',
    'residential',
    'completed',
    'lake-tahoe',
    'Lake Tahoe, CA',
    2023,
    true,
    0
  ),
  (
    'Gordon Green',
    'Modern Event Space',
    'Historical building turned modern event space',
    'commercial',
    'completed',
    'gordon-green',
    'Cleveland, OH',
    2022,
    true,
    1
  ),
  (
    'GreenRoom',
    'Co-working Space',
    'Gordon Square''s first boutique office and social house',
    'commercial',
    'completed',
    'greenroom',
    'Cleveland, OH',
    2022,
    false,
    2
  ),
  (
    'The Primary',
    'Short Term Rental',
    'Large modern home inspired by color',
    'residential',
    'completed',
    'the-primary',
    'Cleveland, OH',
    2021,
    false,
    3
  ),
  (
    'Franklin Grand',
    'Timeless Classic',
    'Queen Anne Victorian short term rental in Hinge Town',
    'residential',
    'completed',
    'franklin-grand',
    'Cleveland, OH',
    2020,
    true,
    4
  ),
  (
    'Bamboo Haus',
    'New Age Classic',
    'High end Mid-Century Modern rental property in Ohio City',
    'residential',
    'completed',
    'bamboo-haus',
    'Cleveland, OH',
    2021,
    false,
    5
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  location = EXCLUDED.location,
  year = EXCLUDED.year,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order;

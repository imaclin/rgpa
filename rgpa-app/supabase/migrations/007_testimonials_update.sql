-- Add photo_url and role columns to testimonials table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS role TEXT;

-- Seed placeholder testimonials
INSERT INTO testimonials (client_name, role, content, photo_url, rating, featured, sort_order) VALUES
  ('Sarah Johnson', 'Modern Residence Owner', 'REVIFI transformed our house into a contemporary haven. The attention to detail, from sleek architectural lines to curated interiors, exceeded our expectations.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', 5, true, 0),
  ('Robert Mitchell', 'Commercial Space Owner', 'REVIFI seamlessly blended elegance and functionality in designing our office. Their innovative approach created an environment that not only impresses clients but also fosters a productive work atmosphere.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 5, true, 1),
  ('Alex & Mia Chen', 'Heritage Home Restorers', 'Preserving the charm of our heritage home was a delicate task, and REVIFI handled it with finesse. They masterfully combined modern amenities while respecting the historical elements.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face', 5, true, 2),
  ('David Park', 'Restaurant Owner', 'Working with REVIFI on our restaurant renovation was an incredible experience. They understood our vision from day one and delivered a space that our guests absolutely love.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 5, true, 3),
  ('Jessica Torres', 'Boutique Hotel Developer', 'The team at REVIFI brought our boutique hotel concept to life with incredible attention to detail. Every room tells a story, and our guests consistently rave about the design.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 5, true, 4),
  ('Marcus Williams', 'Property Investor', 'REVIFI has been instrumental in transforming undervalued properties into high-performing assets. Their expertise in historic renovation is unmatched in Cleveland.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 5, true, 5)
ON CONFLICT DO NOTHING;

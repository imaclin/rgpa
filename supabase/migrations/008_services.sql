-- Drop if partially created from a previous run
DROP TABLE IF EXISTS services CASCADE;

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,

  -- Home page fields
  home_title TEXT NOT NULL,
  home_description TEXT NOT NULL,
  home_icon TEXT NOT NULL DEFAULT 'Building2',
  home_bg_image TEXT,

  -- Services page fields
  services_title TEXT NOT NULL,
  services_description TEXT NOT NULL,
  services_features TEXT[] DEFAULT '{}',
  services_image TEXT,

  -- Service detail page fields
  detail_hero_description TEXT,
  detail_benefits JSONB DEFAULT '[]',
  detail_faqs JSONB DEFAULT '[]',
  detail_cta_title TEXT,
  detail_cta_description TEXT,

  -- SEO fields
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS policies
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view services" ON services;
CREATE POLICY "Public can view services"
  ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;
CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

-- Seed existing services
INSERT INTO services (slug, sort_order, home_title, home_description, home_icon, home_bg_image, services_title, services_description, services_features, services_image, detail_hero_description, detail_benefits, detail_faqs, detail_cta_title, detail_cta_description, seo_title, seo_description, seo_keywords)
VALUES
(
  'commercial-building-restoration',
  0,
  'Commercial Building Restoration',
  'Transform your vision into reality with our expert restoration services.',
  'Building2',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
  'Commercial Building Restoration',
  'Transform your vision into reality with our expert restoration services. From concept to construction, we specialize in crafting innovative and functional spaces that honor the past while embracing the future.',
  ARRAY['Historic preservation expertise', 'Structural assessment and repair', 'Code compliance and permitting', 'Sustainable restoration practices', 'Adaptive reuse solutions'],
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop',
  'Cleveland''s historic commercial buildings deserve expert care. At REVIFI, we specialize in transforming aging commercial properties into vibrant, functional spaces that honor their architectural heritage while meeting modern standards.',
  '[{"title":"Historic Preservation Expertise","description":"Our team understands the delicate balance between preserving historical integrity and incorporating modern functionality. We work with local preservation boards to ensure compliance."},{"title":"Structural Assessment & Repair","description":"Comprehensive structural evaluations identify issues before they become problems. Our engineers develop targeted repair strategies that extend your building''s lifespan."},{"title":"Code Compliance & Permitting","description":"Navigate Cleveland''s building codes and permitting process with confidence. We handle all regulatory requirements to keep your project moving forward."},{"title":"Sustainable Restoration Practices","description":"We incorporate energy-efficient systems and sustainable materials that reduce operating costs while maintaining the character of your building."},{"title":"Adaptive Reuse Solutions","description":"Transform underutilized commercial spaces into thriving destinations. From warehouses to event venues, we reimagine buildings for modern use."},{"title":"Project Management","description":"End-to-end project management ensures your restoration stays on time and on budget. One point of contact from start to finish."}]',
  '[{"question":"How long does a typical commercial building restoration take?","answer":"Timeline varies based on scope, but most commercial restorations take 6-18 months. We provide detailed timelines during our initial consultation and keep you updated throughout the process."},{"question":"Do you handle historic tax credit applications?","answer":"Yes, we have extensive experience with federal and state historic tax credit programs. We guide you through the application process and ensure your project meets all qualifying criteria."},{"question":"What types of commercial buildings do you restore?","answer":"We work with a wide range of commercial properties including office buildings, retail spaces, warehouses, event venues, restaurants, and mixed-use developments throughout Cleveland and Northeast Ohio."},{"question":"Can you work on occupied buildings?","answer":"Absolutely. We develop phased restoration plans that minimize disruption to existing tenants and business operations. Safety and accessibility are always our top priorities."}]',
  'Ready to Restore Your Building?',
  'Contact us for a free consultation. We''ll assess your property and develop a restoration plan tailored to your goals and budget.',
  'Commercial Building Restoration in Cleveland | REVIFI',
  'Expert commercial building restoration services in Cleveland, Ohio. Historic preservation, structural repair, adaptive reuse, and code compliance. Transform your building with REVIFI.',
  ARRAY['commercial building restoration Cleveland', 'historic building restoration Ohio', 'building rehabilitation Cleveland', 'adaptive reuse Cleveland', 'commercial renovation Cleveland OH', 'historic preservation contractor', 'building restoration company near me', 'commercial property restoration']
),
(
  'interior-design',
  1,
  'Interior Design Mastery',
  'Curated interiors that blend elegance with functionality.',
  'Paintbrush',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop',
  'Interior Design Mastery',
  'Our interior design services blend aesthetics with functionality, creating spaces that inspire and delight. We curate every element to reflect your unique vision and lifestyle.',
  ARRAY['Space planning and layout', 'Custom furniture design', 'Material and finish selection', 'Lighting design', 'Art and accessory curation'],
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop',
  'Our interior design services blend aesthetics with functionality, creating spaces that inspire and delight. We curate every element to reflect your unique vision and lifestyle, delivering interiors that are both beautiful and livable.',
  '[{"title":"Space Planning & Layout","description":"Strategic space planning that maximizes functionality and flow. We analyze how you use your space and design layouts that enhance daily life and work."},{"title":"Custom Furniture Design","description":"One-of-a-kind furniture pieces designed specifically for your space. From built-in cabinetry to statement pieces, every item is crafted to perfection."},{"title":"Material & Finish Selection","description":"Curated material palettes that balance beauty, durability, and budget. We source premium materials from trusted suppliers worldwide."},{"title":"Lighting Design","description":"Thoughtful lighting design that sets the mood and highlights architectural features. We layer ambient, task, and accent lighting for maximum impact."},{"title":"Art & Accessory Curation","description":"Complete styling with art, accessories, and soft furnishings that bring your space to life. Every detail is intentionally selected to tell your story."},{"title":"3D Visualization","description":"See your space before it''s built with photorealistic 3D renderings. Make confident decisions with a clear vision of the final result."}]',
  '[{"question":"What is your interior design process?","answer":"Our process begins with a discovery consultation to understand your vision, followed by concept development, design presentations, material selection, procurement, and installation. We handle every detail from start to finish."},{"question":"Do you work with both residential and commercial spaces?","answer":"Yes, we design for both residential and commercial clients throughout Cleveland. Our portfolio includes private homes, offices, restaurants, event spaces, and retail environments."},{"question":"How much does interior design cost?","answer":"Our fees vary based on project scope and complexity. We offer transparent pricing and work within a range of budgets. Contact us for a complimentary initial consultation and project estimate."},{"question":"Can you work with my existing furniture?","answer":"Absolutely. We can incorporate existing pieces you love into a fresh design scheme. We''ll help you identify what stays, what goes, and what new pieces will complete the look."}]',
  'Let''s Design Your Space',
  'Every great space starts with a conversation. Tell us about your vision and let''s create something extraordinary together.',
  'Interior Design Services in Cleveland | REVIFI',
  'Premium interior design services in Cleveland, Ohio. Space planning, custom furniture, material selection, lighting design, and art curation by REVIFI''s expert designers.',
  ARRAY['interior design Cleveland', 'interior designer Cleveland Ohio', 'commercial interior design Cleveland', 'residential interior design Cleveland', 'space planning Cleveland', 'custom interior design', 'luxury interior design Ohio', 'modern interior design Cleveland']
),
(
  'project-consultation',
  2,
  'Project Consultation',
  'Expert guidance from concept to completion.',
  'Lightbulb',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
  'Project Consultation',
  'Our expert consultants guide you through every phase of your project, from initial concept to final delivery. We provide strategic insights and practical solutions tailored to your needs.',
  ARRAY['Feasibility studies', 'Budget planning', 'Timeline development', 'Vendor coordination', 'Project management'],
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1200&auto=format&fit=crop',
  'Our expert consultants guide you through every phase of your project, from initial concept to final delivery. We provide strategic insights and practical solutions tailored to your unique needs, ensuring your project succeeds.',
  '[{"title":"Feasibility Studies","description":"Comprehensive analysis of your project''s viability including site assessment, zoning review, cost projections, and return on investment calculations."},{"title":"Budget Planning","description":"Detailed budgeting that accounts for every phase of your project. We identify cost-saving opportunities without compromising quality."},{"title":"Timeline Development","description":"Realistic project timelines with built-in contingencies. We coordinate all trades and deliveries to keep your project on schedule."},{"title":"Vendor Coordination","description":"Access to our vetted network of contractors, suppliers, and specialists. We manage all vendor relationships so you don''t have to."},{"title":"Project Management","description":"Full-service project management from concept through completion. Regular updates, quality inspections, and proactive problem-solving."},{"title":"Regulatory Navigation","description":"Expert guidance through Cleveland''s permitting, zoning, and regulatory requirements. We handle the paperwork so you can focus on your vision."}]',
  '[{"question":"What does a project consultation include?","answer":"Our initial consultation includes a site visit, discussion of your goals and budget, preliminary feasibility assessment, and a roadmap for next steps. It''s complimentary and comes with no obligations."},{"question":"How early should I start the consultation process?","answer":"The earlier the better. Engaging us during the planning phase helps avoid costly mistakes and ensures all decisions are informed. We recommend reaching out as soon as you''re considering a project."},{"question":"Do you offer consultation without full project management?","answer":"Yes, we offer standalone consultation services. Whether you need a feasibility study, a second opinion on plans, or help with a specific challenge, we''re happy to help at any scale."},{"question":"What types of projects do you consult on?","answer":"We consult on commercial renovations, historic restorations, adaptive reuse projects, new construction, and residential renovations throughout Cleveland and Northeast Ohio."}]',
  'Let''s Talk About Your Project',
  'Every successful project starts with the right plan. Reach out for a complimentary consultation.',
  'Project Consultation Services in Cleveland | REVIFI',
  'Expert project consultation services in Cleveland, Ohio. Feasibility studies, budget planning, timeline development, vendor coordination, and full project management by REVIFI.',
  ARRAY['project consultation Cleveland', 'construction consulting Cleveland Ohio', 'project management Cleveland', 'building consultation services', 'renovation consultant Cleveland', 'construction project planning', 'feasibility study Cleveland', 'development consulting Ohio']
),
(
  'property-acquisition',
  3,
  'Effortless Acquisition',
  'Seamless property acquisition and development services.',
  'Users',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
  'Effortless Acquisition',
  'We streamline the property acquisition process, helping you identify and secure the perfect property for your investment or development goals.',
  ARRAY['Market analysis', 'Property identification', 'Due diligence support', 'Negotiation assistance', 'Closing coordination'],
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop',
  'We streamline the property acquisition process, helping you identify and secure the perfect property for your investment or development goals. Our deep knowledge of Cleveland''s real estate market gives you a competitive edge.',
  '[{"title":"Market Analysis","description":"In-depth analysis of Cleveland''s real estate market to identify emerging opportunities, undervalued properties, and high-potential neighborhoods."},{"title":"Property Identification","description":"We leverage our extensive network and market knowledge to find properties that align with your investment criteria and development goals."},{"title":"Due Diligence Support","description":"Comprehensive property evaluations including structural assessments, environmental reviews, title searches, and financial analysis."},{"title":"Negotiation Assistance","description":"Experienced negotiators who advocate for your interests, securing favorable terms and pricing that maximize your investment potential."},{"title":"Closing Coordination","description":"Seamless closing management coordinating all parties—attorneys, lenders, inspectors, and title companies—to ensure a smooth transaction."},{"title":"Post-Acquisition Planning","description":"After acquisition, we help develop renovation and development plans that maximize property value and return on investment."}]',
  '[{"question":"What types of properties do you help acquire?","answer":"We specialize in commercial properties, mixed-use buildings, multi-family residential, and development sites throughout Cleveland and Northeast Ohio. Our focus is on properties with strong renovation or adaptive reuse potential."},{"question":"Do you invest in properties yourselves?","answer":"Yes, REVIFI actively invests in and develops properties in Cleveland. This gives us firsthand market knowledge and a deep understanding of what makes a successful acquisition."},{"question":"How do you identify good investment properties?","answer":"We analyze location fundamentals, building condition, zoning potential, market trends, comparable sales, and neighborhood trajectory. Our experience in restoration gives us unique insight into a property''s true potential."},{"question":"Can you help with financing?","answer":"While we don''t provide financing directly, we have strong relationships with lenders who specialize in commercial and renovation loans. We can connect you with the right financing partners for your project."}]',
  'Ready to Invest in Cleveland?',
  'Let''s find the perfect property for your next investment or development project.',
  'Property Acquisition Services in Cleveland | REVIFI',
  'Streamlined property acquisition services in Cleveland, Ohio. Market analysis, property identification, due diligence, negotiation, and closing coordination by REVIFI.',
  ARRAY['property acquisition Cleveland', 'commercial property buying Cleveland Ohio', 'real estate acquisition Cleveland', 'investment property Cleveland', 'property development Cleveland', 'real estate investment Ohio', 'commercial real estate Cleveland', 'property acquisition services']
)
ON CONFLICT (slug) DO NOTHING;

# REVIFI Real Estate Portfolio Website - Project Plan

## Project Overview

REVIFI specializes in rehabilitating historic and forgotten buildings in Cleveland, Ohio. The new website will showcase their transformative projects with a modern, sophisticated design system that emphasizes their expertise in architectural restoration and interior design.

## Current Website Analysis

Based on the existing revifi.com site, the company focuses on:
- Historic building rehabilitation in Cleveland, Ohio
- Commercial and residential property transformations
- Full-service design and construction management
- Portfolio includes: Gordon Green, Franklin Grand, Bamboo Haus, Green Room, Lake Tahoe Project, The Primary

## Tech Stack & Architecture

### Frontend
- **Framework**: Next.js 15 with React 19 and TypeScript
- **Styling**: TailwindCSS 4 with custom design system
- **UI Components**: shadcn/ui + custom components
- **State Management**: React 19 Server Components + Zustand
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**: Next.js API routes + Supabase client

### Infrastructure
- **Hosting**: Vercel (recommended for Next.js)
- **CDN**: Supabase Storage + Vercel Edge Network
- **Environment**: Development, Staging, Production

## Design System

### Typography
- **Serif**: Playfair Display (headings, elegant touch)
- **Sans-serif**: Inter (body text, modern simplicity)
- **Monospace**: JetBrains Mono (code, technical details)

### Color Palette
- **Primary Colors**:
  - Black: #000000
  - White: #FFFFFF
  - Dark Gray: #1a1a1a
  - Light Gray: #f5f5f5

- **Accent Colors**:
  - Navy Blue: #1e3a8a
  - Goldenrod: #daa520
  - Burgundy: #722f37

- **Semantic Colors**:
  - Success: #059669
  - Warning: #d97706
  - Error: #dc2626

### Design Principles
- Ultra-minimalist layout with generous whitespace
- Grid-based typography system
- Subtle micro-interactions and animations
- Professional photography as focal point
- Mobile-first responsive design
- Dark mode support throughout

### Component Library
- Custom buttons with hover states
- Card components for projects
- Image gallery with lightbox
- Navigation with smooth transitions
- Form components with validation
- shadcn/ui components (Button, Card, Input, Dialog, etc.)

## Page Structure & Content

### Public Pages

#### 1. Home (/)
- Hero section with featured project imagery
- Company mission statement
- Featured projects grid (3-4 highlights)
- Services overview
- Client testimonials carousel
- Call-to-action for consultation

#### 2. About (/about)
- Company story and philosophy
- Team member profiles (KC Stitak, Kyle Lawrence)
- 6-step process visualization
- Company statistics and achievements
- Historic preservation approach

#### 3. Projects (/projects)
- Filterable project portfolio
- Category filters (Residential, Commercial, Mixed-Use)
- Search functionality
- Grid/list view toggle
- Individual project detail pages

#### 4. Project Detail (/projects/[slug])
- Project hero imagery
- Before/after comparisons
- Detailed project description
- Image galleries with lightbox
- Video integration
- Project specifications (location, year, sq ft)
- Related projects

#### 5. Services (/services)
- Commercial Building Restoration
- Interior Design Mastery
- Project Consultation
- Effortless Acquisition
- Service detail pages

#### 6. Contact (/contact)
- Contact form with validation
- Office location and map
- Team contact information
- Social media links

### Admin Panel (/admin)

#### Dashboard
- Project statistics
- Recent activity
- Quick actions

#### Project Management
- Create/edit/delete projects
- Project status management
- Bulk operations
- Project duplication

#### Media Management
- Image upload with drag-drop
- Video upload and processing
- Image optimization and resizing
- Media library organization

#### Content Management
- Team member profiles
- Service descriptions
- Site-wide content editing

#### Settings
- User management
- SEO settings
- Site configuration

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('residential', 'commercial', 'mixed-use')),
  status TEXT CHECK (status IN ('completed', 'in-progress', 'coming-soon', 'archived')),
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
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Media Table
```sql
CREATE TABLE media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  file_size INTEGER,
  dimensions JSONB,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Team Table
```sql
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  social_links JSONB,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Services Table
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  featured_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Testimonials Table
```sql
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Key Features

### Project Showcase Features
- Advanced filtering by category, status, location
- Search functionality with fuzzy matching
- Grid/list view toggle with smooth transitions
- Image galleries with zoom and lightbox
- Video integration with custom player
- Before/after slider comparisons
- Project sharing and bookmarking
- Related projects recommendations

### Admin Panel Features
- Drag-and-drop image ordering
- Bulk image upload with progress tracking
- Rich text editing with live preview
- Project status workflow management
- SEO metadata control
- Image optimization and resizing
- Content versioning and rollback
- User role management

### Performance Features
- Image optimization (WebP, AVIF formats)
- Lazy loading for images and videos
- Static site generation with React 19 Server Components
- Incremental static regeneration
- CDN delivery via Supabase Storage
- Progressive enhancement
- Core Web Vitals optimization
- Next.js 15 performance improvements

### SEO Features
- Dynamic sitemap generation
- Meta tag optimization
- Structured data (Schema.org)
- Open Graph and Twitter Cards
- Alt text management
- URL slug management
- Internal linking suggestions

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up Supabase project and database
- Create database schema and migrations
- Set up Next.js 15 project with React 19 and TypeScript
- Configure TailwindCSS 4 and design system
- Set up pnpm package manager
- Create basic component library with shadcn/ui
- Set up development environment

### Phase 2: Core Pages (Week 3-4)
- Build home page with hero section
- Create about page with team profiles
- Implement projects listing page
- Build project detail pages
- Add responsive design
- Implement basic navigation

### Phase 3: Admin Panel (Week 5-6)
- Set up authentication with Supabase Auth
- Create admin dashboard
- Build project management interface
- Implement image/video upload
- Add media management
- Create content editing interface

### Phase 4: Enhancement (Week 7-8)
- Add advanced filtering and search
- Implement image galleries and lightbox
- Add video integration
- Create contact forms with validation
- Add animation and micro-interactions
- Implement dark mode

### Phase 5: Optimization & Launch (Week 9-10)
- Performance optimization
- SEO implementation
- Testing and bug fixes
- Content migration from existing site
- Deployment and monitoring
- Documentation and training

## Technical Considerations

### Security
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- File upload security
- Rate limiting on API endpoints
- CSRF protection

### Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader optimization
- Color contrast compliance
- Focus management

### Performance Budget
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms
- Image optimization targets

### Browser Support
- Modern browsers (Chrome 120+, Firefox 120+, Safari 17+)
- Progressive enhancement for older browsers
- Mobile browser optimization
- Tablet responsiveness
- React 19 compatibility requirements

## Success Metrics

### User Experience
- Page load speed < 3 seconds
- Mobile usability score > 90
- User engagement (time on site, bounce rate)
- Contact form conversion rate

### Business Goals
- Increase project inquiries by 25%
- Improve portfolio visibility
- Streamline content management
- Reduce maintenance overhead

### Technical Metrics
- Core Web Vitals scores
- Search engine ranking improvements
- Site uptime and reliability
- Admin task completion time

## Maintenance & Updates

### Content Management
- Regular project updates
- Blog/news integration
- Team profile updates
- Service description maintenance

### Technical Maintenance
- Security updates and patches
- Performance monitoring
- Backup and recovery procedures
- Analytics and reporting

### Future Enhancements
- Virtual tour integration
- Client portal development
- Advanced analytics dashboard
- Multi-language support
- Mobile app development

---

**Project Timeline**: 10 weeks
**Team Size**: 2-3 developers
**Budget**: TBD based on scope and timeline
**Launch Target**: Q2 2024

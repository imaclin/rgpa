import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { HeroCarousel } from "@/components/hero-carousel"
import { createClient } from "@/lib/supabase/server"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"
import { BeforeAfterCarousel } from "@/components/before-after-carousel"
import { ScrollingTestimonials } from "@/components/scrolling-testimonials"
import { ContactCTA } from "@/components/contact-cta"
import { ColorHoverButton } from "@/components/color-hover-button"
import { getIcon } from "@/lib/icons"

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch featured projects for the hero carousel
  const { data: heroProjects } = await supabase
    .from("projects")
    .select("id, title, subtitle, slug, featured_image_url, location")
    .neq("status", "draft")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(5)

  // Fetch before/after pairs
  const { data: beforeAfterPairs } = await supabase
    .from("before_after_pairs")
    .select("id, title, before_image, after_image")
    .order("display_order", { ascending: true })

  // Fallback to any published projects if no featured ones
  // Fetch testimonials
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, client_name, role, content, photo_url, rating")
    .order("sort_order", { ascending: true })

  // Fetch services
  const { data: services } = await supabase
    .from("services")
    .select("slug, home_title, home_description, home_icon, home_bg_image")
    .order("sort_order", { ascending: true })

  let projects = heroProjects || []
  if (projects.length === 0) {
    const { data: fallbackProjects } = await supabase
      .from("projects")
      .select("id, title, subtitle, slug, featured_image_url, location")
      .neq("status", "draft")
      .order("sort_order", { ascending: true })
      .limit(5)
    projects = fallbackProjects || []
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HeroCarousel projects={projects} />

      {/* About Preview Section */}
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ScrollAnimation variant="slideInLeft">
              <BeforeAfterCarousel pairs={beforeAfterPairs || []} />
            </ScrollAnimation>
            <ScrollAnimation variant="slideInRight" className="flex flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                About Us
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Timeless Transformations
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                At Revifi, we believe that every space has a story to tell – a narrative 
                that unfolds with every architectural curve and interior flourish. We take 
                what was once good, and re-imagine it to be great through our dedicated 
                and specialized team and skill set.
              </p>
              <div className="mt-8">
                <ColorHoverButton href="/about" className="gap-2">
                  Discover Our Process
                  <ArrowRight className="h-4 w-4" />
                </ColorHoverButton>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Our Projects
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Some of Our Favorites
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.15}>
            {projects.slice(0, 3).map((project, index) => (
              <StaggerItem key={project.slug}>
              <Link href={`/projects/${project.slug}`}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg p-0">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {project.featured_image_url ? (
                      <img
                        src={project.featured_image_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-16 w-16 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardContent className="px-6 pb-6">
                    <h3 className="font-serif text-xl font-semibold">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {project.subtitle || project.location || "View Project"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollAnimation className="mt-12 text-center" delay={0.3}>
            <ColorHoverButton href="/projects" size="lg" className="gap-2">
              View All Projects
              <ArrowRight className="h-4 w-4" />
            </ColorHoverButton>
          </ScrollAnimation>
        </div>
      </section>

      {/* Services Section */}
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Our Services
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Unleashing the Artistry of REVIFI&apos;s Services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore REVIFI&apos;s suite of services, delivering architectural innovation, 
              interior design mastery, sustainable solutions, and personalized consultations.
            </p>
          </ScrollAnimation>
          <StaggerContainer className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.1}>
            {(services || []).map((service, index) => {
              const IconComponent = getIcon(service.home_icon)
              return (
              <StaggerItem key={service.slug}>
              <Card className="relative overflow-hidden h-[240px]">
                {/* Background Image */}
                {service.home_bg_image && (
                  <div className="absolute inset-0 opacity-[0.08]">
                    <img
                      src={service.home_bg_image}
                      alt=""
                      className="h-full w-full object-cover filter grayscale"
                    />
                  </div>
                )}
                <CardContent className="relative p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-sm font-medium text-goldenrod dark:text-[#fbbf24]">
                    0{index + 1}
                  </p>
                  <h3 className="mt-1 font-serif text-lg font-semibold">
                    {service.home_title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {service.home_description}
                  </p>
                </CardContent>
              </Card>
              </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Testimonials
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              What Our Clients Say
            </h2>
          </ScrollAnimation>
        </div>
        <div className="mt-12">
          <ScrollingTestimonials testimonials={testimonials || []} />
        </div>
      </section>

      {/* CTA Section */}
      <ContactCTA />
    </div>
  )
}

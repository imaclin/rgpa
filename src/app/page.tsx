import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"
import { ScrollingTestimonials } from "@/components/scrolling-testimonials"
import { ContactCTA } from "@/components/contact-cta"
import { ColorHoverButton } from "@/components/color-hover-button"
import { HomeHeroSection } from "@/components/home-hero-section"

export default async function Home() {
  const supabase = await createClient()
  
  // Fetch featured properties for the hero carousel
  const { data: heroProperties } = await supabase
    .from("properties")
    .select("id, title, subtitle, slug, featured_image_url, location")
    .neq("status", "draft")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(5)

  // Fallback to any published projects if no featured ones
  // Fetch testimonials
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, client_name, role, content, photo_url, rating")
    .order("sort_order", { ascending: true })

  const { data: aboutContent } = await supabase
    .from("about_content")
    .select("*")

  const { data: heroMedia } = await supabase
    .from("media")
    .select("url, alt_text, type, sort_order, created_at, property_id")
    .eq("type", "image")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  const { data: heroPropertiesForMedia } = await supabase
    .from("properties")
    .select("id, title, location")

  let properties = heroProperties || []
  if (properties.length === 0) {
    const { data: fallbackProperties } = await supabase
      .from("properties")
      .select("id, title, subtitle, slug, featured_image_url, location")
      .neq("status", "draft")
      .order("sort_order", { ascending: true })
      .limit(5)
    properties = fallbackProperties || []
  }

  const imagesSection = aboutContent?.find((item: any) => item.section === "images")?.content
  const imagesContent = !imagesSection
    ? {}
    : typeof imagesSection === "string"
      ? JSON.parse(imagesSection)
      : imagesSection
  const aboutImageUrl = imagesContent.secondary_image_url || imagesContent.hero_image_url || "https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-41.jpg"
  const propertyLabelById = new Map(
    (heroPropertiesForMedia || []).map((property: any) => [
      property.id,
      property.title || property.location || null,
    ])
  )
  const heroItems = (heroMedia || [])
    .filter((item: any) => item.url)
    .map((item: any) => ({
      imageUrl: item.url,
      label: propertyLabelById.get(item.property_id) || item.alt_text || null,
    }))
    .slice(0, 8)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <HomeHeroSection items={heroItems} />

      {/* About Preview Section */}
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ScrollAnimation variant="slideInLeft">
              <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                <img
                  src={aboutImageUrl}
                  alt="RG Property Advisors team"
                  className="h-full min-h-[320px] w-full object-cover"
                />
              </div>
            </ScrollAnimation>
            <ScrollAnimation variant="slideInRight" className="flex flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                About Us
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Greater Cleveland&apos;s Real Estate Experts
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                At RG Property Advisors, we bring deep market knowledge and a proven track record
                to every transaction. Whether you&apos;re buying, selling, or investing, we guide
                you with expertise across Lakewood, Bay Village, Westlake, and the Cleveland Metro area.
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

      {/* Services Overview Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              What We Do
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Full-Service Real Estate Guidance
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From residential homes to investment assets, we provide expert guidance across Greater Cleveland.
            </p>
          </ScrollAnimation>

          <StaggerContainer className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {[
              {
                title: "Residential",
                description: "Experts in the Lakewood, Bay Village and Surrounding Cleveland areas.",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Multi-Family",
                description: "We cover Townhome Development, Mixed-Use and Office Space.",
                image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Distressed Assets",
                description: "We assist in the acquisition, renovation and disposition of investment properties.",
                image: "https://images.unsplash.com/photo-1605146769289-440113cc3d00?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Sell My Home",
                description: "Thinking of selling your home but don't know where to start?",
                link: "/sell-your-property",
                image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Buy A Home",
                description: "Moving is stressful, don't let your home buying process be.",
                link: "/properties",
                image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1600&auto=format&fit=crop",
              },
              {
                title: "Vacant Land",
                description: "We help answer all your zoning, purchasing and construction questions.",
                image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <Card className="relative h-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-black/50" />
                  <CardContent className="relative p-6">
                    <h3 className="font-serif text-xl font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-sm text-white">{item.description}</p>
                    {item.link && (
                      <div className="mt-4 flex justify-center">
                        <Button asChild variant="outline" size="sm" className="border-white/70 bg-transparent text-white hover:bg-white hover:text-black">
                          <Link href={item.link}>Learn More</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Buy & Sell Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Buy & Sell With Confidence
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Personalized Guidance For Every Move
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We help families, first-time buyers, and seasoned investors make informed decisions
              with local insight, responsive communication, and a strategy tailored to your goals.
            </p>
          </ScrollAnimation>

          <StaggerContainer className="mt-12 grid gap-8 md:grid-cols-2" staggerDelay={0.15}>
            <StaggerItem>
              <Card className="relative h-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: "url(https://images.unsplash.com/photo-1560185007-cde436f6a4d0?q=80&w=1600&auto=format&fit=crop)" }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <CardContent className="relative p-6">
                  <p className="text-sm font-medium uppercase tracking-wide text-white">For Buyers</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-white">Find the Right Home, Not Just Any Home</h3>
                  <p className="mt-3 text-white">
                    We help buyers evaluate opportunities, neighborhoods, and value so you can move forward with confidence.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Button asChild className="bg-white text-black hover:bg-white/90">
                      <Link href="/properties">Learn More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>

            <StaggerItem>
              <Card className="relative h-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-60"
                  style={{ backgroundImage: "url(https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&auto=format&fit=crop)" }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <CardContent className="relative p-6">
                  <p className="text-sm font-medium uppercase tracking-wide text-white">For Sellers</p>
                  <h3 className="mt-2 font-serif text-2xl font-semibold text-white">Market Your Home For Maximum Exposure</h3>
                  <p className="mt-3 text-white">
                    From pricing to presentation, we position your property to attract serious buyers and strong offers.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <Button asChild variant="outline" className="border-white/70 bg-transparent text-white hover:bg-white hover:text-black">
                      <Link href="/sell-your-property">Learn More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Featured Properties
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Recent Properties
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.15}>
            {properties.slice(0, 3).map((property) => (
              <StaggerItem key={property.slug}>
                <Card className="group h-full overflow-hidden transition-all hover:shadow-lg p-0">
                  <Link href={`/properties/${property.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {property.featured_image_url ? (
                        <img
                          src={property.featured_image_url}
                          alt={property.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                          <Building2 className="h-16 w-16 opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </Link>
                  <CardContent className="px-6 pb-6">
                    <h3 className="font-serif text-xl font-semibold">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {property.subtitle || property.location || "View Property"}
                    </p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
          <ScrollAnimation className="mt-12 text-center" delay={0.3}>
            <ColorHoverButton href="/properties" size="lg" className="gap-2">
              View All Properties
              <ArrowRight className="h-4 w-4" />
            </ColorHoverButton>
          </ScrollAnimation>
        </div>
      </section>

      {/* Value Section */}
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Why RG Property Advisors
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Local Experts. Real Relationships. Proven Results.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              We combine market knowledge with a people-first approach so every client feels supported,
              informed, and confident from first conversation to closing day.
            </p>
          </ScrollAnimation>
          <StaggerContainer className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {[
              {
                title: "Neighborhood-Level Insight",
                description:
                  "We help you compare communities, commute patterns, schools, and property values so your choice fits your daily life.",
              },
              {
                title: "Data-Driven Pricing Strategy",
                description:
                  "Whether buying or selling, we use live market trends and comps to support smart pricing and stronger outcomes.",
              },
              {
                title: "Hands-On Transaction Support",
                description:
                  "From inspections and negotiations to financing and closing, we stay proactive so there are no surprises.",
              },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
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

      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <ScrollAnimation>
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Sell Your Property
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Market Your Property With Confidence
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We guide you through every step of the selling process with multi-channel marketing,
                investor outreach, and professional presentation to attract qualified buyers.
              </p>
            </ScrollAnimation>
            <ScrollAnimation className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
              <ColorHoverButton href="/sell-your-property" size="lg" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </ColorHoverButton>
              <Button asChild variant="outline" size="lg">
                <Link href="/contact">Talk to an Advisor</Link>
              </Button>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ContactCTA />
    </div>
  )
}

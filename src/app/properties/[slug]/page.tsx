import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Calendar, Ruler, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { PropertyGallery } from "@/components/property-gallery"
import { BeforeAfterSlider } from "@/components/before-after-slider"
import { ContactCTA } from "@/components/contact-cta"

const properties = [
  {
    title: "Lake Tahoe Project",
    subtitle: "Mountain Haven",
    description: "New build in America's most marvelous outdoors. This stunning mountain retreat combines modern architecture with the natural beauty of Lake Tahoe, creating a harmonious living space that celebrates both comfort and nature.",
    category: "residential",
    status: "completed",
    slug: "lake-tahoe",
    location: "Lake Tahoe, CA",
    year: 2023,
    sqFootage: 4500,
    features: ["Custom millwork", "Floor-to-ceiling windows", "Sustainable materials", "Smart home integration"],
  },
  {
    title: "Gordon Green",
    subtitle: "Modern Event Space",
    description: "Historical building turned modern event space. This adaptive reuse project transformed a century-old industrial building into Cleveland's premier event venue, preserving its historic character while introducing contemporary amenities.",
    category: "commercial",
    status: "completed",
    slug: "gordon-green",
    location: "Cleveland, OH",
    year: 2022,
    sqFootage: 8000,
    features: ["Historic preservation", "Modern HVAC systems", "Flexible floor plan", "Professional kitchen"],
  },
  {
    title: "GreenRoom",
    subtitle: "Co-working Space",
    description: "Gordon Square's first boutique office and social house. A dynamic workspace designed to foster creativity and collaboration, featuring private offices, open workspaces, and community areas.",
    category: "commercial",
    status: "completed",
    slug: "greenroom",
    location: "Cleveland, OH",
    year: 2022,
    sqFootage: 6000,
    features: ["Private offices", "Meeting rooms", "Community lounge", "Rooftop terrace"],
  },
  {
    title: "The Primary",
    subtitle: "Short Term Rental",
    description: "Large modern home inspired by color. This vibrant property showcases bold design choices and artistic flair, offering guests a unique and memorable stay experience.",
    category: "residential",
    status: "completed",
    slug: "the-primary",
    location: "Cleveland, OH",
    year: 2021,
    sqFootage: 3200,
    features: ["Custom art installations", "Designer furniture", "Gourmet kitchen", "Entertainment system"],
  },
  {
    title: "Franklin Grand",
    subtitle: "Timeless Classic",
    description: "Queen Anne Victorian short term rental in Hinge Town. This meticulously restored Victorian home blends period authenticity with modern luxury, creating an unforgettable guest experience.",
    category: "residential",
    status: "completed",
    slug: "franklin-grand",
    location: "Cleveland, OH",
    year: 2021,
    sqFootage: 2800,
    features: ["Original woodwork", "Period-accurate restoration", "Modern amenities", "Landscaped gardens"],
  },
  {
    title: "Bamboo Haus",
    subtitle: "New Age Classic",
    description: "High end Mid-Century Modern rental property in Ohio City. This stunning renovation honors the clean lines and organic forms of mid-century design while incorporating contemporary comfort.",
    category: "residential",
    status: "completed",
    slug: "bamboo-haus",
    location: "Cleveland, OH",
    year: 2020,
    sqFootage: 2400,
    features: ["Original terrazzo floors", "Custom built-ins", "Indoor-outdoor living", "Vintage fixtures"],
  },
]

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: property } = await supabase
    .from("properties")
    .select("title, description")
    .eq("slug", slug)
    .single()
  
  if (!property) {
    return {
      title: "Property",
    }
  }

  return {
    title: property.title,
    description: property.description,
  }
}

export async function generateStaticParams() {
  return []
}

export default async function PropertyPage({ params }: Props) {
  const { slug } = await params
  
  const supabase = await createClient()
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!property) {
    notFound()
  }
  
  // Fetch media for the property
  const { data: media } = await supabase
    .from("media")
    .select("*")
    .eq("property_id", property.id)
    .order("sort_order", { ascending: true })

  // Fetch before/after pairs for the property
  const { data: beforeAfterPairs } = await supabase
    .from("property_before_after")
    .select("id, title, before_image, after_image")
    .eq("property_id", property.id)
    .order("display_order", { ascending: true })

  return (
    <div className="flex flex-col">
      {/* Back Navigation */}
      <div className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/properties">
            <Button variant="ghost" className="gap-2 pl-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>

      {/* Title Section */}
      <section className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="flex items-start justify-between sm:hidden">
            <div className="flex-1">
              <h1 className="font-serif text-3xl font-bold tracking-tight">
                {property.title}
              </h1>
              <p className="mt-1 text-lg font-medium text-[#800020] dark:text-[#ef4444]">
                {property.subtitle}
              </p>
            </div>
            {property.website_url && (
              <a
                href={property.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex sm:items-baseline sm:justify-between sm:gap-4">
            <div className="flex items-baseline gap-4">
              <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                {property.title}
              </h1>
              <p className="text-lg font-medium text-[#800020] dark:text-[#ef4444]">
                {property.subtitle}
              </p>
            </div>
            {property.website_url && (
              <Button
                asChild
                variant="outline"
                className="border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white dark:border-[#ef4444] dark:text-[#ef4444] dark:hover:bg-[#ef4444] dark:hover:text-white"
              >
                <a
                  href={property.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
          <PropertyGallery media={media || []} propertyTitle={property.title} />
        </div>
      </section>

      {/* Property Details Section */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-6">
              {property.location && (
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <MapPin className="h-5 w-5 text-[#800020] dark:text-[#ef4444]" />
                  <span>{property.location}</span>
                </div>
              )}
              {property.sq_footage && (
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Ruler className="h-5 w-5 text-[#800020] dark:text-[#ef4444]" />
                  <span>{property.sq_footage.toLocaleString()} sq ft</span>
                </div>
              )}
              {property.year && (
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Calendar className="h-5 w-5 text-[#800020] dark:text-[#ef4444]" />
                  <span>{property.year}</span>
                </div>
              )}
            </div>
            
            <p className="mt-8 text-lg text-muted-foreground">{property.description}</p>

            <div className="mt-8 flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {property.category}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {property.status}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Before & After Section */}
      {beforeAfterPairs && beforeAfterPairs.length > 0 && (
        <section className="border-b border-border bg-background py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold">Before & After</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {beforeAfterPairs.map((pair) => (
                <div key={pair.id} className="space-y-3">
                  {pair.title && (
                    <h3 className="text-sm font-medium text-muted-foreground">{pair.title}</h3>
                  )}
                  <BeforeAfterSlider
                    beforeImage={pair.before_image}
                    afterImage={pair.after_image}
                    beforeLabel="Before"
                    afterLabel="After"
                    className="aspect-[4/3] rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ContactCTA />
    </div>
  )
}

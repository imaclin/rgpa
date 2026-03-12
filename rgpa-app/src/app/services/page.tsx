import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimation } from "@/components/animations/scroll-animations"
import { createClient } from "@/lib/supabase/server"
import { ContactCTA } from "@/components/contact-cta"

export const metadata: Metadata = {
  title: "Services | Building Restoration & Interior Design in Cleveland",
  description: "Explore REVIFI's suite of services - commercial building restoration, interior design, project consultation, and property acquisition in Cleveland, Ohio. Expert contractors for historic renovation.",
  keywords: [
    "building restoration services Cleveland",
    "interior design Cleveland Ohio",
    "commercial renovation Cleveland",
    "property acquisition Cleveland",
    "construction management Cleveland",
    "historic renovation contractor",
  ],
  openGraph: {
    title: "Services | Building Restoration & Interior Design in Cleveland",
    description: "Explore REVIFI's suite of services - commercial building restoration, interior design, project consultation, and property acquisition in Cleveland, Ohio.",
    url: "https://revifi.com/services",
  },
  alternates: {
    canonical: "https://revifi.com/services",
  },
}

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from("services")
    .select("slug, services_title, services_description, services_features, services_image")
    .order("sort_order", { ascending: true })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Our Services
          </h1>
        </div>
      </section>

      {/* Services List */}
      <section className="bg-background pt-4 pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16">
            {(services || []).map((service, index) => (
              <ScrollAnimation key={service.slug} variant={index % 2 === 0 ? "slideInLeft" : "slideInRight"}>
              <Card className="group overflow-hidden">
                <div className={`grid lg:grid-cols-2 ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                  <div className={`relative aspect-[4/3] overflow-hidden bg-muted lg:aspect-auto lg:min-h-[400px] ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    {service.services_image && (
                      <img
                        src={service.services_image}
                        alt={service.services_title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                  <CardContent className="flex flex-col justify-center p-8 lg:p-12">
                    <p className="text-sm font-medium text-goldenrod dark:text-[#fbbf24]">
                      0{index + 1}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-bold">{service.services_title}</h2>
                    <p className="mt-4 text-muted-foreground">{service.services_description}</p>
                    {service.services_features && service.services_features.length > 0 && (
                      <ul className="mt-6 space-y-2">
                        {service.services_features.map((feature: string) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <span className="text-navy dark:text-[#3b82f6]">→</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-8">
                      <Link href={`/services/${service.slug}`}>
                        <Button variant="outline" className="gap-2">
                          Learn More
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </div>
              </Card>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Process CTA */}
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Our Process
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every project begins with understanding your vision. Learn more about our 
              comprehensive approach to transforming spaces.
            </p>
            <div className="mt-8">
              <Link href="/about">
                <Button className="gap-2">
                  Learn About Our Process
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <ContactCTA />
    </div>
  )
}

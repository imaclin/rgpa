import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ServiceJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"
import { createClient } from "@/lib/supabase/server"
import { ContactCTA } from "@/components/contact-cta"

interface Benefit {
  title: string
  description: string
}

interface FAQ {
  question: string
  answer: string
}

interface ServiceData {
  id: string
  slug: string
  home_title: string
  services_title: string
  services_description: string
  services_image: string | null
  detail_hero_description: string | null
  detail_benefits: Benefit[]
  detail_faqs: FAQ[]
  detail_cta_title: string | null
  detail_cta_description: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[] | null
}

async function getService(slug: string): Promise<ServiceData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = await getService(slug)
  if (!service) return {}

  return {
    title: service.seo_title || `${service.services_title} | REVIFI`,
    description: service.seo_description || service.services_description,
    keywords: service.seo_keywords || [],
    openGraph: {
      title: service.seo_title || `${service.services_title} | REVIFI`,
      description: service.seo_description || service.services_description,
      url: `https://revifi.com/services/${service.slug}`,
    },
    alternates: {
      canonical: `https://revifi.com/services/${service.slug}`,
    },
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = await getService(slug)

  if (!service) {
    notFound()
  }

  const benefits: Benefit[] = service.detail_benefits || []
  const faqs: FAQ[] = service.detail_faqs || []

  return (
    <div className="flex flex-col">
      <ServiceJsonLd
        name={`${service.services_title} in Cleveland`}
        description={service.seo_description || service.services_description}
        url={`https://revifi.com/services/${service.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "https://revifi.com" },
          { name: "Services", url: "https://revifi.com/services" },
          {
            name: service.services_title,
            url: `https://revifi.com/services/${service.slug}`,
          },
        ]}
      />

      {/* Back Navigation */}
      <div className="bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/services">
            <Button variant="ghost" className="gap-2 pl-0">
              <ArrowLeft className="h-4 w-4" />
              All Services
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-background pb-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Our Services
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              {service.services_title}
            </h1>
            {service.detail_hero_description && (
              <p className="mt-6 text-lg text-muted-foreground">
                {service.detail_hero_description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Get a Free Consultation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button size="lg" variant="outline">
                  View Past Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      {benefits.length > 0 && (
        <section className="relative border-t border-border bg-muted/30 py-24 overflow-hidden">
          {service.services_image && (
            <div className="absolute inset-0 opacity-[0.2]">
              <img
                src={service.services_image}
                alt=""
                className="h-full w-full object-cover "
              />
            </div>
          )}
          <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              What We Deliver
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-green-600" />
                      <div>
                        <h3 className="font-serif text-lg font-semibold">
                          {benefit.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="border-t border-border bg-background py-24">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardContent className="p-6">
                    <h3 className="font-serif text-lg font-semibold">{faq.question}</h3>
                    <p className="mt-3 text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <ContactCTA />
    </div>
  )
}

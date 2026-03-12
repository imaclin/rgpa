import { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"
import { createClient } from "@/lib/supabase/server"
import { ContactCTA } from "@/components/contact-cta"
import { getIcon } from "@/lib/icons"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about RG Property Advisors - Greater Cleveland's top 1% real estate advisors specializing in residential, multi-family, and investment properties.",
}

// Fallback defaults used when DB rows are empty
const DEFAULTS = {
  mission: "RG Property Advisors are a team of agents who strive to provide our clients with unmatched representation and service in all aspects of the real estate experience.",
  understanding_clients: "RG Property Advisors would like to welcome you to an innovative and fresh real estate experience.",
  hero_image_url: "https://rgpropertyadvisors.com/wp-content/uploads/2022/01/KW-44-scaled.jpg",
  secondary_image_url: "https://rgpropertyadvisors.com/wp-content/uploads/2021/11/thumbnail_KW-41.jpg",
  intro_paragraph_1: "At RG Property Advisors, we don't just close deals — we build lasting relationships.",
  intro_paragraph_2: "Our deep knowledge of the Greater Cleveland market sets us apart.",
}

export default async function AboutPage() {
  const supabase = await createClient()

  const [stepsRes, contentRes, valuesRes, teamRes] = await Promise.all([
    supabase.from("about_process_steps").select("*").order("sort_order", { ascending: true }),
    supabase.from("about_content").select("*"),
    supabase.from("about_values").select("*").order("sort_order", { ascending: true }),
    supabase.from("team_members").select("*").eq("active", true).order("sort_order", { ascending: true }),
  ])

  const processSteps = stepsRes.data || []
  const content = contentRes.data || []
  const coreValues = valuesRes.data || []
  const teamMembers = teamRes.data || []

  const getSection = (section: string) => {
    const row = content.find((c: any) => c.section === section)
    if (!row?.content) return {}
    return typeof row.content === "string" ? JSON.parse(row.content) : row.content
  }

  const introData = getSection("intro_paragraphs")
  const intro1 = introData.intro_paragraph_1 || DEFAULTS.intro_paragraph_1
  const intro2 = introData.intro_paragraph_2 || DEFAULTS.intro_paragraph_2
  
  const missionData = getSection("mission")
  const missionText = missionData.mission || DEFAULTS.mission
  
  const understandingData = getSection("understanding_clients")
  const understandingText = understandingData.understanding_clients || DEFAULTS.understanding_clients
  
  const imageData = getSection("images")
  const heroImageUrl = imageData.hero_image_url || DEFAULTS.hero_image_url
  const secondaryImageUrl = imageData.secondary_image_url || DEFAULTS.secondary_image_url

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-[400px] w-full">
          <img
            src={heroImageUrl}
            alt="RG Property Advisors"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Red Group Property Advisors
              </h1>
              <p className="mt-4 text-lg text-white/90">
                Greater Cleveland&apos;s Trusted Real Estate Experts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <ScrollAnimation variant="slideInLeft">
              <img
                src={secondaryImageUrl}
                alt="Our team"
                className="h-full w-full object-cover rounded-2xl"
              />
            </ScrollAnimation>
            <ScrollAnimation variant="slideInRight" className="flex flex-col justify-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Our Mission
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Unmatched Representation & Service
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {missionText}
              </p>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      <section className="border-t border-border bg-muted/30 py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Understanding Our Clients
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              An Innovative Real Estate Experience
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              {understandingText}
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Values Section */}
      {coreValues.length > 0 && (
      <section className="border-t border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Values We Live By
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Our Core Values
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {coreValues.map((value: any, index: number) => (
              <StaggerItem key={value.id || index}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-navy dark:bg-blue-500/10 dark:text-blue-500">
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>
                    <h3 className="mt-4 font-serif text-xl font-semibold">{value.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      )}

      {/* Team Section */}
      {teamMembers.length > 0 && (
      <section className="bg-background pt-2 pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Meet Our People
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Greater Cleveland&apos;s Real Estate Experts
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-2" staggerDelay={0.15}>
            {teamMembers.map((member: any) => (
              <StaggerItem key={member.id}>
              <Card className="overflow-hidden h-[460px]">
                <div className="grid h-full md:grid-cols-2">
                  <div className="relative overflow-hidden bg-muted">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground/30">
                        {member.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <CardContent className="flex flex-col justify-center p-6">
                    <h3 className="font-serif text-2xl font-semibold">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">
                      {member.role}
                    </p>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/\D/g, "")}`}
                        className="mt-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {member.phone}
                      </a>
                    )}
                    <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </div>
              </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <ContactCTA />
    </div>
  )
}

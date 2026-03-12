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
  description: "Learn about REVIFI - designers and contractors specializing in the revitalization of old properties in Cleveland, Ohio.",
}

export default async function AboutPage() {
  const supabase = await createClient()

  const [teamRes, stepsRes, contentRes] = await Promise.all([
    supabase.from("team_members").select("*").eq("active", true).order("sort_order", { ascending: true }),
    supabase.from("about_process_steps").select("*").order("sort_order", { ascending: true }),
    supabase.from("about_content").select("*"),
  ])

  const teamMembers = teamRes.data || []
  const processSteps = stepsRes.data || []
  const content = contentRes.data || []

  const intro1 = content.find((c: any) => c.key === "intro_paragraph_1")?.value
    || "At REVIFI, we don't just design spaces; we tell stories."
  const intro2 = content.find((c: any) => c.key === "intro_paragraph_2")?.value
    || "Our comprehensive start-to-finish approach sets us apart."

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              About Us
            </h1>
            <Link href="/projects">
              <Button className="gap-2">
                View Our Projects
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="border-b border-border bg-background pt-4 pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
          <div className="mb-8">
            <p className="text-lg text-muted-foreground">
              {intro1}
            </p>
            <p className="mt-4 text-lg text-muted-foreground">
              {intro2}
            </p>
            <h2 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl mt-8">
              Our Process
            </h2>
          </div>
          </ScrollAnimation>
          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {processSteps.map((item: any) => {
              const IconComponent = getIcon(item.icon)
              return (
              <StaggerItem key={item.step_number}>
              <Card className="relative overflow-hidden h-[280px]">
                {item.bg_image && (
                  <div className="absolute inset-0 opacity-[0.08]">
                    <img
                      src={item.bg_image}
                      alt=""
                      className="h-full w-full object-cover filter grayscale"
                    />
                  </div>
                )}
                <CardContent className="relative p-6">
                  <div className="flex h-12 w-12 items-center justify-center">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-goldenrod dark:text-[#fbbf24]">
                    {item.step_number}
                  </p>
                  <h3 className="mt-2 font-serif text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
              </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-border bg-background py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              You&apos;re in Good Hands
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              Passionate Expertise, Collaborative Brilliance
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-2" staggerDelay={0.2}>
            {teamMembers.map((member) => (
              <StaggerItem key={member.id || member.name}>
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="aspect-square object-cover"
                    />
                  ) : (
                    <div className="aspect-square bg-muted" />
                  )}
                  <CardContent className="flex flex-col justify-center p-6">
                    <h3 className="font-serif text-2xl font-semibold">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-navy dark:text-[#3b82f6]">
                      {member.role}
                    </p>
                    <p className="mt-4 text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </div>
              </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <ContactCTA />
    </div>
  )
}

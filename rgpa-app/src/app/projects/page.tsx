import { Metadata } from "next"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ScrollAnimation } from "@/components/animations/scroll-animations"
import { ProjectsViewToggle } from "@/components/projects-view-toggle"
import { ColorHoverButton } from "@/components/color-hover-button"

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore REVIFI's transformative design projects - from historic restorations to modern event spaces in Cleveland, Ohio.",
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  // Fetch published projects (not drafts) ordered by sort_order
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .neq("status", "draft")
    .order("sort_order", { ascending: true })

  console.log("Projects data:", projects)
  console.log("Projects error:", error)
  console.log("Projects count:", projects?.length)

  return (
    <div className="flex flex-col">
      {/* Projects */}
      <section className="bg-background py-8 pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!projects || projects.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold">No projects found</h3>
              <p className="mt-2 text-muted-foreground">
                Check back soon for our latest work.
              </p>
            </div>
          ) : (
            <ProjectsViewToggle projects={projects} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden border-t border-border bg-muted py-24 text-foreground">
        <div className="absolute inset-0 opacity-[0.12]">
          <img
            src="/kylekc.png"
            alt=""
            className="h-full w-full object-cover filter grayscale"
          />
        </div>
        <ScrollAnimation className="container relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Have a Project in Mind?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            We&apos;d love to hear about your vision. Let&apos;s create something extraordinary together.
          </p>
          <div className="mt-8">
            <ColorHoverButton href="/contact" size="lg" className="bg-white text-black border-white">
              Start Your Project
            </ColorHoverButton>
          </div>
        </ScrollAnimation>
      </section>
    </div>
  )
}

import { ScrollAnimation } from "@/components/animations/scroll-animations"
import { ColorHoverButton } from "@/components/color-hover-button"
import { Phone, Mail, MapPin } from "lucide-react"

export function ContactCTA() {
  return (
    <section className="relative border-t border-border overflow-hidden bg-muted py-24 text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-[0.12]">
        <img
          src="https://rgpropertyadvisors.com/wp-content/uploads/2022/01/KW-44-scaled.jpg"
          alt=""
          className="h-full w-full object-cover filter grayscale"
        />
      </div>
      <ScrollAnimation className="container relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Get Started?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Whether you're buying, selling, or investing, our team is here to guide you through every step of your real estate journey.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
          <ColorHoverButton href="/contact" size="lg" className="bg-white text-black border-white">
            Contact Our Team
          </ColorHoverButton>
          <ColorHoverButton href="/sell-your-property" size="lg" className="bg-red-600 text-white border-red-600 hover:bg-red-700">
            Sell Your Property
          </ColorHoverButton>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <a href="tel:(216)-408-3082" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <Phone className="h-4 w-4" />
            Call (216)-408-3082
          </a>
          <a href="mailto:info@rgpropertyadvisors.com" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <Mail className="h-4 w-4" />
            Email Us
          </a>
          <a href="https://maps.google.com/?q=2001+Crocker+Rd+Suite+200%2C+Westlake%2C+OH%2C+44145" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <MapPin className="h-4 w-4" />
            Get Directions
          </a>
        </div>
      </ScrollAnimation>
    </section>
  )
}

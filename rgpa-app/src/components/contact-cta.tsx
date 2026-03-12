import { ScrollAnimation } from "@/components/animations/scroll-animations"
import { ColorHoverButton } from "@/components/color-hover-button"

export function ContactCTA() {
  return (
    <section className="relative border-t border-border overflow-hidden bg-muted py-24 text-foreground">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-[0.12]">
        <img
          src="/kylekc.png"
          alt=""
          className="h-full w-full object-cover filter grayscale"
        />
      </div>
      <ScrollAnimation className="container relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Let&apos;s Get in Touch
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Ready to transform your space? Contact us to discuss your next project.
        </p>
        <div className="mt-8">
          <ColorHoverButton href="/contact" size="lg" className="bg-white text-black border-white">
            Build With Us
          </ColorHoverButton>
        </div>
      </ScrollAnimation>
    </section>
  )
}

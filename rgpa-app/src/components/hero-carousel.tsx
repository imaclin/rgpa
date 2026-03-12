"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotatingText } from "@/components/rotating-text"
import { ColorHoverButton } from "@/components/color-hover-button"

interface Project {
  id: string
  title: string
  subtitle: string
  slug: string
  featured_image_url: string | null
  location: string | null
}

interface HeroCarouselProps {
  projects: Project[]
}

export function HeroCarousel({ projects }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (projects.length <= 1) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % projects.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [projects.length])

  const currentProject = projects[currentIndex]

  if (!currentProject) {
    return null
  }

  return (
    <section className="relative bg-background">
      <div className="container mx-auto grid min-h-[85vh] max-w-7xl grid-cols-1 items-center gap-4 px-4 py-8 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* REVIFI Badge - Mobile Only, Above Image */}
        <div className="order-1 flex items-center justify-start lg:hidden">
          <span className="font-serif text-6xl font-bold tracking-tight text-black dark:text-white">
            REVIFI
          </span>
        </div>

        {/* H1 - Mobile Only, Above Image */}
        <div className="order-2 mb-4 lg:hidden">
          <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Building a better future through{" "}
            <RotatingText className="italic text-muted-foreground" />{" "}
            development and project management
          </h1>
        </div>

        {/* Right Image with Project Info */}
        <div className="relative order-3 mx-auto w-full max-w-md lg:order-2 lg:mx-0 lg:max-w-none lg:h-[600px]">
          {/* Main Image */}
          <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted shadow-2xl lg:absolute lg:right-0 lg:top-0 lg:mx-0 lg:h-[90%] lg:w-[90%] lg:aspect-auto">
            <div
              className={cn(
                "h-full w-full transition-all duration-500",
                isAnimating ? "opacity-0 scale-105" : "opacity-100 scale-100"
              )}
            >
              {currentProject.featured_image_url ? (
                <img
                  src={currentProject.featured_image_url}
                  alt={currentProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Building2 className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Project Info Card - Mobile: bottom right of image */}
            <Link href={`/projects/${currentProject.slug}`} className="lg:hidden">
              <div
                className={cn(
                  "absolute bottom-4 right-4 w-auto max-w-[200px] rounded-lg bg-background p-3 shadow-xl border border-border transition-all duration-500 hover:shadow-2xl cursor-pointer group",
                  isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy dark:bg-blue-500/10 dark:text-blue-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground group-hover:text-navy dark:group-hover:text-blue-500 transition-colors">
                      {currentProject.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {currentProject.subtitle || currentProject.location || "Featured Project"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Project Info Card - Desktop: bottom left outside image */}
          <Link href={`/projects/${currentProject.slug}`} className="hidden lg:block">
            <div
              className={cn(
                "absolute bottom-12 left-0 w-[70%] rounded-xl bg-background p-6 shadow-xl border border-border transition-all duration-500 hover:shadow-2xl cursor-pointer group",
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10 text-navy dark:bg-blue-500/10 dark:text-blue-500">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground group-hover:text-navy dark:group-hover:text-blue-500 transition-colors">
                    {currentProject.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentProject.subtitle || currentProject.location || "Featured Project"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-navy dark:group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Pagination Dots */}
          {projects.length > 1 && (
            <div className="mt-4 flex justify-center gap-2 lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:justify-start">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAnimating(true)
                    setTimeout(() => {
                      setCurrentIndex(index)
                      setIsAnimating(false)
                    }, 300)
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-navy dark:bg-blue-500"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to project ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left Content - Desktop Only */}
        <div className="order-4 hidden flex-col justify-center lg:flex lg:order-1">
          {/* REVIFI Badge - Desktop Only */}
          <div className="mb-6 hidden items-center justify-start lg:flex">
            <span className="font-serif text-7xl font-bold tracking-tight text-black dark:text-white">
              REVIFI
            </span>
          </div>
          <h1 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl lg:mb-6 lg:text-3xl xl:text-4xl">
            Building a better future through{" "}
            <RotatingText className="italic text-muted-foreground" />{" "}
            development
          </h1>
          <p className="mb-6 text-base text-muted-foreground sm:text-lg lg:mb-8">
            As innovators in renovations and construction, we meticulously craft bold and 
            inspired designs that blend precision with creativity.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row lg:justify-start">
            <ColorHoverButton href="/projects" size="lg" className="gap-2 w-full sm:w-auto bg-foreground text-background border-foreground">
              View Our Projects <ArrowRight className="h-4 w-4" />
            </ColorHoverButton>
            <ColorHoverButton href="/contact" size="lg" className="w-full sm:w-auto">
              Get In Touch
            </ColorHoverButton>
          </div>
        </div>

        {/* Mobile Description - Below Pagination */}
        <div className="order-5 mb-6 text-center lg:hidden">
          <p className="text-base text-muted-foreground sm:text-lg">
            As innovators in renovations and construction, we meticulously craft bold and 
            inspired designs that blend precision with creativity.
          </p>
        </div>

        {/* Mobile Buttons - Below Image */}
        <div className="order-6 flex flex-col gap-4 lg:hidden">
          <ColorHoverButton href="/projects" size="lg" className="gap-2 w-full bg-foreground text-background border-foreground">
            View Our Projects <ArrowRight className="h-4 w-4" />
          </ColorHoverButton>
          <ColorHoverButton href="/contact" size="lg" className="w-full">
            Get In Touch
          </ColorHoverButton>
        </div>
      </div>
    </section>
  )
}

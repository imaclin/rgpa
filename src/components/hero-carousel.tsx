"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotatingText } from "@/components/rotating-text"
import { ColorHoverButton } from "@/components/color-hover-button"

interface Property {
  id: string
  title: string
  subtitle: string
  slug: string
  featured_image_url: string | null
  location: string | null
}

interface HeroCarouselProps {
  properties: Property[]
}

export function HeroCarousel({ properties }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (properties.length <= 1) return

    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % properties.length)
        setIsAnimating(false)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [properties.length])

  const currentProperty = properties[currentIndex]

  if (!currentProperty) {
    return null
  }

  return (
    <section className="relative bg-background">
      <div className="container mx-auto grid min-h-[85vh] max-w-7xl grid-cols-1 items-center gap-4 px-4 py-8 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Brand - Mobile Only, Above Image */}
        <div className="order-1 flex items-center justify-start lg:hidden">
          <span className="font-serif text-4xl font-bold tracking-tight text-black dark:text-white">
            RG Property Advisors
          </span>
        </div>

        {/* H1 - Mobile Only, Above Image */}
        <div className="order-2 mb-4 lg:hidden">
          <h1 className="font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl">
            Helping you buy and sell the right home with{" "}
            <RotatingText className="italic text-muted-foreground" />{" "}
            guidance
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
              {currentProperty.featured_image_url ? (
                <img
                  src={currentProperty.featured_image_url}
                  alt={currentProperty.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Building2 className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Property Info Card - Mobile: bottom right of image */}
            <Link href={`/properties/${currentProperty.slug}`} className="lg:hidden">
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
                      {currentProperty.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {currentProperty.subtitle || currentProperty.location || "Featured Property"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Property Info Card - Desktop: bottom left outside image */}
          <Link href={`/properties/${currentProperty.slug}`} className="hidden lg:block">
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
                    {currentProperty.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentProperty.subtitle || currentProperty.location || "Featured Property"}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-navy dark:group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          </Link>

          {/* Pagination Dots */}
          {properties.length > 1 && (
            <div className="mt-4 flex justify-center gap-2 lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:justify-start">
              {properties.map((_, index) => (
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
                  aria-label={`Go to property ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left Content - Desktop Only */}
        <div className="order-4 hidden flex-col justify-center lg:flex lg:order-1">
          {/* Brand - Desktop Only */}
          <div className="mb-6 hidden items-center justify-start lg:flex">
            <span className="font-serif text-5xl font-bold tracking-tight text-black dark:text-white">
              RG Property Advisors
            </span>
          </div>
          <h1 className="mb-4 font-serif text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl md:text-4xl lg:mb-6 lg:text-3xl xl:text-4xl">
            Helping you buy and sell the right home with{" "}
            <RotatingText className="italic text-muted-foreground" />{" "}
            guidance
          </h1>
          <p className="mb-6 text-base text-muted-foreground sm:text-lg lg:mb-8">
            We combine neighborhood insight, pricing strategy, and hands-on support to guide
            you from search to close across Greater Cleveland.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row lg:justify-start">
            <ColorHoverButton href="/properties" size="lg" className="gap-2 w-full sm:w-auto bg-foreground text-background border-foreground">
              Browse Homes <ArrowRight className="h-4 w-4" />
            </ColorHoverButton>
            <ColorHoverButton href="/sell-your-property" size="lg" className="w-full sm:w-auto">
              Sell Your Property
            </ColorHoverButton>
          </div>
        </div>

        {/* Mobile Description - Below Pagination */}
        <div className="order-5 mb-6 text-center lg:hidden">
          <p className="text-base text-muted-foreground sm:text-lg">
            We combine neighborhood insight, pricing strategy, and hands-on support to guide
            you from search to close across Greater Cleveland.
          </p>
        </div>

        {/* Mobile Buttons - Below Image */}
        <div className="order-6 flex flex-col gap-4 lg:hidden">
          <ColorHoverButton href="/properties" size="lg" className="gap-2 w-full bg-foreground text-background border-foreground">
            Browse Homes <ArrowRight className="h-4 w-4" />
          </ColorHoverButton>
          <ColorHoverButton href="/sell-your-property" size="lg" className="w-full">
            Sell Your Property
          </ColorHoverButton>
        </div>
      </div>
    </section>
  )
}

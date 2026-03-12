"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface HeroItem {
  imageUrl: string
  label?: string | null
  propertyId?: string | null
  slug?: string | null
}

interface HomeHeroSectionProps {
  items: HeroItem[]
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2574&auto=format&fit=crop"

export function HomeHeroSection({ items }: HomeHeroSectionProps) {
  const heroItems = items.length > 0 ? items : [{ imageUrl: FALLBACK_IMAGE, label: null, propertyId: null, slug: null }]
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (heroItems.length <= 1) return

    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length)
    }, 5000)

    return () => window.clearInterval(interval)
  }, [heroItems.length])

  const currentItem = heroItems[currentIndex]

  return (
    <section className="relative">
      <div className="relative h-[700px] w-full overflow-hidden">
        {heroItems.map((item, index) => (
          <img
            key={`${item.imageUrl}-${index}`}
            src={item.imageUrl}
            alt="RG Property Advisors hero background"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/25"></div>
        {currentItem?.label && (
          <Link 
            href={currentItem.slug ? `/properties/${currentItem.slug}` : "/properties"}
            className="absolute right-4 bottom-4 z-10 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-md backdrop-blur-sm hover:bg-background/95 transition-colors flex items-center gap-2 sm:right-6 sm:bottom-6"
          >
            {currentItem.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-xl rounded-none bg-white/42 p-10 text-black shadow-lg backdrop-blur-sm sm:rounded-xl">
              <h1 className="font-serif text-4xl font-bold text-black sm:text-5xl">
                Find the right home with local experts
              </h1>
              <p className="mt-6 text-lg text-black">
                We guide buyers and sellers across Greater Cleveland with smart pricing, strong marketing,
                and hands-on support from first showing to closing day.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-black/20 pt-8">
                <div>
                  <p className="text-3xl font-bold text-black">100+</p>
                  <p className="text-sm text-black">Homes sold & purchased</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-black">Top 1%</p>
                  <p className="text-sm text-black">Cleveland advisors</p>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 text-base">
                  <Link href="/properties">Browse Homes</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 text-base">
                  <Link href="/sell-your-property">Sell Your Property</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

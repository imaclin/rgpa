"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building2, LayoutGrid, List, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"
import { cn } from "@/lib/utils"

interface Property {
  slug: string
  title: string
  subtitle: string | null
  category: string
  status: string
  location: string | null
  featured_image_url: string | null
}

interface PropertiesViewToggleProps {
  properties: Property[]
}

export function PropertiesViewToggle({ properties }: PropertiesViewToggleProps) {
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 640 ? "list" : "grid"
    }
    return "grid"
  })

  useEffect(() => {
    setView(window.innerWidth < 640 ? "list" : "grid")
  }, [])

  return (
    <div>
      {/* Header + Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
          Our Work
        </h1>
        <div className="flex items-center gap-1">
        <Button
          variant={view === "grid" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === "list" ? "default" : "ghost"}
          size="icon"
          className="h-8 w-8"
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4" />
        </Button>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
          {properties.map((property) => (
            <StaggerItem key={property.slug}>
              <Link href={`/properties/${property.slug}`}>
                <Card className="group overflow-hidden transition-all hover:shadow-lg p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {property.featured_image_url ? (
                      <img
                        src={property.featured_image_url}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-24 w-24 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {property.category}
                      </Badge>
                      <Badge variant="secondary" className="capitalize">
                        {property.status}
                      </Badge>
                    </div>
                    <h2 className="font-serif text-2xl font-bold">{property.title}</h2>
                    <p className="mt-1 text-sm font-medium text-navy dark:text-[#3b82f6]">
                      {property.subtitle}
                    </p>
                    <p className="mt-4 text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
                      View Property →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="flex flex-col gap-2">
          {properties.map((property) => (
            <Link key={property.slug} href={`/properties/${property.slug}`} className="block">
              <Card className="group overflow-hidden transition-all hover:shadow-md hover:border-foreground/20 p-0">
                <CardContent className="flex items-center gap-4 p-0">
                  {/* Thumbnail */}
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden bg-muted sm:h-28 sm:w-40">
                    {property.featured_image_url ? (
                      <img
                        src={property.featured_image_url}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-8 w-8 opacity-20" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 py-2 pr-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize text-xs">
                        {property.category}
                      </Badge>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {property.status}
                      </Badge>
                    </div>
                    <h2 className="font-serif text-lg font-bold leading-tight sm:text-xl">
                      {property.title}
                    </h2>
                    {property.subtitle && (
                      <p className="mt-0.5 text-sm text-navy dark:text-[#3b82f6]">
                        {property.subtitle}
                      </p>
                    )}
                    {property.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {property.location}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

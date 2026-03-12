"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"

interface Property {
  id: string
  title: string
  subtitle: string | null
  slug: string
  category: string
  status: string
  location: string | null
  year: number | null
  featured: boolean
  featured_image_url: string | null
  sort_order: number | null
}

interface PropertiesListProps {
  initialProperties: Property[]
  viewMode: "list" | "grid"
  setViewMode: (mode: "list" | "grid") => void
}

export function PropertiesList({ initialProperties, viewMode, setViewMode }: PropertiesListProps) {
  const router = useRouter()
  const adminPath = useAdminPath()
  const [properties, setProperties] = useState(initialProperties)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newProperties = [...properties]
    const draggedItem = newProperties[draggedIndex]
    newProperties.splice(draggedIndex, 1)
    newProperties.splice(index, 0, draggedItem)

    setProperties(newProperties)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)

    // Update sort_order in database
    const supabase = createClient()
    for (let i = 0; i < properties.length; i++) {
      await supabase
        .from("properties")
        .update({ sort_order: i })
        .eq("id", properties[i].id)
    }

    toast.success("Property order updated")
    router.refresh()
  }

  const handleRowClick = (propertyId: string) => {
    router.push(adminPath(`/admin/properties/${propertyId}`))
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-lg font-semibold">No properties yet</h3>
          <p className="mt-2 text-muted-foreground">
            Get started by creating your first property.
          </p>
          <Link href={adminPath("/admin/properties/new")} className="mt-4 inline-block">
            <Button>Create Property</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Order will be reflected on the public properties page.
          </p>
          <div className="grid gap-2">
            {properties.map((property, index) => (
              <Card
                key={property.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleRowClick(property.id)}
                className={`cursor-pointer overflow-hidden transition-all hover:bg-muted/50 p-0 gap-0 ${
                  draggedIndex === index ? "opacity-50 ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3 px-2 py-2.5">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Image */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {property.featured_image_url ? (
                      <img
                        src={property.featured_image_url}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold">{property.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{property.subtitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {property.location} {property.location && property.year && "•"} {property.year}
                    </p>
                  </div>
                  {/* Status pill */}
                  <div className="shrink-0 pr-2">
                    <Badge
                      variant={property.status === "for-sale" ? "default" : property.status === "sold" ? "secondary" : "outline"}
                      className="capitalize text-xs"
                    >
                      {property.status === "for-sale" ? "For Sale" : property.status === "for-rent" ? "For Rent" : property.status === "sold" ? "Sold" : property.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <Card
              key={property.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleRowClick(property.id)}
              className={`cursor-pointer overflow-hidden transition-all hover:bg-muted/50 ${
                draggedIndex === index ? "opacity-50 ring-2 ring-primary" : ""
              }`}
            >
              {/* Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {property.featured_image_url ? (
                  <img
                    src={property.featured_image_url}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                {/* Drag Handle Overlay */}
                <div className="absolute left-2 top-2 cursor-grab rounded bg-black/50 p-1 text-white opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
                  <GripVertical className="h-4 w-4" />
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-lg font-semibold">{property.title}</h3>
                    {property.featured && (
                      <Badge className="bg-goldenrod text-white dark:bg-[#fbbf24]">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{property.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {property.category}
                    </Badge>
                    <Badge
                      variant={property.status === "for-sale" ? "default" : property.status === "sold" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {property.status === "for-sale" ? "For Sale" : property.status === "for-rent" ? "For Rent" : property.status === "sold" ? "Sold" : property.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {property.location} {property.location && property.year && "•"} {property.year}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

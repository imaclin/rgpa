"use client"

import { useState, useEffect, use, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Trash2, Check } from "lucide-react"
import { toast } from "sonner"
import { PropertyMedia } from "@/components/admin/property-media"
import { useAdminPath } from "@/hooks/use-admin-path"

type Props = {
  params: Promise<{ id: string }>
}

export default function EditPropertyPage({ params }: Props) {
  const adminPath = useAdminPath()
  const { id } = use(params)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [media, setMedia] = useState<any[]>([])
  const [initialLoad, setInitialLoad] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    category: "residential",
    status: "for-sale",
    location: "",
    year: new Date().getFullYear(),
    sq_footage: "",
    website_url: "",
    featured: false,
  })

  const normalizeStatus = (status?: string | null) => {
    const value = (status || "").toLowerCase().trim()
    if (value === "for-sale" || value === "for-rent" || value === "sold") {
      return value
    }
    if (value.includes("rent")) return "for-rent"
    if (
      value.includes("sold") ||
      value.includes("completed") ||
      value.includes("archived") ||
      value.includes("pending") ||
      value.includes("off market")
    ) {
      return "sold"
    }
    return "for-sale"
  }
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTitleChange = (value: string) => {
    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    }
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    })
  }

  const saveProperty = useCallback(async (data: typeof formData) => {
    if (!data.title.trim()) return
    
    setIsSaving(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("properties")
        .update({
          title: data.title,
          subtitle: data.subtitle,
          slug: data.slug,
          description: data.description,
          category: data.category,
          status: data.status,
          location: data.location,
          year: data.year,
          sq_footage: data.sq_footage ? parseInt(data.sq_footage) : null,
          website_url: data.website_url || null,
          featured: data.featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error
      setHasUnsavedChanges(false)
    } catch (error: any) {
      toast.error("Failed to save", { description: error.message })
    } finally {
      setIsSaving(false)
    }
  }, [id])

  useEffect(() => {
    const fetchProperty = async () => {
      const supabase = createClient()
      
      const { data: property, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !property) {
        toast.error("Property not found")
        router.push(adminPath("/admin/properties"))
        return
      }

      setFormData({
        title: property.title || "",
        subtitle: property.subtitle || "",
        slug: property.slug || "",
        description: property.description || "",
        category: property.category || "residential",
        status: normalizeStatus(property.status),
        location: property.location || "",
        year: property.year || new Date().getFullYear(),
        sq_footage: property.sq_footage?.toString() || "",
        website_url: property.website_url || "",
        featured: property.featured || false,
      })

      // Fetch media
      const { data: mediaData } = await supabase
        .from("media")
        .select("*")
        .eq("property_id", id)
        .order("sort_order", { ascending: true })

      if (mediaData) {
        setMedia(mediaData.map((m: any) => ({
          id: m.id,
          url: m.url,
          alt_text: m.alt_text,
          type: m.type,
        })))
      }

      setIsLoading(false)
      // Mark initial load complete after a short delay to prevent auto-save on load
      setTimeout(() => setInitialLoad(false), 100)
    }

    fetchProperty()
  }, [id, router])

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (initialLoad || isLoading) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    if (!formData.title.trim()) return

    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    saveTimeoutRef.current = setTimeout(() => {
      saveProperty(formData)
    }, 1500) // 1.5 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, initialLoad, isLoading, saveProperty])

  const handleManualSave = async () => {
    await saveProperty(formData)
    toast.success("Property saved!")
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("properties").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete property")
      return
    }

    toast.success("Property deleted")
    router.push(adminPath("/admin/properties"))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Mobile Layout */}
      <div className="space-y-4 md:hidden">
        <div className="flex items-center justify-between">
          <Link href={adminPath("/admin/properties")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Button 
            onClick={handleManualSave} 
            className="gap-2" 
            disabled={isSaving || !formData.title.trim()}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save*" : "Save"}
          </Button>
        </div>
        <div>
          <h1 className="font-sans text-3xl font-bold">{formData.title || "Untitled Property"}</h1>
          {formData.slug && (
            <Link 
              href={`/properties/${formData.slug}`}
              target="_blank"
              className="mt-1 inline-block text-sm text-navy hover:underline dark:text-[#3b82f6]"
            >
              View public property →
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={adminPath("/admin/properties")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-sans text-3xl font-bold">{formData.title || "Untitled Property"}</h1>
          </div>
          <Button
            onClick={handleManualSave}
            className="gap-2"
            disabled={isSaving || !formData.title.trim()}
            variant={hasUnsavedChanges ? "default" : "outline"}
          >
            {isSaving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save*" : "Saved"}
          </Button>
        </div>
        {formData.slug && (
          <div className="ml-14">
            <Link
              href={`/properties/${formData.slug}`}
              target="_blank"
              className="text-sm text-navy hover:underline dark:text-[#3b82f6]"
            >
              View public property →
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleManualSave() }} className="space-y-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Title *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Franklin Grand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="3-bed investment property"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="franklin-grand"
                />
                <p className="text-sm text-muted-foreground">
                  This will be used in the property URL: /properties/{formData.slug || "slug"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the property..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Cleveland, OH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sq_footage">Square Footage</Label>
                  <Input
                    id="sq_footage"
                    type="number"
                    value={formData.sq_footage}
                    onChange={(e) =>
                      setFormData({ ...formData, sq_footage: e.target.value })
                    }
                    placeholder="2500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Listing URL</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) =>
                      setFormData({ ...formData, website_url: e.target.value })
                    }
                    placeholder="https://airbnb.com/..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Link to MLS, property website, etc.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="mixed-use">Mixed Use</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <select
                    id="status"
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="for-sale">For Sale</option>
                    <option value="for-rent">For Rent</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="featured">Featured Property</Label>
              </div>
            </CardContent>
          </Card>

          <PropertyMedia
            propertyId={id}
            media={media}
            onMediaChange={setMedia}
          />

          {/* Delete Property */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Once you delete a property, there is no going back. Please be certain.
              </p>
              <Button onClick={handleDelete} variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Property
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}


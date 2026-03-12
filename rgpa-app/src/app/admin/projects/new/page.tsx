"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, Check } from "lucide-react"
import { toast } from "sonner"
import { ProjectMedia } from "@/components/admin/project-media"
import { useAdminPath } from "@/hooks/use-admin-path"

export default function NewProjectPage() {
  const router = useRouter()
  const adminPath = useAdminPath()
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [media, setMedia] = useState<any[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    category: "residential",
    status: "in-progress",
    location: "",
    year: new Date().getFullYear(),
    sq_footage: "",
    website_url: "",
    featured: false,
  })
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const saveProject = useCallback(async (data: typeof formData, currentProjectId: string | null) => {
    if (!data.title.trim()) return null
    
    setIsSaving(true)
    const supabase = createClient()

    try {
      if (currentProjectId) {
        // Update existing project
        const { error } = await supabase
          .from("projects")
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
          .eq("id", currentProjectId)

        if (error) throw error
        setHasUnsavedChanges(false)
        return currentProjectId
      } else {
        // Create new project
        const { data: newProject, error } = await supabase.from("projects").insert({
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
        }).select().single()

        if (error) throw error
        setProjectId(newProject.id)
        setHasUnsavedChanges(false)
        return newProject.id
      }
    } catch (error: any) {
      toast.error("Failed to save", { description: error.message })
      return null
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Only auto-save if there's a title
    if (!formData.title.trim()) return

    // Mark as having unsaved changes
    setHasUnsavedChanges(true)

    saveTimeoutRef.current = setTimeout(() => {
      saveProject(formData, projectId)
    }, 1500) // 1.5 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, projectId, saveProject])

  const handleTitleChange = (value: string) => {
    setFormData({
      ...formData,
      title: value,
      slug: generateSlug(value),
    })
  }

  const handleManualSave = async () => {
    await saveProject(formData, projectId)
    toast.success("Project saved!")
  }

  return (
    <div className="space-y-8">
      {/* Mobile Layout */}
      <div className="space-y-4 md:hidden">
        <div className="flex items-center justify-between">
          <Link href={adminPath("/admin/projects")}>
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
          <h1 className="font-serif text-3xl font-bold">New Project</h1>
          <p className="mt-1 text-muted-foreground">
            Add a new project to your portfolio
          </p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={adminPath("/admin/projects")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold">New Project</h1>
            <p className="mt-1 text-muted-foreground">
              Add a new project to your portfolio
            </p>
          </div>
        </div>
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
      <form id="project-form">
        <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g., Franklin Grand"
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
                      placeholder="e.g., Timeless Classic"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="franklin-grand"
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be used in the project URL: /projects/{formData.slug || "slug"}
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
                    placeholder="Describe the project..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
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
                    <Label htmlFor="website_url">Website URL</Label>
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
                      Link to Airbnb, business site, etc.
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
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="coming-soon">Coming Soon</option>
                      <option value="archived">Archived</option>
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
                  <Label htmlFor="featured">Featured Project</Label>
                </div>
              </CardContent>
            </Card>

            {projectId ? (
              <ProjectMedia
                projectId={projectId}
                media={media}
                onMediaChange={setMedia}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Project Media</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Save the project as a draft first to enable media uploads.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </form>
    </div>
  )
}

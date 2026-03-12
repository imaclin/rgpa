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
import { ProjectMedia } from "@/components/admin/project-media"
import { useAdminPath } from "@/hooks/use-admin-path"

type Props = {
  params: Promise<{ id: string }>
}

export default function EditProjectPage({ params }: Props) {
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
    status: "in-progress",
    location: "",
    year: new Date().getFullYear(),
    sq_footage: "",
    website_url: "",
    featured: false,
  })
  
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

  const saveProject = useCallback(async (data: typeof formData) => {
    if (!data.title.trim()) return
    
    setIsSaving(true)
    const supabase = createClient()

    try {
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
    const fetchProject = async () => {
      const supabase = createClient()
      
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()

      if (error || !project) {
        toast.error("Project not found")
        router.push(adminPath("/admin/projects"))
        return
      }

      setFormData({
        title: project.title || "",
        subtitle: project.subtitle || "",
        slug: project.slug || "",
        description: project.description || "",
        category: project.category || "residential",
        status: project.status || "in-progress",
        location: project.location || "",
        year: project.year || new Date().getFullYear(),
        sq_footage: project.sq_footage?.toString() || "",
        website_url: project.website_url || "",
        featured: project.featured || false,
      })

      // Fetch media
      const { data: mediaData } = await supabase
        .from("media")
        .select("*")
        .eq("project_id", id)
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

    fetchProject()
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
      saveProject(formData)
    }, 1500) // 1.5 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, initialLoad, isLoading, saveProject])

  const handleManualSave = async () => {
    await saveProject(formData)
    toast.success("Project saved!")
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("projects").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete project")
      return
    }

    toast.success("Project deleted")
    router.push(adminPath("/admin/projects"))
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
          <h1 className="font-sans text-3xl font-bold">{formData.title || "Untitled Project"}</h1>
          {formData.slug && (
            <Link 
              href={`/projects/${formData.slug}`}
              target="_blank"
              className="mt-1 inline-block text-sm text-navy hover:underline dark:text-[#3b82f6]"
            >
              View public project →
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={adminPath("/admin/projects")}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-sans text-3xl font-bold">{formData.title || "Untitled Project"}</h1>
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
        {formData.slug && (
          <div className="ml-14">
            <Link 
              href={`/projects/${formData.slug}`}
              target="_blank"
              className="text-sm text-navy hover:underline dark:text-[#3b82f6]"
            >
              View public project →
            </Link>
          </div>
        )}
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
                    <option value="draft">Draft</option>
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

          <ProjectMedia
            projectId={id}
            media={media}
            onMediaChange={setMedia}
          />

          {/* Delete Project */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Once you delete a project, there is no going back. Please be certain.
              </p>
              <Button onClick={handleDelete} variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Project
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

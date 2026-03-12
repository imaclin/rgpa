"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Building2, GripVertical, LayoutGrid, List } from "lucide-react"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"

interface Project {
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

interface ProjectsListProps {
  initialProjects: Project[]
  viewMode: "list" | "grid"
  setViewMode: (mode: "list" | "grid") => void
}

export function ProjectsList({ initialProjects, viewMode, setViewMode }: ProjectsListProps) {
  const router = useRouter()
  const adminPath = useAdminPath()
  const [projects, setProjects] = useState(initialProjects)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newProjects = [...projects]
    const draggedItem = newProjects[draggedIndex]
    newProjects.splice(draggedIndex, 1)
    newProjects.splice(index, 0, draggedItem)

    setProjects(newProjects)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)

    // Update sort_order in database
    const supabase = createClient()
    for (let i = 0; i < projects.length; i++) {
      await supabase
        .from("projects")
        .update({ sort_order: i })
        .eq("id", projects[i].id)
    }

    toast.success("Project order updated")
    router.refresh()
  }

  const handleRowClick = (projectId: string) => {
    router.push(adminPath(`/admin/projects/${projectId}`))
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 font-serif text-lg font-semibold">No projects yet</h3>
          <p className="mt-2 text-muted-foreground">
            Get started by creating your first project.
          </p>
          <Link href={adminPath("/admin/projects/new")} className="mt-4 inline-block">
            <Button>Create Project</Button>
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
            Drag to reorder. Order will be reflected on the public projects page.
          </p>
          <div className="grid gap-2">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleRowClick(project.id)}
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
                    {project.featured_image_url ? (
                      <img
                        src={project.featured_image_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{project.subtitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {project.location} {project.location && project.year && "•"} {project.year}
                    </p>
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
          {projects.map((project, index) => (
            <Card
              key={project.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => handleRowClick(project.id)}
              className={`cursor-pointer overflow-hidden transition-all hover:bg-muted/50 ${
                draggedIndex === index ? "opacity-50 ring-2 ring-primary" : ""
              }`}
            >
              {/* Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {project.featured_image_url ? (
                  <img
                    src={project.featured_image_url}
                    alt={project.title}
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
                    <h3 className="font-serif text-lg font-semibold">{project.title}</h3>
                    {project.featured && (
                      <Badge className="bg-goldenrod text-white dark:bg-[#fbbf24]">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{project.subtitle}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {project.category}
                    </Badge>
                    <Badge
                      variant={project.status === "completed" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.location} {project.location && project.year && "•"} {project.year}
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

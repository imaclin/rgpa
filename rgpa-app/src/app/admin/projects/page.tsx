"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, List, LayoutGrid } from "lucide-react"
import { ProjectsList } from "@/components/admin/projects-list"
import { AdminLink } from "@/components/admin/admin-link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setProjects(data || [])
      }
      setLoading(false)
    }

    fetchProjects()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your portfolio projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <AdminLink href="/admin/projects/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </AdminLink>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading projects...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Unable to load projects. Make sure your database is set up correctly.
            </p>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <ProjectsList 
          initialProjects={projects} 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}
    </div>
  )
}

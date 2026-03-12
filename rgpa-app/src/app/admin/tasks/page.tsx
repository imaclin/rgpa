"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAdminPath } from "@/hooks/use-admin-path"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  title: string
  subtitle: string | null
  slug: string
  location: string | null
  featured_image_url: string | null
  status: string
}

interface TaskSummary {
  project_id: string
  total: number
  completed: number
  overdue: number
}

export default function TasksPage() {
  const router = useRouter()
  const adminPath = useAdminPath()
  const [projects, setProjects] = useState<Project[]>([])
  const [taskSummaries, setTaskSummaries] = useState<Record<string, TaskSummary>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const { data: projectsData } = await supabase
      .from("projects")
      .select("id, title, subtitle, slug, location, featured_image_url, status")
      .order("sort_order", { ascending: true })

    if (projectsData) {
      setProjects(projectsData)

      // Fetch task counts per project
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("id, project_id, status, due_date")

      if (tasksData) {
        const summaries: Record<string, TaskSummary> = {}
        const today = new Date().toISOString().split("T")[0]

        for (const task of tasksData) {
          if (!summaries[task.project_id]) {
            summaries[task.project_id] = { project_id: task.project_id, total: 0, completed: 0, overdue: 0 }
          }
          summaries[task.project_id].total++
          if (task.status === "completed") {
            summaries[task.project_id].completed++
          }
          if (task.due_date && task.due_date < today && task.status !== "completed") {
            summaries[task.project_id].overdue++
          }
        }
        setTaskSummaries(summaries)
      }
    }

    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredProjects = projects.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleClick = (projectId: string) => {
    router.push(adminPath(`/admin/tasks/${projectId}`))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Manage tasks for each property
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-serif text-lg font-semibold">No properties yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a project first to start managing tasks.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Property List */}
          <div className="space-y-1">
            {filteredProjects.map((project) => {
              const summary = taskSummaries[project.id]
              const total = summary?.total || 0
              const completed = summary?.completed || 0
              const overdue = summary?.overdue || 0
              const progress = total > 0 ? Math.round((completed / total) * 100) : 0

              return (
                <Card
                  key={project.id}
                  className="group cursor-pointer transition-all hover:border-foreground/20"
                  onClick={() => handleClick(project.id)}
                >
                  <CardContent className="flex items-center gap-3 px-3 -my-1">
                    {/* Property thumbnail */}
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-muted">
                      {project.featured_image_url ? (
                        <img
                          src={project.featured_image_url}
                          alt={project.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Property info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium leading-tight">{project.title}</h3>
                        {overdue > 0 && (
                          <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0">
                            <AlertTriangle className="h-3 w-3" />
                            {overdue}
                          </Badge>
                        )}
                      </div>
                      {project.location && (
                        <p className="text-xs text-muted-foreground">{project.location}</p>
                      )}
                    </div>

                    {/* Task count */}
                    {total > 0 && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        {completed}/{total}
                      </span>
                    )}

                    {/* Arrow indicator */}
                    <div className="text-muted-foreground/40 group-hover:text-muted-foreground">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

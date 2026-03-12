"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"
import { cn } from "@/lib/utils"
import { TaskItem, type Task } from "@/components/admin/task-item"
import { TaskForm } from "@/components/admin/task-form"

interface Project {
  id: string
  title: string
  location: string | null
  featured_image_url: string | null
}

export default function PropertyTasksPage() {
  const params = useParams()
  const router = useRouter()
  const adminPath = useAdminPath()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quickAdd, setQuickAdd] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [projectRes, tasksRes] = await Promise.all([
      supabase.from("projects").select("id, title, location, featured_image_url").eq("id", projectId).single(),
      supabase.from("tasks").select("*").eq("project_id", projectId).order("sort_order", { ascending: true }),
    ])

    if (projectRes.data) setProject(projectRes.data)
    if (tasksRes.data) setTasks(tasksRes.data as Task[])
    setIsLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Derived state
  const activeTasks = tasks.filter((t) => t.status !== "completed")
  const completedTasks = tasks.filter((t) => t.status === "completed")
  const totalTasks = tasks.length
  const completedCount = completedTasks.length
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  // Quick add
  const handleQuickAdd = async () => {
    if (!quickAdd.trim() || isAdding) return
    setIsAdding(true)
    const supabase = createClient()

    const maxSort = tasks.length > 0 ? Math.max(...tasks.map((t) => t.sort_order)) + 1 : 0

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: quickAdd.trim(),
        status: "pending",
        priority: "medium",
        sort_order: maxSort,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to create task")
    } else if (data) {
      setTasks((prev) => [...prev, data as Task])
      toast.success("Task added")
    }

    setQuickAdd("")
    setIsAdding(false)
  }

  // Toggle complete
  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    const completedAt = newStatus === "completed" ? new Date().toISOString() : null

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } as Task : t))
    )

    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at: completedAt })
      .eq("id", task.id)

    if (error) {
      // Revert
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? task : t))
      )
      toast.error("Failed to update task")
    } else {
      toast.success(newStatus === "completed" ? "Task completed" : "Task reopened")
    }
  }

  // Save (create or edit)
  const handleSave = async (data: Partial<Task>) => {
    const supabase = createClient()

    if (data.id) {
      // Update
      const { error } = await supabase
        .from("tasks")
        .update({
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
          completed_at: data.completed_at,
        })
        .eq("id", data.id)

      if (error) {
        toast.error("Failed to update task")
      } else {
        setTasks((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } as Task : t)))
        toast.success("Task updated")
      }
    } else {
      // Create via form
      const maxSort = tasks.length > 0 ? Math.max(...tasks.map((t) => t.sort_order)) + 1 : 0
      const { data: created, error } = await supabase
        .from("tasks")
        .insert({
          project_id: projectId,
          title: data.title,
          description: data.description,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date,
          completed_at: data.completed_at,
          sort_order: maxSort,
        })
        .select()
        .single()

      if (error) {
        toast.error("Failed to create task")
      } else if (created) {
        setTasks((prev) => [...prev, created as Task])
        toast.success("Task created")
      }
    }

    setEditingTask(null)
    setShowForm(false)
  }

  // Delete
  const handleDelete = async () => {
    if (!deletingTask) return
    const supabase = createClient()
    const { error } = await supabase.from("tasks").delete().eq("id", deletingTask.id)

    if (error) {
      toast.error("Failed to delete task")
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id))
      toast.success("Task deleted")
    }
    setDeletingTask(null)
  }

  // Clear completed
  const handleClearCompleted = async () => {
    const completedIds = completedTasks.map((t) => t.id)
    if (completedIds.length === 0) return

    const supabase = createClient()
    const { error } = await supabase.from("tasks").delete().in("id", completedIds)

    if (error) {
      toast.error("Failed to clear completed tasks")
    } else {
      setTasks((prev) => prev.filter((t) => t.status !== "completed"))
      toast.success(`Cleared ${completedIds.length} completed tasks`)
    }
  }

  // Drag reorder (active tasks only)
  const handleDragStart = (index: number) => setDragIndex(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    const reordered = [...activeTasks]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)

    // Merge back with completed
    setTasks([...reordered, ...completedTasks])
    setDragIndex(index)
  }

  const handleDragEnd = async () => {
    setDragIndex(null)

    // Persist new sort order
    const supabase = createClient()
    const updates = activeTasks.map((task, i) => ({
      id: task.id,
      sort_order: i,
    }))

    for (const update of updates) {
      await supabase.from("tasks").update({ sort_order: update.sort_order }).eq("id", update.id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="py-24 text-center">
        <p className="text-muted-foreground">Property not found</p>
        <Button variant="link" onClick={() => router.push(adminPath("/admin/tasks"))}>
          Back to Tasks
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="mt-1 shrink-0"
          onClick={() => router.push(adminPath("/admin/tasks"))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-bold leading-tight">{project.title}</h1>
          {project.location && (
            <p className="mt-0.5 text-sm text-muted-foreground">{project.location}</p>
          )}

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progress === 100
                    ? "bg-green-500 dark:bg-green-400"
                    : progress > 0
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "bg-transparent"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="shrink-0 text-sm font-medium text-muted-foreground">
              {completedCount}/{totalTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a task..."
          value={quickAdd}
          onChange={(e) => setQuickAdd(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          disabled={isAdding}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => { setEditingTask(null); setShowForm(true) }}
          title="Create task with details"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Active tasks */}
      {activeTasks.length === 0 && completedTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Circle className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 font-serif text-lg font-semibold">No tasks yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Type a task name above and press Enter to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {activeTasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
              onDelete={(t) => setDeletingTask(t)}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      )}

      {/* Completed section */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {showCompleted ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
              {completedTasks.length} completed
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleClearCompleted}
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </Button>
          </div>
          {showCompleted && (
            <div className="space-y-2">
              {completedTasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  index={index}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => { setEditingTask(t); setShowForm(true) }}
                  onDelete={(t) => setDeletingTask(t)}
                  onDragStart={() => {}}
                  onDragOver={() => {}}
                  onDragEnd={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Task form dialog */}
      <TaskForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditingTask(null) }}
        onSave={handleSave}
        task={editingTask}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingTask} onOpenChange={(v) => !v && setDeletingTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingTask?.title}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

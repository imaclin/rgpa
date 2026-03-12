"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { GripVertical, Pencil, Trash2, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

interface TaskItemProps {
  task: Task
  onToggleComplete: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onDragStart: (index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  index: number
}

const priorityConfig = {
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  high: { label: "High", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  low: { label: "Low", className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700" },
}

export function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  index,
}: TaskItemProps) {
  const [isChecking, setIsChecking] = useState(false)
  const isCompleted = task.status === "completed"
  const priority = priorityConfig[task.priority]
  const today = new Date().toISOString().split("T")[0]
  const isOverdue = task.due_date && task.due_date < today && !isCompleted

  const handleToggle = () => {
    setIsChecking(true)
    setTimeout(() => {
      onToggleComplete(task)
      setIsChecking(false)
    }, 200)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all",
        isCompleted
          ? "border-border/50 bg-muted/30"
          : "border-border bg-card hover:border-foreground/20 hover:shadow-sm",
        isChecking && "scale-[0.98] opacity-70"
      )}
    >
      {/* Drag handle */}
      <div className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        className={cn(
          "h-5 w-5 rounded-full transition-all",
          isCompleted && "bg-green-500 border-green-500 dark:bg-green-400 dark:border-green-400"
        )}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium transition-all",
              isCompleted && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
          {!isCompleted && (
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 leading-4 font-normal", priority.className)}>
              {priority.label}
            </Badge>
          )}
        </div>
        {task.description && !isCompleted && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.description}</p>
        )}
      </div>

      {/* Due date */}
      {task.due_date && !isCompleted && (
        <span
          className={cn(
            "flex items-center gap-1 whitespace-nowrap text-xs",
            isOverdue ? "font-medium text-red-600 dark:text-red-400" : "text-muted-foreground"
          )}
        >
          <Calendar className="h-3 w-3" />
          {formatDate(task.due_date)}
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => { e.stopPropagation(); onEdit(task) }}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(task) }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

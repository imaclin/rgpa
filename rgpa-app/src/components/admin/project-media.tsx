"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Upload, Trash2, Image as ImageIcon, GripVertical, Star } from "lucide-react"
import { toast } from "sonner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProjectFiles } from "@/components/admin/project-files"
import { ProjectBeforeAfter } from "@/components/admin/project-before-after"

interface ProjectMediaProps {
  projectId?: string
  media: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
}

export interface MediaItem {
  id?: string
  url: string
  alt_text: string
  type: "image" | "video"
  file?: File
  sort_order?: number
}

export function ProjectMedia({ projectId, media, onMediaChange }: ProjectMediaProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    
    const newMedia = [...media]
    const draggedItem = newMedia[draggedIndex]
    newMedia.splice(draggedIndex, 1)
    newMedia.splice(index, 0, draggedItem)
    
    // Update sort_order for all items
    const updatedMedia = newMedia.map((item, i) => ({ ...item, sort_order: i }))
    onMediaChange(updatedMedia)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)
    
    // Update sort_order in database if we have a projectId
    if (projectId) {
      const supabase = createClient()
      for (let i = 0; i < media.length; i++) {
        if (media[i].id) {
          await supabase
            .from("media")
            .update({ sort_order: i })
            .eq("id", media[i].id)
        }
      }
      
      // Update featured_image_url to first image
      if (media.length > 0 && media[0].type === "image") {
        await supabase
          .from("projects")
          .update({ featured_image_url: media[0].url })
          .eq("id", projectId)
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    await handleUpload(files)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    await handleUpload(files)
  }

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsUploading(true)
    const supabase = createClient()
    const newMedia: MediaItem[] = []

    for (const file of files) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `uploads/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`, {
          description: uploadError.message,
        })
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath)

      // If we have a projectId, save to database
      if (projectId) {
        const { data, error: dbError } = await supabase
          .from("media")
          .insert({
            project_id: projectId,
            type: file.type.startsWith("video/") ? "video" : "image",
            url: publicUrl,
            alt_text: file.name,
            file_size: file.size,
          })
          .select()
          .single()

        if (dbError) {
          toast.error(`Failed to save ${file.name}`)
          continue
        }

        newMedia.push({
          id: data.id,
          url: publicUrl,
          alt_text: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
        })
      } else {
        // For new projects, just store locally
        newMedia.push({
          url: publicUrl,
          alt_text: file.name,
          type: file.type.startsWith("video/") ? "video" : "image",
          file,
        })
      }
    }

    const updatedMedia = [...media, ...newMedia]
    onMediaChange(updatedMedia)
    
    // If this is the first image and we have a projectId, set it as featured
    if (projectId && media.length === 0 && newMedia.length > 0 && newMedia[0].type === "image") {
      const supabase = createClient()
      await supabase
        .from("projects")
        .update({ featured_image_url: newMedia[0].url })
        .eq("id", projectId)
    }
    
    toast.success(`Uploaded ${files.length} file(s)`)
    setIsUploading(false)
  }

  const confirmDelete = async () => {
    if (deleteIndex === null) return
    
    const item = media[deleteIndex]
    
    if (item.id && projectId) {
      const supabase = createClient()
      
      // Extract file path from URL
      const urlParts = item.url.split("/")
      const filePath = urlParts.slice(-2).join("/")

      // Delete from storage
      await supabase.storage.from("media").remove([filePath])

      // Delete from database
      const { error } = await supabase.from("media").delete().eq("id", item.id)

      if (error) {
        toast.error("Failed to delete file")
        setDeleteIndex(null)
        return
      }
    }

    const newMedia = media.filter((_, i) => i !== deleteIndex)
    onMediaChange(newMedia)
    
    // Update featured_image_url if we deleted the first image
    if (deleteIndex === 0 && projectId) {
      const supabase = createClient()
      const newFeaturedUrl = newMedia.length > 0 && newMedia[0].type === "image" 
        ? newMedia[0].url 
        : null
      await supabase
        .from("projects")
        .update({ featured_image_url: newFeaturedUrl })
        .eq("id", projectId)
    }
    
    toast.success("File deleted")
    setDeleteIndex(null)
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Project Assets</CardTitle>
      </CardHeader>
      <CardContent>
      <Tabs defaultValue="media" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="before-after">Before & After</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isUploading}
          />
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag and drop files here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Supports images and videos up to 50MB
          </p>
        </div>

        {/* Media Grid */}
        {media.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">
              Drag to reorder. The first image will be used as the preview image.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {media.map((item, index) => (
                <div
                  key={item.id || index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-move ${
                    draggedIndex === index ? "opacity-50 ring-2 ring-primary" : ""
                  }`}
                >
                  {/* First image indicator */}
                  {index === 0 && (
                    <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      <Star className="h-3 w-3" />
                      Preview
                    </div>
                  )}
                  
                  {/* Drag handle - now on left */}
                  <div className="absolute left-2 top-2 z-10 rounded bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <GripVertical className="h-4 w-4 text-white" />
                  </div>
                  
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteIndex(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-2 py-1 text-xs text-white">
                    {item.alt_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {media.length === 0 && (
          <div className="py-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No media uploaded yet
            </p>
          </div>
        )}
        </TabsContent>

        <TabsContent value="files">
          {projectId ? (
            <ProjectFiles projectId={projectId} />
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Save the project first to upload files.
            </div>
          )}
        </TabsContent>

        <TabsContent value="before-after">
          {projectId ? (
            <ProjectBeforeAfter projectId={projectId} />
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Save the project first to add before/after pairs.
            </div>
          )}
        </TabsContent>
      </Tabs>
      </CardContent>
    </Card>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this file?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the file from your project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Image as ImageIcon, Trash2, X, Search, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { BeforeAfterUpload } from "@/components/admin/before-after-upload"

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingItem, setDeletingItem] = useState<{ id: string; url: string; alt_text: string } | null>(null)
  const [viewingItem, setViewingItem] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ alt_text: "", caption: "" })
  const [activeTab, setActiveTab] = useState("media")

  const fetchMedia = useCallback(async () => {
    const supabase = createClient()
    
    // First try simple fetch without join
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false })

    console.log("Simple fetch result:", { data, error })

    if (error) {
      console.error("Error fetching media:", error)
      toast.error("Failed to fetch media", {
        description: error.message,
      })
      setIsLoading(false)
      return
    }
    
    if (data) {
      console.log("Fetched media:", data)
      setMedia(data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

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

      const { error: dbError } = await supabase.from("media").insert({
        type: file.type.startsWith("video/") ? "video" : "image",
        url: publicUrl,
        alt_text: file.name,
        file_size: file.size,
      })

      if (dbError) {
        console.error("Database insert error:", dbError)
        toast.error(`Failed to save ${file.name}`, {
          description: dbError.message,
        })
      } else {
        console.log("Successfully saved to database:", { type: file.type.startsWith("video/") ? "video" : "image", url: publicUrl, alt_text: file.name })
      }
    }

    toast.success(`Uploaded ${files.length} file(s)`)
    fetchMedia()
    setIsUploading(false)
  }

  const openViewModal = (item: any) => {
    setViewingItem(item)
    setEditForm({ alt_text: item.alt_text || "", caption: item.caption || "" })
  }

  const handleSaveEdit = async () => {
    if (!viewingItem) return
    const supabase = createClient()
    const { error } = await supabase
      .from("media")
      .update({ alt_text: editForm.alt_text, caption: editForm.caption })
      .eq("id", viewingItem.id)

    if (error) {
      toast.error("Failed to update media")
      return
    }

    toast.success("Media updated")
    setMedia(media.map((m) => m.id === viewingItem.id ? { ...m, ...editForm } : m))
    setViewingItem(null)
  }

  const handleDelete = async (id: string, url: string) => {
    const supabase = createClient()
    
    // Extract file path from URL
    const urlParts = url.split("/")
    const filePath = urlParts.slice(-2).join("/")

    // Delete from storage
    await supabase.storage.from("media").remove([filePath])

    // Delete from database
    const { error } = await supabase.from("media").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete file")
      return
    }

    toast.success("File deleted")
    setMedia(media.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold">Media Library</h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage images and videos for your projects
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="before-after">Before & After</TabsTrigger>
        </TabsList>

        <TabsContent value="media" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Media</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchMedia}>
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  dragActive
                    ? "border-navy bg-navy/5 dark:border-[#3b82f6] dark:bg-[#3b82f6]/5"
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
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium">
                  {isUploading ? "Uploading..." : "Drag and drop files here, or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports images and videos up to 50MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media Grid */}
          <div>
        <h2 className="mb-4 text-lg font-semibold">All Media</h2>
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">Loading...</div>
        ) : media.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No media files</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload your first file to get started
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="mb-3 text-sm text-muted-foreground">
              {searchQuery
                ? `${media.filter((m) => m.alt_text?.toLowerCase().includes(searchQuery.toLowerCase())).length} of ${media.length} items`
                : `${media.length} items`}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {media
                .filter((item) =>
                  !searchQuery ||
                  item.alt_text?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
                  onClick={() => openViewModal(item)}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.alt_text || ""}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* Name overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8">
                    <p className="truncate text-xs font-medium text-white">{item.alt_text}</p>
                  </div>
                  {/* Delete button - top right */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingItem({ id: item.id, url: item.url, alt_text: item.alt_text || "this file" })
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-medium text-foreground">&ldquo;{deletingItem?.alt_text}&rdquo;</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingItem) {
                  handleDelete(deletingItem.id, deletingItem.url)
                  setDeletingItem(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View / Edit Modal */}
      <Dialog open={!!viewingItem} onOpenChange={(open) => !open && setViewingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Media Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg">
                {viewingItem.type === "image" ? (
                  <img
                    src={viewingItem.url}
                    alt={editForm.alt_text}
                    className="w-full object-contain max-h-[50vh]"
                  />
                ) : (
                  <video
                    src={viewingItem.url}
                    className="w-full max-h-[50vh]"
                    controls
                  />
                )}
              </div>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-alt">Name / Alt Text</Label>
                  <Input
                    id="edit-alt"
                    value={editForm.alt_text}
                    onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                    placeholder="Descriptive name for this image"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-caption">Caption</Label>
                  <Textarea
                    id="edit-caption"
                    rows={2}
                    value={editForm.caption}
                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                    placeholder="Optional caption..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground">URL</Label>
                  <p className="break-all rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {viewingItem.url}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setViewingItem(null)
                    setDeletingItem({ id: viewingItem.id, url: viewingItem.url, alt_text: editForm.alt_text || "this file" })
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewingItem(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Before & After Tab */}
        <TabsContent value="before-after" className="space-y-6">
          <BeforeAfterUpload />
        </TabsContent>
      </Tabs>
    </div>
  )
}

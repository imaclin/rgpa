"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
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
  Upload,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
  File,
  Presentation,
  Eye,
  X,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ProjectFile {
  id: string
  project_id: string
  name: string
  storage_path: string
  url: string
  file_type: string | null
  file_size: number | null
  created_at: string
}

interface ProjectFilesProps {
  projectId: string
}

const fileTypeIcon = (mimeType: string | null) => {
  if (!mimeType) return { icon: File, color: "text-gray-500" }
  if (mimeType.includes("pdf")) return { icon: FileText, color: "text-red-500" }
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType.includes("csv"))
    return { icon: FileSpreadsheet, color: "text-green-500" }
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return { icon: Presentation, color: "text-orange-500" }
  if (mimeType.includes("word") || mimeType.includes("document"))
    return { icon: FileText, color: "text-blue-500" }
  if (mimeType.includes("text")) return { icon: FileText, color: "text-gray-500" }
  return { icon: File, color: "text-gray-500" }
}

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ProjectFiles({ projectId }: ProjectFilesProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [deletingFile, setDeletingFile] = useState<ProjectFile | null>(null)
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (data) setFiles(data)
    if (error) console.error("Error fetching files:", error)
    setIsLoading(false)
  }, [projectId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const getPreviewType = (file: ProjectFile): "pdf" | "image" | "office" | "text" | "none" => {
    const mime = file.file_type || ""
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    if (mime.includes("pdf") || ext === "pdf") return "pdf"
    if (mime.startsWith("image/")) return "image"
    if (mime.includes("text") || ["txt", "csv", "json", "md", "log"].includes(ext)) return "text"
    if (
      mime.includes("word") || mime.includes("document") ||
      mime.includes("spreadsheet") || mime.includes("excel") ||
      mime.includes("presentation") || mime.includes("powerpoint") ||
      ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)
    ) return "office"
    return "none"
  }

  const handlePreview = async (file: ProjectFile) => {
    const type = getPreviewType(file)
    if (type === "text") {
      try {
        const res = await fetch(file.url)
        const text = await res.text()
        setTextContent(text)
      } catch {
        setTextContent("Failed to load file content.")
      }
    } else {
      setTextContent(null)
    }
    setPreviewFile(file)
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
    const droppedFiles = Array.from(e.dataTransfer.files)
    await handleUpload(droppedFiles)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    await handleUpload(selected)
    e.target.value = ""
  }

  const handleUpload = async (uploadFiles: File[]) => {
    if (uploadFiles.length === 0) return
    setIsUploading(true)
    const supabase = createClient()
    let uploaded = 0

    for (const file of uploadFiles) {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const storagePath = `files/${projectId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(storagePath, file)

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`, { description: uploadError.message })
        continue
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("media").getPublicUrl(storagePath)

      const { data, error: dbError } = await supabase
        .from("project_files")
        .insert({
          project_id: projectId,
          name: file.name,
          storage_path: storagePath,
          url: publicUrl,
          file_type: file.type || null,
          file_size: file.size,
        })
        .select()
        .single()

      if (dbError) {
        toast.error(`Failed to save ${file.name}`)
        continue
      }

      if (data) {
        setFiles((prev) => [data, ...prev])
        uploaded++
      }
    }

    if (uploaded > 0) toast.success(`Uploaded ${uploaded} file${uploaded > 1 ? "s" : ""}`)
    setIsUploading(false)
  }

  const handleDelete = async () => {
    if (!deletingFile) return
    const supabase = createClient()

    // Delete from storage
    await supabase.storage.from("media").remove([deletingFile.storage_path])

    // Delete from database
    const { error } = await supabase.from("project_files").delete().eq("id", deletingFile.id)

    if (error) {
      toast.error("Failed to delete file")
    } else {
      setFiles((prev) => prev.filter((f) => f.id !== deletingFile.id))
      toast.success("File deleted")
    }
    setDeletingFile(null)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className={cn(
            "relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-muted-foreground/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
            disabled={isUploading}
          />
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">
            {isUploading ? "Uploading..." : "Drag and drop files here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, DOC, XLS, PPT, TXT, CSV, ZIP — up to 50MB
          </p>
        </div>

        {/* File List */}
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="py-8 text-center">
            <File className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => {
              const { icon: Icon, color } = fileTypeIcon(file.file_type)
              return (
                <div
                  key={file.id}
                  className="group flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:border-foreground/20"
                  onClick={() => handlePreview(file)}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", color)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); handlePreview(file) }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name}>
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeletingFile(file) }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={(v) => { if (!v) { setPreviewFile(null); setTextContent(null) } }}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="truncate text-sm font-medium">
                {previewFile?.name}
              </DialogTitle>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <a href={previewFile?.url} target="_blank" rel="noopener noreferrer" download={previewFile?.name}>
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewFile && (() => {
              const type = getPreviewType(previewFile)
              if (type === "pdf") {
                return (
                  <iframe
                    src={`${previewFile.url}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="h-full w-full"
                    title={previewFile.name}
                  />
                )
              }
              if (type === "image") {
                return (
                  <div className="flex items-center justify-center p-6 h-full">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  </div>
                )
              }
              if (type === "text") {
                return (
                  <pre className="p-6 text-sm whitespace-pre-wrap break-words font-mono text-foreground">
                    {textContent ?? "Loading..."}
                  </pre>
                )
              }
              if (type === "office") {
                return (
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewFile.url)}&embedded=true`}
                    className="h-full w-full"
                    title={previewFile.name}
                  />
                )
              }
              return (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                  <File className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
                  <Button asChild>
                    <a href={previewFile.url} target="_blank" rel="noopener noreferrer" download={previewFile.name}>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                </div>
              )
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingFile} onOpenChange={(v) => !v && setDeletingFile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingFile?.name}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

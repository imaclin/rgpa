"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Plus, Pencil, Trash2, Star, Upload, MessageSquareQuote, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: string
  client_name: string
  role: string | null
  content: string
  photo_url: string | null
  rating: number | null
  featured: boolean
  sort_order: number
  created_at: string
}

const emptyForm = {
  client_name: "",
  role: "",
  content: "",
  photo_url: "",
  rating: "5",
  featured: true,
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchTestimonials = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })

    if (data) setTestimonials(data)
    if (error) console.error("Error fetching testimonials:", error)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchTestimonials()
  }, [fetchTestimonials])

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (t: Testimonial) => {
    setEditingId(t.id)
    setForm({
      client_name: t.client_name,
      role: t.role || "",
      content: t.content,
      photo_url: t.photo_url || "",
      rating: String(t.rating || 5),
      featured: t.featured,
    })
    setShowForm(true)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)

    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `testimonials/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage.from("media").upload(fileName, file, { upsert: true })

    if (error) {
      toast.error("Failed to upload photo")
      setIsUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName)
    setForm((prev) => ({ ...prev, photo_url: publicUrl }))
    setIsUploading(false)
    e.target.value = ""
  }

  const handleSave = async () => {
    if (!form.client_name.trim() || !form.content.trim()) {
      toast.error("Name and testimonial content are required")
      return
    }

    const supabase = createClient()
    const payload = {
      client_name: form.client_name.trim(),
      role: form.role.trim() || null,
      content: form.content.trim(),
      photo_url: form.photo_url || null,
      rating: parseInt(form.rating),
      featured: form.featured,
    }

    if (editingId) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editingId)
      if (error) {
        toast.error("Failed to update testimonial")
        return
      }
      setTestimonials((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...payload } : t)))
      toast.success("Testimonial updated")
    } else {
      const maxSort = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.sort_order)) + 1 : 0
      const { data, error } = await supabase
        .from("testimonials")
        .insert({ ...payload, sort_order: maxSort })
        .select()
        .single()

      if (error) {
        toast.error("Failed to create testimonial")
        return
      }
      if (data) setTestimonials((prev) => [...prev, data])
      toast.success("Testimonial created")
    }

    setShowForm(false)
    setEditingId(null)
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    const supabase = createClient()
    const { error } = await supabase.from("testimonials").delete().eq("id", deletingItem.id)

    if (error) {
      toast.error("Failed to delete testimonial")
    } else {
      setTestimonials((prev) => prev.filter((t) => t.id !== deletingItem.id))
      toast.success("Testimonial deleted")
    }
    setDeletingItem(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Testimonials</h1>
          <p className="mt-2 text-muted-foreground">Manage client testimonials displayed on the homepage</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquareQuote className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-serif text-lg font-semibold">No testimonials yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first client testimonial.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.id} className="group relative">
              <CardContent className="p-5">
                {/* Actions */}
                <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => setDeletingItem(t)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 mb-3">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.client_name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {getInitials(t.client_name)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{t.client_name}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                  </div>
                </div>

                {/* Rating */}
                {t.rating && (
                  <div className="mb-2 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn("h-3 w-3", i < t.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30")}
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-sm text-muted-foreground line-clamp-4">&ldquo;{t.content}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={(v) => !v && setShowForm(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-3">
                {form.photo_url ? (
                  <img src={form.photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {form.client_name ? getInitials(form.client_name) : "?"}
                  </div>
                )}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isUploading ? "Uploading..." : "Upload Photo"}
                  </Button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={form.client_name}
                  onChange={(e) => setForm((p) => ({ ...p, client_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label>Role / Title</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  placeholder="Homeowner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Testimonial</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="What did the client say?"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <Select value={form.rating} onValueChange={(v) => setForm((p) => ({ ...p, rating: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.client_name.trim() || !form.content.trim()}>
                {editingId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingItem} onOpenChange={(v) => !v && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the testimonial from &ldquo;{deletingItem?.client_name}&rdquo;?
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

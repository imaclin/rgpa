"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Users, ExternalLink, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function TeamPage() {
  const [team, setTeam] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    email: "",
    image_url: "",
  })

  const fetchTeam = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order", { ascending: true })

    if (!error && data) {
      setTeam(data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchTeam()
  }, [fetchTeam])

  const resetForm = () => {
    setFormData({ name: "", role: "", bio: "", email: "", image_url: "" })
    setEditingMember(null)
  }

  const openDialog = (member?: any) => {
    if (member) {
      setEditingMember(member)
      setFormData({
        name: member.name || "",
        role: member.role || "",
        bio: member.bio || "",
        email: member.email || "",
        image_url: member.image_url || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    if (editingMember) {
      const { error } = await supabase
        .from("team_members")
        .update(formData)
        .eq("id", editingMember.id)

      if (error) {
        toast.error("Failed to update team member")
        return
      }
      toast.success("Team member updated")
    } else {
      const { error } = await supabase.from("team_members").insert({
        ...formData,
        sort_order: team.length,
      })

      if (error) {
        toast.error("Failed to add team member")
        return
      }
      toast.success("Team member added")
    }

    setIsDialogOpen(false)
    resetForm()
    fetchTeam()
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WebP, or GIF image")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB")
      return
    }

    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `team/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file)

      if (uploadError) {
        toast.error("Failed to upload photo")
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })
      toast.success("Photo uploaded")
    } catch {
      toast.error("Upload failed")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return

    const supabase = createClient()
    const { error } = await supabase.from("team_members").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete team member")
      return
    }

    toast.success("Team member deleted")
    setTeam(team.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Team Members</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your team profiles displayed on the{" "}
            <Link href="/about" className="inline-flex items-center gap-1 text-primary underline underline-offset-4 hover:text-primary/80">
              About Us page
              <ExternalLink className="h-3 w-3" />
            </Link>
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => openDialog()}>
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  placeholder="Architect & Designer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@revifi.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                {formData.image_url ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-20 rounded-full object-cover border"
                    />
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        Change Photo
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 transition-colors hover:border-muted-foreground/50"
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                    )}
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isUploading ? "Uploading..." : "Click to upload a photo"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      JPG, PNG, WebP or GIF (max 5MB)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="A brief bio..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMember ? "Save Changes" : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading...</div>
      ) : team.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold">No team members yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first team member to get started
            </p>
            <Button className="mt-4" onClick={() => openDialog()}>
              Add Team Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {team.map((member) => (
            <Card key={member.id}>
              <CardContent className="flex items-start gap-4 p-6">
                {member.image_url ? (
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-navy dark:text-[#3b82f6]">{member.role}</p>
                  {member.email && (
                    <p className="mt-1 text-sm text-muted-foreground">{member.email}</p>
                  )}
                  {member.bio && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {member.bio}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDialog(member)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive"
                    onClick={() => handleDelete(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

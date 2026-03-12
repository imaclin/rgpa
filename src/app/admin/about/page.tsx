"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save, Plus, X, Upload, LinkIcon, ChevronDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { getIcon } from "@/lib/icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ICON_OPTIONS = [
  "Search", "Lightbulb", "PenTool", "Hammer", "Sparkles", "Gift",
  "Building2", "Paintbrush", "Users", "Wrench", "Home", "Ruler",
  "Shield", "Briefcase", "HardHat", "Layers", "Star",
]

interface ProcessStep {
  id?: string
  sort_order: number
  step_number: string
  title: string
  description: string
  icon: string
  bg_image: string
}

interface AboutValue {
  id?: string
  sort_order: number
  title: string
  description: string
}

function IconPicker({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false)
  const SelectedIcon = getIcon(value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
      >
        <span className="flex items-center gap-2">
          <SelectedIcon className="h-4 w-4" />
          {value}
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {ICON_OPTIONS.map((iconName) => {
            const Icon = getIcon(iconName)
            return (
              <button
                key={iconName}
                type="button"
                onClick={() => { onChange(iconName); setOpen(false) }}
                className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent ${value === iconName ? "bg-accent font-medium" : ""}`}
              >
                <Icon className="h-4 w-4" />
                {iconName}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function AdminAboutPage() {
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const heroFileRef = useRef<HTMLInputElement>(null)
  const secondaryFileRef = useRef<HTMLInputElement>(null)

  const [introParagraph1, setIntroParagraph1] = useState("")
  const [introParagraph2, setIntroParagraph2] = useState("")
  const [mission, setMission] = useState("")
  const [understandingClients, setUnderstandingClients] = useState("")
  const [heroImageUrl, setHeroImageUrl] = useState("")
  const [secondaryImageUrl, setSecondaryImageUrl] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [officeAddress, setOfficeAddress] = useState("")

  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [values, setValues] = useState<AboutValue[]>([])

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    const [contentRes, stepsRes, valuesRes] = await Promise.all([
      supabase.from("about_content").select("*"),
      supabase.from("about_process_steps").select("*").order("sort_order", { ascending: true }),
      supabase.from("about_values").select("*").order("sort_order", { ascending: true }),
    ])

    if (contentRes.data) {
      const getSection = (section: string) => {
        const row = contentRes.data.find((c: any) => c.section === section)
        if (!row?.content) return {}
        return typeof row.content === "string" ? JSON.parse(row.content) : row.content
      }
      
      const introData = getSection("intro_paragraphs")
      setIntroParagraph1(introData.intro_paragraph_1 || "")
      setIntroParagraph2(introData.intro_paragraph_2 || "")
      
      const missionData = getSection("mission")
      setMission(missionData.mission || "")
      
      const understandingData = getSection("understanding_clients")
      setUnderstandingClients(understandingData.understanding_clients || "")
      
      const imageData = getSection("images")
      setHeroImageUrl(imageData.hero_image_url || "")
      setSecondaryImageUrl(imageData.secondary_image_url || "")
      
      const contactData = getSection("contact_info")
      setContactPhone(contactData.contact_phone || "")
      setContactEmail(contactData.contact_email || "")
      setOfficeAddress(contactData.office_address || "")
    }

    if (stepsRes.data) {
      setSteps(stepsRes.data.map((s: any) => ({
        id: s.id,
        sort_order: s.sort_order,
        step_number: s.step_number,
        title: s.title,
        description: s.description,
        icon: s.icon,
        bg_image: s.bg_image || "",
      })))
    }

    if (valuesRes.data) {
      setValues(valuesRes.data.map((v: any) => ({
        id: v.id,
        sort_order: v.sort_order,
        title: v.title,
        description: v.description,
      })))
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStep = (index: number, field: keyof ProcessStep, value: string | number) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)))
  }

  const addStep = () => {
    const nextNumber = String(steps.length + 1).padStart(2, "0")
    setSteps((prev) => [
      ...prev,
      {
        sort_order: prev.length,
        step_number: nextNumber,
        title: "",
        description: "",
        icon: "Search",
        bg_image: "",
      },
    ])
  }

  const removeStep = (index: number) => {
    setSteps((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, sort_order: i })))
  }

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newSteps.length) return
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]
    setSteps(newSteps.map((s, i) => ({ ...s, sort_order: i })))
  }

  const updateValue = (index: number, field: keyof AboutValue, val: string | number) => {
    setValues((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: val } : v)))
  }

  const addValue = () => {
    setValues((prev) => [...prev, { sort_order: prev.length, title: "", description: "" }])
  }

  const removeValue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index).map((v, i) => ({ ...v, sort_order: i })))
  }

  const moveValue = (index: number, direction: "up" | "down") => {
    const newValues = [...values]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newValues.length) return
    ;[newValues[index], newValues[targetIndex]] = [newValues[targetIndex], newValues[index]]
    setValues(newValues.map((v, i) => ({ ...v, sort_order: i })))
  }

  const handleContentImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (url: string) => void,
    label: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(label)
    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `about-${label}-${Date.now()}.${fileExt}`
      const { data, error } = await supabase.storage.from("images").upload(fileName, file)
      if (error) { toast.error("Upload failed: " + error.message); return }
      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(data.path)
      setter(publicUrl)
      toast.success("Image uploaded")
    } catch { toast.error("Upload failed") } finally { setUploading(null) }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, stepIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `about-step-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file)

    if (error) {
      toast.error("Upload failed: " + error.message)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("images")
      .getPublicUrl(data.path)

    updateStep(stepIndex, "bg_image", publicUrl)
    toast.success("Image uploaded")
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      // Save all about_content section/content pairs
      const contentPairs = [
        { 
          section: "intro_paragraphs", 
          content: JSON.stringify({ intro_paragraph_1: introParagraph1, intro_paragraph_2: introParagraph2 }),
          updated_at: new Date().toISOString() 
        },
        { 
          section: "mission", 
          content: JSON.stringify({ mission }),
          updated_at: new Date().toISOString() 
        },
        { 
          section: "understanding_clients", 
          content: JSON.stringify({ understanding_clients: understandingClients }),
          updated_at: new Date().toISOString() 
        },
        { 
          section: "images", 
          content: JSON.stringify({ hero_image_url: heroImageUrl, secondary_image_url: secondaryImageUrl }),
          updated_at: new Date().toISOString() 
        },
        { 
          section: "contact_info", 
          content: JSON.stringify({ contact_phone: contactPhone, contact_email: contactEmail, office_address: officeAddress }),
          updated_at: new Date().toISOString() 
        },
      ]

      const { error: contentError } = await supabase
        .from("about_content")
        .upsert(contentPairs, { onConflict: "section" })
      if (contentError) throw contentError

      // Delete all existing steps and re-insert
      await supabase.from("about_process_steps").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (steps.length > 0) {
        const stepsToInsert = steps.map((s) => ({
          sort_order: s.sort_order,
          step_number: s.step_number,
          title: s.title,
          description: s.description,
          icon: s.icon,
          bg_image: s.bg_image || null,
        }))

        const { error } = await supabase.from("about_process_steps").insert(stepsToInsert)
        if (error) throw error
      }

      // Delete all existing values and re-insert
      await supabase.from("about_values").delete().neq("id", "00000000-0000-0000-0000-000000000000")

      if (values.length > 0) {
        const valuesToInsert = values.map((v) => ({
          sort_order: v.sort_order,
          title: v.title,
          description: v.description,
        }))

        const { error } = await supabase.from("about_values").insert(valuesToInsert)
        if (error) throw error
      }

      toast.success("About page saved")
      fetchData()
    } catch (err: any) {
      toast.error("Save failed: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">About Page</h1>
          <p className="text-muted-foreground">Manage all content displayed on the about page</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Hero & Images */}
      <Card>
        <CardHeader>
          <CardTitle>Hero & Images</CardTitle>
          <CardDescription>The banner and secondary images on the about page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Hero Image</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="https://..." className="pl-9" />
                </div>
                <label>
                  <Button variant="outline" size="icon" asChild disabled={uploading === "hero"}>
                    <span>{uploading === "hero" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                  </Button>
                  <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleContentImageUpload(e, setHeroImageUrl, "hero")} />
                </label>
              </div>
              {heroImageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border bg-muted">
                  <img src={heroImageUrl} alt="Hero preview" className="w-full object-cover" style={{ maxHeight: "160px" }} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Secondary Image</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={secondaryImageUrl} onChange={(e) => setSecondaryImageUrl(e.target.value)} placeholder="https://..." className="pl-9" />
                </div>
                <label>
                  <Button variant="outline" size="icon" asChild disabled={uploading === "secondary"}>
                    <span>{uploading === "secondary" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}</span>
                  </Button>
                  <input ref={secondaryFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleContentImageUpload(e, setSecondaryImageUrl, "secondary")} />
                </label>
              </div>
              {secondaryImageUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border bg-muted">
                  <img src={secondaryImageUrl} alt="Secondary preview" className="w-full object-cover" style={{ maxHeight: "160px" }} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mission & Understanding */}
      <Card>
        <CardHeader>
          <CardTitle>Mission & About Text</CardTitle>
          <CardDescription>The mission statement and &quot;Understanding Our Clients&quot; section</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mission Statement</Label>
            <Textarea value={mission} onChange={(e) => setMission(e.target.value)} rows={5} placeholder="Our mission..." />
          </div>
          <div className="space-y-2">
            <Label>Understanding Our Clients</Label>
            <Textarea value={understandingClients} onChange={(e) => setUnderstandingClients(e.target.value)} rows={6} placeholder="Our approach to understanding clients..." />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Phone, email, and office address shown on the about page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="(216)-408-3082" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="info@rgpropertyadvisors.com" />
            </div>
            <div className="space-y-2">
              <Label>Office Address</Label>
              <Input value={officeAddress} onChange={(e) => setOfficeAddress(e.target.value)} placeholder="123 Main St..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intro Text */}
      <Card>
        <CardHeader>
          <CardTitle>Introduction Text</CardTitle>
          <CardDescription>The intro paragraphs shown at the top of the about page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Paragraph 1</Label>
            <Textarea
              value={introParagraph1}
              onChange={(e) => setIntroParagraph1(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Paragraph 2</Label>
            <Textarea
              value={introParagraph2}
              onChange={(e) => setIntroParagraph2(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Process Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Process Steps</CardTitle>
              <CardDescription>The "Our Process" cards shown on the about page</CardDescription>
            </div>
            <Button onClick={addStep} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {steps.map((step, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(index, "up")}
                      disabled={index === 0}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, "down")}
                      disabled={index === steps.length - 1}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="font-semibold text-sm">Step {step.step_number}: {step.title || "(untitled)"}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Step</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this process step?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeStep(index)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Step Number</Label>
                  <Input
                    value={step.step_number}
                    onChange={(e) => updateStep(index, "step_number", e.target.value)}
                    placeholder="01"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <IconPicker
                    value={step.icon}
                    onChange={(val) => updateStep(index, "icon", val)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(index, "title", e.target.value)}
                  placeholder="Step title"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={step.description}
                  onChange={(e) => updateStep(index, "description", e.target.value)}
                  rows={3}
                  placeholder="Step description"
                />
              </div>

              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={step.bg_image}
                      onChange={(e) => updateStep(index, "bg_image", e.target.value)}
                      placeholder="https://..."
                      className="pl-9"
                    />
                  </div>
                  <label>
                    <Button variant="outline" size="icon" asChild>
                      <span><Upload className="h-4 w-4" /></span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                  </label>
                </div>
                {step.bg_image && (
                  <div className="relative mt-2 w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={step.bg_image}
                      alt="Step background preview"
                      className="w-full object-contain"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No process steps yet. Click &quot;Add Step&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Core Values */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Core Values</CardTitle>
              <CardDescription>The values displayed on the about page</CardDescription>
            </div>
            <Button onClick={addValue} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Value
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {values.map((val, index) => (
            <div key={index} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => moveValue(index, "up")}
                      disabled={index === 0}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveValue(index, "down")}
                      disabled={index === values.length - 1}
                      className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="font-semibold text-sm">{val.title || "(untitled)"}</span>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <X className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Value</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this core value?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeValue(index)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={val.title}
                  onChange={(e) => updateValue(index, "title", e.target.value)}
                  placeholder="Value title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={val.description}
                  onChange={(e) => updateValue(index, "description", e.target.value)}
                  rows={2}
                  placeholder="Value description"
                />
              </div>
            </div>
          ))}

          {values.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No core values yet. Click &quot;Add Value&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

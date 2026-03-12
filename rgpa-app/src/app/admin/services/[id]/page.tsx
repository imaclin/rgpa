"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Trash2, Plus, X, Upload, LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"
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

interface Benefit {
  title: string
  description: string
}

interface FAQ {
  question: string
  answer: string
}

interface ServiceData {
  slug: string
  home_title: string
  home_description: string
  home_icon: string
  home_bg_image: string
  services_title: string
  services_description: string
  services_features: string[]
  services_image: string
  detail_hero_description: string
  detail_benefits: Benefit[]
  detail_faqs: FAQ[]
  detail_cta_title: string
  detail_cta_description: string
  seo_title: string
  seo_description: string
  seo_keywords: string[]
}

const ICON_OPTIONS = [
  "Building2", "Paintbrush", "Lightbulb", "Users", "Wrench", "Hammer",
  "Home", "Ruler", "PenTool", "Sparkles", "Shield", "Briefcase",
  "HardHat", "Layers", "Search", "Star",
]

const defaultService: ServiceData = {
  slug: "",
  home_title: "",
  home_description: "",
  home_icon: "Building2",
  home_bg_image: "",
  services_title: "",
  services_description: "",
  services_features: [],
  services_image: "",
  detail_hero_description: "",
  detail_benefits: [],
  detail_faqs: [],
  detail_cta_title: "",
  detail_cta_description: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: [],
}

export default function AdminServiceEditPage() {
  const router = useRouter()
  const params = useParams()
  const adminPath = useAdminPath()
  const isNew = params.id === "new"
  const serviceId = isNew ? null : (params.id as string)

  const [service, setService] = useState<ServiceData>(defaultService)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [newFeature, setNewFeature] = useState("")
  const [newKeyword, setNewKeyword] = useState("")

  const fetchService = useCallback(async () => {
    if (!serviceId) return
    const supabase = createClient()
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single()

    if (error) {
      toast.error("Failed to load service")
      router.push(adminPath("/admin/services"))
      return
    }

    setService({
      slug: data.slug || "",
      home_title: data.home_title || "",
      home_description: data.home_description || "",
      home_icon: data.home_icon || "Building2",
      home_bg_image: data.home_bg_image || "",
      services_title: data.services_title || "",
      services_description: data.services_description || "",
      services_features: data.services_features || [],
      services_image: data.services_image || "",
      detail_hero_description: data.detail_hero_description || "",
      detail_benefits: data.detail_benefits || [],
      detail_faqs: data.detail_faqs || [],
      detail_cta_title: data.detail_cta_title || "",
      detail_cta_description: data.detail_cta_description || "",
      seo_title: data.seo_title || "",
      seo_description: data.seo_description || "",
      seo_keywords: data.seo_keywords || [],
    })
    setLoading(false)
  }, [serviceId, router, adminPath])

  useEffect(() => {
    fetchService()
  }, [fetchService])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "home_bg_image" | "services_image"
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const path = `services/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from("media")
      .upload(path, file)

    if (error) {
      toast.error("Upload failed: " + error.message)
      return
    }

    const { data: urlData } = supabase.storage
      .from("media")
      .getPublicUrl(path)

    setService({ ...service, [field]: urlData.publicUrl })
    toast.success("Image uploaded")
  }

  const handleSave = async () => {
    if (!service.home_title || !service.slug) {
      toast.error("Title and slug are required")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const payload = {
      slug: service.slug,
      home_title: service.home_title,
      home_description: service.home_description,
      home_icon: service.home_icon,
      home_bg_image: service.home_bg_image || null,
      services_title: service.services_title || service.home_title,
      services_description: service.services_description || service.home_description,
      services_features: service.services_features,
      services_image: service.services_image || null,
      detail_hero_description: service.detail_hero_description || null,
      detail_benefits: service.detail_benefits,
      detail_faqs: service.detail_faqs,
      detail_cta_title: service.detail_cta_title || null,
      detail_cta_description: service.detail_cta_description || null,
      seo_title: service.seo_title || null,
      seo_description: service.seo_description || null,
      seo_keywords: service.seo_keywords,
      updated_at: new Date().toISOString(),
    }

    if (isNew) {
      const { error } = await supabase.from("services").insert(payload)
      if (error) {
        toast.error("Failed to create: " + error.message)
        setSaving(false)
        return
      }
      toast.success("Service created")
      router.push(adminPath("/admin/services"))
    } else {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", serviceId)
      if (error) {
        toast.error("Failed to save: " + error.message)
        setSaving(false)
        return
      }
      toast.success("Service saved")
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!serviceId) return
    const supabase = createClient()
    const { error } = await supabase.from("services").delete().eq("id", serviceId)
    if (error) {
      toast.error("Failed to delete: " + error.message)
      return
    }
    toast.success("Service deleted")
    router.push(adminPath("/admin/services"))
  }

  // Benefits helpers
  const addBenefit = () => {
    setService({
      ...service,
      detail_benefits: [...service.detail_benefits, { title: "", description: "" }],
    })
  }

  const updateBenefit = (index: number, field: keyof Benefit, value: string) => {
    const updated = [...service.detail_benefits]
    updated[index] = { ...updated[index], [field]: value }
    setService({ ...service, detail_benefits: updated })
  }

  const removeBenefit = (index: number) => {
    setService({
      ...service,
      detail_benefits: service.detail_benefits.filter((_, i) => i !== index),
    })
  }

  // FAQ helpers
  const addFaq = () => {
    setService({
      ...service,
      detail_faqs: [...service.detail_faqs, { question: "", answer: "" }],
    })
  }

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...service.detail_faqs]
    updated[index] = { ...updated[index], [field]: value }
    setService({ ...service, detail_faqs: updated })
  }

  const removeFaq = (index: number) => {
    setService({
      ...service,
      detail_faqs: service.detail_faqs.filter((_, i) => i !== index),
    })
  }

  // Features helpers
  const addFeature = () => {
    if (!newFeature.trim()) return
    setService({
      ...service,
      services_features: [...service.services_features, newFeature.trim()],
    })
    setNewFeature("")
  }

  const removeFeature = (index: number) => {
    setService({
      ...service,
      services_features: service.services_features.filter((_, i) => i !== index),
    })
  }

  // Keywords helpers
  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setService({
      ...service,
      seo_keywords: [...service.seo_keywords, newKeyword.trim()],
    })
    setNewKeyword("")
  }

  const removeKeyword = (index: number) => {
    setService({
      ...service,
      seo_keywords: service.seo_keywords.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={adminPath("/admin/services")}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-bold">
              {isNew ? "New Service" : service.home_title}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">/{service.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Service</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this service. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Slug + Icon Row */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={service.slug}
                onChange={(e) => setService({ ...service, slug: e.target.value })}
                placeholder="e.g. commercial-building-restoration"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon (Lucide name)</Label>
              <select
                value={service.home_icon}
                onChange={(e) => setService({ ...service, home_icon: e.target.value })}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="home" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="home">Home Page</TabsTrigger>
          <TabsTrigger value="services">Services Page</TabsTrigger>
          <TabsTrigger value="detail">Detail Page</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Home Page Tab */}
        <TabsContent value="home" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Home Page Card</CardTitle>
              <CardDescription>How this service appears on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={service.home_title}
                  onChange={(e) => {
                    const title = e.target.value
                    setService({
                      ...service,
                      home_title: title,
                      slug: isNew && !service.slug ? generateSlug(title) : service.slug,
                    })
                  }}
                  placeholder="Service title for homepage"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={service.home_description}
                  onChange={(e) => setService({ ...service, home_description: e.target.value })}
                  placeholder="Short description for homepage card"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Background Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={service.home_bg_image}
                    onChange={(e) => setService({ ...service, home_bg_image: e.target.value })}
                    placeholder="Paste image URL..."
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <Button variant="outline" size="icon" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "home_bg_image")}
                    />
                  </label>
                </div>
                {service.home_bg_image && (
                  <div className="relative mt-2 w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={service.home_bg_image}
                      alt="Background preview"
                      className="w-full object-contain"
                      style={{ maxHeight: '240px' }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Page Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Page Card</CardTitle>
              <CardDescription>How this service appears on the /services page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={service.services_title}
                  onChange={(e) => setService({ ...service, services_title: e.target.value })}
                  placeholder="Service title for services page"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={service.services_description}
                  onChange={(e) => setService({ ...service, services_description: e.target.value })}
                  placeholder="Full description for services page"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input
                    value={service.services_image}
                    onChange={(e) => setService({ ...service, services_image: e.target.value })}
                    placeholder="Paste image URL..."
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <Button variant="outline" size="icon" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "services_image")}
                    />
                  </label>
                </div>
                {service.services_image && (
                  <div className="relative mt-2 w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={service.services_image}
                      alt="Service image preview"
                      className="w-full object-contain"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="space-y-2">
                  {service.services_features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 text-sm">{feature}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature..."
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                    />
                    <Button variant="outline" size="icon" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detail Page Tab */}
        <TabsContent value="detail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Page Hero</CardTitle>
              <CardDescription>Content shown on the individual service page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Description</Label>
                <Textarea
                  value={service.detail_hero_description}
                  onChange={(e) => setService({ ...service, detail_hero_description: e.target.value })}
                  placeholder="Detailed description for the service hero section"
                  rows={4}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>CTA Title</Label>
                  <Input
                    value={service.detail_cta_title}
                    onChange={(e) => setService({ ...service, detail_cta_title: e.target.value })}
                    placeholder="e.g. Ready to Start Your Project?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CTA Description</Label>
                  <Input
                    value={service.detail_cta_description}
                    onChange={(e) => setService({ ...service, detail_cta_description: e.target.value })}
                    placeholder="e.g. Contact us for a free consultation."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits</CardTitle>
              <CardDescription>What you deliver — shown as cards on the detail page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.detail_benefits.map((benefit, index) => (
                <div key={index} className="relative rounded-lg border p-4 space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => removeBenefit(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Input
                    value={benefit.title}
                    onChange={(e) => updateBenefit(index, "title", e.target.value)}
                    placeholder="Benefit title"
                  />
                  <Textarea
                    value={benefit.description}
                    onChange={(e) => updateBenefit(index, "description", e.target.value)}
                    placeholder="Benefit description"
                    rows={2}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addBenefit} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Benefit
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>Frequently asked questions for this service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.detail_faqs.map((faq, index) => (
                <div key={index} className="relative rounded-lg border p-4 space-y-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => removeFaq(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(index, "question", e.target.value)}
                    placeholder="Question"
                  />
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(index, "answer", e.target.value)}
                    placeholder="Answer"
                    rows={2}
                  />
                </div>
              ))}
              <Button variant="outline" onClick={addFaq} className="gap-2">
                <Plus className="h-4 w-4" />
                Add FAQ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Search engine optimization for this service page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input
                  value={service.seo_title}
                  onChange={(e) => setService({ ...service, seo_title: e.target.value })}
                  placeholder="e.g. Commercial Building Restoration in Cleveland | REVIFI"
                />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={service.seo_description}
                  onChange={(e) => setService({ ...service, seo_description: e.target.value })}
                  placeholder="SEO meta description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {service.seo_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs"
                    >
                      {keyword}
                      <button onClick={() => removeKeyword(index)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add a keyword..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  />
                  <Button variant="outline" size="icon" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

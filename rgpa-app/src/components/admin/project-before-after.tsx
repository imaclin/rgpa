"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, ImageIcon, Loader2, Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react"
import { toast } from "sonner"
import { BeforeAfterSlider } from "@/components/before-after-slider"
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

interface Pair {
  id: string
  project_id: string
  title: string | null
  before_image: string
  after_image: string
  display_order: number
}

export function ProjectBeforeAfter({ projectId }: { projectId: string }) {
  const [pairs, setPairs] = useState<Pair[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadingType, setUploadingType] = useState<"before" | "after" | null>(null)
  const [deletingPair, setDeletingPair] = useState<Pair | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newBefore, setNewBefore] = useState<File | null>(null)
  const [newAfter, setNewAfter] = useState<File | null>(null)
  const [newBeforePreview, setNewBeforePreview] = useState<string | null>(null)
  const [newAfterPreview, setNewAfterPreview] = useState<string | null>(null)
  const [isSavingNew, setIsSavingNew] = useState(false)
  const beforeInputRef = useRef<HTMLInputElement>(null)
  const afterInputRef = useRef<HTMLInputElement>(null)
  const replaceBeforeRef = useRef<HTMLInputElement>(null)
  const replaceAfterRef = useRef<HTMLInputElement>(null)
  const [replaceTarget, setReplaceTarget] = useState<{ id: string; type: "before" | "after" } | null>(null)

  const fetchPairs = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("project_before_after")
      .select("*")
      .eq("project_id", projectId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching pairs:", error)
      toast.error("Failed to fetch before/after pairs")
      setIsFetching(false)
      return
    }

    setPairs(data || [])
    setIsFetching(false)
  }, [projectId])

  useEffect(() => {
    fetchPairs()
  }, [fetchPairs])

  const uploadFile = async (file: File, prefix: string): Promise<string | null> => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `before-after/projects/${projectId}/${prefix}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      toast.error("Failed to upload image", { description: uploadError.message })
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleReplaceImage = async (pairId: string, file: File, type: "before" | "after") => {
    setUploadingId(pairId)
    setUploadingType(type)

    const url = await uploadFile(file, type)
    if (!url) {
      setUploadingId(null)
      setUploadingType(null)
      return
    }

    const supabase = createClient()
    const update = type === "before" ? { before_image: url } : { after_image: url }
    const { error } = await supabase
      .from("project_before_after")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", pairId)

    if (error) {
      toast.error("Failed to update image")
    } else {
      toast.success(`${type === "before" ? "Before" : "After"} image updated`)
      fetchPairs()
    }

    setUploadingId(null)
    setUploadingType(null)
  }

  const handleUpdateTitle = async (pairId: string, title: string) => {
    const supabase = createClient()
    await supabase
      .from("project_before_after")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", pairId)

    setPairs(pairs.map(p => p.id === pairId ? { ...p, title } : p))
  }

  const handleReorder = async (pairId: string, direction: "up" | "down") => {
    const idx = pairs.findIndex(p => p.id === pairId)
    if (idx === -1) return
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === pairs.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const newPairs = [...pairs]
    const tempOrder = newPairs[idx].display_order
    newPairs[idx].display_order = newPairs[swapIdx].display_order
    newPairs[swapIdx].display_order = tempOrder
    ;[newPairs[idx], newPairs[swapIdx]] = [newPairs[swapIdx], newPairs[idx]]
    setPairs(newPairs)

    const supabase = createClient()
    await Promise.all([
      supabase.from("project_before_after").update({ display_order: newPairs[idx].display_order }).eq("id", newPairs[idx].id),
      supabase.from("project_before_after").update({ display_order: newPairs[swapIdx].display_order }).eq("id", newPairs[swapIdx].id),
    ])
  }

  const handleDelete = async (pair: Pair) => {
    const supabase = createClient()
    const { error } = await supabase.from("project_before_after").delete().eq("id", pair.id)
    if (error) {
      toast.error("Failed to delete pair")
      return
    }
    toast.success("Pair deleted")
    setPairs(pairs.filter(p => p.id !== pair.id))
    setDeletingPair(null)
  }

  const handleAddPair = async () => {
    if (!newBefore || !newAfter) {
      toast.error("Please select both a before and after image")
      return
    }

    setIsSavingNew(true)
    const beforeUrl = await uploadFile(newBefore, "before")
    const afterUrl = await uploadFile(newAfter, "after")

    if (!beforeUrl || !afterUrl) {
      setIsSavingNew(false)
      return
    }

    const supabase = createClient()
    const maxOrder = pairs.length > 0 ? Math.max(...pairs.map(p => p.display_order)) + 1 : 0

    const { error } = await supabase.from("project_before_after").insert({
      project_id: projectId,
      title: newTitle || null,
      before_image: beforeUrl,
      after_image: afterUrl,
      display_order: maxOrder,
    })

    if (error) {
      toast.error("Failed to add pair", { description: error.message })
      setIsSavingNew(false)
      return
    }

    toast.success("New before/after pair added")
    setNewTitle("")
    setNewBefore(null)
    setNewAfter(null)
    setNewBeforePreview(null)
    setNewAfterPreview(null)
    setIsAdding(false)
    setIsSavingNew(false)
    fetchPairs()
  }

  const handleNewFileSelect = (file: File, type: "before" | "after") => {
    if (type === "before") {
      setNewBefore(file)
      setNewBeforePreview(URL.createObjectURL(file))
    } else {
      setNewAfter(file)
      setNewAfterPreview(URL.createObjectURL(file))
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage before/after comparisons for this project
        </p>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pair
        </Button>
      </div>
          {pairs.length === 0 && !isAdding && (
            <div className="py-6 text-center text-muted-foreground">
              <ImageIcon className="mx-auto h-10 w-10 opacity-50" />
              <p className="mt-2 text-sm">No before/after pairs yet</p>
            </div>
          )}

          {pairs.map((pair, idx) => (
            <div key={pair.id} className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === 0} onClick={() => handleReorder(pair.id, "up")}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" disabled={idx === pairs.length - 1} onClick={() => handleReorder(pair.id, "down")}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={pair.title || ""}
                    onChange={(e) => setPairs(pairs.map(p => p.id === pair.id ? { ...p, title: e.target.value } : p))}
                    onBlur={(e) => handleUpdateTitle(pair.id, e.target.value)}
                    placeholder="Pair title (optional)"
                    className="max-w-xs"
                  />
                </div>
                <Button variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => setDeletingPair(pair)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-hidden rounded-lg">
                <BeforeAfterSlider beforeImage={pair.before_image} afterImage={pair.after_image} className="aspect-[4/3]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50"
                    onClick={() => { setReplaceTarget({ id: pair.id, type: "before" }); replaceBeforeRef.current?.click() }}
                  >
                    <img src={pair.before_image} alt="Before" className="h-full w-full object-cover" />
                    {uploadingId === pair.id && uploadingType === "before" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { setReplaceTarget({ id: pair.id, type: "before" }); replaceBeforeRef.current?.click() }} disabled={uploadingId === pair.id}>
                    <Upload className="h-4 w-4" /> Replace Before
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50"
                    onClick={() => { setReplaceTarget({ id: pair.id, type: "after" }); replaceAfterRef.current?.click() }}
                  >
                    <img src={pair.after_image} alt="After" className="h-full w-full object-cover" />
                    {uploadingId === pair.id && uploadingType === "after" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => { setReplaceTarget({ id: pair.id, type: "after" }); replaceAfterRef.current?.click() }} disabled={uploadingId === pair.id}>
                    <Upload className="h-4 w-4" /> Replace After
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {isAdding && (
            <div className="rounded-lg border border-dashed border-navy p-4 space-y-4 dark:border-[#3b82f6]">
              <h3 className="font-semibold">New Before & After Pair</h3>
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Kitchen Renovation" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Before Image *</Label>
                  <div className="relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50" onClick={() => beforeInputRef.current?.click()}>
                    {newBeforePreview ? (
                      <img src={newBeforePreview} alt="Before preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to select</p>
                      </div>
                    )}
                  </div>
                  <input ref={beforeInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleNewFileSelect(file, "before"); e.target.value = "" }} />
                </div>
                <div className="space-y-2">
                  <Label>After Image *</Label>
                  <div className="relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border hover:border-muted-foreground/50" onClick={() => afterInputRef.current?.click()}>
                    {newAfterPreview ? (
                      <img src={newAfterPreview} alt="After preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 p-4">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Click to select</p>
                      </div>
                    )}
                  </div>
                  <input ref={afterInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleNewFileSelect(file, "after"); e.target.value = "" }} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsAdding(false); setNewTitle(""); setNewBefore(null); setNewAfter(null); setNewBeforePreview(null); setNewAfterPreview(null) }}>Cancel</Button>
                <Button onClick={handleAddPair} disabled={isSavingNew || !newBefore || !newAfter}>
                  {isSavingNew ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Pair
                </Button>
              </div>
            </div>
          )}
      <input ref={replaceBeforeRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && replaceTarget) handleReplaceImage(replaceTarget.id, file, "before"); e.target.value = "" }} />
      <input ref={replaceAfterRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file && replaceTarget) handleReplaceImage(replaceTarget.id, file, "after"); e.target.value = "" }} />

      <AlertDialog open={!!deletingPair} onOpenChange={(open) => !open && setDeletingPair(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Before/After Pair</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingPair?.title ? `"${deletingPair.title}"` : "this pair"}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deletingPair && handleDelete(deletingPair)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

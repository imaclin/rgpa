"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Loader2, CheckCircle2, AlertCircle, Image } from "lucide-react"
import { toast } from "sonner"

interface ZillowImportResult {
  success: boolean
  property_id: string
  listing: {
    address: string
    city: string
    state: string
    zip: string
    price: number | null
    beds: number
    baths: number
    sqft: number | null
    year_built: number | null
    property_type: string
    description: string
    listing_status: string
    photo_urls: string[]
  }
  photo_count: number
}

export function RealtorImportModal({ onImportComplete }: { onImportComplete?: () => void }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ZillowImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error("Please enter a Realtor.com URL")
      return
    }

    if (!url.includes("realtor.com")) {
      toast.error("Please enter a valid Realtor.com URL")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/realtor-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Import failed")
      }

      setResult(data)
      toast.success("Property imported successfully!", {
        description: `${data.listing.address}, ${data.listing.city} — ${data.photo_count} photos`,
      })
      onImportComplete?.()
    } catch (err: any) {
      setError(err.message)
      toast.error("Import failed", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = (imported = false) => {
    setOpen(false)
    setTimeout(() => {
      setUrl("")
      setResult(null)
      setError(null)
      if (imported) window.location.reload()
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Add from Realtor.com
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import from Realtor.com</DialogTitle>
          <DialogDescription>
            Paste a Realtor.com listing URL to automatically import property details and photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="realtor-url">Realtor.com Listing URL</Label>
            <Input
              id="realtor-url"
              placeholder="https://www.realtor.com/realestateandhomes-detail/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleImport()
              }}
            />
          </div>

          {error && (
            <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Tip: Make sure the URL is a valid Realtor.com property detail page.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Imported successfully</span>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{result.listing.address}, {result.listing.city}</p>
                <p className="text-muted-foreground">
                  {result.listing.beds} bed · {result.listing.baths} bath
                  {result.listing.sqft ? ` · ${result.listing.sqft.toLocaleString()} sqft` : ""}
                </p>
                {result.listing.price && (
                  <p className="text-muted-foreground">
                    ${result.listing.price.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Image className="h-3.5 w-3.5" />
                <span>{result.photo_count} photos imported</span>
              </div>
              {result.listing.photo_urls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {result.listing.photo_urls.slice(0, 4).map((photoUrl, i) => (
                    <div key={i} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      <img
                        src={photoUrl}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {i === 3 && result.listing.photo_urls.length > 4 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-sm font-medium">
                          +{result.listing.photo_urls.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {result ? (
              <Button onClick={() => handleClose(true)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleClose(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={loading} className="gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Import Property
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

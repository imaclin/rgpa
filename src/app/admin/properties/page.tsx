"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, List, LayoutGrid } from "lucide-react"
import { PropertiesList } from "@/components/admin/properties-list"
import { AdminLink } from "@/components/admin/admin-link"
import { RealtorImportModal } from "@/components/admin/zillow-import-modal"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: true })

      if (error) {
        setError(error.message)
      } else {
        setProperties(data || [])
      }
      setLoading(false)
    }

  useEffect(() => {
    fetchProperties()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Properties</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your property listings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <RealtorImportModal onImportComplete={() => fetchProperties()} />
          <AdminLink href="/admin/properties/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Property
            </Button>
          </AdminLink>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading properties...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Unable to load properties. Make sure your database is set up correctly.
            </p>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : (
        <PropertiesList 
          initialProperties={properties} 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      )}
    </div>
  )
}

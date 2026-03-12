"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, GripVertical } from "lucide-react"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"

interface Service {
  id: string
  slug: string
  home_title: string
  home_icon: string
  sort_order: number | null
}

export default function AdminServicesPage() {
  const router = useRouter()
  const adminPath = useAdminPath()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("services")
        .select("id, slug, home_title, home_icon, sort_order")
        .order("sort_order", { ascending: true })

      if (error) {
        setError(error.message)
      } else {
        setServices(data || [])
      }
      setLoading(false)
    }

    fetchServices()
  }, [])

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newServices = [...services]
    const draggedItem = newServices[draggedIndex]
    newServices.splice(draggedIndex, 1)
    newServices.splice(index, 0, draggedItem)

    setServices(newServices)
    setDraggedIndex(index)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return
    setDraggedIndex(null)

    const supabase = createClient()
    for (let i = 0; i < services.length; i++) {
      await supabase
        .from("services")
        .update({ sort_order: i })
        .eq("id", services[i].id)
    }

    toast.success("Service order updated")
    router.refresh()
  }

  const handleRowClick = (serviceId: string) => {
    router.push(adminPath(`/admin/services/${serviceId}`))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Services</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your service offerings
          </p>
        </div>
        <Link href={adminPath("/admin/services/new")}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Service
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading services...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Unable to load services. Make sure your database is set up correctly.
            </p>
            <p className="mt-2 text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-serif text-lg font-semibold">No services yet</h3>
            <p className="mt-2 text-muted-foreground">
              Get started by creating your first service.
            </p>
            <Link href={adminPath("/admin/services/new")} className="mt-4 inline-block">
              <Button>Create Service</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Order will be reflected on the public pages.
          </p>
          <div className="grid gap-2">
            {services.map((service, index) => (
              <Card
                key={service.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleRowClick(service.id)}
                className={`cursor-pointer overflow-hidden transition-all hover:bg-muted/50 p-0 gap-0 ${
                  draggedIndex === index ? "opacity-50 ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Wrench className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-lg font-semibold">{service.home_title}</h3>
                    <p className="text-xs text-muted-foreground">/{service.slug}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    0{index + 1}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

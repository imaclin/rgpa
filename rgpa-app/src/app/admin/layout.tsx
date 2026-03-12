import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-7xl p-8">
          {children}
        </div>
      </main>
    </div>
  )
}

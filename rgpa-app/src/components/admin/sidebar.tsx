"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User } from "@supabase/supabase-js"
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Image,
  Users,
  MessageSquareQuote,
  Wrench,
  Info,
  Inbox,
  Settings,
  LogOut,
  Home,
  Menu,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useAdminPath } from "@/hooks/use-admin-path"

const navigation = [
  { name: "Projects", href: "/admin/projects", icon: FolderKanban },
  { name: "Services", href: "/admin/services", icon: Wrench },
  { name: "About", href: "/admin/about", icon: Info },
  { name: "Messages", href: "/admin/messages", icon: Inbox },
  { name: "Tasks", href: "/admin/tasks", icon: ClipboardList },
  { name: "Media", href: "/admin/media", icon: Image },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const adminPath = useAdminPath()

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact" })
        .eq("status", "unread")
      setUnreadCount(count || 0)
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Signed out successfully")
    router.push("/login")
    router.refresh()
  }

  const closeSidebar = () => setIsOpen(false)

  return (
    <>
      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
        <nav className="flex-1 overflow-y-auto space-y-1 p-4 pt-8">
          {navigation.map((item) => {
            const resolvedHref = adminPath(item.href)
            const isActive = pathname === item.href || pathname === resolvedHref ||
              (item.href !== "/admin" && (pathname.startsWith(item.href) || pathname.startsWith(resolvedHref)))
            
            return (
              <Link
                key={item.name}
                href={resolvedHref}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {item.name === "Messages" && unreadCount > 0 && (
                  <Badge className="ml-auto" variant="destructive">
                    {unreadCount}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>

        <Separator />

        <div className="p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Home className="h-5 w-5" />
            View Site
          </Link>
        </div>

        <Separator />

        <div className="p-4">
          <div className="mb-2 px-3">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Mobile sidebar using shadcn Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="lg:hidden fixed bottom-20 left-4 z-50 rounded-full shadow-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigation Menu</SheetTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col">
            <nav className="flex-1 space-y-1 p-4 pt-8">
              {navigation.map((item) => {
                const resolvedHref = adminPath(item.href)
                const isActive = pathname === item.href || pathname === resolvedHref ||
                  (item.href !== "/admin" && (pathname.startsWith(item.href) || pathname.startsWith(resolvedHref)))
                
                return (
                  <Link
                    key={item.name}
                    href={resolvedHref}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {item.name === "Messages" && unreadCount > 0 && (
                      <Badge className="ml-auto" variant="destructive">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                )
              })}
            </nav>

            <Separator />

            <div className="p-4">
              <Link
                href="/"
                onClick={closeSidebar}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Home className="h-5 w-5" />
                View Site
              </Link>
            </div>

            <Separator />

            <div className="p-4">
              <div className="mb-2 px-3">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

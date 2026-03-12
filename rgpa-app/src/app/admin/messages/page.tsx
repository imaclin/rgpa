"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, MailOpen, Archive, Trash2, ArrowLeft, Clock, User, Phone } from "lucide-react"
import { toast } from "sonner"
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

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: string
  created_at: string
}

type FilterStatus = "all" | "unread" | "read" | "archived"

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>("all")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const fetchMessages = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data, error } = await query
    if (error) {
      toast.error("Failed to load messages")
      return
    }
    setMessages(data || [])
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("messages")
      .update({ status })
      .eq("id", id)

    if (error) {
      toast.error("Failed to update message")
      return
    }

    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev) => prev ? { ...prev, status } : null)
    }
    toast.success(`Message marked as ${status}`)
  }

  const deleteMessage = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("messages").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete message")
      return
    }

    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selectedMessage?.id === id) {
      setSelectedMessage(null)
    }
    toast.success("Message deleted")
  }

  const unreadCount = messages.filter((m) => m.status === "unread").length

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 1) return `${Math.floor(diffMs / (1000 * 60))}m ago`
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`
    if (diffHours < 48) return "Yesterday"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  // Detail view
  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="gap-2 pl-0" onClick={() => setSelectedMessage(null)}>
            <ArrowLeft className="h-4 w-4" />
            Back to Messages
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedMessage.name}
                  </span>
                  <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-1 hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {selectedMessage.email}
                  </a>
                  {selectedMessage.phone && (
                    <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-1 hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedMessage.phone}
                    </a>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <Badge variant={selectedMessage.status === "unread" ? "default" : "secondary"}>
                {selectedMessage.status}
              </Badge>
            </div>

            <div className="border-t pt-6">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">{selectedMessage.message}</p>
            </div>

            <div className="flex flex-wrap gap-2 border-t pt-6">
              {selectedMessage.status === "unread" && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => updateStatus(selectedMessage.id, "read")}>
                  <MailOpen className="h-4 w-4" />
                  Mark as Read
                </Button>
              )}
              {selectedMessage.status === "read" && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => updateStatus(selectedMessage.id, "unread")}>
                  <Mail className="h-4 w-4" />
                  Mark as Unread
                </Button>
              )}
              {selectedMessage.status !== "archived" && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => updateStatus(selectedMessage.id, "archived")}>
                  <Archive className="h-4 w-4" />
                  Archive
                </Button>
              )}
              {selectedMessage.status === "archived" && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => updateStatus(selectedMessage.id, "read")}>
                  <MailOpen className="h-4 w-4" />
                  Unarchive
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Message</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete this message?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMessage(selectedMessage.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Messages
            {unreadCount > 0 && (
              <Badge className="ml-2 align-middle">{unreadCount}</Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Contact form submissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "unread", "read", "archived"] as FilterStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {filter === "all" ? "No messages yet." : `No ${filter} messages.`}
          </CardContent>
        </Card>
      ) : (
        <div className="divide-y border rounded-md">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => {
                setSelectedMessage(msg)
                if (msg.status === "unread") updateStatus(msg.id, "read")
              }}
              className="flex w-full items-center gap-4 py-2 px-4 text-left transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center justify-center shrink-0">
                {msg.status === "unread" ? (
                  <Mail className="h-4 w-4 text-primary" />
                ) : msg.status === "archived" ? (
                  <Archive className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`truncate text-sm ${msg.status === "unread" ? "font-bold" : "font-medium"}`}>
                      {msg.name}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className={`truncate text-sm ${msg.status === "unread" ? "font-semibold" : "font-medium"}`}>
                      {msg.subject}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(msg.created_at)}
                  </span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {msg.message}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

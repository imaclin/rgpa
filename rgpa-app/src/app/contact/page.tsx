"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "5900 Detroit Ave.\nCleveland, Ohio 44102",
    href: "https://maps.google.com/?q=5900+Detroit+Ave+Cleveland+Ohio+44102",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(216) 302-7741",
    href: "tel:216-302-7741",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@revifi.com",
    href: "mailto:info@revifi.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@revifiproperties",
    href: "https://www.instagram.com/revifiproperties",
  },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [honeypot, setHoneypot] = useState("")
  const [cooldown, setCooldown] = useState(false)
  const colorOptions = [
    { bg: '#b91c1c', textWhite: true },
    { bg: '#1e3a5f', textWhite: true },
    { bg: '#fbbf24', textWhite: false },
  ]
  const [activeHover, setActiveHover] = useState<{ label: string; bg: string; textWhite: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown) return
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, honeypot }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to send message.")
        return
      }

      toast.success("Message sent!", {
        description: "We'll get back to you as soon as possible.",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })

      // 5 second cooldown after successful submission
      setCooldown(true)
      setTimeout(() => setCooldown(false), 5000)
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-background py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              Contact Us
            </h1>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="bg-background pt-4 pb-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {/* Contact Info */}
            <ScrollAnimation variant="slideInRight">
            <div className="flex flex-col justify-center space-y-8">
              <div>
                <h2 className="font-serif text-2xl font-bold">Get in Touch</h2>
                <p className="mt-4 text-muted-foreground">
                  Whether you&apos;re ready to start a project or just want to learn more 
                  about what we do, we&apos;re here to help. Reach out through any of the 
                  channels below.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group"
                    onMouseEnter={() => setActiveHover({ label: item.label, ...colorOptions[Math.floor(Math.random() * colorOptions.length)] })}
                    onMouseLeave={() => setActiveHover(null)}
                  >
                    <div 
                      className="flex items-center gap-2 p-2 h-20 rounded-lg border border-border transition-all hover:shadow-md"
                      style={{
                        backgroundColor: activeHover?.label === item.label ? activeHover.bg : undefined,
                        color: activeHover?.label === item.label && activeHover.textWhite ? '#fff' : undefined,
                      }}
                    >
                        <div 
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors"
                          style={{
                            backgroundColor: activeHover?.label === item.label ? 'rgba(255,255,255,0.2)' : undefined,
                          }}
                        >
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-medium" style={{ color: activeHover?.label === item.label && activeHover.textWhite ? 'rgba(255,255,255,0.8)' : undefined }}>
                            {item.label}
                          </p>
                          <p className="mt-0.5 whitespace-pre-line text-sm font-medium">
                            {item.value}
                          </p>
                        </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            </ScrollAnimation>

            {/* Contact Form */}
            <ScrollAnimation variant="slideInLeft">
              <h2 className="font-serif text-2xl font-bold">Send Us a Message</h2>
              <Card className="mt-6">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="(555) 555-5555"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Tell us about your project..."
                    />
                  </div>
                  {/* Honeypot - hidden from real users */}
                  <div className="absolute opacity-0 pointer-events-none" aria-hidden="true" tabIndex={-1}>
                    <Input
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || cooldown}>
                    {isSubmitting ? "Sending..." : cooldown ? "Message Sent!" : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            </ScrollAnimation>

            {/* Office Hours */}
            <ScrollAnimation variant="slideInLeft" delay={0.1}>
            <Card className="bg-foreground text-background">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold">Office Hours</h3>
                <div className="mt-4 space-y-2 text-background/80">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: By Appointment</p>
                  <p>Sunday: Closed</p>
                </div>
              </CardContent>
            </Card>
            </ScrollAnimation>
          </div>
        </div>
      </section>
    </div>
  )
}

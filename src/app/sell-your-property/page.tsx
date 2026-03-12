"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollAnimation, StaggerContainer, StaggerItem } from "@/components/animations/scroll-animations"
import { toast } from "sonner"

const marketingItems = [
  {
    title: "Multi-faceted Marketing Effort",
    description:
      "Designing the right marketing systems to help accomplish the goals of our customers is critical. Your listing is advertised in the Multiple Listing Services, a commercial portal that migrates to Loopnet, Instagram and Facebook ads, just-listed postcards, featured on our website, and emailed to other real estate agents.",
  },
  {
    title: "Multiple Listing Services",
    description:
      "We enter your property information into the MLS database so that all agents have access to share it with buyers they are actively working with.",
  },
  {
    title: "Facebook Ads",
    description:
      "We use Facebook advertising to reach exact audiences — investors, commercial agents, and buyers in the Cleveland area who are likely to be interested in your listing.",
  },
  {
    title: "Agent/Investor Referral Network",
    description:
      "We network your listing with real estate agents who specialize in commercial buyers and investors, and we work extensively with our investor sphere of influence.",
  },
  {
    title: "Instagram",
    description:
      "Instagram ads allow us to reach precise audiences and drive traffic back to our website where your listing can be featured.",
  },
  {
    title: "Professional Brochures",
    description:
      "High-quality photos and a detailed property description are created. Concise rent rolls and financials are prepared and distributed to qualified buyers.",
  },
]

export default function SellYourPropertyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    propertyAddress: "",
    city: "",
    zipCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    details: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const message = [
        `Property Address: ${formData.propertyAddress}`,
        `City: ${formData.city}`,
        `Zip Code: ${formData.zipCode}`,
        `Name: ${formData.firstName} ${formData.lastName}`,
        `Email: ${formData.email}`,
        `Phone: ${formData.phone}`,
        "",
        "Tell Us About Your Property:",
        formData.details,
      ].join("\n")

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          subject: "Sell Your Property",
          message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit form")
      }

      toast.success("Thanks! We'll be in touch soon.")
      setFormData({
        propertyAddress: "",
        city: "",
        zipCode: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        details: "",
      })
    } catch (error) {
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-background py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="max-w-3xl">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Ready to Sell
              </p>
              <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                Sell Your Property
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                We work with you through every step of the process of selling your home. Get the process
                started with a free consultation.
              </p>
              <div className="mt-6">
                <Button asChild className="gap-2">
                  <Link href="#property-form">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Marketing */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              How We Market For You
            </p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
              A Full-Service Marketing Strategy
            </h2>
          </ScrollAnimation>
          <StaggerContainer className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1}>
            {marketingItems.map((item) => (
              <StaggerItem key={item.title}>
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Form */}
      <section id="property-form" className="border-t border-border bg-background py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollAnimation>
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Property Information
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                Tell Us About Your Property
              </h2>
            </div>
          </ScrollAnimation>

          <Card className="mt-10">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="propertyAddress">Property Address</Label>
                  <Input
                    id="propertyAddress"
                    required
                    value={formData.propertyAddress}
                    onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Westlake"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="44145"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(216) 408-3082"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="details">Tell Us About Your Property</Label>
                  <Textarea
                    id="details"
                    required
                    rows={6}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Share details about your property, timeline, and goals."
                  />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

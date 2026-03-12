"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: string
  client_name: string
  role: string | null
  content: string
  photo_url: string | null
  rating: number | null
}

interface ScrollingTestimonialsProps {
  testimonials: Testimonial[]
}

export function ScrollingTestimonials({ testimonials }: ScrollingTestimonialsProps) {
  if (testimonials.length === 0) return null

  // Duplicate items for seamless infinite loop
  const items = [...testimonials, ...testimonials]

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-background to-transparent sm:w-24" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-background to-transparent sm:w-24" />

      {/* Scrolling track */}
      <div className="group flex w-max animate-scroll hover:[animation-play-state:paused]">
        {items.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="mx-3 w-[320px] shrink-0 rounded-xl border border-border bg-card p-5 shadow-sm sm:w-[380px]"
          >
            {/* Author */}
            <div className="mb-4 flex items-center gap-3">
              {t.photo_url ? (
                <img
                  src={t.photo_url}
                  alt={t.client_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {getInitials(t.client_name)}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{t.client_name}</p>
                {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
              </div>
            </div>

            {/* Content */}
            <blockquote className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
              &ldquo;{t.content}&rdquo;
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  )
}

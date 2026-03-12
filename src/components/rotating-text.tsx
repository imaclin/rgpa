"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const phrases = [
  "community-centric",
  "design-driven",
  "historically inspired",
  "detail-oriented",
  "quality-focused",
]

const brandColors = ['#b91c1c', '#1e3a5f', '#fbbf24']

export function RotatingText({ className }: { className?: string }) {
  const [index, setIndex] = useState(0)
  const [nextIndex, setNextIndex] = useState(0)
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle")
  const measureRef = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [color, setColor] = useState(brandColors[0])

  // Measure width of current phrase
  useEffect(() => {
    if (measureRef.current) {
      setWidth(measureRef.current.offsetWidth)
    }
  }, [index])

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (index + 1) % phrases.length
      setNextIndex(next)
      setPhase("out")

      setTimeout(() => {
        setIndex(next)
        setColor(brandColors[Math.floor(Math.random() * brandColors.length)])
        setPhase("in")
      }, 350)

      setTimeout(() => {
        setPhase("idle")
      }, 700)
    }, 3000)

    return () => clearInterval(interval)
  }, [index])

  return (
    <span
      className={cn("relative inline-flex overflow-hidden align-baseline", className)}
      style={{
        width: width ? `${width + 8}px` : "auto",
        transition: "width 350ms ease",
      }}
    >
      {/* Hidden measurer for current phrase */}
      <span ref={measureRef} className="invisible absolute whitespace-nowrap italic" aria-hidden="true">
        {phrases[phase === "out" ? nextIndex : index]}
      </span>
      {/* Animated phrase */}
      <span
        className={cn(
          "inline-block whitespace-nowrap transition-all duration-350 ease-in-out",
          phase === "out" && "opacity-0 -translate-y-full",
          phase === "in" && "opacity-0 translate-y-full",
          phase === "idle" && "opacity-100 translate-y-0"
        )}
        style={{ transitionDuration: "350ms", color: color }}
      >
        {phrases[index]}
      </span>
    </span>
  )
}

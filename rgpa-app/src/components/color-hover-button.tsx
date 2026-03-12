"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const colorOptions = [
  { bg: '#b91c1c', textWhite: true },
  { bg: '#1e3a5f', textWhite: true },
  { bg: '#fbbf24', textWhite: false },
]

interface ColorHoverButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  size?: "default" | "lg"
  external?: boolean
}

export function ColorHoverButton({
  href,
  children,
  className,
  size = "default",
  external = false,
}: ColorHoverButtonProps) {
  const [hover, setHover] = useState<{ bg: string; textWhite: boolean } | null>(null)

  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-md border border-input font-medium transition-all duration-200",
    size === "lg" ? "h-12 px-8 text-sm" : "h-10 px-6 text-sm",
    className,
  )

  const props = {
    className: baseClasses,
    style: {
      backgroundColor: hover ? hover.bg : undefined,
      color: hover ? (hover.textWhite ? '#fff' : '#1a1a1a') : undefined,
      borderColor: hover ? hover.bg : undefined,
    } as React.CSSProperties,
    onMouseEnter: () => setHover(colorOptions[Math.floor(Math.random() * colorOptions.length)]),
    onMouseLeave: () => setHover(null),
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

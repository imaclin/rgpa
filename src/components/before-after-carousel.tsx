"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BeforeAfterSlider } from "@/components/before-after-slider"
import { Button } from "@/components/ui/button"

interface Pair {
  id: string
  title: string | null
  before_image: string
  after_image: string
}

export function BeforeAfterCarousel({ pairs }: { pairs: Pair[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (pairs.length === 0) return null

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? pairs.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === pairs.length - 1 ? 0 : prev + 1))
  }

  const current = pairs[activeIndex]

  return (
    <div className="space-y-3">
      <BeforeAfterSlider
        beforeImage={current.before_image}
        afterImage={current.after_image}
        beforeLabel="Before"
        afterLabel="After"
        className="aspect-[4/3]"
      />

      {/* Navigation */}
      {pairs.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {activeIndex + 1} / {pairs.length}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

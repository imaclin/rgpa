"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Building2, ChevronLeft, ChevronRight, X, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MediaItem {
  id: string
  url: string
  alt_text: string | null
  type: string
}

interface ProjectGalleryProps {
  media: MediaItem[]
  projectTitle: string
}

export function ProjectGallery({ media, projectTitle }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)

  const openModal = (index: number) => {
    setSelectedIndex(index)
  }

  const closeModal = useCallback(() => {
    setSelectedIndex(null)
  }, [])

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === 0 ? media.length - 1 : selectedIndex - 1)
  }, [selectedIndex, media.length])

  const goToNext = useCallback(() => {
    if (selectedIndex === null) return
    setSelectedIndex(selectedIndex === media.length - 1 ? 0 : selectedIndex + 1)
  }, [selectedIndex, media.length])

  // Auto-focus modal when it opens so arrow keys work immediately
  useEffect(() => {
    if (selectedIndex !== null && modalRef.current) {
      modalRef.current.focus()
    }
  }, [selectedIndex])

  // Scroll active thumbnail into view
  useEffect(() => {
    if (selectedIndex !== null && thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[selectedIndex] as HTMLElement
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeModal()
    if (e.key === "ArrowLeft") { e.preventDefault(); goToPrevious() }
    if (e.key === "ArrowRight") { e.preventDefault(); goToNext() }
  }

  if (!media || media.length === 0) {
    return (
      <p className="text-muted-foreground">No media available for this project yet.</p>
    )
  }

  // Get first 5 images for the grid display
  const mainImage = media[0]
  const sideImages = media.slice(1, 5)
  const hasMoreImages = media.length > 5

  return (
    <>
      {/* Airbnb-style Gallery Grid */}
      <div className="relative grid gap-2 overflow-hidden rounded-xl md:grid-cols-2">
        {/* Main Image - Left Side */}
        <button
          onClick={() => openModal(0)}
          className="relative aspect-[4/3] overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary md:aspect-square md:row-span-2"
        >
          {mainImage.type === "image" ? (
            <img
              src={mainImage.url}
              alt={mainImage.alt_text || projectTitle}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          ) : (
            <video
              src={mainImage.url}
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
        </button>

        {/* Side Images - Right Side (2x2 grid) */}
        <div className="hidden gap-2 md:grid md:grid-cols-2">
          {sideImages.map((item, index) => (
            <button
              key={item.id}
              onClick={() => openModal(index + 1)}
              className="relative aspect-square overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.alt_text || projectTitle}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              ) : (
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/0 transition-colors hover:bg-black/10" />
            </button>
          ))}
          {/* Fill empty slots if less than 4 side images */}
          {Array.from({ length: Math.max(0, 4 - sideImages.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square bg-muted" />
          ))}
        </div>

        {/* Show All Photos Button */}
        {media.length > 1 && (
          <Button
            onClick={() => openModal(0)}
            variant="secondary"
            size="sm"
            className="absolute bottom-4 right-4 gap-2 shadow-md"
          >
            <Grid className="h-4 w-4" />
            Show all photos
          </Button>
        )}
      </div>

      {/* Modal */}
      {selectedIndex !== null && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 outline-none"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 text-white hover:bg-white/20"
            onClick={closeModal}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous Button */}
          {media.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Image/Video Container */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {media[selectedIndex].type === "image" ? (
              <img
                src={media[selectedIndex].url}
                alt={media[selectedIndex].alt_text || projectTitle}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            ) : (
              <video
                src={media[selectedIndex].url}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                controls
                autoPlay
              />
            )}
          </div>

          {/* Next Button */}
          {media.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 z-50 -translate-y-1/2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToNext()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Image Counter */}
          {media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
              {selectedIndex + 1} / {media.length}
            </div>
          )}

          {/* Thumbnail Strip */}
          {media.length > 1 && (
            <div className="absolute bottom-16 left-1/2 z-50 w-full max-w-[90vw] -translate-x-1/2 sm:max-w-[600px]">
              <div
                ref={thumbnailContainerRef}
                className="flex gap-2 overflow-x-auto rounded-lg bg-black/50 p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/30"
              >
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedIndex(index)
                    }}
                    className={`h-12 w-12 flex-shrink-0 overflow-hidden rounded transition-all ${
                      index === selectedIndex
                        ? "ring-2 ring-white"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.alt_text || projectTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

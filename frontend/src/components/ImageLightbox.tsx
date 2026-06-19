'use client'

// Fix #12 — Added full ARIA support:
//   - role="dialog" + aria-modal so screen readers announce the overlay
//   - aria-label on the dialog itself (describes what's shown)
//   - aria-label on every button (Close, Prev, Next, dot nav)
//   - aria-live region announces the current image index to screen readers
//   - alt text on the image (was empty string before)
//   - Focus moved to Close button on open, restored to trigger on close
//   - Body scroll locked while open

import { useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images:   string[]
  index:    number
  onClose:  () => void
  onChange: (i: number) => void
}

export default function ImageLightbox({ images, index, onClose, onChange }: Props) {
  const closeRef   = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Save trigger, lock scroll, focus close button on open
  useEffect(() => {
    triggerRef.current           = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = ''
      ;(triggerRef.current as HTMLElement | null)?.focus()
    }
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     { onClose(); return }
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length)
      if (e.key === 'ArrowLeft')  onChange((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, images.length, onClose, onChange])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer — ${index + 1} of ${images.length}`}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Screen-reader live counter — announced whenever the image changes */}
      <div aria-live="polite" className="sr-only">
        Image {index + 1} of {images.length}
      </div>

      {/* Close */}
      <button
        ref={closeRef}
        aria-label="Close image viewer"
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
      >
        <X className="w-7 h-7" aria-hidden="true" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          aria-label="Previous image"
          className="absolute left-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-40 rounded-full"
          onClick={e => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length) }}
        >
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[index]}
        alt={`Product image ${index + 1} of ${images.length}`}
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          aria-label="Next image"
          className="absolute right-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-40 rounded-full"
          onClick={e => { e.stopPropagation(); onChange((index + 1) % images.length) }}
        >
          <ChevronRight className="w-6 h-6" aria-hidden="true" />
        </button>
      )}

      {/* Dot navigation */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2" role="tablist" aria-label="Image thumbnails">
          {images.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to image ${i + 1}`}
              onClick={e => { e.stopPropagation(); onChange(i) }}
              className={"w-2 h-2 rounded-full transition-colors " + (i === index ? 'bg-white' : 'bg-gray-500')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

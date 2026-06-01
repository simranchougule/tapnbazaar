'use client'

import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images:   string[]
  index:    number
  onClose:  () => void
  onChange: (i: number) => void
}

export default function ImageLightbox({ images, index, onClose, onChange }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length)
      if (e.key === 'ArrowLeft')  onChange((index - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [index, images.length])

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button className="absolute top-4 right-4 text-white hover:text-gray-300 z-10" onClick={onClose}>
        <X className="w-7 h-7" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          className="absolute left-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-40 rounded-full"
          onClick={e => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length) }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <img
        src={images[index]}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
        onClick={e => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          className="absolute right-4 text-white hover:text-gray-300 p-2 bg-black bg-opacity-40 rounded-full"
          onClick={e => { e.stopPropagation(); onChange((index + 1) % images.length) }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); onChange(i) }}
              className={"w-2 h-2 rounded-full transition-colors " + (i === index ? 'bg-white' : 'bg-gray-500')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

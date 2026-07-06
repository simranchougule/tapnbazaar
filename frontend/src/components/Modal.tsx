'use client'

// Fix #12 — Shared accessible modal wrapper
// All modals previously had zero ARIA attributes and no focus management.
// This component provides:
//   - role="dialog" + aria-modal so screen readers announce the overlay
//   - aria-labelledby wired to the title so readers announce what dialog opened
//   - Focus trapped inside (Tab / Shift+Tab cycle only within the modal)
//   - Focus restored to the element that opened the modal on close
//   - Escape key closes the modal
//   - Body scroll locked while open

import { useEffect, useRef, useId, ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  onClose:     () => void
  title:       ReactNode
  children:    ReactNode
  panelClass?: string  // extra Tailwind classes for the inner panel e.g. max-w-sm
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export default function Modal({ onClose, title, children, panelClass = 'max-w-sm' }: ModalProps) {
  const panelRef  = useRef<HTMLDivElement>(null)
  const titleId   = useId()
  const triggerEl = useRef<Element | null>(null)

  // Lock body scroll and save the element that triggered the modal
  useEffect(() => {
    triggerEl.current        = document.activeElement
    document.body.style.overflow = 'hidden'

    // Auto-focus the first focusable element inside the modal
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()

    return () => {
      document.body.style.overflow = ''
      // Restore focus to whatever opened the modal
      ;(triggerEl.current as HTMLElement | null)?.focus()
    }
  }, [])

  // Escape closes, Tab stays trapped
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab')    trapFocus(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const trapFocus = (e: KeyboardEvent) => {
    if (!panelRef.current) return
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length === 0) return
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  return (
    // Backdrop — aria-hidden because the dialog panel carries all semantics
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      aria-hidden="true"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white rounded-2xl w-full ${panelClass} p-6 shadow-2xl`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div id={titleId} className="font-bold text-gray-900 text-sm">
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}
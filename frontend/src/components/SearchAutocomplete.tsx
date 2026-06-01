'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import api from '@/lib/api'

interface Suggestion {
  id:    string
  title: string
  price: number
  city:  string
}

export default function SearchAutocomplete() {
  const router  = useRouter()
  const ref     = useRef<HTMLDivElement>(null)
  const timer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery]           = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen]             = useState(false)
  const [loading, setLoading]       = useState(false)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (value: string) => {
    setQuery(value)
    if (timer.current) clearTimeout(timer.current)
    if (!value.trim()) { setSuggestions([]); setOpen(false); return }

    timer.current = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await api.get('/products?search=' + encodeURIComponent(value) + '&limit=6')
        setSuggestions(res.data.products)
        setOpen(true)
      } catch { /* ignore */ }
      finally { setLoading(false) }
    }, 300)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      router.push('/?search=' + encodeURIComponent(query.trim()))
    }
  }

  const handleSelect = (s: Suggestion) => {
    setOpen(false)
    setQuery('')
    router.push('/products/' + s.id)
  }

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={e => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search for anything..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-orange-500"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {suggestions.map(s => (
            <button
              key={s.id}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{s.title}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-orange-500">Rs.{s.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">{s.city}</p>
              </div>
            </button>
          ))}
          <button
            onClick={handleSubmit as any}
            className="w-full text-center py-2 text-xs text-orange-500 hover:bg-orange-50 border-t border-gray-100 transition-colors"
          >
            See all results for "{query}"
          </button>
        </div>
      )}
    </div>
  )
}

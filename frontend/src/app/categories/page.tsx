'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { ChevronRight, ArrowLeft } from 'lucide-react'

interface SubCategory {
  id:   string
  name: string
  slug: string
  icon: string
}

interface Category {
  id:       string
  name:     string
  slug:     string
  icon:     string
  children: SubCategory[]
}

// Custom order — most popular first
const CATEGORY_ORDER = [
  'vehicles', 'electronics', 'property', 'fashion',
  'furniture', 'jobs', 'pets', 'sports', 'kids',
  'education', 'services', 'agriculture'
]

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories]         = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    api.get('/categories').then(res => {
      // Sort by custom order
      const cats: Category[] = res.data.categories
      const sorted = [...cats].sort((a, b) => {
        const ai = CATEGORY_ORDER.indexOf(a.slug)
        const bi = CATEGORY_ORDER.indexOf(b.slug)
        if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
      setCategories(sorted)
      if (sorted.length > 0) setActiveCategory(sorted[0])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="flex gap-4 bg-white rounded-2xl overflow-hidden" style={{height: '500px'}}>
            <div className="w-36 bg-gray-100" />
            <div className="flex-1 p-4 grid grid-cols-3 gap-3 content-start">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 h-24 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">All Categories</h1>
        </div>

        <div className="flex gap-0 bg-white rounded-2xl shadow-sm overflow-hidden min-h-[500px]">

          {/* Left Sidebar */}
          <div className="w-24 sm:w-32 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={"w-full flex flex-col items-center gap-1 py-3 px-1 text-center transition-all border-l-3 " +
                  (activeCategory?.id === cat.id
                    ? 'bg-white text-orange-500 border-l-4 border-orange-500 font-semibold'
                    : 'text-gray-500 hover:bg-white hover:text-orange-400 border-l-4 border-transparent')}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs leading-tight px-1">{cat.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right — Subcategories */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeCategory && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCategory.icon}</span>
                    <h2 className="font-bold text-gray-800">{activeCategory.name}</h2>
                  </div>
                  <Link
                    href={"/?category=" + activeCategory.slug}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:underline font-medium"
                  >
                    View All
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Subcategory Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {activeCategory.children.map(sub => (
                    <Link
                      key={sub.id}
                      href={"/?category=" + sub.slug}
                      className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group"
                    >
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow text-3xl">
                        {sub.icon}
                      </div>
                      <span className="text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-orange-600">
                        {sub.name}
                      </span>
                    </Link>
                  ))}

                  {/* View All tile */}
                  <Link
                    href={"/?category=" + activeCategory.slug}
                    className="flex flex-col items-center gap-2 p-3 bg-orange-50 rounded-2xl hover:bg-orange-100 border border-orange-100 transition-all"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-500">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-orange-500 font-semibold text-center">View All</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

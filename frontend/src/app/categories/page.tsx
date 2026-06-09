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

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories]         = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [loading, setLoading]               = useState(true)

  useEffect(() => {
    api.get('/categories').then(res => {
      const cats = res.data.categories
      setCategories(cats)
      if (cats.length > 0) setActiveCategory(cats[0])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="flex gap-4">
            <div className="w-40 space-y-3">
              {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-200 h-16 rounded-xl" />)}
            </div>
            <div className="flex-1 grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-200 h-24 rounded-xl" />)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Categories</h1>
        </div>

        <div className="flex gap-3 bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Left Sidebar — Parent Categories */}
          <div className="w-28 sm:w-36 bg-gray-50 border-r border-gray-100 flex-shrink-0">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={"w-full flex flex-col items-center gap-1.5 py-4 px-2 text-center transition-all relative " +
                  (activeCategory?.id === cat.id
                    ? 'bg-white text-orange-500 border-r-2 border-orange-500'
                    : 'text-gray-600 hover:bg-white hover:text-orange-400')}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Right — Subcategories */}
          <div className="flex-1 p-4">
            {activeCategory && (
              <>
                {/* Category header with View All */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800 text-base">{activeCategory.name}</h2>
                  <Link
                    href={"/?category=" + activeCategory.slug}
                    className="flex items-center gap-1 text-xs text-orange-500 hover:underline font-medium"
                  >
                    View All
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Subcategory Grid */}
                {activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {activeCategory.children.map(sub => (
                      <Link
                        key={sub.id}
                        href={"/?category=" + sub.slug}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all group"
                      >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                          <span className="text-2xl">{sub.icon}</span>
                        </div>
                        <span className="text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-orange-600">
                          {sub.name}
                        </span>
                      </Link>
                    ))}

                    {/* View All tile */}
                    <Link
                      href={"/?category=" + activeCategory.slug}
                      className="flex flex-col items-center gap-2 p-3 bg-orange-50 rounded-2xl hover:bg-orange-100 border border-orange-100 transition-all group"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <ChevronRight className="w-5 h-5 text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-500 font-medium text-center leading-tight">
                        View All
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No subcategories</p>
                    <Link href={"/?category=" + activeCategory.slug}
                      className="mt-3 inline-block bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors">
                      Browse {activeCategory.name}
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

// SEO note: this is still a client component (needs click-to-switch
// sidebar interactivity), but it now receives server-fetched categories
// as an initial prop instead of starting empty and fetching on mount —
// so the first HTML response already contains the full category list
// instead of a loading skeleton.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { ChevronRight, ArrowLeft, Grid } from 'lucide-react'

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

// Fallback icons in case DB icons are empty
const FALLBACK_ICONS: Record<string, string> = {
  'cars': '🚗', 'bikes': '🏍️', 'scooters': '🛵', 'bicycles': '🚲',
  'commercial-vehicles': '🚛', 'auto-parts': '⚙️',
  'mobile-phones': '📱', 'laptops': '💻', 'tablets': '📟', 'tvs': '📺',
  'cameras': '📷', 'home-appliances': '🏠', 'gaming-consoles': '🎮', 'computers': '🖥️',
  'houses-for-sale': '🏡', 'flats-apartments': '🏢', 'plots-land': '🌍',
  'commercial-property': '🏬', 'houses-for-rent': '🔑', 'pg-guest-houses': '🛏️',
  'mens-clothing': '👔', 'womens-clothing': '👗', 'kids-clothing': '👶',
  'footwear': '👟', 'watches': '⌚', 'beauty-products': '💄', 'jewellery': '💍',
  'sofas': '🛋️', 'beds': '🛏️', 'dining-tables': '🪑', 'wardrobes': '🚪',
  'home-decor': '🏮', 'kitchen-items': '🍳',
  'it-jobs': '💻', 'sales-jobs': '📊', 'marketing-jobs': '📣',
  'part-time-jobs': '⏰', 'work-from-home': '🏠', 'delivery-jobs': '🚚',
  'dogs': '🐕', 'cats': '🐈', 'birds': '🦜', 'fish': '🐠', 'pet-accessories': '🦴',
  'courses': '📚', 'tuition': '✏️', 'books': '📖', 'training-programs': '🎯',
  'home-cleaning': '🧹', 'repairs': '🔧', 'movers-packers': '📦',
  'event-services': '🎉', 'beauty-services': '💇', 'freelance-services': '💻',
  'toys': '🧸', 'baby-products': '🍼', 'strollers': '🛺', 'school-supplies': '🎒',
  'sports-equipment': '⚽', 'musical-instruments': '🎸',
  'collectibles': '🏆', 'fitness-equipment': '🏋️',
  'farm-equipment': '🚜', 'seeds-fertilizers': '🌱',
  'industrial-machinery': '⚙️', 'business-equipment': '💼',
}

function getIcon(slug: string, icon: string): string {
  if (icon && icon.trim()) return icon
  return FALLBACK_ICONS[slug] || '📦'
}

interface CategoriesContentProps {
  initialCategories: Category[]
}

export default function CategoriesContent({ initialCategories }: CategoriesContentProps) {
  const router = useRouter()
  const [categories] = useState<Category[]>(initialCategories)
  const [activeCategory, setActiveCategory] = useState<Category | null>(
    initialCategories.length > 0 ? initialCategories[0] : null
  )

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

        <div className="flex bg-white rounded-2xl shadow-sm overflow-hidden min-h-[520px]">

          {/* Left Sidebar */}
          <div className="w-24 sm:w-28 bg-gray-50 border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat)}
                className={"w-full flex flex-col items-center gap-1 py-4 px-1 text-center transition-all border-l-4 " +
                  (activeCategory?.id === cat.id
                    ? 'bg-white text-orange-500 border-orange-500 font-semibold'
                    : 'text-gray-500 hover:bg-white hover:text-orange-400 border-transparent')}
              >
                <span style={{fontSize: '24px', lineHeight: '1'}}>{getIcon(cat.slug, cat.icon)}</span>
                <span className="text-xs leading-tight px-1 mt-1">{cat.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Right — Subcategories */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeCategory && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span style={{fontSize: '24px'}}>{getIcon(activeCategory.slug, activeCategory.icon)}</span>
                    <h2 className="font-bold text-gray-800 text-base">{activeCategory.name}</h2>
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
                {activeCategory.children.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {activeCategory.children.map(sub => (
                      <Link
                        key={sub.id}
                        href={"/?category=" + sub.slug}
                        className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group"
                      >
                        <span style={{fontSize: '36px', lineHeight: '1', display: 'block'}}>
                          {getIcon(sub.slug, sub.icon)}
                        </span>
                        <span className="text-xs text-gray-600 font-medium text-center leading-tight group-hover:text-orange-600 mt-1">
                          {sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Grid className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-3">No subcategories yet</p>
                    <Link
                      href={"/?category=" + activeCategory.slug}
                      className="inline-block bg-orange-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
                    >
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

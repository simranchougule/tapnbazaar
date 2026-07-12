'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Tag, Heart, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import api from '@/lib/api'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'

interface SubCategory { id: string; name: string; slug: string; icon: string }
interface CategoryInfo { id: string; name: string; slug: string; icon: string; children: SubCategory[] }

const CONDITION_CHIP: Record<string, { label: string; cls: string }> = {
  NEW:      { label: 'Brand New', cls: 'bg-green-100 text-green-700' },
  LIKE_NEW: { label: 'Like New',  cls: 'bg-emerald-100 text-emerald-700' },
  GOOD:     { label: 'Good',      cls: 'bg-orange-100 text-orange-700' },
  FAIR:     { label: 'Fair',      cls: 'bg-yellow-100 text-yellow-700' },
  POOR:     { label: 'Poor',      cls: 'bg-gray-100 text-gray-500' },
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

function formatLocation(product: any): string {
  const parts: string[] = []
  if (product.locality) parts.push(product.locality)
  if (product.city) parts.push(product.city)
  return parts.join(', ') || 'India'
}

interface CategoryContentProps {
  category: CategoryInfo
  initialProducts: Product[]
  initialPagination: { totalPages: number; total: number }
}

export default function CategoryContent({ category, initialProducts, initialPagination }: CategoryContentProps) {
  const { isLoggedIn } = useAuthStore()
  const [products, setProducts]   = useState<Product[]>(initialProducts)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages)
  const [total, setTotal]         = useState(initialPagination.total)
  const [loading, setLoading]     = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const goToPage = async (p: number) => {
    try {
      setLoading(true)
      const res = await api.get(`/products?category=${category.slug}&page=${p}&limit=20&sortBy=createdAt&order=desc`)
      setProducts(res.data.products)
      setTotalPages(res.data.pagination.totalPages)
      setTotal(res.data.pagination.total)
      setPage(p)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    if (!isLoggedIn) { window.location.href = '/login'; return }
    try {
      const res = await api.post('/favorites/' + productId)
      setFavorites((prev) => {
        const next = new Set(prev)
        res.data.favorited ? next.add(productId) : next.delete(productId)
        return next
      })
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Breadcrumb + header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
            <Link href="/" className="hover:text-orange-500">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-orange-500">Categories</Link>
            <span>/</span>
            <span className="text-slate-600">{category.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{category.name}</h1>
              <p className="text-sm text-slate-400">{total} listing{total === 1 ? '' : 's'}</p>
            </div>
          </div>

          {/* Subcategory chips */}
          {category.children.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
              {category.children.map((sub) => (
                <Link
                  key={sub.slug}
                  href={`/categories/${sub.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                >
                  <span>{sub.icon}</span>
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-10">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-36 sm:h-48 w-full" />
                <div className="p-3 space-y-2">
                  <div className="bg-gray-200 h-4 rounded" />
                  <div className="bg-gray-200 h-3 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 max-w-sm rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-orange-300 mx-auto mb-3" />
              <p className="text-slate-700 text-base font-semibold mb-1">No listings yet in {category.name}</p>
              <p className="text-slate-400 text-sm mb-5">Be the first to list something here.</p>
              <Link
                href="/products/new"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm"
              >
                Sell an Item
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={'/products/' + product.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer relative border border-transparent hover:border-slate-200"
                >
                  <button
                    onClick={(e) => handleToggleFavorite(e, product.id)}
                    className="absolute top-2.5 right-2.5 z-10 bg-white/95 rounded-full p-2.5 shadow-sm backdrop-blur-sm"
                    aria-label="Save to favorites"
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  </button>
                  <div className="relative bg-slate-100 h-36 sm:h-48 w-full flex items-center justify-center overflow-hidden">
                    {product.images.length > 0 ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, 300px" />
                    ) : (
                      <Tag className="w-10 h-10 text-slate-300" />
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="font-bold text-slate-900 text-base">Rs.{product.price.toLocaleString('en-IN')}</p>
                    <p className="text-slate-600 text-xs sm:text-sm truncate mt-1">{product.title}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1.5">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatLocation(product)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {CONDITION_CHIP[product.condition] && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CONDITION_CHIP[product.condition].cls}`}>
                          {CONDITION_CHIP[product.condition].label}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">{relativeTime(product.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <button
                        key={`page-${p}`}
                        onClick={() => goToPage(p as number)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                          page === p ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-orange-300'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2.5 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Search, MapPin, Tag, Heart, SlidersHorizontal, ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import TrendingProducts from '@/components/trending/TrendingProducts'
import api from '@/lib/api'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'

const CATEGORIES = [
  { name: 'Electronics', icon: '📱', slug: 'electronics' },
  { name: 'Cars',        icon: '🚗', slug: 'cars' },
  { name: 'Furniture',   icon: '🛋️', slug: 'furniture' },
  { name: 'Fashion',     icon: '👗', slug: 'fashion' },
  { name: 'Books',       icon: '📚', slug: 'books' },
  { name: 'Sports',      icon: '⚽', slug: 'sports' },
  { name: 'Home',        icon: '🏠', slug: 'home' },
  { name: 'Jobs',        icon: '💼', slug: 'jobs' },
  { name: 'Pets',        icon: '🐾', slug: 'pets' },
  { name: 'Other',       icon: '📦', slug: 'other' },
]

const SORT_OPTIONS = [
  { label: 'Newest',        value: 'createdAt_desc' },
  { label: 'Oldest',        value: 'createdAt_asc' },
  { label: 'Price: Low',    value: 'price_asc' },
  { label: 'Price: High',   value: 'price_desc' },
]

function HomeContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  const [products, setProducts]   = useState<Product[]>([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showTrending, setShowTrending] = useState(false)

  // Filter/sort state
  const [sortBy, setSortBy]       = useState('createdAt_desc')
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')

  // Pagination
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]         = useState(0)

  useEffect(() => {
    const category = searchParams.get('category') || ''
    const q        = searchParams.get('search')   || ''
    setActiveCategory(category)
    setSearch(q)
    setPage(1)
    fetchProducts(category, q, 1, sortBy, minPrice, maxPrice)
  }, [searchParams])

  useEffect(() => {
    if (isLoggedIn) fetchFavorites()
  }, [isLoggedIn])

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorites(new Set(res.data.products.map((p: Product) => p.id)))
    } catch { /* ignore */ }
  }

  const fetchProducts = async (
    category = activeCategory, q = search,
    p = page, sort = sortBy, min = minPrice, max = maxPrice
  ) => {
    try {
      setLoading(true)
      const [field, order] = sort.split('_')
      let url = `/products?page=${p}&limit=20&sortBy=${field}&order=${order}`
      if (category) url += '&category=' + category
      if (q)        url += '&search='   + encodeURIComponent(q)
      if (min)      url += '&minPrice=' + min
      if (max)      url += '&maxPrice=' + max
      const res = await api.get(url)
      setProducts(res.data.products)
      setTotalPages(res.data.pagination.totalPages)
      setTotal(res.data.pagination.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(search.trim() ? '/?search=' + encodeURIComponent(search.trim()) : '/')
  }

  const handleCategoryClick = (slug: string) => {
    router.push(activeCategory === slug ? '/' : '/?category=' + slug)
  }

  const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    if (!isLoggedIn) { window.location.href = '/login'; return }
    try {
      const res = await api.post('/favorites/' + productId)
      setFavorites(prev => {
        const next = new Set(prev)
        res.data.favorited ? next.add(productId) : next.delete(productId)
        return next
      })
    } catch { /* ignore */ }
  }

  const applyFilters = () => {
    setPage(1)
    fetchProducts(activeCategory, search, 1, sortBy, minPrice, maxPrice)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setSortBy('createdAt_desc')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
    fetchProducts(activeCategory, search, 1, 'createdAt_desc', '', '')
    setShowFilters(false)
  }

  const goToPage = (p: number) => {
    setPage(p)
    fetchProducts(activeCategory, search, p, sortBy, minPrice, maxPrice)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Buy and Sell Locally</h1>
          <p className="text-orange-100 text-lg mb-8 leading-relaxed">Find great deals on second-hand items near you</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search phones, cars, furniture..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-slate-900 border border-white/50 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent"
              />
            </div>
            <button type="submit" className="inline-flex justify-center items-center bg-white text-orange-600 font-semibold px-8 py-3.5 rounded-2xl shadow-lg hover:bg-slate-50 transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Browse by Category</h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.slug} onClick={() => handleCategoryClick(cat.slug)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer ${activeCategory === cat.slug ? 'bg-orange-50 text-orange-600 scale-105' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
          {activeCategory && (
            <div className="mt-6 inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
              <span className="text-sm font-medium text-orange-900">
                {CATEGORIES.find(c => c.slug === activeCategory)?.icon} {CATEGORIES.find(c => c.slug === activeCategory)?.name}
              </span>
              <button onClick={() => router.push('/')} className="text-xs font-medium text-orange-600 hover:text-orange-700 ml-1">×</button>
            </div>
          )}
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-10">

        {/* Header row with sort/filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeCategory ? CATEGORIES.find(c => c.slug === activeCategory)?.name + ' Listings' : 'Fresh Recommendations'}
            {!loading && <span className="text-sm text-gray-400 font-normal ml-2">({total})</span>}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowTrending(t => !t)}
              className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors " + (showTrending ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300')}>
              <Flame className="w-4 h-4" />
              Trending
              <span className={"text-xs px-1.5 py-0.5 rounded-full " + (showTrending ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-600')}>Live</span>
            </button>
            <button onClick={() => setShowFilters(f => !f)}
            className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-colors " + (showFilters ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300')}>
            <SlidersHorizontal className="w-4 h-4" />
            Filter & Sort
            </button>
          </div>
        </div>

        {/* Trending panel */}
        {showTrending && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-orange-100">
            <TrendingProducts onClose={() => setShowTrending(false)} />
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (Rs.)</label>
                <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (Rs.)</label>
                <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={applyFilters} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl text-sm font-medium transition-colors">Apply</button>
                <button onClick={resetFilters} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:border-gray-300 transition-colors">Reset</button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-3 space-y-2">
                  <div className="bg-gray-200 h-4 rounded" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 max-w-md rounded-3xl border border-dashed border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-slate-500 text-lg">No listings found</p>
              <Link href="/products/new" className="mt-4 inline-flex bg-orange-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-orange-600 transition-colors">
                Post the first listing!
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map(product => (
                <Link key={product.id} href={"/products/" + product.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer relative border border-transparent hover:border-slate-200">
                  <button onClick={e => handleToggleFavorite(e, product.id)}
                    className="absolute top-3 right-3 z-10 bg-white/95 rounded-full p-2 shadow-sm backdrop-blur-sm">
                    <Heart className={"w-4 h-4 " + (favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
                  </button>
                  <div className="bg-slate-100 h-48 w-full flex items-center justify-center overflow-hidden">
                    {product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Tag className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 text-lg">Rs.{product.price.toLocaleString('en-IN')}</p>
                    <p className="text-slate-600 text-sm truncate mt-2">{product.title}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{product.city}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button key={`page-${p}`} onClick={() => goToPage(p as number)}
                      className={"w-9 h-9 rounded-xl text-sm font-medium transition-colors " + (page === p ? 'bg-orange-500 text-white' : 'border border-gray-200 text-gray-600 hover:border-orange-300')}>
                      {p}
                    </button>
                  ))}
                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-orange-500 h-40" />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-8">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-3 space-y-2">
                  <div className="bg-gray-200 h-4 rounded" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

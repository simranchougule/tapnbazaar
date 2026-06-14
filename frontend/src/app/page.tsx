'use client'

import Image from 'next/image'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import LocationSelector from '@/components/LocationSelector'
import { Search, MapPin, Navigation, Tag, Heart, SlidersHorizontal, ChevronLeft, ChevronRight, Flame, ShoppingBag, Plus } from 'lucide-react'
import TrendingProducts from '@/components/trending/TrendingProducts'
import api from '@/lib/api'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: 'Newest',      value: 'createdAt_desc' },
  { label: 'Oldest',      value: 'createdAt_asc' },
  { label: 'Price: Low',  value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
]

const CATEGORY_ORDER = [
  'vehicles', 'electronics', 'property', 'fashion',
  'furniture', 'jobs', 'pets', 'sports', 'kids',
  'education', 'services', 'agriculture',
]

// Popular localities shown as chips per city
const POPULAR_LOCALITIES: Record<string, string[]> = {
  Pune:      ['Wakad', 'Baner', 'Hinjewadi', 'Aundh', 'Kothrud', 'Viman Nagar'],
  Mumbai:    ['Andheri', 'Bandra', 'Powai', 'Thane', 'Kurla', 'Dadar'],
  Bangalore: ['Koramangala', 'Indiranagar', 'Whitefield', 'HSR Layout', 'Jayanagar'],
  Delhi:     ['Dwarka', 'Rohini', 'Lajpat Nagar', 'Saket', 'Vasant Kunj'],
  Hyderabad: ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Madhapur', 'Kondapur'],
  Chennai:   ['Anna Nagar', 'T. Nagar', 'Velachery', 'Adyar', 'Porur'],
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SelectedLocation {
  state?: string
  city?: string
  locality?: string
}

interface SubCategory { id: string; name: string; slug: string; icon: string }
interface Category    { id: string; name: string; slug: string; icon: string; children: SubCategory[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 60)   return mins <= 1 ? 'Just now' : `${mins} mins ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)   return `${hrs} hr${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 30)   return `${days} day${days > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}

const CONDITION_CHIP: Record<string, { label: string; cls: string }> = {
  NEW:      { label: 'Brand New', cls: 'bg-green-100 text-green-700' },
  LIKE_NEW: { label: 'Like New',  cls: 'bg-emerald-100 text-emerald-700' },
  GOOD:     { label: 'Good',      cls: 'bg-orange-100 text-orange-700' },
  FAIR:     { label: 'Fair',      cls: 'bg-yellow-100 text-yellow-700' },
  POOR:     { label: 'Poor',      cls: 'bg-gray-100 text-gray-500' },
}

function formatLocation(product: any): string {
  const parts: string[] = []
  if (product.locality) parts.push(product.locality)
  if (product.city)     parts.push(product.city)
  return parts.join(', ') || 'India'
}

// ─── Inner Page ───────────────────────────────────────────────────────────────

function HomeContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  // location
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({})
  const [activeLocalityChip, setActiveLocalityChip] = useState<string | null>(null)

  // products
  const [products, setProducts]     = useState<Product[]>([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [favorites, setFavorites]   = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters]   = useState(false)
  const [showTrending, setShowTrending] = useState(false)
  const [sortBy, setSortBy]       = useState('createdAt_desc')
  const [minPrice, setMinPrice]   = useState('')
  const [maxPrice, setMaxPrice]   = useState('')
  const [condition, setCondition] = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)

  // nearby
  const [nearbyProducts, setNearbyProducts]   = useState<Product[]>([])
  const [nearbyLoading, setNearbyLoading]     = useState(false)
  const [userLat, setUserLat]                 = useState<number | null>(null)
  const [userLng, setUserLng]                 = useState<number | null>(null)
  const [nearbyRadius, setNearbyRadius]       = useState(25)
  const [showNearby, setShowNearby]           = useState(false)
  const [gpsError, setGpsError]               = useState<string | null>(null)

  // categories
  const [categories, setCategories] = useState<Category[]>([])

  // Popular localities for the selected city
 const popularLocalities =
  selectedLocation.city
    ? (POPULAR_LOCALITIES[selectedLocation.city] ?? []).filter(
        l => l !== selectedLocation.locality
      )
    : []

  // ── Fetch categories ──
  useEffect(() => {
    api.get('/categories').then(res => {
      const sorted = [...res.data.categories].sort((a: Category, b: Category) => {
        const ai = CATEGORY_ORDER.indexOf(a.slug)
        const bi = CATEGORY_ORDER.indexOf(b.slug)
        if (ai === -1 && bi === -1) return a.name.localeCompare(b.name)
        if (ai === -1) return 1
        if (bi === -1) return -1
        return ai - bi
      })
      setCategories(sorted)
    }).catch(() => {})
  }, [])

  // ── Sync URL search params ──
  useEffect(() => {
    const category = searchParams.get('category') || ''
    const q        = searchParams.get('search')   || ''
    const city     = searchParams.get('city')     || ''
    const locality = searchParams.get('locality') || ''
    setActiveCategory(category)
    setSearch(q)
    if (city || locality) {
      setSelectedLocation(prev => ({
        ...prev,
        ...(city ? { city } : {}),
        ...(locality ? { locality } : {}),
      }))
    }
    setPage(1)
    fetchProducts(category, q, 1, sortBy, minPrice, maxPrice, city, locality)
  }, [searchParams])

  // ── Favorites ──
  useEffect(() => {
    if (isLoggedIn) fetchFavorites()
  }, [isLoggedIn])

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorites(new Set(res.data.products.map((p: Product) => p.id)))
    } catch { /* ignore */ }
  }

  // ── Nearby ──
  const fetchNearby = (lat: number, lng: number, radius = 25) => {
    setNearbyLoading(true)
    api.get(`/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=10`)
      .then(res => setNearbyProducts(res.data.products))
      .catch(() => {})
      .finally(() => setNearbyLoading(false))
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser.')
      return
    }
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setShowNearby(true)
        fetchNearby(pos.coords.latitude, pos.coords.longitude, nearbyRadius)
      },
      () => setGpsError('Location access denied. Enable it in browser settings.')
    )
  }

  // ── Products ──
  const fetchProducts = async (
    category = activeCategory,
    q = search,
    p = page,
    sort = sortBy,
    min = minPrice,
    max = maxPrice,
    city = selectedLocation.city ?? '',
    locality = activeLocalityChip ?? selectedLocation.locality ?? '',
    cond = condition,
  ) => {
    try {
      setLoading(true)
      const [field, order] = sort.split('_')
      let url = `/products?page=${p}&limit=20&sortBy=${field}&order=${order}`
      if (category)  url += '&category='  + category
      if (q)         url += '&search='    + encodeURIComponent(q)
      if (min)       url += '&minPrice='  + min
      if (max)       url += '&maxPrice='  + max
      if (city && city !== 'All India') url += '&city=' + encodeURIComponent(city)
      if (locality)  url += '&locality='  + encodeURIComponent(locality)
      if (cond)      url += '&condition=' + cond
      const res = await api.get(url)
      setProducts(res.data.products)
      setTotalPages(res.data.pagination.totalPages)
      setTotal(res.data.pagination.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  // ── Location change from LocationSelector ──
  const handleLocationChange = (loc: SelectedLocation) => {
    setSelectedLocation(loc)
    setActiveLocalityChip(null)
    setPage(1)
    fetchProducts(
      activeCategory, search, 1, sortBy, minPrice, maxPrice,
      loc.city ?? '', loc.locality ?? '',
    )
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (loc.city && loc.city !== 'All India') params.set('city', loc.city)
    if (loc.locality) params.set('locality', loc.locality)
    router.push(params.toString() ? '/?' + params.toString() : '/')
  }

  // ── Locality chip ──
  const handleLocalityChip = (locality: string) => {
    const next = activeLocalityChip === locality ? null : locality
    setActiveLocalityChip(next)
    setPage(1)
    fetchProducts(
      activeCategory, search, 1, sortBy, minPrice, maxPrice,
      selectedLocation.city ?? '', next ?? selectedLocation.locality ?? '',
    )
  }

  // ── Search ──
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (selectedLocation.city && selectedLocation.city !== 'All India')
      params.set('city', selectedLocation.city)
    if (selectedLocation.locality) params.set('locality', selectedLocation.locality)
    router.push(params.toString() ? '/?' + params.toString() : '/')
  }

  // ── Category ──
  const handleCategoryClick = (slug: string) => {
    router.push(activeCategory === slug ? '/' : '/?category=' + slug)
  }

  // ── Favorites toggle ──
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

  // ── Filters ──
  const applyFilters = () => {
    setPage(1)
    fetchProducts(activeCategory, search, 1, sortBy, minPrice, maxPrice, selectedLocation.city ?? '', activeLocalityChip ?? selectedLocation.locality ?? '', condition)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setSortBy('createdAt_desc')
    setMinPrice('')
    setMaxPrice('')
    setCondition('')
    setPage(1)
    fetchProducts(activeCategory, search, 1, 'createdAt_desc', '', '', selectedLocation.city ?? '', activeLocalityChip ?? selectedLocation.locality ?? '', '')
    setShowFilters(false)
  }

  // ── Pagination ──
  const goToPage = (p: number) => {
    setPage(p)
    fetchProducts(activeCategory, search, p, sortBy, minPrice, maxPrice)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeCategoryData =
    categories.find(c => c.slug === activeCategory) ||
    categories.flatMap(c => c.children).find(c => c.slug === activeCategory)

  // ── Listings heading ──
  const listingsHeading = (() => {
    const loc = activeLocalityChip ?? selectedLocation.locality
    if (loc) return `Listings in ${loc}`
    if (selectedLocation.city) return `Listings in ${selectedLocation.city}`
    if (selectedLocation.state) return `Listings in ${selectedLocation.state}`
    if (activeCategory && activeCategoryData) return activeCategoryData.name + ' Listings'
    return 'Discover Products'
  })()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Buy and Sell Locally</h1>
          <p className="text-orange-100 text-lg mb-8 leading-relaxed font-medium">
            Buy New, Sell Used. All in One Place
          </p>

          {/* LocationSelector — replaces old city dropdown */}
          <div className="mb-3 max-w-3xl mx-auto">
            <LocationSelector
              value={selectedLocation}
              onChange={handleLocationChange}
            />
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex w-full rounded-2xl border border-white/30 bg-white shadow-lg
                            focus-within:ring-2 focus-within:ring-white/50 transition-all overflow-hidden">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={
                  (activeLocalityChip ?? selectedLocation.locality)
                    ? `Search in ${activeLocalityChip ?? selectedLocation.locality}…`
                    : selectedLocation.city
                    ? `Search in ${selectedLocation.city}…`
                    : 'Search phones, cars, furniture…'
                }
                className="flex-1 px-4 py-3.5 text-slate-900 text-sm focus:outline-none bg-white"
              />
              <button
                type="submit"
                className="px-6 bg-white hover:bg-slate-50 text-orange-500 font-semibold transition-colors
                           flex items-center gap-2 flex-shrink-0 border-l border-gray-200"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:block text-gray-700">Search</span>
              </button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5
                         rounded-xl text-sm font-semibold transition-colors border border-white/30"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </button>
            <Link
              href="/products/new"
              className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5
                         rounded-xl text-sm font-semibold transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              Start Selling
            </Link>
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Browse by Category</h2>
            <Link href="/categories" className="text-sm text-orange-500 hover:underline font-medium flex items-center gap-1">
              All Categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer ${
                  activeCategory === cat.slug
                    ? 'bg-orange-50 text-orange-600 scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-500'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {activeCategory && activeCategoryData && (
            <div className="mt-4 inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl border border-orange-200">
              <span className="text-sm font-medium text-orange-900">
                {activeCategoryData.icon}{' '}{activeCategoryData.name}
              </span>
              <button onClick={() => router.push('/')} className="text-xs font-medium text-orange-600 hover:text-orange-700 ml-1">×</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Products Near You ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* Header row: icon+title on left, radius select on right (desktop) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0 bg-orange-50 rounded-xl flex items-center justify-center">
              <Navigation className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-800">Products Near You</h2>
              <p className="text-xs text-gray-400">Find listings close to your location</p>
            </div>
            {showNearby && (
              <select
                value={nearbyRadius}
                onChange={e => {
                  const r = Number(e.target.value)
                  setNearbyRadius(r)
                  if (userLat && userLng) fetchNearby(userLat, userLng, r)
                }}
                className="hidden sm:block px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-500 flex-shrink-0"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
              </select>
            )}
          </div>

          {/* On mobile: radius select + detect button stacked below header */}
          <div className="mt-3 flex gap-2">
            {showNearby && (
              <select
                value={nearbyRadius}
                onChange={e => {
                  const r = Number(e.target.value)
                  setNearbyRadius(r)
                  if (userLat && userLng) fetchNearby(userLat, userLng, r)
                }}
                className="sm:hidden flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-500"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
              </select>
            )}
            <button
              onClick={handleDetectLocation}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                showNearby
                  ? 'bg-orange-500 text-white flex-shrink-0'
                  : 'w-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {showNearby ? 'Refresh' : 'Detect Location'}
            </button>
          </div>

          {gpsError && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              ⚠️ {gpsError}
            </p>
          )}

          {showNearby && (
            <div className="mt-4">
              {nearbyLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
                  ))}
                </div>
              ) : nearbyProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No listings found within {nearbyRadius} km</p>
                  <p className="text-xs mt-1">Try increasing the radius or post a listing in your area</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {nearbyProducts.map((product: any) => (
                    <Link
                      key={product.id}
                      href={'/products/' + product.id}
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-100"
                    >
                      <div className="relative h-32 bg-gray-100 overflow-hidden">
                        {product.images.length > 0 ? (
                          <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="200px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-gray-900 text-sm">Rs.{product.price.toLocaleString('en-IN')}</p>
                        <p className="text-gray-600 text-xs truncate mt-0.5">{product.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatLocation(product)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Navigation className="w-3 h-3 text-orange-400" />
                          <span className="text-xs text-orange-500 font-medium">{product.distance?.toFixed(1)} km away</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Listings ── */}
      <div id="listings-section" className="max-w-7xl mx-auto px-4 py-8 pb-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {listingsHeading}
            {!loading && <span className="text-sm text-gray-400 font-normal ml-2">({total})</span>}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTrending(t => !t)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                showTrending
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              <Flame className="w-4 h-4 flex-shrink-0" />
              <span>Trending</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${showTrending ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-600'}`}>Live</span>
            </button>
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-colors ${
                showFilters
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
              <span>Filter & Sort</span>
            </button>
          </div>
        </div>

        {showTrending && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-orange-100">
            <TrendingProducts onClose={() => setShowTrending(false)} />
          </div>
        )}

        {showFilters && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="">All Conditions</option>
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (Rs.)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (Rs.)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
              <div className="flex items-end gap-2 col-span-2 sm:col-span-1">
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
              <ShoppingBag className="w-12 h-12 text-orange-300 mx-auto mb-3" />
              <p className="text-slate-700 text-lg font-semibold mb-1">No listings found</p>
              <p className="text-slate-400 text-sm mb-5">Try a different location or search term.</p>
              <div className="flex gap-3 justify-center">
                <Link href="/" className="inline-flex items-center gap-2 border border-orange-500 text-orange-500 px-5 py-2.5 rounded-xl font-medium hover:bg-orange-50 transition-colors text-sm">
                  <ShoppingBag className="w-4 h-4" />
                  Browse All
                </Link>
                <Link href="/products/new" className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  Sell an Item
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product: any) => (
                <Link
                  key={product.id}
                  href={'/products/' + product.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200
                             transform hover:-translate-y-0.5 cursor-pointer relative border border-transparent hover:border-slate-200"
                >
                  <button
                    onClick={e => handleToggleFavorite(e, product.id)}
                    className="absolute top-3 right-3 z-10 bg-white/95 rounded-full p-2 shadow-sm backdrop-blur-sm"
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                  </button>
                  <div className="relative bg-slate-100 h-48 w-full flex items-center justify-center overflow-hidden">
                    {product.images.length > 0 ? (
                      <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="300px" />
                    ) : (
                      <Tag className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 text-lg">Rs.{product.price.toLocaleString('en-IN')}</p>
                    <p className="text-slate-600 text-sm truncate mt-2">{product.title}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                      <MapPin className="w-3 h-3" />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
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
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
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
                  className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:border-orange-300 transition-colors"
                >
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

// ─── Export ───────────────────────────────────────────────────────────────────

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

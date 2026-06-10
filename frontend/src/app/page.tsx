'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Search, MapPin, Navigation, Tag, Heart, SlidersHorizontal, ChevronLeft, ChevronRight, Flame, ChevronDown, ShoppingBag, Plus } from 'lucide-react'
import TrendingProducts from '@/components/trending/TrendingProducts'
import api from '@/lib/api'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'

const CITIES = [
  'All India', 'Mumbai', 'Delhi', 'Bangalore',
  'Pune', 'Hyderabad', 'Chennai', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow',
]

const SORT_OPTIONS = [
  { label: 'Newest',      value: 'createdAt_desc' },
  { label: 'Oldest',      value: 'createdAt_asc' },
  { label: 'Price: Low',  value: 'price_asc' },
  { label: 'Price: High', value: 'price_desc' },
]

const CATEGORY_ORDER = [
  'vehicles', 'electronics', 'property', 'fashion',
  'furniture', 'jobs', 'pets', 'sports', 'kids',
  'education', 'services', 'agriculture'
]

interface SubCategory { id: string; name: string; slug: string; icon: string }
interface Category    { id: string; name: string; slug: string; icon: string; children: SubCategory[] }

function HomeContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  const [products, setProducts]     = useState<Product[]>([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [favorites, setFavorites]   = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters]   = useState(false)
  const [showTrending, setShowTrending] = useState(false)
  const [showCities, setShowCities]     = useState(false)
  const [selectedCity, setSelectedCity] = useState('All India')
  const [sortBy, setSortBy]     = useState('createdAt_desc')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [page, setPage]             = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]           = useState(0)
  const [nearbyProducts, setNearbyProducts]   = useState<Product[]>([])
  const [nearbyLoading, setNearbyLoading]     = useState(false)
  const [userLat, setUserLat]                 = useState<number | null>(null)
  const [userLng, setUserLng]                 = useState<number | null>(null)
  const [nearbyRadius, setNearbyRadius]       = useState(25)
  const [showNearby, setShowNearby]           = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch categories from API
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

  useEffect(() => {
    const category = searchParams.get('category') || ''
    const q        = searchParams.get('search')   || ''
    const city     = searchParams.get('city')     || ''
    setActiveCategory(category)
    setSearch(q)
    if (city) setSelectedCity(city)
    setPage(1)
    fetchProducts(category, q, 1, sortBy, minPrice, maxPrice, city)
  }, [searchParams])

  useEffect(() => {
    if (isLoggedIn) fetchFavorites()
  }, [isLoggedIn])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.city-dropdown')) setShowCities(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorites(new Set(res.data.products.map((p: Product) => p.id)))
    } catch { /* ignore */ }
  }

  const fetchNearby = async (lat: number, lng: number, radius = 25) => {
    try {
      setNearbyLoading(true)
      const res = await api.get(`/products/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=10`)
      setNearbyProducts(res.data.products)
    } catch { /* ignore */ }
    finally { setNearbyLoading(false) }
  }

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserLat(pos.coords.latitude)
        setUserLng(pos.coords.longitude)
        setShowNearby(true)
        fetchNearby(pos.coords.latitude, pos.coords.longitude, nearbyRadius)
      },
      () => {}
    )
  }

  const fetchProducts = async (
    category = activeCategory, q = search, p = page,
    sort = sortBy, min = minPrice, max = maxPrice, city = selectedCity
  ) => {
    try {
      setLoading(true)
      const [field, order] = sort.split('_')
      let url = `/products?page=${p}&limit=20&sortBy=${field}&order=${order}`
      if (category) url += '&category=' + category
      if (q)        url += '&search='   + encodeURIComponent(q)
      if (min)      url += '&minPrice=' + min
      if (max)      url += '&maxPrice=' + max
      if (city && city !== 'All India') url += '&city=' + encodeURIComponent(city)
      const res = await api.get(url)
      setProducts(res.data.products)
      setTotalPages(res.data.pagination.totalPages)
      setTotal(res.data.pagination.total)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setShowCities(false)
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (city !== 'All India') params.set('city', city)
    router.push(params.toString() ? '/?' + params.toString() : '/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (selectedCity !== 'All India') params.set('city', selectedCity)
    router.push(params.toString() ? '/?' + params.toString() : '/')
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
    fetchProducts(activeCategory, search, 1, sortBy, minPrice, maxPrice, selectedCity)
    setShowFilters(false)
  }

  const resetFilters = () => {
    setSortBy('createdAt_desc')
    setMinPrice('')
    setMaxPrice('')
    setPage(1)
    fetchProducts(activeCategory, search, 1, 'createdAt_desc', '', '', selectedCity)
    setShowFilters(false)
  }

  const goToPage = (p: number) => {
    setPage(p)
    fetchProducts(activeCategory, search, p, sortBy, minPrice, maxPrice, selectedCity)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeCategoryData = categories.find(c => c.slug === activeCategory)
    || categories.flatMap(c => c.children).find(c => c.slug === activeCategory)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-4 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Buy and Sell Locally</h1>
          <p className="text-orange-100 text-lg mb-8 leading-relaxed font-medium">Buy New, Sell Used. All in One Place</p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex w-full rounded-2xl border border-white/30 bg-white shadow-lg focus-within:ring-2 focus-within:ring-white/50 transition-all" style={{overflow: 'visible'}}>

              {/* City Dropdown */}
              <div className="relative city-dropdown flex-shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowCities(!showCities) }}
                  className="flex items-center gap-1.5 px-4 py-3.5 border-r border-gray-200 rounded-l-2xl bg-white hover:bg-slate-50 transition-colors min-w-fit h-full"
                >
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium max-w-24 truncate">{selectedCity}</span>
                  <ChevronDown className={"w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 " + (showCities ? 'rotate-180' : '')} />
                </button>
                {showCities && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[200] w-48 py-1 max-h-64 overflow-y-auto">
                    <p className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider border-b border-gray-50">Select City</p>
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleCitySelect(city) }}
                        className={"w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 " + (selectedCity === city ? 'text-orange-500 font-semibold bg-orange-50' : 'text-gray-600')}
                      >
                        <span>{city === 'All India' ? '🌍' : '📍'}</span>
                        <span>{city}</span>
                        {selectedCity === city && <span className="ml-auto text-orange-500">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search phones, cars, furniture..."
                className="flex-1 px-4 py-3.5 text-slate-900 text-sm focus:outline-none bg-white rounded-none"
              />

              {/* Search Button */}
              <button
                type="submit"
                className="px-6 bg-white hover:bg-slate-50 text-orange-500 font-semibold transition-colors flex items-center gap-2 flex-shrink-0 rounded-r-2xl border-l border-gray-200"
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
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-white/30"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </button>
            <Link href="/products/new" className="flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md">
              <Plus className="w-4 h-4" />
              Start Selling
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
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
                className={"flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer " + (activeCategory === cat.slug ? 'bg-orange-50 text-orange-600 scale-105' : 'bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-orange-500')}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{cat.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Active category filter badge */}
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


      {/* Near You Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Products Near You</h2>
                <p className="text-xs text-gray-400">Find listings close to your location</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showNearby && (
                <select value={nearbyRadius} onChange={e => { setNearbyRadius(Number(e.target.value)); if (userLat && userLng) fetchNearby(userLat, userLng, Number(e.target.value)) }}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-orange-500">
                  <option value={5}>Within 5 km</option>
                  <option value={10}>Within 10 km</option>
                  <option value={25}>Within 25 km</option>
                  <option value={50}>Within 50 km</option>
                  <option value={100}>Within 100 km</option>
                </select>
              )}
              <button onClick={handleDetectLocation}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showNearby ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}>
                <Navigation className="w-4 h-4" />
                {showNearby ? 'Refresh' : 'Detect Location'}
              </button>
            </div>
          </div>

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
                    <Link key={product.id} href={'/products/' + product.id}
                      className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-shadow border border-gray-100">
                      <div className="h-32 bg-gray-100 overflow-hidden">
                        {product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" onError={(e: any) => { e.target.src = '/placeholder.png' }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><MapPin className="w-8 h-8 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-gray-900 text-sm">Rs.{product.price.toLocaleString('en-IN')}</p>
                        <p className="text-gray-600 text-xs truncate mt-0.5">{product.title}</p>
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

      {/* Listings */}
      <div id="listings-section" className="max-w-7xl mx-auto px-4 py-8 pb-10">

        {/* Header row with sort/filter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeCategory && activeCategoryData ? activeCategoryData.name + ' Listings' : 'Discover Products'}
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
              <ShoppingBag className="w-12 h-12 text-orange-300 mx-auto mb-3" />
              <p className="text-slate-700 text-lg font-semibold mb-1">No listings found</p>
              <p className="text-slate-400 text-sm mb-5">Buy great products or start selling your own items.</p>
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
              {products.map(product => (
                <Link key={product.id} href={"/products/" + product.id}
                  className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer relative border border-transparent hover:border-slate-200">
                  <button onClick={e => handleToggleFavorite(e, product.id)}
                    className="absolute top-3 right-3 z-10 bg-white/95 rounded-full p-2 shadow-sm backdrop-blur-sm">
                    <Heart className={"w-4 h-4 " + (favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-400')} />
                  </button>
                  <div className="bg-slate-100 h-48 w-full flex items-center justify-center overflow-hidden">
                    {product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Tag className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 text-lg">Rs.{product.price.toLocaleString('en-IN')}</p>
                    <p className="text-slate-600 text-sm truncate mt-2">{product.title}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{product.city}</span>
                      </div>
                      <span className="text-xs text-orange-500 font-medium">Buy Now →</span>
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

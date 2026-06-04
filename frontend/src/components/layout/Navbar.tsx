'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Plus, User, LogOut, Heart, MessageCircle, ShieldCheck, Search, MapPin, ChevronDown, Menu, X } from 'lucide-react'
import api from '@/lib/api'

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

const CITIES = [
  'All India', 'Mumbai', 'Delhi', 'Bangalore',
  'Pune', 'Hyderabad', 'Chennai', 'Kolkata',
  'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow',
]

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout, loadFromStorage } = useAuthStore()

  const [unread, setUnread]             = useState(0)
  const [search, setSearch]             = useState('')
  const [mobileMenu, setMobileMenu]     = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [showCities, setShowCities]     = useState(false)
  const [selectedCity, setSelectedCity] = useState('All India')

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
  }, [isLoggedIn])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.city-dropdown')) {
        setShowCities(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push('/?search=' + encodeURIComponent(search))
      setMobileMenu(false)
    }
  }

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    setShowCities(false)
    if (city === 'All India') {
      router.push('/')
    } else {
      router.push('/?city=' + encodeURIComponent(city))
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className={"sticky top-0 z-50 transition-all duration-200 " + (scrolled ? 'shadow-md' : 'shadow-sm')}>

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-orange-200 transition-all">
                  <span className="text-white font-black text-lg">T</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-white font-bold" style={{fontSize: '7px'}}>B</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="font-black text-xl text-gray-900 tracking-tight">
                  tapn<span className="text-orange-500">bazaar</span>
                </span>
                <p className="text-xs text-gray-400 -mt-1">Buy. Sell. Locally.</p>
              </div>
            </Link>

            {/* Search Bar — desktop only */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
              <div className="flex w-full rounded-xl border border-gray-200 hover:border-orange-400 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 transition-all">

                {/* City Dropdown */}
                <div className="relative city-dropdown">
                  <button
                    type="button"
                    onClick={() => setShowCities(!showCities)}
                    className="flex items-center gap-1.5 px-3 py-2.5 border-r border-gray-200 rounded-l-xl bg-gray-50 hover:bg-gray-100 transition-colors min-w-fit"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 font-medium max-w-20 truncate">
                      {selectedCity}
                    </span>
                    <ChevronDown className={"w-3 h-3 text-gray-400 transition-transform flex-shrink-0 " + (showCities ? 'rotate-180' : '')} />
                  </button>

                  {showCities && (
                    <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-[100] w-48 py-1 max-h-64 overflow-y-auto">
                      <p className="text-xs text-gray-400 px-3 py-2 font-semibold uppercase tracking-wider border-b border-gray-50">
                        Select City
                      </p>
                      {CITIES.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={"w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-orange-50 hover:text-orange-600 flex items-center gap-2 " + (selectedCity === city ? 'text-orange-500 font-semibold bg-orange-50' : 'text-gray-600')}
                        >
                          <span>{city === 'All India' ? '🌍' : '📍'}</span>
                          <span>{city}</span>
                          {selectedCity === city && (
                            <span className="ml-auto text-orange-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for mobiles, cars, bikes, furniture..."
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-white"
                />

                {/* Search Button */}
                <button
                  type="submit"
                  className="px-5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white transition-colors flex items-center gap-2 flex-shrink-0 rounded-r-xl"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium hidden lg:block">Search</span>
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">
              {isLoggedIn ? (
                <>
                  {(user as any)?.isAdmin && (
                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1.5 text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Link>
                  )}

                  <Link
                    href="/products/new"
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:block">Sell Now</span>
                  </Link>

                  <Link
                    href="/chats"
                    className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>

                  <Link
                    href="/favorites"
                    className="hidden sm:flex p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-orange-500 px-4 py-2 text-sm font-medium transition-colors rounded-xl hover:bg-orange-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Register
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden p-2.5 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors ml-1"
              >
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Bar — desktop only ── */}
      {!mobileMenu && (
        <div className="bg-white border-b border-gray-100 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={"/?category=" + cat.slug}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all hover:bg-orange-50 hover:text-orange-600 text-gray-600 font-medium"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ── */}
      {mobileMenu && (
        <div className="bg-white border-b border-gray-100 md:hidden">
          <div className="px-4 py-3 space-y-3">

            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-orange-500">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for anything..."
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                />
                <button type="submit" className="px-4 bg-orange-500 text-white">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Mobile Nav Links */}
            {isLoggedIn ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { href: '/products/new', icon: Plus,          label: 'Sell',     color: 'text-orange-500' },
                  { href: '/chats',        icon: MessageCircle, label: 'Messages', color: 'text-blue-500' },
                  { href: '/favorites',    icon: Heart,         label: 'Saved',    color: 'text-red-500' },
                  { href: '/profile',      icon: User,          label: 'Profile',  color: 'text-green-500' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenu(false)}
                    className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <item.icon className={"w-5 h-5 " + item.color} />
                    <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenu(false)}
                  className="flex-1 text-center border border-orange-500 text-orange-500 py-2.5 rounded-xl text-sm font-semibold"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenu(false)}
                  className="flex-1 text-center bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Categories */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Categories
              </p>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={"/?category=" + cat.slug}
                    onClick={() => setMobileMenu(false)}
                    className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-xs text-gray-500 text-center leading-tight">{cat.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
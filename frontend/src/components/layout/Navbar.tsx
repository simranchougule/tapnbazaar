'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Plus, User, LogOut, Heart, MessageCircle, ShieldCheck, Search, X } from 'lucide-react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import NotificationBell from '@/components/NotificationBell'

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout, loadFromStorage } = useAuthStore()

  const [unread, setUnread]         = useState(0)
  const [scrolled, setScrolled]     = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchVal, setSearchVal]   = useState('')

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
    const token = localStorage.getItem('token')
    if (!token) return
    const socket = getSocket(token)
    socket.on('unread_update', () => {
      api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
    })
    if (pathname?.startsWith('/chats')) setUnread(0)
    return () => { socket.off('unread_update') }
  }, [isLoggedIn])

  // Close search bar on route change
  useEffect(() => { setShowSearch(false) }, [pathname])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    setShowSearch(false)
    router.push('/?search=' + encodeURIComponent(searchVal.trim()))
    setSearchVal('')
  }

  const handleSearchIconClick = () => {
    if (pathname === '/') {
      // On home page: focus the existing search bar instead of opening overlay
      const el = document.querySelector<HTMLInputElement>('input[type="text"]')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => el.focus(), 300)
        return
      }
    }
    setShowSearch((v) => !v)
  }

  return (
    <nav className={'sticky top-0 z-50 bg-white transition-all duration-200 ' + (scrolled ? 'shadow-md' : 'shadow-sm')}>
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img
                src="/tapnbazaar-logo.png"
                alt="TapnBazaar"
                className="h-9 sm:h-12 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.removeAttribute('style')
                }}
              />
              <span style={{ display: 'none' }} className="text-lg font-bold text-orange-500">
                TapnBazaar
              </span>
            </Link>

            {/* ── Mobile right side ── */}
            <div className="flex items-center gap-1 ml-auto sm:hidden">
              {/* Search */}
              <button
                onClick={handleSearchIconClick}
                className="p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <>
                  {/* Chat with badge */}
                  <Link href="/chats" className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>

                  {/* Notification bell */}
                  <NotificationBell />

                  {/* Avatar */}
                  <Link href="/profile" className="p-1 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold"
                >
                  Login
                </Link>
              )}
            </div>

            {/* ── Desktop right side ── */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-1 ml-auto">
                {(user as any)?.isAdmin && (
                  <Link href="/admin" className="flex items-center gap-1.5 text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => pathname === '/' ? document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }) : router.push('/')}
                  className="flex items-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                >
                  Buy Now
                </button>
                <Link href="/products/new" className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
                  <Plus className="w-4 h-4" />
                  Sell Now
                </Link>
                <Link href="/chats" className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>
                <Link href="/favorites" className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
                <NotificationBell />
                <Link href="/profile" className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <Link href="/login" className="text-gray-600 hover:text-orange-500 px-4 py-2 text-sm font-medium transition-colors rounded-xl hover:bg-orange-50">Login</Link>
                <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile search overlay bar (non-home pages) ── */}
      {showSearch && (
        <div className="sm:hidden border-b border-gray-100 bg-white px-4 py-2.5 animate-in slide-in-from-top duration-150">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-orange-400 transition-colors">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search phones, cars, furniture…"
                className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              />
              {searchVal && (
                <button type="button" onClick={() => setSearchVal('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex-shrink-0"
            >
              Go
            </button>
          </form>
        </div>
      )}
    </nav>
  )
}
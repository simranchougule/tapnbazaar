'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Plus, User, LogOut, Heart, MessageCircle, ShieldCheck, Search } from 'lucide-react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import NotificationBell from '@/components/NotificationBell'

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout, loadFromStorage } = useAuthStore()

  const [unread, setUnread]   = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch unread count + listen for real-time updates
  useEffect(() => {
    if (!isLoggedIn) return

    // Initial fetch
    api.get('/chats/unread').then(res => { setUnread(res.data.count) }).catch(() => {})

    // Real-time socket update
    const token = localStorage.getItem('token')
    if (!token) return
    const socket = getSocket(token)

    socket.on('unread_update', () => {
      api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
    })

    // Reset badge when on chats page
    if (pathname?.startsWith('/chats')) {
      setUnread(0)
    }

    return () => { socket.off('unread_update') }
  }, [isLoggedIn])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className={"sticky top-0 z-50 bg-white transition-all duration-200 " + (scrolled ? 'shadow-md' : 'shadow-sm')}>
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img src="/tapnbazaar-logo.png" alt="TapnBazaar" className="h-9 sm:h-12 w-auto object-contain" />
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-auto">

              {/* ── Mobile: Search only (bottom nav handles the rest) ── */}
              <div className="flex items-center gap-1 sm:hidden">
                <Link href="/?search=" className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                  <Search className="w-5 h-5" />
                </Link>
                {!isLoggedIn && (
                  <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-sm font-semibold">
                    Login
                  </Link>
                )}
              </div>

              {/* ── Desktop: full action bar ── */}
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center gap-1">
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
                  <Link href="/chats" className="relative p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>
                  <Link href="/favorites" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>
                  <NotificationBell />
                  <Link href="/profile" className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login" className="text-gray-600 hover:text-orange-500 px-4 py-2 text-sm font-medium transition-colors rounded-xl hover:bg-orange-50">Login</Link>
                  <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm">Register</Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

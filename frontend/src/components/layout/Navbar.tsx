'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Plus, User, LogOut, Heart, MessageCircle, ShieldCheck, Menu, X, ShoppingBag } from 'lucide-react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import NotificationBell from '@/components/NotificationBell'

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

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout, loadFromStorage } = useAuthStore()

  const [unread, setUnread]         = useState(0)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [scrolled, setScrolled]     = useState(false)

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
    api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})

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
  }, [isLoggedIn, pathname])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className={"sticky top-0 z-50 transition-all duration-200 " + (scrolled ? 'shadow-md' : 'shadow-sm')}>

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/tapnbazaar-logo.png" alt="TapnBazaar" width={1637} height={723} className="h-16 w-40 object-contain" />
            </Link>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              {isLoggedIn ? (
                <>
                  {user?.isAdmin && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-1.5 text-orange-500 hover:bg-orange-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Link>
                  )}

                  {/* Browse */}
                  <button
                    onClick={() => {
                      if (pathname === '/') {
                        document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' })
                      } else {
                        router.push('/')
                      }
                    }}
                    className="hidden sm:flex items-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:block">Buy Now</span>
                  </button>

                  {/* Sell */}
                  <Link href="/products/new" className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:block">Sell Now</span>
                  </Link>

                  {/* Chat with real-time unread badge */}
                  <Link href="/chats" className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {unread > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </Link>

                  {/* Favorites */}
                  <Link href="/favorites" className="hidden sm:flex p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <Heart className="w-5 h-5" />
                  </Link>

                  {/* Notification Bell — system alerts only */}
                  <div className="hidden sm:block">
                    <NotificationBell />
                  </div>

                  {/* Profile */}
                  <Link href="/profile" className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm flex-shrink-0">
                      {user?.avatar
                        ? <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="32px" />
                        : <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</div>
                      }
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </Link>

                  <button onClick={handleLogout} className="hidden sm:flex p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-orange-500 px-4 py-2 text-sm font-medium transition-colors rounded-xl hover:bg-orange-50">
                    Login
                  </Link>
                  <Link href="/register" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                    Register
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="md:hidden p-2.5 text-gray-500 hover:bg-slate-50 rounded-xl transition-colors ml-1"
              >
                {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="bg-white border-b border-gray-100 md:hidden">
          <div className="px-4 py-3 space-y-3">
            {isLoggedIn ? (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { href: '/',             icon: ShoppingBag,   label: 'Buy',      color: 'text-blue-500' },
                  { href: '/products/new', icon: Plus,          label: 'Sell',     color: 'text-orange-500' },
                  { href: '/chats',        icon: MessageCircle, label: 'Messages', color: 'text-purple-500', badge: unread },
                  { href: '/profile',      icon: User,          label: 'Profile',  color: 'text-green-500' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenu(false)}
                    className="relative flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl hover:bg-orange-50 transition-colors"
                  >
                    <item.icon className={"w-5 h-5 " + item.color} />
                    <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 ? (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" onClick={() => setMobileMenu(false)} className="flex-1 text-center border border-orange-500 text-orange-500 py-2.5 rounded-xl text-sm font-semibold">Login</Link>
                <Link href="/register" onClick={() => setMobileMenu(false)} className="flex-1 text-center bg-orange-500 text-white py-2.5 rounded-xl text-sm font-semibold">Register</Link>
              </div>
            )}

            {/* Mobile Categories */}
            <div>
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Categories</p>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={"/?category=" + cat.slug}
                    onClick={() => setMobileMenu(false)}
                    className="flex flex-col items-center gap-1 p-2 bg-slate-50 rounded-xl hover:bg-orange-50 transition-colors"
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

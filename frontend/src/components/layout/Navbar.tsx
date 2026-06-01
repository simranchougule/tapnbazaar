// src/components/layout/Navbar.tsx
'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Plus, User, LogOut, Heart, MessageCircle, ShieldCheck } from 'lucide-react'
import { getSocket } from '@/lib/socket'
import api from '@/lib/api'
import NotificationBell from '@/components/NotificationBell'
import SearchAutocomplete from '@/components/SearchAutocomplete'

export default function Navbar() {
  const router = useRouter()
  const { user, isLoggedIn, logout, loadFromStorage } = useAuthStore()
  const [unread, setUnread] = useState(0)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) return
    api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
    const token = localStorage.getItem('token')
    if (!token) return
    const socket = getSocket(token)
    socket.on('unread_update', () => {
      api.get('/chats/unread').then(res => setUnread(res.data.count)).catch(() => {})
    })
    return () => { socket.off('unread_update') }
  }, [isLoggedIn])

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-orange-500 text-white font-bold text-xl px-3 py-1 rounded-lg">
              TB
            </div>
            <span className="font-bold text-xl text-gray-800 hidden sm:block">
              TapnBazaar
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <SearchAutocomplete />
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {/* Admin link — only for admins */}
                {(user as any)?.isAdmin && (
                  <Link href="/admin"
                    className="flex items-center gap-1 text-orange-500 hover:text-orange-600 px-3 py-2 rounded-full text-sm transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="hidden sm:block">Admin</span>
                  </Link>
                )}

                {/* Sell button */}
                <Link
                  href="/products/new"
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:block">Sell</span>
                </Link>

                {/* Messages */}
                <Link
                  href="/chats"
                  className="relative flex items-center gap-1 text-gray-600 hover:text-orange-500 px-3 py-2 rounded-full text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:block">Messages</span>
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </span>
                  )}
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* Favorites */}
                <Link
                  href="/favorites"
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500 px-3 py-2 rounded-full text-sm transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:block">Saved</span>
                </Link>

                {/* My listings */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-orange-500 px-3 py-2 rounded-full text-sm transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-500 p-2 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-orange-500 px-4 py-2 text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
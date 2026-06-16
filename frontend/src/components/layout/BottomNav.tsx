'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Home, Search, Plus, User, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { isLoggedIn, loadFromStorage } = useAuthStore()
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
    if (pathname?.startsWith('/chats')) setUnread(0)
    return () => { socket.off('unread_update') }
  }, [isLoggedIn, pathname])

  const handleSearchTap = () => {
    if (pathname === '/') {
      const el = document.querySelector<HTMLInputElement>('input[type="text"]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => el?.focus(), 300)
    } else {
      router.push('/')
    }
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 z-50 sm:hidden pb-safe"
    >
      <div className="flex items-center justify-around px-1 py-1.5">

        {/* Home */}
        <Link href="/" className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center">
          <Home className={'w-5 h-5 ' + (isActive('/') ? 'text-orange-500' : 'text-gray-400')} />
          <span className={'text-[10px] ' + (isActive('/') ? 'text-orange-500 font-semibold' : 'text-gray-400')}>Home</span>
        </Link>

        {/* Search */}
        <button
          onClick={handleSearchTap}
          className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-[10px] text-gray-400">Search</span>
        </button>

        {/* Sell — elevated */}
        <Link href="/products/new" className="flex flex-col items-center -mt-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] text-orange-500 font-semibold mt-0.5">Sell</span>
        </Link>

        {/* Chats */}
        <Link
          href={isLoggedIn ? '/chats' : '/login'}
          className="relative flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
        >
          <MessageCircle className={'w-5 h-5 ' + (isActive('/chats') ? 'text-orange-500' : 'text-gray-400')} />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          <span className={'text-[10px] ' + (isActive('/chats') ? 'text-orange-500 font-semibold' : 'text-gray-400')}>Chats</span>
        </Link>

        {/* Profile */}
        <Link
          href={isLoggedIn ? '/profile' : '/login'}
          className="flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] justify-center"
        >
          <User className={'w-5 h-5 ' + (isActive('/profile') ? 'text-orange-500' : 'text-gray-400')} />
          <span className={'text-[10px] ' + (isActive('/profile') ? 'text-orange-500 font-semibold' : 'text-gray-400')}>
            {isLoggedIn ? 'Profile' : 'Login'}
          </span>
        </Link>

      </div>
    </nav>
  )
}
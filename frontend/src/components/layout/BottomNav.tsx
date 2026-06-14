'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Home, Search, Plus, User, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'

export default function BottomNav() {
  const pathname = usePathname()
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
  }, [isLoggedIn])

  const navItems = [
    { href: '/',                               icon: Home,         label: 'Home' },
    { href: '/?search=',                       icon: Search,       label: 'Search' },
    { href: '/products/new',                   icon: Plus,         label: 'Sell',    special: true },
    { href: isLoggedIn ? '/chats' : '/login',  icon: MessageCircle,label: 'Chats',   badge: unread },
    { href: isLoggedIn ? '/profile' : '/login',icon: User,         label: isLoggedIn ? 'Profile' : 'Login' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 z-50 sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon     = item.icon
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href.split('?')[0])

          if (item.special) {
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg -mt-6 border-4 border-white">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-orange-500 font-semibold mt-0.5">Sell</span>
              </Link>
            )
          }

          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-0.5 px-3 py-1">
              <Icon className={"w-5 h-5 transition-colors " + (isActive ? 'text-orange-500' : 'text-gray-400')} />
              {(item as any).badge > 0 && (
                <span className="absolute -top-0.5 left-1/2 ml-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {(item as any).badge > 9 ? '9+' : (item as any).badge}
                </span>
              )}
              <span className={"text-xs transition-colors " + (isActive ? 'text-orange-500 font-semibold' : 'text-gray-400')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      <div className="h-safe-area-inset-bottom bg-white" />
    </div>
  )
}
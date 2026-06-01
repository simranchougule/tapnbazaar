'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Home, Search, Plus, User, Heart } from 'lucide-react'
import { useEffect } from 'react'

export default function BottomNav() {
  const pathname = usePathname()
  const { isLoggedIn, loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [])

  const navItems = [
    {
      href:  '/',
      icon:  Home,
      label: 'Home',
    },
    {
      href:  '/?search=',
      icon:  Search,
      label: 'Search',
    },
    {
      href:  '/products/new',
      icon:  Plus,
      label: 'Sell',
      special: true,
    },
    {
      href:  '/favorites',
      icon:  Heart,
      label: 'Saved',
    },
    {
      href:  isLoggedIn ? '/profile' : '/login',
      icon:  User,
      label: isLoggedIn ? 'Profile' : 'Login',
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 z-50 sm:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon      = item.icon
          const isActive  = pathname === item.href

          if (item.special) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg -mt-6 border-4 border-white">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-orange-500 font-medium mt-0.5">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon
                className={"w-5 h-5 transition-colors " + (isActive ? 'text-orange-500' : 'text-gray-400')}
              />
              <span
                className={"text-xs transition-colors " + (isActive ? 'text-orange-500 font-medium' : 'text-gray-400')}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iPhone */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </div>
  )
}
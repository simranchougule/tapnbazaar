'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, MessageCircle, Tag, TrendingDown, ShoppingBag, BadgeIndianRupee } from 'lucide-react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'

interface Notification {
  id:        string
  type:      string
  title:     string
  body:      string
  link?:     string
  isRead:    boolean
  createdAt: string
}

// System notification types only — new_message goes to Chat
const SYSTEM_TYPES = ['product_sold', 'price_drop', 'new_offer', 'listing_approved', 'account', 'wishlist_alert']

const ICONS: Record<string, React.ReactNode> = {
  product_sold:     <Tag className="w-4 h-4 text-green-500" />,
  price_drop:       <TrendingDown className="w-4 h-4 text-orange-500" />,
  new_offer:        <BadgeIndianRupee className="w-4 h-4 text-blue-500" />,
  listing_approved: <ShoppingBag className="w-4 h-4 text-purple-500" />,
  default:          <Bell className="w-4 h-4 text-gray-400" />,
}

export default function NotificationBell() {
  const router = useRouter()
  const ref    = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen]     = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetchNotifications()

    const token = localStorage.getItem('token')
    if (!token) return
    const socket = getSocket(token)

    socket.on('notification', (n: Notification) => {
      // Only show system notifications in bell — not chat messages
      if (n.type === 'new_message') return
      setNotifications(prev => [n, ...prev].slice(0, 20))
      setUnread(c => c + 1)
    })

    return () => { socket.off('notification') }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      // Filter out new_message — those belong in Chat
      const systemNotifs = res.data.notifications.filter(
        (n: Notification) => n.type !== 'new_message'
      ).slice(0, 20)
      setNotifications(systemNotifs)
      setUnread(systemNotifs.filter((n: Notification) => !n.isRead).length)
    } catch { /* not logged in */ }
  }

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await api.put(`/notifications/${n.id}/read`)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
      setUnread(c => Math.max(0, c - 1))
    }
    setOpen(false)
    if (n.link) router.push(n.link)
  }

  const markAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-orange-500 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No notifications yet</p>
                <p className="text-gray-300 text-xs mt-1">We&apos;ll notify you about offers &amp; updates</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={"w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 " + (!n.isRead ? 'bg-orange-50/60' : '')}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {ICONS[n.type] ?? ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={"text-xs font-semibold " + (!n.isRead ? 'text-gray-900' : 'text-gray-600')}>{n.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-xs text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => { setOpen(false); router.push('/notifications') }}
              className="text-xs text-orange-500 hover:underline w-full text-center"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

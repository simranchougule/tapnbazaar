'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Bell, MessageCircle, Tag, TrendingDown, CheckCheck } from 'lucide-react'

interface Notification {
  id:        string
  type:      string
  title:     string
  body:      string
  link?:     string
  isRead:    boolean
  createdAt: string
}

const ICONS: Record<string, React.ReactNode> = {
  new_message:  <MessageCircle className="w-5 h-5 text-blue-500" />,
  product_sold: <Tag className="w-5 h-5 text-green-500" />,
  price_drop:   <TrendingDown className="w-5 h-5 text-orange-500" />,
}

export default function NotificationsPage() {
  const router = useRouter()
  const { isLoggedIn, loadFromStorage } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    fetchNotifications()
  }, [isLoggedIn])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications)
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const handleClick = async (n: Notification) => {
    if (!n.isRead) {
      await api.put(`/notifications/${n.id}/read`)
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
    }
    if (n.link) router.push(n.link)
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unread}</span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors">
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-1/2" />
                  <div className="bg-gray-200 h-3 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={"w-full text-left bg-white rounded-2xl p-4 flex items-start gap-3 hover:shadow-md transition-shadow " + (!n.isRead ? 'border-l-4 border-orange-500' : '')}
              >
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center flex-shrink-0">
                  {ICONS[n.type] ?? <Bell className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={"text-sm font-semibold " + (!n.isRead ? 'text-gray-900' : 'text-gray-600')}>{n.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{n.body}</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

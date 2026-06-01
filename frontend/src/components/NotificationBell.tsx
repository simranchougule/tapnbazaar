'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
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

export default function NotificationBell() {
  const router  = useRouter()
  const ref     = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen]   = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    fetchNotifications()

    const token = localStorage.getItem('token')
    if (!token) return
    const socket = getSocket(token)
    socket.on('notification', (n: Notification) => {
      setNotifications(prev => [n, ...prev].slice(0, 20))
      setUnread(c => c + 1)
    })
    return () => { socket.off('notification') }
  }, [])

  // Close dropdown on outside click
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
      setNotifications(res.data.notifications.slice(0, 20))
      setUnread(res.data.unreadCount)
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center gap-1 text-gray-600 hover:text-orange-500 px-3 py-2 rounded-full text-sm transition-colors"
      >
        <Bell className="w-4 h-4" />
        <span className="hidden sm:block">Alerts</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
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

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={"w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 " + (!n.isRead ? 'bg-orange-50' : '')}
                >
                  <div className="flex-1 min-w-0">
                    <p className={"text-xs font-semibold truncate " + (!n.isRead ? 'text-gray-900' : 'text-gray-600')}>{n.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{n.body}</p>
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1" />}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2">
            <button
              onClick={() => { setOpen(false); router.push('/notifications') }}
              className="text-xs text-orange-500 hover:underline w-full text-center"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

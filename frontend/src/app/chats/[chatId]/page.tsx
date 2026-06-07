'use client'
import Image from 'next/image'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Send, Tag } from 'lucide-react'

interface Message {
  id:        string
  content:   string
  senderId:  string
  createdAt: string
  sender:    { id: string; name: string; avatar?: string }
}

interface ChatData {
  id:           string
  product:      { id: string; title: string; price: number; images: string[] }
  participants: { user: { id: string; name: string; avatar?: string } }[]
  messages:     Message[]
}

export default function ChatRoomPage() {
  const { chatId }  = useParams()
  const router      = useRouter()
  const { user, isLoggedIn, loadFromStorage } = useAuthStore()
  const [chat, setChat]       = useState<ChatData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    fetchChat()
  }, [isLoggedIn])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChat = async () => {
    try {
      const res = await api.get('/chats/' + chatId)
      setChat(res.data.chat)
      setMessages(res.data.messages)
    } catch {
      toast.error('Chat not found')
      router.push('/chats')
    } finally {
      setLoading(false)
    }
  }

  // Socket.io setup
  useEffect(() => {
    if (!isLoggedIn) return
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = getSocket(token)
    socket.emit('join_chat', chatId)

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    return () => {
      socket.emit('leave_chat', chatId)
      socket.off('new_message')
    }
  }, [isLoggedIn, chatId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending) return

    const token = localStorage.getItem('token')
    if (!token) return

    setSending(true)
    try {
      const socket = getSocket(token)
      socket.emit('send_message', { chatId, content: text.trim() })
      setText('')
    } finally {
      setSending(false)
    }
  }

  const otherUser = chat?.participants.find(p => p.user.id !== user?.id)?.user

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
              <div className="bg-gray-200 h-10 w-48 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-16 z-10">
        <button onClick={() => router.push('/chats')} className="p-1 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-500 text-sm flex-shrink-0">
          {otherUser?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm">{otherUser?.name}</p>
          {chat && (
            <Link href={'/products/' + chat.product.id} className="text-xs text-orange-500 truncate block hover:underline">
              {chat.product.title} — Rs.{chat.product.price.toLocaleString('en-IN')}
            </Link>
          )}
        </div>

        {chat?.product.images[0] && (
          <Link href={'/products/' + chat.product.id}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <img src={chat.product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId === user?.id
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                isMine
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white p-2.5 rounded-xl transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}

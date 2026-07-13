'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, X, MessageCircle, ChevronDown } from 'lucide-react'
import api from '@/lib/api'
import { getSocket } from '@/lib/socket'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

interface Message {
  id:        string
  content:   string
  senderId:  string
  createdAt: string
  sender:    { id: string; name: string }
}

interface Props {
  productId:    string
  sellerName:   string
  productTitle: string
  currentUserId: string | null
}

export default function InlineChat({ productId, sellerName, productTitle, currentUserId }: Props) {
  const { user, loadFromStorage } = useAuthStore()
  const resolvedUserId = currentUserId ?? user?.id ?? null
  const [open, setOpen]         = useState(false)
  const [chatId, setChatId]     = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [sending, setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  // Focus the input whenever the user explicitly opens the chat panel
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Open chat — fetch or create the chat room
  const openChat = async () => {
    if (!resolvedUserId) { toast.error('Please login to chat'); return }
    setOpen(true)
    if (chatId) return   // already loaded

    try {
      setLoading(true)
      const res = await api.get('/chats/product/' + productId)
      const chat = res.data.chat
      setChatId(chat.id)
      setMessages(chat.messages || [])
    } catch {
      toast.error('Failed to open chat')
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  // Socket.io — join room and listen for messages
  useEffect(() => {
    if (!chatId || !resolvedUserId) return
    const token = localStorage.getItem('token')
    if (!token) return

    const socket = getSocket(token)
    socket.emit('join_chat', chatId)

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    })

    return () => {
      socket.emit('leave_chat', chatId)
      socket.off('new_message')
    }
  }, [chatId, resolvedUserId])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || sending || !chatId) return
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

  return (
    <div className="w-full">
      {/* Toggle button */}
      {!open ? (
        <button
          onClick={openChat}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat with Seller
        </button>
      ) : (
        <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">

          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 bg-orange-500">
            <div>
              <p className="text-white font-semibold text-sm">{sellerName}</p>
              <p className="text-orange-100 text-xs truncate max-w-[200px]">{productTitle}</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white hover:text-orange-100 p-1">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="h-72 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-8 h-8 text-gray-200 mb-2" />
                <p className="text-gray-400 text-sm">No messages yet</p>
                <p className="text-gray-300 text-xs mt-1">Ask about price, condition, availability...</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === resolvedUserId
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                    }`}>
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-0.5 ${isMine ? 'text-orange-100' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 px-3 py-3 border-t border-gray-100 bg-white">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Is price negotiable?"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending || !chatId}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white p-2 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

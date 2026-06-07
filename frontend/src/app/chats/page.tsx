'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { MessageCircle, Tag } from 'lucide-react'

interface ChatPreview {
  id: string
  product: { id: string; title: string; price: number; images: string[] }
  participants: { user: { id: string; name: string; avatar?: string } }[]
  messages: { content: string; sender: { id: string; name: string }; createdAt: string }[]
}

export default function ChatsPage() {
  const router = useRouter()
  const { user, isLoggedIn, loadFromStorage } = useAuthStore()
  const [chats, setChats]     = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    api.get('/chats').then(res => setChats(res.data.chats)).finally(() => setLoading(false))
  }, [isLoggedIn])

  const getOtherUser = (chat: ChatPreview) =>
    chat.participants.find(p => p.user.id !== user?.id)?.user

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <MessageCircle className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-1/2" />
                  <div className="bg-gray-200 h-3 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No conversations yet</p>
            <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => {
              const other      = getOtherUser(chat)
              const lastMsg    = chat.messages[0]
              return (
                <Link key={chat.id} href={'/chats/' + chat.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                  {/* Product thumbnail */}
                  <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {chat.product.images.length > 0 ? (
                      <Image src={chat.product.images[0]} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <Tag className="w-5 h-5 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800 text-sm truncate">{other?.name}</p>
                      {lastMsg && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(lastMsg.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-orange-500 truncate">{chat.product.title}</p>
                    {lastMsg && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {lastMsg.sender.id === user?.id ? 'You: ' : ''}{lastMsg.content}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

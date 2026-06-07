'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { MapPin, Tag, Package, Calendar } from 'lucide-react'
import { Product } from '@/types'

interface PublicUser {
  id:        string
  name:      string
  avatar?:   string
  city?:     string
  state?:    string
  createdAt: string
  _count:    { products: number }
  products:  Product[]
}

export default function SellerProfilePage() {
  const { id }    = useParams()
  const router    = useRouter()
  const [user, setUser]       = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/users/' + id)
      .then(res => setUser(res.data.user))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="bg-white rounded-2xl p-6 flex gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2 pt-2">
              <div className="bg-gray-200 h-5 rounded w-1/3" />
              <div className="bg-gray-200 h-4 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Seller card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex items-center gap-5">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-3xl font-bold text-orange-500 flex-shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
            {user.city && (
              <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span>{user.city}{user.state ? ', ' + user.state : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
              <Calendar className="w-3 h-3" />
              <span>Member since {memberSince}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-800">{user.products.length}</p>
            <p className="text-xs text-gray-500">Active Listings</p>
          </div>
        </div>

        {/* Listings */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">Listings by {user.name}</h2>

        {user.products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No active listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {user.products.map(product => (
              <Link key={product.id} href={'/products/' + product.id}
                className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-100 h-44 w-full flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" onError={(e: any) => { e.target.src = '/placeholder.png' }} />
                  ) : (
                    <Tag className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-gray-900">Rs.{product.price.toLocaleString('en-IN')}</p>
                  <p className="text-gray-600 text-sm truncate mt-1">{product.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{product.city}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

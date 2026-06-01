'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Heart, MapPin, Tag } from 'lucide-react'
import { Product } from '@/types'

export default function FavoritesPage() {
  const router = useRouter()
  const { isLoggedIn, loadFromStorage } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    loadFromStorage()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    fetchFavorites()
  }, [isLoggedIn])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const res = await api.get('/favorites')
      setProducts(res.data.products)
    } catch {
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleUnfavorite = async (productId: string) => {
    try {
      await api.post('/favorites/' + productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
      toast.success('Removed from favorites')
    } catch {
      toast.error('Failed to remove')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-bold text-gray-800">My Favorites</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-44 w-full" />
                <div className="p-3 space-y-2">
                  <div className="bg-gray-200 h-4 rounded" />
                  <div className="bg-gray-200 h-4 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No saved items yet</p>
            <Link
              href="/"
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow relative">
                <button
                  onClick={() => handleUnfavorite(product.id)}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow"
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </button>
                <Link href={'/products/' + product.id}>
                  <div className="bg-gray-100 h-44 w-full flex items-center justify-center">
                    {product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

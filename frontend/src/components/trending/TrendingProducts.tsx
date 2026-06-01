'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/api'
import { Product } from '@/types'
import { Flame, MapPin, Eye, X, Tag } from 'lucide-react'

interface TrendingProductsProps {
  onClose: () => void
}

export default function TrendingProducts({ onClose }: TrendingProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetchTrending()
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchTrending = async () => {
    try {
      setLoading(true)
      const res = await api.get('/products/trending')
      setProducts(res.data.products)
    } catch (error) {
      console.error('Failed to fetch trending:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border-t border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">
                Trending Now
              </h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-gray-400">Updated Live</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mb-4">
          What people are looking for right now
        </p>

        {loading ? (
          /* Skeleton Loading */
          <div className="flex gap-4 overflow-x-auto pb-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-48 bg-gray-50 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="bg-gray-200 h-36 w-full"></div>
                <div className="p-3">
                  <div className="bg-gray-200 h-3 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No trending products yet</p>
          </div>
        ) : (
          /* Horizontal Scroll */
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={"/products/" + product.id}
                onClick={onClose}
                className="flex-shrink-0 w-48 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                {/* Image */}
                <div className="relative bg-gray-200 h-36 w-full">
                  {product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-8 h-8 text-gray-300" />
                    </div>
                  )}

                  {/* Trending Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    <Flame className="w-3 h-3" />
                    <span>#{index + 1}</span>
                  </div>

                  {/* Views Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded-full">
                    <Eye className="w-3 h-3" />
                    <span>{product.views}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-bold text-gray-900 text-sm">
                    Rs.{product.price.toLocaleString('en-IN')}
                  </p>
                  <p className="text-gray-700 text-xs truncate mt-0.5">
                    {product.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{product.city}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      {product.category.icon} {product.category.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    People are searching for this
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, MapPin, Tag, Edit, User, Heart, CheckCircle, Zap, Flag, Plus } from 'lucide-react'
import { Product } from '@/types'
import InlineChat from '@/components/InlineChat'
import ImageLightbox from '@/components/ImageLightbox'

const CONDITION_LABELS: Record<string, string> = {
  NEW:      'Brand New',
  LIKE_NEW: 'Like New',
  GOOD:     'Good',
  FAIR:     'Fair',
  POOR:     'Poor',
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const { user, isLoggedIn, loadFromStorage } = useAuthStore()
  const [product, setProduct]         = useState<Product | null>(null)
  const [related, setRelated]         = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [lightbox, setLightbox]       = useState(false)
  const [favorited, setFavorited]     = useState(false)
  const [favLoading, setFavLoading]   = useState(false)
  const [soldLoading, setSoldLoading] = useState(false)

  useEffect(() => { loadFromStorage() }, [])
  useEffect(() => { fetchProduct() }, [])
  useEffect(() => { if (isLoggedIn) fetchFavoriteStatus() }, [isLoggedIn, id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await api.get('/products/' + id)
      setProduct(res.data.product)
      setRelated(res.data.related || [])
    } catch {
      toast.error('Product not found')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const fetchFavoriteStatus = async () => {
    try {
      const res = await api.get('/favorites')
      setFavorited(res.data.products.some((p: Product) => p.id === id))
    } catch { /* not logged in */ }
  }

  const handleMarkSold = async () => {
    if (!confirm('Mark this listing as sold?')) return
    try {
      setSoldLoading(true)
      await api.put('/products/' + id, { status: 'SOLD' })
      setProduct(p => p ? { ...p, status: 'SOLD' } : p)
      toast.success('Marked as sold!')
    } catch { toast.error('Failed to update') }
    finally { setSoldLoading(false) }
  }

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) { toast.error('Please login to save items'); return }
    try {
      setFavLoading(true)
      const res = await api.post('/favorites/' + id)
      setFavorited(res.data.favorited)
      toast.success(res.data.favorited ? 'Added to favorites!' : 'Removed from favorites')
    } catch {
      toast.error('Failed to update favorites')
    } finally {
      setFavLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="bg-gray-200 h-80 rounded-2xl" />
          <div className="bg-gray-200 h-8 rounded w-2/3" />
          <div className="bg-gray-200 h-6 rounded w-1/3" />
        </div>
      </div>
    )
  }

  if (!product) return null

  const storedUser = user ?? (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null)
  const isOwner    = !!storedUser && storedUser.id === product.user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Images */}
          <div>
            <div className="relative">
              <div
                className="bg-gray-100 rounded-2xl overflow-hidden h-80 flex items-center justify-center cursor-zoom-in"
                onClick={() => product.images.length > 0 && setLightbox(true)}
              >
                {product.images.length > 0 ? (
                  <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" />
                ) : (
                  <Tag className="w-16 h-16 text-gray-300" />
                )}
              </div>

              {/* Floating favourite button */}
              <button
                onClick={handleToggleFavorite}
                disabled={favLoading}
                className={"absolute top-3 right-3 p-2.5 rounded-full shadow-lg transition-all " + (favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500')}
              >
                <Heart className={"w-5 h-5 " + (favorited ? 'fill-white' : '')} />
              </button>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={"w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors " + (activeImage === i ? 'border-orange-500' : 'border-transparent')}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-3xl font-bold text-gray-900">Rs.{product.price.toLocaleString('en-IN')}</p>
              <h1 className="text-xl font-semibold text-gray-800 mt-1">{product.title}</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full">
                {CONDITION_LABELS[product.condition] ?? product.condition}
              </span>
              {product.category && (
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {product.category.name}
                </span>
              )}
              {product.status === 'SOLD' && (
                <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">Sold</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{product.city}, {product.state}</span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

            {/* Seller info */}
            <Link href={'/users/' + product.user.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">
                {product.user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{product.user.name}</p>
                {product.user.city && <p className="text-xs text-gray-400">{product.user.city}</p>}
              </div>
              <User className="w-4 h-4 text-gray-300" />
            </Link>

            {/* Buyer CTA — Buy Now only */}
            {!isOwner && product.status !== 'SOLD' && (
              <button
                onClick={() => {
                  if (!isLoggedIn) { toast.error('Please login to buy'); router.push('/login'); return }
                  toast.success('Chat with the seller to proceed!')
                  document.querySelector<HTMLButtonElement>('[data-inline-chat]')?.click()
                }}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-base w-full"
              >
                <Zap className="w-5 h-5" />
                Buy Now
              </button>
            )}

            {/* Owner actions | Buyer chat */}
            {isOwner ? (
              <div className="flex flex-col gap-2">
                {product.status !== 'SOLD' && (
                  <button onClick={handleMarkSold} disabled={soldLoading}
                    className="flex items-center justify-center gap-2 border-2 border-green-400 text-green-600 hover:bg-green-50 font-semibold py-3 rounded-xl transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    {soldLoading ? 'Updating...' : 'Mark as Sold'}
                  </button>
                )}
                <Link href={'/products/' + product.id + '/edit'}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
                  <Edit className="w-4 h-4" />
                  Edit Listing
                </Link>
                <Link href="/products/new"
                  className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:border-orange-300 font-medium py-2.5 rounded-xl transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  Sell Similar Item
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <InlineChat
                  productId={product.id}
                  sellerName={product.user.name}
                  productTitle={product.title}
                  currentUserId={storedUser?.id ?? null}
                />
                <button
                  onClick={() => toast.success('Report submitted. We will review this listing.')}
                  className="flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 text-xs py-2 transition-colors"
                >
                  <Flag className="w-3 h-3" />
                  Report Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {lightbox && (
        <ImageLightbox
          images={product.images}
          index={activeImage}
          onClose={() => setLightbox(false)}
          onChange={setActiveImage}
        />
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Similar Listings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map(r => (
              <Link key={r.id} href={'/products/' + r.id} className="bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-100 h-32 w-full flex items-center justify-center">
                  {r.images.length > 0 ? (
                    <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="p-2">
                  <p className="font-bold text-gray-900 text-sm">Rs.{r.price.toLocaleString('en-IN')}</p>
                  <p className="text-gray-600 text-xs truncate mt-0.5">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

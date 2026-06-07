'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, MapPin, Tag, Edit, User, Heart, CheckCircle, Zap, Plus, X, Copy, Check, Mail } from 'lucide-react'
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

// Real SVG icons for social platforms
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

// Modern share icon
const ShareIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

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
  const [showShare, setShowShare]     = useState(false)
  const [copied, setCopied]           = useState(false)

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success('Link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrl  = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = product ? `Check out ${product.title} for Rs.${product.price.toLocaleString('en-IN')} on TapnBazaar!` : ''

  const shareOptions = [
    {
      name:  'WhatsApp',
      icon:  <WhatsAppIcon />,
      color: 'bg-green-500 hover:bg-green-600',
      url:   `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name:  'Facebook',
      icon:  <FacebookIcon />,
      color: 'bg-blue-600 hover:bg-blue-700',
      url:   `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name:  'Twitter/X',
      icon:  <TwitterIcon />,
      color: 'bg-black hover:bg-gray-800',
      url:   `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name:  'Telegram',
      icon:  <TelegramIcon />,
      color: 'bg-sky-500 hover:bg-sky-600',
      url:   `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      name:  'Email',
      icon:  <Mail className="w-6 h-6 text-white" />,
      color: 'bg-gray-500 hover:bg-gray-600',
      url:   `mailto:?subject=${encodeURIComponent(product?.title || '')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    },
  ]

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
                  <img src={product.images[activeImage]} alt={product.title} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Tag className="w-16 h-16 text-gray-300" />
                )}
              </div>

              {/* Floating heart + share on image */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                  className={"p-2.5 rounded-full shadow-lg transition-all " + (favorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500')}
                >
                  <Heart className={"w-5 h-5 " + (favorited ? 'fill-white' : '')} />
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="p-2.5 rounded-full shadow-lg bg-white/90 text-gray-500 hover:bg-white hover:text-orange-500 transition-all"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={"w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors " + (activeImage === i ? 'border-orange-500' : 'border-transparent')}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
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

            {/* Buyer CTA */}
            {!isOwner && product.status !== 'SOLD' && (
              <button
                onClick={() => {
                  if (!isLoggedIn) { toast.error('Please login to buy'); router.push('/login'); return }
                  toast.success('Chat with the seller to proceed!')
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Share Listing</h3>
                <p className="text-gray-400 text-xs mt-0.5 truncate max-w-56">{product.title}</p>
              </div>
              <button onClick={() => setShowShare(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              {shareOptions.map(option => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowShare(false)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={"w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all group-hover:scale-110 group-hover:shadow-md " + option.color}>
                    {option.icon}
                  </div>
                  <span className="text-xs text-gray-500 text-center leading-tight font-medium">{option.name}</span>
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or copy link</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Copy Link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
              <p className="flex-1 text-xs text-gray-400 truncate">{shareUrl}</p>
              <button
                onClick={handleCopyLink}
                className={"flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-w-fit " + (copied ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white')}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    <img src={r.images[0]} alt={r.title} className="w-full h-full object-cover" loading="lazy" />
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

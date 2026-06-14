'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { MapPin, Tag, Package, Calendar, Flag, Star, X } from 'lucide-react'
import { Product } from '@/types'
import ReportModal from '@/components/ReportModal'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  buyer: { id: string; name: string; avatar?: string }
}

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

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${cls} ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function SellerProfilePage() {
  const { id }    = useParams()
  const router    = useRouter()
  const { user: currentUser, isLoggedIn } = useAuthStore()
  const [user, setUser]               = useState<PublicUser | null>(null)
  const [loading, setLoading]         = useState(true)
  const [showReport, setShowReport]   = useState(false)

  // reviews
  const [reviews, setReviews]           = useState<Review[]>([])
  const [avgRating, setAvgRating]       = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [canReview, setCanReview]       = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    api.get('/auth/users/' + id)
      .then(res => setUser(res.data.user))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api.get('/reviews/user/' + id)
      .then(res => {
        setReviews(res.data.reviews.slice(0, 5))
        setAvgRating(res.data.averageRating)
        setTotalReviews(res.data.total)
      })
      .catch(() => {})
  }, [id])

  // Check if logged-in user can review any of the seller's products
  useEffect(() => {
    if (!isLoggedIn || !user) return
    // Check can-review for each of the seller's products, stop at first match
    const checkProducts = async () => {
      for (const product of user.products) {
        try {
          const res = await api.get('/reviews/can-review/' + product.id)
          if (res.data.canReview) {
            setCanReview(true)
            setReviewProduct(product)
            setAlreadyReviewed(res.data.alreadyReviewed)
            if (res.data.alreadyReviewed && res.data.review) {
              setReviewRating(res.data.review.rating)
              setReviewComment(res.data.review.comment || '')
            }
            return
          }
        } catch {}
      }
    }
    checkProducts()
  }, [isLoggedIn, user])

  const handleSubmitReview = async () => {
    if (!reviewProduct) return
    setSubmitting(true)
    try {
      await api.post('/reviews', {
        sellerId:  id,
        productId: reviewProduct.id,
        rating:    reviewRating,
        comment:   reviewComment || undefined,
      })
      const res = await api.get('/reviews/user/' + id)
      setReviews(res.data.reviews.slice(0, 5))
      setAvgRating(res.data.averageRating)
      setTotalReviews(res.data.total)
      setAlreadyReviewed(true)
      setShowReviewModal(false)
    } catch {}
    finally { setSubmitting(false) }
  }

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

  const memberSince  = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const isOwnProfile = currentUser?.id === user.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Seller card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm flex items-start gap-5">
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
            {totalReviews > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarDisplay rating={Math.round(avgRating)} size="sm" />
                <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({totalReviews} review{totalReviews !== 1 ? 's' : ''})</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{user.products.length}</p>
              <p className="text-xs text-gray-500">Active Listings</p>
            </div>
            {isLoggedIn && !isOwnProfile && (
              <div className="flex flex-col items-end gap-2">
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-amber-600 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <Star className="w-3.5 h-3.5" />
                    {alreadyReviewed ? 'Edit Review' : 'Leave a Review'}
                  </button>
                )}
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Report Seller
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-4">Reviews ({totalReviews})</h2>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-500">
                        {review.buyer.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{review.buyer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={review.rating} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 ml-9">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

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
                <div className="relative bg-gray-100 h-44 w-full flex items-center justify-center">
                  {product.images.length > 0 ? (
                    <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="300px" />
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

      {/* Leave a Review Modal */}
      {showReviewModal && reviewProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{alreadyReviewed ? 'Edit Review' : 'Leave a Review'}</h3>
                <p className="text-gray-400 text-xs mt-0.5">for {user.name}</p>
              </div>
              <button onClick={() => setShowReviewModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Rating</p>
              <div className="flex items-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setReviewRating(i)}>
                    <Star className={`w-8 h-8 transition-colors ${i <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 hover:text-amber-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Comment (optional)</label>
              <textarea
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                placeholder="Share your experience with this seller..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none"
              />
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : alreadyReviewed ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </div>
      )}

      {showReport && (
        <ReportModal
          type="user"
          targetId={user.id}
          targetName={user.name}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}

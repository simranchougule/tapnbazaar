'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Trash2, Upload, X, Truck } from 'lucide-react'
import { INDIA_STATES } from '@/lib/constants'

const CONDITIONS = [
  { value: 'NEW',      label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD',     label: 'Good' },
  { value: 'FAIR',     label: 'Fair' },
  { value: 'POOR',     label: 'Poor' },
]

const STATUSES = [
  { value: 'ACTIVE',   label: 'Active' },
  { value: 'SOLD',     label: 'Sold' },
  { value: 'INACTIVE', label: 'Hidden' },
]

export default function EditProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const { isLoggedIn, loadFromStorage } = useAuthStore()
  const [loading, setLoading]     = useState(false)
  const [fetching, setFetching]   = useState(true)
  const [images, setImages]       = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title:         '',
    description:   '',
    price:         '',
    condition:     'GOOD',
    city:          '',
    state:         '',
    status:        'ACTIVE',
    listing_type:  'local',
    supplier_info: '',
    supplier_cost: '',
    delivery_days: '5-10 days',
    return_policy: 'Contact seller within 7 days',
    shipping_note: '',
  })

  useEffect(() => {
    loadFromStorage()
    fetchProduct()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login first')
      router.push('/login')
    }
  }, [isLoggedIn])

  const fetchProduct = async () => {
    try {
      setFetching(true)
      const res = await api.get('/products/' + id)
      const p   = res.data.product
      setImages(p.images || [])
      setFormData({
        title:         p.title,
        description:   p.description,
        price:         p.price.toString(),
        condition:     p.condition,
        city:          p.city,
        state:         p.state,
        status:        p.status,
        listing_type:  p.listingType || 'local',
        supplier_info: p.supplierInfo || '',
        supplier_cost: p.supplierCost ? p.supplierCost.toString() : '',
        delivery_days: p.deliveryDays || '5-10 days',
        return_policy: p.returnPolicy || 'Contact seller within 7 days',
        shipping_note: p.shippingNote || '',
      })
    } catch (error) {
      toast.error('Product not found')
      router.push('/')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    try {
      setUploading(true)
      const formDataImg = new FormData()
      Array.from(files).forEach(f => formDataImg.append('images', f))
      const res = await api.post('/upload/multiple', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setImages(prev => [...prev, ...res.data.urls])
      toast.success(`${res.data.urls.length} image(s) uploaded!`)
    } catch {
      toast.error('Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields')
      return
    }
    if (formData.listing_type === 'dropship' && !formData.supplier_cost) {
      toast.error('Please enter supplier cost for dropship listing')
      return
    }
    try {
      setLoading(true)
      const res = await api.put('/products/' + id, {
        ...formData,
        price:        parseFloat(formData.price),
        images,
        listingType:  formData.listing_type,
        supplierInfo: formData.supplier_info,
        supplierCost: formData.supplier_cost ? parseFloat(formData.supplier_cost) : undefined,
        deliveryDays: formData.delivery_days,
        returnPolicy: formData.return_policy,
        shippingNote: formData.shipping_note,
      })
      if (res.data.success) {
        toast.success('Listing updated successfully!')
        router.push('/products/' + id)
      }
    } catch (error) {
      toast.error('Failed to update listing')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.delete('/products/' + id)
      toast.success('Listing deleted!')
      router.push('/profile')
    } catch (error) {
      toast.error('Failed to delete listing')
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-gray-200 h-12 rounded-xl"></div>
            <div className="bg-gray-200 h-12 rounded-xl"></div>
            <div className="bg-gray-200 h-32 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  const isDropship = formData.listing_type === 'dropship'
  const profit = isDropship && formData.supplier_cost && formData.price
    ? parseFloat(formData.price) - parseFloat(formData.supplier_cost)
    : null
  const margin = profit !== null && parseFloat(formData.price) > 0
    ? ((profit / parseFloat(formData.price)) * 100).toFixed(1)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Edit Listing</h1>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (max 5)</label>
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image src={url} alt="" fill className="object-cover rounded-xl border border-gray-200" sizes="20vw" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Main</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-orange-500">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-7 h-7 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload photos</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'local',    label: 'Local Sale',  desc: 'You own and ship the item' },
                  { value: 'dropship', label: 'Dropship',    desc: 'Supplier ships to buyer' },
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, listing_type: type.value })}
                    className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left ${
                      formData.listing_type === type.value
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${formData.listing_type === type.value ? 'text-orange-600' : 'text-gray-700'}`}>
                      {type.value === 'dropship' ? '🚚' : '📦'} {type.label}
                    </span>
                    <span className="text-xs text-gray-400">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-5 gap-2">
                {CONDITIONS.map((cond) => (
                  <button key={cond.value} type="button"
                    onClick={() => setFormData({ ...formData, condition: cond.value })}
                    className={"py-2 px-1 text-xs font-medium rounded-xl border transition-colors " + (formData.condition === cond.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600')}>
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map((s) => (
                  <button key={s.value} type="button"
                    onClick={() => setFormData({ ...formData, status: s.value })}
                    className={"py-2 px-1 text-xs font-medium rounded-xl border transition-colors " + (formData.status === s.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600')}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                <input type="text" name="city" value={formData.city} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                <select name="state" value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white">
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Dropship fields — only shown for dropship listings */}
            {isDropship && (
              <div className="space-y-4 border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500" />
                  <p className="text-sm font-bold text-gray-800">Dropship Details (Private)</p>
                </div>

                {/* Supplier cost */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier Cost (Rs.) <span className="text-red-500">*</span>
                  </label>
                  <input type="number" name="supplier_cost" value={formData.supplier_cost} onChange={handleChange}
                    placeholder="e.g. 500" min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500" />
                  <p className="text-xs text-gray-400 mt-1">What you pay the supplier — never shown to buyers.</p>
                </div>

                {/* Profit calculator */}
                {profit !== null && (
                  <div className={`rounded-xl p-4 border ${profit > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-xs font-semibold text-gray-600 mb-3">💰 Profit Calculator</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Supplier Cost</p>
                        <p className="text-sm font-bold text-gray-700">Rs.{parseFloat(formData.supplier_cost).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Selling Price</p>
                        <p className="text-sm font-bold text-gray-700">Rs.{parseFloat(formData.price).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Your Profit</p>
                        <p className={`text-sm font-bold ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {profit > 0 ? '+' : ''}Rs.{profit.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className={`mt-3 text-center text-xs font-medium ${profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {profit > 0
                        ? `✅ Margin: ${margin}% — Good to go!`
                        : '⚠️ Selling price is lower than supplier cost — you will lose money!'}
                    </div>
                  </div>
                )}

                {/* Supplier info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Info</label>
                  <textarea name="supplier_info" value={formData.supplier_info} onChange={handleChange}
                    placeholder="e.g. Meesho product link, IndiaMART supplier name, WhatsApp number..."
                    rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none" />
                  <p className="text-xs text-gray-400 mt-1">This is only visible to you — buyers will never see this.</p>
                </div>

                {/* Shipping details */}
                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                    🚚 Shipping Details <span className="text-xs font-normal text-gray-400">(shown to buyers)</span>
                  </p>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Delivery</label>
                    <select name="delivery_days" value={formData.delivery_days} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white text-sm">
                      <option value="1-2 days">1–2 days (Express)</option>
                      <option value="3-5 days">3–5 days (Fast)</option>
                      <option value="5-10 days">5–10 days (Standard)</option>
                      <option value="10-15 days">10–15 days</option>
                      <option value="15-20 days">15–20 days</option>
                      <option value="20-30 days">20–30 days</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Return Policy</label>
                    <select name="return_policy" value={formData.return_policy} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white text-sm">
                      <option value="No returns">No returns</option>
                      <option value="Contact seller within 7 days">Contact seller within 7 days</option>
                      <option value="Exchange only within 7 days">Exchange only within 7 days</option>
                      <option value="7 day return policy">7 day return policy</option>
                      <option value="15 day return policy">15 day return policy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Note <span className="text-gray-400">(optional)</span></label>
                    <input type="text" name="shipping_note" value={formData.shipping_note} onChange={handleChange}
                      placeholder="e.g. Free shipping across India, Shipping charges extra..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 text-sm" />
                  </div>

                  {/* Buyer preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">👁️ What buyers will see:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span>🚚</span>
                        <p className="text-xs font-semibold text-blue-700">Dropship Item</p>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Ships in {formData.delivery_days}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <p className="text-xs text-gray-500">📦 Supplier ships directly to buyer</p>
                        <p className="text-xs text-gray-500">⏱️ {formData.delivery_days}</p>
                        <p className="text-xs text-gray-500">🔄 {formData.return_policy}</p>
                        <p className="text-xs text-gray-500">✅ Seller verified</p>
                      </div>
                      {formData.shipping_note && (
                        <p className="text-xs text-blue-600 mt-1">📝 {formData.shipping_note}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading || uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
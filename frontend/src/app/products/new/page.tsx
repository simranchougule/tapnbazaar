'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Category } from '@/types'
import { ArrowLeft, Upload, X, MapPin, Locate, Navigation, ShieldCheck, ImagePlus, Tag, FileText, Package, Truck } from 'lucide-react'
import { INDIA_STATES } from '@/lib/constants'
import PhoneVerifyModal from '@/components/PhoneVerifyModal'

const CONDITIONS = [
  { value: 'NEW',      label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD',     label: 'Good' },
  { value: 'FAIR',     label: 'Fair' },
  { value: 'POOR',     label: 'Poor' },
]

const LISTING_TYPES = [
  {
    value: 'local',
    label: 'Local Sale',
    desc: 'You own the item and ship/hand it over yourself',
    icon: Package,
  },
  {
    value: 'dropship',
    label: 'Dropship',
    desc: 'Supplier ships directly to buyer on your behalf',
    icon: Truck,
  },
]

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-orange-500" />
      </div>
      <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    </div>
  )
}

export default function CreateProductPage() {
  const router = useRouter()
  const { isLoggedIn, loadFromStorage, user } = useAuthStore()
  const [categories, setCategories]           = useState<Category[]>([])
  const [loading, setLoading]                 = useState(false)
  const [uploading, setUploading]             = useState(false)
  const [images, setImages]                   = useState<string[]>([])
  const [locating, setLocating]               = useState(false)
  const [locationSet, setLocationSet]         = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [submitted, setSubmitted]             = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', condition: 'GOOD',
    categoryId: '', city: '', state: '', area: '', pincode: '',
    latitude: '', longitude: '',
    listing_type: 'local',
    supplier_info: '',
    supplier_cost: '',
    delivery_days: '5-10 days',
    return_policy: 'Contact seller within 7 days',
    shipping_note: '',
  })

  useEffect(() => { loadFromStorage(); fetchCategories() }, [])
  useEffect(() => {
    if (!isLoggedIn) { toast.error('Please login to post a listing'); router.push('/login') }
  }, [isLoggedIn])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      const flat: Category[] = []
      res.data.categories.forEach((cat: any) => {
        flat.push(cat)
        if (cat.children?.length > 0) {
          cat.children.forEach((child: any) => flat.push({ ...child, name: `  └ ${child.name}` }))
        }
      })
      setCategories(flat)
    } catch { toast.error('Failed to load categories') }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) { toast.error('GPS not supported on this device'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
          const data = await res.json()
          const addr = data.address || {}
          const city = addr.city || addr.town || addr.village || addr.county || ''
          const state = addr.state || ''
          const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || ''
          const pincode = addr.postcode || ''
          const matchedState = INDIA_STATES.find(s => s.toLowerCase() === state.toLowerCase()) || state
          setFormData(f => ({ ...f, latitude: latitude.toString(), longitude: longitude.toString(), city, state: matchedState, area, pincode }))
          setLocationSet(true)
          toast.success('Location detected!')
        } catch {
          setFormData(f => ({ ...f, latitude: latitude.toString(), longitude: longitude.toString() }))
          setLocationSet(true)
          toast.success('GPS location saved. Please enter city manually.')
        } finally { setLocating(false) }
      },
      (error) => {
        setLocating(false)
        toast.error(error.code === error.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not get location.')
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (images.length + files.length > 5) { toast.error('Maximum 5 images allowed'); return }
    try {
      setUploading(true)
      const fd = new FormData()
      Array.from(files).forEach(file => fd.append('images', file))
      const res = await api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImages(prev => [...prev, ...res.data.urls])
      toast.success(`${res.data.urls.length} image(s) uploaded!`)
    } catch { toast.error('Image upload failed.') }
    finally { setUploading(false) }
  }

  const removeImage = (index: number) => setImages(prev => prev.filter((_, i) => i !== index))

  const doSubmit = async () => {
    if (submitted) return
    setSubmitted(true)
    try {
      setLoading(true)
      const res = await api.post('/products', {
        ...formData,
        price:        parseFloat(formData.price),
        latitude:     formData.latitude  ? parseFloat(formData.latitude)  : undefined,
        longitude:    formData.longitude ? parseFloat(formData.longitude) : undefined,
        images,
        listingType:  formData.listing_type,
        supplierInfo: formData.supplier_info,
        supplierCost: formData.supplier_cost ? parseFloat(formData.supplier_cost) : undefined,
        deliveryDays: formData.delivery_days,
        returnPolicy: formData.return_policy,
        shippingNote: formData.shipping_note,
      })
      if (res.data.success) {
        toast.success('Listing posted successfully!')
        router.push(`/products/${res.data.product.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post listing')
      setSubmitted(false)
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.categoryId || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields'); return
    }
    if (formData.listing_type === 'dropship' && !formData.supplier_cost) {
      toast.error('Please enter supplier cost for dropship listing'); return
    }
    if (!user?.phoneVerified) { setShowVerifyModal(true); return }
    await doSubmit()
  }

  // Simple progress estimate
  const requiredFilled = [formData.title, formData.price, formData.categoryId, formData.city, formData.state, formData.description].filter(Boolean).length
  const progress = Math.round((requiredFilled / 6) * 100)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-5 sm:py-8 pb-28 sm:pb-8">

        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Post a Listing</h1>
          {user?.phoneVerified && (
            <span className="ml-auto hidden sm:flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Phone Verified
            </span>
          )}
        </div>

        {/* Progress bar — mobile only */}
        <div className="sm:hidden mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400 font-medium">Listing progress</span>
            <span className="text-xs text-orange-500 font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-300" style={{ width: progress + '%' }} />
          </div>
        </div>

        {/* Phone verification banner */}
        {!user?.phoneVerified && (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-amber-700 font-medium">Phone verification required</p>
            </div>
            <button onClick={() => setShowVerifyModal(true)}
              className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              Verify Now
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Listing Type */}
            <div>
              <SectionHeader icon={Truck} title="Listing Type" />
              <div className="grid grid-cols-2 gap-3">
                {LISTING_TYPES.map(type => {
                  const Icon = type.icon
                  const selected = formData.listing_type === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, listing_type: type.value })}
                      className={`flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected ? 'bg-orange-500' : 'bg-gray-100'}`}>
                        <Icon className={`w-4 h-4 ${selected ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <span className={`text-sm font-semibold ${selected ? 'text-orange-600' : 'text-gray-700'}`}>{type.label}</span>
                      <span className="text-xs text-gray-400 leading-tight">{type.desc}</span>
                    </button>
                  )
                })}
              </div>

              {/* Dropship info banner */}
              {formData.listing_type === 'dropship' && (
                <div className="mt-3 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <Truck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    Your listing will show a <strong>Dropship</strong> badge and estimated delivery of 5–10 days. Supplier details are kept private from buyers.
                  </p>
                </div>
              )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Photos */}
            <div>
              <SectionHeader icon={ImagePlus} title="Photos (max 5)" />
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image src={url} alt="" fill className="object-cover rounded-xl border border-gray-200" sizes="100px" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">Main</span>}
                    </div>
                  ))}
                </div>
              )}
              {images.length < 5 && (
                <label className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-orange-500">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload photos</span>
                      <span className="text-xs text-gray-400">PNG, JPG up to 5MB each</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            <div className="h-px bg-gray-100" />

            {/* Item Details */}
            <div>
              <SectionHeader icon={Tag} title="Item Details" />
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange}
                    placeholder="e.g. iPhone 13 Pro Max 256GB"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white">
                    <option value="">Select a category</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (Rs.) <span className="text-red-500">*</span>
                    <span className="relative group inline-block ml-1.5 cursor-pointer">
                      <span className="text-gray-400 hover:text-orange-500 transition-colors text-xs border border-gray-300 rounded-full px-1.5 py-0.5">ⓘ</span>
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-7 w-56 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                        🏷️ What the BUYER pays you (e.g. Rs. 800). Set this higher than your supplier cost to make a profit.
                        <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
                      </span>
                    </span>
                  </label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange}
                    placeholder="e.g. 15000" min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {CONDITIONS.map(cond => (
                      <button key={cond.value} type="button"
                        onClick={() => setFormData({ ...formData, condition: cond.value })}
                        className={"py-2.5 px-1 text-xs font-medium rounded-xl border transition-colors " + (
                          formData.condition === cond.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300'
                        )}>
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Description */}
            <div>
              <SectionHeader icon={FileText} title="Description" />
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe your item — condition, age, reason for selling..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none" />
            </div>

            <div className="h-px bg-gray-100" />

            {/* Supplier Info — only for dropship */}
            {formData.listing_type === 'dropship' && (
              <>
                <div className="space-y-4">
                  <SectionHeader icon={Truck} title="Supplier Details (Private)" />

                  {/* Supplier cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Cost (Rs.) <span className="text-red-500">*</span>
                      <span className="relative group inline-block ml-1.5 cursor-pointer">
                        <span className="text-gray-400 hover:text-orange-500 transition-colors text-xs border border-gray-300 rounded-full px-1.5 py-0.5">ⓘ</span>
                        <span className="absolute left-1/2 -translate-x-1/2 bottom-7 w-56 bg-gray-800 text-white text-xs rounded-xl px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                          💸 What YOU pay the supplier (e.g. Meesho price Rs. 500). This is private — buyers never see it.
                          <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
                        </span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="supplier_cost"
                      value={formData.supplier_cost}
                      onChange={handleChange}
                      placeholder="e.g. 500"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">What you pay the supplier — never shown to buyers.</p>
                  </div>

                  {/* Profit calculator */}
                  {formData.supplier_cost && formData.price && (
                    (() => {
                      const cost   = parseFloat(formData.supplier_cost)
                      const sell   = parseFloat(formData.price)
                      const profit = sell - cost
                      const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : '0'
                      const isGood = profit > 0
                      return (
                        <div className={`rounded-xl p-4 border ${isGood ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <p className="text-xs font-semibold text-gray-600 mb-3">💰 Profit Calculator</p>
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-xs text-gray-400">Supplier Cost</p>
                              <p className="text-sm font-bold text-gray-700">Rs.{cost.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Selling Price</p>
                              <p className="text-sm font-bold text-gray-700">Rs.{sell.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Your Profit</p>
                              <p className={`text-sm font-bold ${isGood ? 'text-green-600' : 'text-red-500'}`}>
                                {isGood ? '+' : ''}Rs.{profit.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          <div className={`mt-3 text-center text-xs font-medium ${isGood ? 'text-green-600' : 'text-red-500'}`}>
                            {isGood
                              ? `✅ Margin: ${margin}% — Good to go!`
                              : '⚠️ Selling price is lower than supplier cost — you will lose money!'}
                          </div>
                        </div>
                      )
                    })()
                  )}

                  {/* Supplier info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Info</label>
                    <textarea
                      name="supplier_info"
                      value={formData.supplier_info}
                      onChange={handleChange}
                      placeholder="e.g. Meesho product link, IndiaMART supplier name, WhatsApp number..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">This is only visible to you — buyers will never see supplier details.</p>
                  </div>

                  {/* Shipping details — visible to buyers */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">🚚 Shipping Details <span className="text-xs font-normal text-gray-400">(shown to buyers)</span></p>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Delivery</label>
                      <select
                        name="delivery_days"
                        value={formData.delivery_days}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                      >
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
                      <select
                        name="return_policy"
                        value={formData.return_policy}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white text-sm"
                      >
                        <option value="No returns">No returns</option>
                        <option value="Contact seller within 7 days">Contact seller within 7 days</option>
                        <option value="Exchange only within 7 days">Exchange only within 7 days</option>
                        <option value="7 day return policy">7 day return policy</option>
                        <option value="15 day return policy">15 day return policy</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Shipping Note <span className="text-gray-400">(optional)</span></label>
                      <input
                        type="text"
                        name="shipping_note"
                        value={formData.shipping_note}
                        onChange={handleChange}
                        placeholder="e.g. Free shipping across India, Shipping charges extra..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Buyer preview */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">👁️ What buyers will see:</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span>🚚</span>
                        <p className="text-xs font-semibold text-blue-700">Dropship Item</p>
                        <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Ships in {formData.delivery_days}</span>
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
                <div className="h-px bg-gray-100" />
              </>
            )}


            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <SectionHeader icon={MapPin} title="Location" />
                <button type="button" onClick={handleGetLocation} disabled={locating}
                  className={"flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all " + (
                    locationSet ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                  )}>
                  {locating ? (
                    <><div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />Detecting</>
                  ) : locationSet ? (
                    <><Navigation className="w-3.5 h-3.5" />Set ✓</>
                  ) : (
                    <><Locate className="w-3.5 h-3.5" />Use GPS</>
                  )}
                </button>
              </div>

              {locationSet && formData.latitude && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-3">
                  <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-green-700">GPS coordinates saved — buyers can find this on the map</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City <span className="text-red-500">*</span></label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Pune"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State <span className="text-red-500">*</span></label>
                    <select name="state" value={formData.state} onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white">
                      <option value="">Select state</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Area / Locality</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Baner, Koregaon Park..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="411045"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit — normal on desktop, hidden on mobile (sticky version below) */}
            <button type="submit" disabled={loading || uploading}
              className="hidden sm:flex w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Post Listing'}
            </button>
          </form>
        </div>
      </div>

      {/* Sticky submit bar — mobile only */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-3 pb-5 z-40">
        <button
          onClick={(e) => handleSubmit(e as any)}
          disabled={loading || uploading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Post Listing'}
        </button>
      </div>

      {showVerifyModal && (
        <PhoneVerifyModal
          onVerified={() => { setShowVerifyModal(false); doSubmit() }}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  )
}
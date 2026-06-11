'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Category } from '@/types'
import { ArrowLeft, Upload, X, MapPin, Locate, Navigation, ShieldCheck } from 'lucide-react'
import { INDIA_STATES } from '@/lib/constants'
import PhoneVerifyModal from '@/components/PhoneVerifyModal'

const CONDITIONS = [
  { value: 'NEW',      label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD',     label: 'Good' },
  { value: 'FAIR',     label: 'Fair' },
  { value: 'POOR',     label: 'Poor' },
]

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

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', condition: 'GOOD',
    categoryId: '', city: '', state: '', area: '', pincode: '',
    latitude: '', longitude: '',
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
    try {
      setLoading(true)
      const res = await api.post('/products', {
        ...formData,
        price:     parseFloat(formData.price),
        latitude:  formData.latitude  ? parseFloat(formData.latitude)  : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        images,
      })
      if (res.data.success) {
        toast.success('Listing posted successfully!')
        router.push(`/products/${res.data.product.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post listing')
    } finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.price || !formData.categoryId || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields'); return
    }
    if (!user?.phoneVerified) { setShowVerifyModal(true); return }
    await doSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Post a Listing</h1>
          {user?.phoneVerified && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Phone Verified
            </span>
          )}
        </div>

        {/* Phone verification banner */}
        {!user?.phoneVerified && (
          <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700 font-medium">Phone verification required to post listings</p>
            </div>
            <button onClick={() => setShowVerifyModal(true)}
              className="text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              Verify Now
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos (max 5)</label>
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
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
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-orange-500">Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload photos</span>
                      <span className="text-xs text-gray-400">PNG, JPG up to 5MB each</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white">
                <option value="">Select a category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.) <span className="text-red-500">*</span></label>
              <input type="number" name="price" value={formData.price} onChange={handleChange}
                placeholder="e.g. 15000" min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-5 gap-2">
                {CONDITIONS.map(cond => (
                  <button key={cond.value} type="button"
                    onClick={() => setFormData({ ...formData, condition: cond.value })}
                    className={`py-2 px-1 text-xs font-medium rounded-xl border transition-colors ${
                      formData.condition === cond.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}>
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleChange}
                placeholder="Describe your item — condition, age, reason for selling..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none" />
            </div>

            {/* Location */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                <button type="button" onClick={handleGetLocation} disabled={locating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    locationSet ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
                  }`}>
                  {locating ? (
                    <><div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />Detecting...</>
                  ) : locationSet ? (
                    <><Navigation className="w-4 h-4" />Location Set ✓</>
                  ) : (
                    <><Locate className="w-4 h-4" />Use My Location</>
                  )}
                </button>
              </div>

              {locationSet && formData.latitude && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                  <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700">GPS coordinates saved — buyers can find this listing on the map</p>
                </div>
              )}

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

            {/* Submit */}
            <button type="submit" disabled={loading || uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Post Listing'}
            </button>
          </form>
        </div>
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

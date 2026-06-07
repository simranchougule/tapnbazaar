'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ArrowLeft, Trash2, Upload, X } from 'lucide-react'
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
    title:       '',
    description: '',
    price:       '',
    condition:   'GOOD',
    city:        '',
    state:       '',
    status:      'ACTIVE',
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
        title:       p.title,
        description: p.description,
        price:       p.price.toString(),
        condition:   p.condition,
        city:        p.city,
        state:       p.state,
        status:      p.status,
      })
    } catch (error) {
      toast.error('Product not found')
      router.push('/')
    } finally {
      setFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    try {
      setLoading(true)
      const res = await api.put('/products/' + id, {
        ...formData,
        price: parseFloat(formData.price),
        images,
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (max 5)
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" loading="lazy" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: cond.value })}
                    className={"py-2 px-1 text-xs font-medium rounded-xl border transition-colors " + (formData.condition === cond.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600')}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s.value })}
                    className={"py-2 px-1 text-xs font-medium rounded-xl border transition-colors " + (formData.status === s.value ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 text-gray-600')}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

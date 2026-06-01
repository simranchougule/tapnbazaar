'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Category } from '@/types'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { INDIA_STATES } from '@/lib/constants'

const CONDITIONS = [
  { value: 'NEW',      label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD',     label: 'Good' },
  { value: 'FAIR',     label: 'Fair' },
  { value: 'POOR',     label: 'Poor' },
]

export default function CreateProductPage() {
  const router = useRouter()
  const { isLoggedIn, loadFromStorage } = useAuthStore()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [images, setImages]         = useState<string[]>([])

  const [formData, setFormData] = useState({
    title:       '',
    description: '',
    price:       '',
    condition:   'GOOD',
    categoryId:  '',
    city:        '',
    state:       '',
  })

  useEffect(() => {
    loadFromStorage()
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to post a listing')
      router.push('/login')
    }
  }, [isLoggedIn])

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data.categories)
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const totalImages = images.length + files.length
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    try {
      setUploading(true)
      const formDataImg = new FormData()
      Array.from(files).forEach((file) => {
        formDataImg.append('images', file)
      })

      const res = await api.post('/upload/multiple', formDataImg, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setImages((prev) => [...prev, ...res.data.urls])
      toast.success(`${res.data.urls.length} image(s) uploaded!`)
    } catch (error) {
      toast.error('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.price || !formData.categoryId || !formData.city || !formData.state) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const res = await api.post('/products', {
        ...formData,
        price: parseFloat(formData.price),
        images,
      })

      if (res.data.success) {
        toast.success('Listing posted successfully!')
        router.push(`/products/${res.data.product.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Post a Listing</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (max 5)
              </label>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Button */}
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
                      <span className="text-sm text-gray-500">
                        Click to upload photos
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG up to 5MB each
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. iPhone 13 Pro Max 256GB"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 15000"
                min="0"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Condition */}
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
                    className={`py-2 px-1 text-xs font-medium rounded-xl border transition-colors ${
                      formData.condition === cond.value
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your item — condition, age, reason for selling..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
              />
            </div>

            {/* City and State */}
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
                  placeholder="Pune"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-white"
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Post Listing'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
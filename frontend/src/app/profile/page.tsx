'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Product } from '@/types'
import { MapPin, Package, LogOut, Edit, Check, X, ShoppingBag, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { INDIA_STATES } from '@/lib/constants'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, loadFromStorage, setAuth } = useAuthStore()
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [favCount, setFavCount]   = useState(0)
  const [activeTab, setActiveTab] = useState<'listings' | 'purchases'>('listings')
  const [editForm, setEditForm]   = useState({ name: '', phone: '', city: '', state: '', bio: '' })

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    fetchMyProducts()
    fetchFavCount()
  }, [isLoggedIn])

  useEffect(() => {
    if (user) setEditForm({ name: user.name || '', phone: user.phone || '', city: user.city || '', state: user.state || '', bio: '' })
  }, [user])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/products/user/my-listings')
      setProducts(res.data.products)
    } catch { toast.error('Failed to load listings') }
    finally { setLoading(false) }
  }

  const fetchFavCount = async () => {
    try {
      const res = await api.get('/favorites')
      setFavCount(res.data.products.length)
    } catch { /* ignore */ }
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) { toast.error('Name is required'); return }
    try {
      setSaving(true)
      const res = await api.put('/auth/profile', editForm)
      const token = localStorage.getItem('token') || ''
      setAuth(res.data.user, token)
      toast.success('Profile updated!')
      setEditing(false)
    } catch { toast.error('Failed to update profile') }
    finally { setSaving(false) }
  }

  const handleMarkSold = async (productId: string) => {
    try {
      await api.put('/products/' + productId, { status: 'SOLD' })
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'SOLD' } : p))
      toast.success('Marked as sold!')
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await api.delete('/products/' + productId)
      toast.success('Listing deleted!')
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch { toast.error('Failed to delete listing') }
  }

  const soldCount = products.filter(p => p.status === 'SOLD').length

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          {!editing ? (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  {user.city && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{user.city}{user.state ? ', ' + user.state : ''}</span>
                    </div>
                  )}
                  {user.phone && <p className="text-gray-400 text-sm mt-0.5">📞 {user.phone}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl transition-colors text-sm border border-orange-200"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <button
                  onClick={() => { logout(); router.push('/') }}
                  className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-gray-800">Edit Profile</h2>
                <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                  <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                  <select value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white">
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{products.length}</p>
              <p className="text-sm text-gray-500">Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{soldCount}</p>
              <p className="text-sm text-gray-500">Sold</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{favCount}</p>
              <p className="text-sm text-gray-500">Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{products.length - soldCount}</p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>

        {/* Buy / Sell Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setActiveTab('listings')}
            className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors " + (activeTab === 'listings' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
            <TrendingUp className="w-4 h-4" />
            My Listings
          </button>
          <button onClick={() => setActiveTab('purchases')}
            className={"flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors " + (activeTab === 'purchases' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
            <ShoppingBag className="w-4 h-4" />
            My Purchases
          </button>
          {activeTab === 'listings' && (
            <Link href="/products/new" className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              + Post New
            </Link>
          )}
          {activeTab === 'purchases' && (
            <Link href="/" className="ml-auto border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              Browse Products
            </Link>
          )}
        </div>

        {activeTab === 'listings' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="bg-slate-100 h-40 w-full" />
                    <div className="p-3 space-y-2">
                      <div className="bg-slate-100 h-4 rounded" />
                      <div className="bg-slate-100 h-4 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold mb-1">No listings yet</p>
                <p className="text-gray-400 text-sm mb-4">Buy great products or start selling your own items.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/" className="border border-orange-500 text-orange-500 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-50 transition-colors">Browse &amp; Buy</Link>
                  <Link href="/products/new" className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors text-sm">Post a Listing</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <Link href={'/products/' + product.id}>
                      <div className="bg-slate-100 h-40 w-full flex items-center justify-center relative">
                        {product.images.length > 0 ? (
                          <Image src={product.images[0]} alt={product.title} fill className="object-cover" unoptimized />
                        ) : (
                          <Package className="w-10 h-10 text-gray-300" />
                        )}
                        {product.status === 'SOLD' && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">SOLD</span>
                          </div>
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
                    <div className="flex gap-2 px-3 pb-3">
                      {product.status !== 'SOLD' && (
                        <button onClick={() => handleMarkSold(product.id)}
                          className="flex-1 flex items-center justify-center gap-1 border border-green-200 text-green-600 py-2 rounded-xl text-xs hover:bg-green-50 transition-colors">
                          <Check className="w-3 h-3" />
                          <span>Sold</span>
                        </button>
                      )}
                      <Link href={'/products/' + product.id + '/edit'}
                        className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs hover:border-orange-300 transition-colors">
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </Link>
                      <button onClick={() => handleDelete(product.id)}
                        className="flex-1 flex items-center justify-center gap-1 border border-red-200 text-red-500 py-2 rounded-xl text-xs hover:bg-red-50 transition-colors">
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'purchases' && (
          <div className="text-center py-16 bg-white rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-orange-200 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-1">No purchases yet</p>
            <p className="text-gray-400 text-sm mb-4">Discover great deals and buy from trusted sellers across India.</p>
            <Link href="/" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
              Browse &amp; Buy Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

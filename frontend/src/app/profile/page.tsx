'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Product } from '@/types'
import {
  MapPin, Package, LogOut, Edit, Check, X, ShoppingBag, TrendingUp,
  ChevronRight, Heart, MessageCircle, Bell, ShieldCheck
} from 'lucide-react'
import Link from 'next/link'
import { INDIA_STATES } from '@/lib/constants'
import PhoneVerifyModal from '@/components/PhoneVerifyModal'

const SIDEBAR_SECTIONS = [
  {
    label: 'My Account',
    items: [
      { icon: TrendingUp,  label: 'My Listings',   tab: 'listings' },
      { icon: ShoppingBag, label: 'My Chats',      tab: 'chats' },
      { icon: Heart,       label: 'Saved Items',   href: '/favorites' },
      { icon: Bell,        label: 'Notifications', href: '/notifications' },
    ],
  },
  {
    label: 'Settings',
    href: '/profile/settings',
    items: [
      { label: 'Personal Information',     href: '/profile/settings#personal' },
      { label: 'Change Password',          href: '/profile/settings#password' },
      { label: 'Notification Preferences', href: '/profile/settings#notifications' },
      { label: 'Privacy Settings',         href: '/profile/settings#privacy' },
      { label: 'Language Preferences',     href: '/profile/settings#language' },
      { label: 'Saved Addresses',          href: '/profile/settings#addresses' },
      { label: 'Location Preferences',     href: '/profile/settings#location' },
    ],
  },
  {
    label: 'Help & Support',
    href: '/profile/help',
    items: [
      { label: 'FAQs',             href: '/profile/help#faqs' },
      { label: 'Contact Support',  href: '/profile/help#contact' },
      { label: 'Report a Problem', href: '/profile/help#report' },
      { label: 'Safety Tips',      href: '/profile/help#safety' },
    ],
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout, loadFromStorage, setAuth } = useAuthStore()
  const [products, setProducts]   = useState<Product[]>([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [favCount, setFavCount]   = useState(0)
  const [activeTab, setActiveTab] = useState<'listings' | 'chats'>('listings')
  const [editForm, setEditForm]   = useState({ name: '', phone: '', city: '', state: '', bio: '' })
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

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
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* ── Mobile horizontal tabs ── */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {[
            { tab: 'listings' as const, label: 'My Listings' },
            { tab: 'chats' as const,    label: 'My Chats' },
          ].map(item => (
            <button key={item.tab} onClick={() => setActiveTab(item.tab)}
              className={'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ' +
                (activeTab === item.tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200')}>
              {item.label}
            </button>
          ))}
          <Link href="/favorites" className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200">Saved</Link>
          <Link href="/notifications" className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200">Notifications</Link>
          <Link href="/profile/settings" className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-gray-600 border border-gray-200">Settings</Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0 space-y-3">

            {/* Profile card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              {!editing ? (
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-gray-800">{user.name}</h1>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                    {user.city && (
                      <div className="flex items-center justify-center gap-1 text-gray-400 text-xs mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{user.city}{user.state ? ', ' + user.state : ''}</span>
                      </div>
                    )}
                    {user.phone && <p className="text-gray-400 text-xs mt-0.5">📞 {user.phone}</p>}
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-orange-500 hover:bg-orange-50 py-2 rounded-xl transition-colors text-xs border border-orange-200 font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                    <button
                      onClick={() => { logout(); router.push('/') }}
                      className="flex items-center justify-center gap-1.5 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors text-xs border border-red-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 text-sm">Edit Profile</h2>
                    <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                    <input value={editForm.city} onChange={e => setEditForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                    <select value={editForm.state} onChange={e => setEditForm(f => ({ ...f, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 bg-white">
                      <option value="">Select state</option>
                      {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2 rounded-xl text-xs font-medium transition-colors">
                    <Check className="w-3.5 h-3.5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-100">
                {[
                  { value: products.length,            label: 'Listed' },
                  { value: soldCount,                   label: 'Sold' },
                  { value: favCount,                    label: 'Saved' },
                  { value: products.length - soldCount, label: 'Active', orange: true },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className={'text-lg font-bold ' + (s.orange ? 'text-orange-500' : 'text-gray-800')}>{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Trust badges */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {user.phoneVerified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Phone Verified
                  </span>
                ) : (
                  <button onClick={() => setShowVerifyModal(true)}
                    className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors">
                    <ShieldCheck className="w-3 h-3" /> Verify Phone
                  </button>
                )}
                {user.emailVerified ? (
                  <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> Email Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-1 rounded-full">
                    Email Unverified
                  </span>
                )}
              </div>
            </div>

            {/* Nav Sections */}
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.label} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {section.href ? (
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.label ? null : section.label)}
                    className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.label}</span>
                    <ChevronRight className={'w-4 h-4 text-gray-400 transition-transform ' + (expandedSection === section.label ? 'rotate-90' : '')} />
                  </button>
                ) : (
                  <div className="px-4 py-3 border-b border-gray-50">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{section.label}</span>
                  </div>
                )}

                {(!section.href || expandedSection === section.label) && (
                  <ul>
                    {section.items.map((item: any) => {
                      const isActiveTab = item.tab && activeTab === item.tab
                      if (item.tab) {
                        return (
                          <li key={item.label}>
                            <button
                              onClick={() => setActiveTab(item.tab)}
                              className={'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-orange-50 ' +
                                (isActiveTab ? 'text-orange-500 bg-orange-50 font-semibold' : 'text-gray-600')}
                            >
                              {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                              <span>{item.label}</span>
                              {isActiveTab && <ChevronRight className="w-3.5 h-3.5 ml-auto text-orange-400" />}
                            </button>
                          </li>
                        )
                      }
                      return (
                        <li key={item.label}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                          >
                            {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" />}
                            <span>{item.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-300" />
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            ))}

            <button
              onClick={() => { logout(); router.push('/') }}
              className="w-full flex items-center justify-center gap-2 text-red-500 border border-red-100 hover:bg-red-50 py-3 rounded-2xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0">
            {/* Tabs + action (desktop) */}
            <div className="hidden lg:flex items-center gap-2 mb-4">
              <button onClick={() => setActiveTab('listings')}
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ' +
                  (activeTab === 'listings' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
                <TrendingUp className="w-4 h-4" /> My Listings
              </button>
              <button onClick={() => setActiveTab('chats')}
                className={'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ' +
                  (activeTab === 'chats' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300')}>
                <ShoppingBag className="w-4 h-4" /> My Chats
              </button>
              {activeTab === 'listings' && (
                <Link href="/products/new" className="ml-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  + Post New
                </Link>
              )}
              {activeTab === 'chats' && (
                <Link href="/chats" className="ml-auto border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  View Chats
                </Link>
              )}
            </div>

            {/* Mobile: post new / view chats action */}
            <div className="lg:hidden flex justify-end mb-4">
              {activeTab === 'listings' && (
                <Link href="/products/new" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  + Post New
                </Link>
              )}
              {activeTab === 'chats' && (
                <Link href="/chats" className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                  View Chats
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
                              <Image src={product.images[0]} alt={product.title} fill className="object-cover" sizes="200px" />
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
                              <Check className="w-3 h-3" /><span>Sold</span>
                            </button>
                          )}
                          <Link href={'/products/' + product.id + '/edit'}
                            className="flex-1 flex items-center justify-center gap-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-xs hover:border-orange-300 transition-colors">
                            <Edit className="w-3 h-3" /><span>Edit</span>
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

            {activeTab === 'chats' && (
              <div className="text-center py-16 bg-white rounded-2xl">
                <ShoppingBag className="w-12 h-12 text-orange-200 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold mb-1">Your buying activity</p>
                <p className="text-gray-400 text-sm mb-4">All your conversations with sellers are in one place.</p>
                <Link href="/chats" className="bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors">
                  View My Chats
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {showVerifyModal && (
        <PhoneVerifyModal
          onVerified={() => setShowVerifyModal(false)}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  )
}

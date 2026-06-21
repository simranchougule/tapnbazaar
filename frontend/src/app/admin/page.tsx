'use client'

// Fix #14 — Admin page client-side guard now checks user.isAdmin, not just isLoggedIn.
// Previously any logged-in user could see the admin shell briefly before the
// API returned 403. Now non-admin users are bounced to / immediately.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Users, Package, MessageCircle, TrendingUp, Trash2, ShieldCheck, Ban, Flag } from 'lucide-react'

interface Stats {
  totalUsers:     number
  totalProducts:  number
  totalMessages:  number
  activeProducts: number
  soldProducts:   number
}

interface AdminUser {
  id:        string
  name:      string
  email:     string
  city?:     string
  state?:    string
  isAdmin:   boolean
  isBanned:  boolean
  isTrusted: boolean
  createdAt: string
  _count:    { products: number }
}

interface AdminProduct {
  id:        string
  title:     string
  price:     number
  status:    string
  city:      string
  createdAt: string
  user:      { name: string; email: string }
  category:  { name: string }
}

interface AdminReport {
  id:        string
  reason:    string
  details?:  string
  status:    string
  createdAt: string
  product:   { id: string; title: string }
  user:      { name: string; email: string }
}

export default function AdminPage() {
  const router = useRouter()
  // Fix #14: read user from store so we can check isAdmin, not just isLoggedIn
  const { isLoggedIn, user, loadFromStorage } = useAuthStore()
  const [tab, setTab]           = useState<'stats' | 'users' | 'products' | 'reports'>('stats')
  const [stats, setStats]       = useState<Stats | null>(null)
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [reports, setReports]   = useState<AdminReport[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    // Fix #14: bounce non-admin users immediately — don't wait for API 403
    if (!isLoggedIn) { router.push('/login'); return }
    if (isLoggedIn && !user?.isAdmin) { router.push('/'); return }
    fetchStats()
  }, [isLoggedIn, user])

  useEffect(() => {
    if (tab === 'users'    && users.length === 0)    fetchUsers()
    if (tab === 'products' && products.length === 0) fetchProducts()
    if (tab === 'reports'  && reports.length === 0)  fetchReports()
  }, [tab])

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.stats)
    } catch {
      toast.error('Access denied — admin only')
      router.push('/')
    } finally { setLoading(false) }
  }

  const fetchUsers    = async () => { const res = await api.get('/admin/users');    setUsers(res.data.users) }
  const fetchProducts = async () => { const res = await api.get('/admin/products'); setProducts(res.data.products) }
  const fetchReports  = async () => { const res = await api.get('/admin/reports');  setReports(res.data.reports) }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return
    try {
      await api.delete('/admin/products/' + id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Listing deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleBan = async (id: string, banned: boolean) => {
    try {
      await api.patch('/admin/users/' + id + '/ban', { banned })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isBanned: banned } : u))
      toast.success(banned ? 'User banned' : 'User unbanned')
    } catch { toast.error('Failed to update') }
  }

  const handleTrust = async (id: string, trusted: boolean) => {
    try {
      await api.patch('/admin/users/' + id + '/trust', { trusted })
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isTrusted: trusted } : u))
      toast.success(trusted ? 'Marked as trusted' : 'Trust removed')
    } catch { toast.error('Failed to update') }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="bg-white h-28 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(['stats', 'users', 'products', 'reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={'flex-shrink-0 px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize ' +
                (tab === t ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:border-orange-300 border border-gray-200')}>
              {t === 'reports' ? (
                <span className="flex items-center gap-1.5"><Flag className="w-3.5 h-3.5" /> Reports</span>
              ) : t}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users',     value: stats.totalUsers,     icon: <Users className="w-5 h-5 text-blue-500" />,       bg: 'bg-blue-50' },
              { label: 'Total Listings',  value: stats.totalProducts,  icon: <Package className="w-5 h-5 text-orange-500" />,    bg: 'bg-orange-50' },
              { label: 'Active Listings', value: stats.activeProducts, icon: <TrendingUp className="w-5 h-5 text-green-500" />,  bg: 'bg-green-50' },
              { label: 'Sold',            value: stats.soldProducts,   icon: <ShieldCheck className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
              { label: 'Messages',        value: stats.totalMessages,  icon: <MessageCircle className="w-5 h-5 text-pink-500" />, bg: 'bg-pink-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center mb-3 ' + s.bg}>
                  {s.icon}
                </div>
                <p className="text-2xl font-bold text-gray-800">{s.value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Email', 'Location', 'Listings', 'Joined', 'Role', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(u => (
                    <tr key={u.id} className={'hover:bg-gray-50 transition-colors ' + (u.isBanned ? 'opacity-60' : '')}>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        <div className="flex items-center gap-1.5">
                          {u.isTrusted && <ShieldCheck className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                          {u.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.city || '—'}{u.state ? ', ' + u.state : ''}</td>
                      <td className="px-4 py-3 text-gray-500">{u._count.products}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        {u.isAdmin
                          ? <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">Admin</span>
                          : u.isBanned
                          ? <span className="bg-red-100 text-red-500 text-xs px-2 py-1 rounded-full">Banned</span>
                          : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">User</span>}
                      </td>
                      <td className="px-4 py-3">
                        {!u.isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleBan(u.id, !u.isBanned)}
                              className={'text-xs px-2 py-1 rounded-lg border transition-colors ' +
                                (u.isBanned
                                  ? 'border-green-200 text-green-600 hover:bg-green-50'
                                  : 'border-red-200 text-red-500 hover:bg-red-50')}
                            >
                              {u.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                              onClick={() => handleTrust(u.id, !u.isTrusted)}
                              className={'text-xs px-2 py-1 rounded-lg border transition-colors ' +
                                (u.isTrusted
                                  ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50')}
                            >
                              {u.isTrusted ? 'Untrust' : 'Trust'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Title', 'Seller', 'Category', 'Price', 'Status', 'City', 'Date', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={'/products/' + p.id} className="font-medium text-gray-800 hover:text-orange-500 truncate max-w-[180px] block">
                          {p.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{p.user.name}</td>
                      <td className="px-4 py-3 text-gray-500">{p.category.name}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">Rs.{p.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (
                          p.status === 'ACTIVE' ? 'bg-green-100 text-green-600' :
                          p.status === 'SOLD'   ? 'bg-red-100 text-red-500' :
                          'bg-gray-100 text-gray-500'
                        )}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{p.city}</td>
                      <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports tab */}
        {tab === 'reports' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {reports.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Flag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p>No reports yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Reported By', 'Listing', 'Reason', 'Details', 'Status', 'Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{r.user.name}</p>
                          <p className="text-xs text-gray-400">{r.user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={'/products/' + r.product.id} className="text-orange-500 hover:underline truncate max-w-[160px] block">
                            {r.product.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.reason}</td>
                        <td className="px-4 py-3 text-gray-400 max-w-[200px] truncate">{r.details || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={'text-xs px-2 py-1 rounded-full font-medium ' + (
                            r.status === 'PENDING'  ? 'bg-amber-100 text-amber-600' :
                            r.status === 'RESOLVED' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-500'
                          )}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

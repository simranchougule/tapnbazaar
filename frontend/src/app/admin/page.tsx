'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Users, Package, MessageCircle, TrendingUp, Trash2, ShieldCheck } from 'lucide-react'

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

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoggedIn, loadFromStorage } = useAuthStore()
  const [tab, setTab]           = useState<'stats' | 'users' | 'products'>('stats')
  const [stats, setStats]       = useState<Stats | null>(null)
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadFromStorage() }, [])

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    fetchStats()
  }, [isLoggedIn])

  useEffect(() => {
    if (tab === 'users' && users.length === 0)       fetchUsers()
    if (tab === 'products' && products.length === 0) fetchProducts()
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

  const fetchUsers   = async () => { const res = await api.get('/admin/users');    setUsers(res.data.users) }
  const fetchProducts = async () => { const res = await api.get('/admin/products'); setProducts(res.data.products) }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this listing permanently?')) return
    try {
      await api.delete('/admin/products/' + id)
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Listing deleted')
    } catch { toast.error('Failed to delete') }
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
        <div className="flex gap-2 mb-6">
          {(['stats', 'users', 'products'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-5 py-2 rounded-xl text-sm font-medium transition-colors capitalize " + (tab === t ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 hover:border-orange-300 border border-gray-200')}>
              {t}
            </button>
          ))}
        </div>

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users',     value: stats.totalUsers,     icon: <Users className="w-5 h-5 text-blue-500" />,   bg: 'bg-blue-50' },
              { label: 'Total Listings',  value: stats.totalProducts,  icon: <Package className="w-5 h-5 text-orange-500" />, bg: 'bg-orange-50' },
              { label: 'Active Listings', value: stats.activeProducts, icon: <TrendingUp className="w-5 h-5 text-green-500" />, bg: 'bg-green-50' },
              { label: 'Sold',            value: stats.soldProducts,   icon: <ShieldCheck className="w-5 h-5 text-purple-500" />, bg: 'bg-purple-50' },
              { label: 'Messages',        value: stats.totalMessages,  icon: <MessageCircle className="w-5 h-5 text-pink-500" />, bg: 'bg-pink-50' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className={"w-10 h-10 rounded-xl flex items-center justify-center mb-3 " + s.bg}>
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
                  {['Name', 'Email', 'Location', 'Listings', 'Joined', 'Role'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500">{u.city || '—'}{u.state ? ', ' + u.state : ''}</td>
                    <td className="px-4 py-3 text-gray-500">{u._count.products}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin
                        ? <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">Admin</span>
                        : <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">User</span>}
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
                      <span className={"text-xs px-2 py-1 rounded-full font-medium " + (
                        p.status === 'ACTIVE'   ? 'bg-green-100 text-green-600' :
                        p.status === 'SOLD'     ? 'bg-red-100 text-red-500' :
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
      </div>
    </div>
  )
}

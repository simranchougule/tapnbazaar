'use client'

// Fix #14 — Admin page client-side guard now checks user.isAdmin, not just isLoggedIn.
// Previously any logged-in user could see the admin shell briefly before the
// API returned 403. Now non-admin users are bounced to / immediately.
//
// Perf fix: each tab's table/UI is now a separate component loaded via
// next/dynamic, so visiting /admin only ships the "Stats" tab's code to
// the browser up front — Users/Products/Reports (each with their own
// table markup) only download when the admin actually clicks that tab,
// instead of all four shipping in one bundle regardless of which tab is
// ever opened.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { ShieldCheck, Flag } from 'lucide-react'

const TabLoading = () => (
  <div className="bg-white rounded-2xl shadow-sm p-8 animate-pulse space-y-3">
    <div className="bg-gray-100 h-8 rounded" />
    <div className="bg-gray-100 h-8 rounded" />
    <div className="bg-gray-100 h-8 rounded" />
  </div>
)

const StatsTab    = dynamic(() => import('./tabs/StatsTab'),    { loading: TabLoading, ssr: false })
const UsersTab    = dynamic(() => import('./tabs/UsersTab'),    { loading: TabLoading, ssr: false })
const ProductsTab = dynamic(() => import('./tabs/ProductsTab'), { loading: TabLoading, ssr: false })
const ReportsTab  = dynamic(() => import('./tabs/ReportsTab'),  { loading: TabLoading, ssr: false })

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

        {tab === 'stats'    && stats && <StatsTab stats={stats} />}
        {tab === 'users'    && <UsersTab users={users} onBan={handleBan} onTrust={handleTrust} />}
        {tab === 'products' && <ProductsTab products={products} onDelete={handleDeleteProduct} />}
        {tab === 'reports'  && <ReportsTab reports={reports} />}
      </div>
    </div>
  )
}

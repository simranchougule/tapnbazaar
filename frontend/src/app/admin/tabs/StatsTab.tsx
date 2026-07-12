import { Users, Package, TrendingUp, ShieldCheck, MessageCircle } from 'lucide-react'

interface Stats {
  totalUsers:     number
  totalProducts:  number
  totalMessages:  number
  activeProducts: number
  soldProducts:   number
}

export default function StatsTab({ stats }: { stats: Stats }) {
  return (
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
  )
}

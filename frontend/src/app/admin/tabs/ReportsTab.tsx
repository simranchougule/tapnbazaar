import Link from 'next/link'
import { Flag } from 'lucide-react'

interface AdminReport {
  id:        string
  reason:    string
  details?:  string
  status:    string
  createdAt: string
  product:   { id: string; title: string }
  user:      { name: string; email: string }
}

export default function ReportsTab({ reports }: { reports: AdminReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="text-center py-16 text-gray-400">
          <Flag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>No reports yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
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
    </div>
  )
}

import Link from 'next/link'
import { Trash2 } from 'lucide-react'

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

interface ProductsTabProps {
  products:  AdminProduct[]
  onDelete:  (id: string) => void
}

export default function ProductsTab({ products, onDelete }: ProductsTabProps) {
  return (
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
                  <button onClick={() => onDelete(p.id)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

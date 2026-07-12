import { ShieldCheck } from 'lucide-react'

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

interface UsersTabProps {
  users:       AdminUser[]
  onBan:       (id: string, banned: boolean) => void
  onTrust:     (id: string, trusted: boolean) => void
}

export default function UsersTab({ users, onBan, onTrust }: UsersTabProps) {
  return (
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
                        onClick={() => onBan(u.id, !u.isBanned)}
                        className={'text-xs px-2 py-1 rounded-lg border transition-colors ' +
                          (u.isBanned
                            ? 'border-green-200 text-green-600 hover:bg-green-50'
                            : 'border-red-200 text-red-500 hover:bg-red-50')}
                      >
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      <button
                        onClick={() => onTrust(u.id, !u.isTrusted)}
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
  )
}

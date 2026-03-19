import { useEffect, useState } from 'react'
import { Search, Loader2, Users, CheckCircle2, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { cn, fmtDate } from '@/lib/utils'

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: 'client' | 'manufacturer'
  companyName?: string
  businessName?: string
  category?: string
  isVerified: boolean
  isActive: boolean
  rating: number
  totalOrders: number
  createdAt: string
}

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Clients', value: 'client' },
  { label: 'Manufacturers', value: 'manufacturer' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    api.get('/admin/users')
      .then(r => setUsers(r.data.data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const toggleActive = async (userId: string, current: boolean) => {
    setActionId(userId)
    try {
      await api.patch(`/admin/users/${userId}/toggle-active`)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !current } : u))
    } catch (e) { console.error(e) }
    finally { setActionId(null) }
  }

  const filtered = users.filter(u => {
    if (tab !== 'all' && u.role !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Users</h2>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                tab === t.value ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
              )}>
              {t.label}
              <span className={cn('ml-1.5 text-xs', tab === t.value ? 'text-white/60' : 'text-gray-400')}>
                {t.value === 'all' ? users.length : users.filter(u => u.role === t.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Name', 'Email', 'Role', 'Company', 'Status', 'Joined', 'Actions'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users size={28} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No users found</p>
              </div>
            ) : filtered.map(u => (
              <div key={u.id}
                className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                <Link to={`/users/${u.id}`} className="flex items-center gap-2.5 min-w-0 group">
                  <div className="w-8 h-8 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{u.fullName.charAt(0)}</span>
                  </div>
                  <p className="text-sm font-medium text-[#0A0A0A] truncate group-hover:underline">{u.fullName}</p>
                </Link>
                <p className="text-sm text-gray-600 truncate">{u.email}</p>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize w-fit',
                  u.role === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                )}>{u.role}</span>
                <p className="text-sm text-gray-600 truncate">{u.companyName || u.businessName || '—'}</p>
                <div className="flex items-center gap-1">
                  {u.isActive
                    ? <CheckCircle2 size={14} className="text-green-500" />
                    : <XCircle size={14} className="text-red-400" />}
                  <span className={cn('text-xs font-medium', u.isActive ? 'text-green-600' : 'text-red-500')}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{fmtDate(u.createdAt)}</p>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  disabled={actionId === u.id}
                  className={cn(
                    'text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
                    u.isActive
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  )}>
                  {actionId === u.id ? '...' : u.isActive ? 'Suspend' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

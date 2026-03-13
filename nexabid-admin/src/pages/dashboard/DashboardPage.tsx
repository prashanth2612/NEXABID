import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Package, Gavel, CreditCard, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'
import { fmt, fmtTime } from '@/lib/utils'

interface Stats {
  totalUsers: number
  totalClients: number
  totalManufacturers: number
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalBids: number
  totalRevenue: number
  pendingPayments: number
  recentOrders: {
    id: string; orderNumber: string; title: string; status: string
    clientId: { fullName: string }; createdAt: string; escrowAmount?: number
  }[]
  recentUsers: {
    id: string; fullName: string; email: string; role: string; createdAt: string
  }[]
}

const STATUS_COLOR: Record<string, string> = {
  posted: '#2563EB', bidding: '#7C3AED', confirmed: '#059669',
  manufacturing: '#D97706', shipped: '#0891B2', completed: '#6B7280', cancelled: '#DC2626',
}

const MOCK_CHART = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],
  orders: Math.floor(Math.random() * 8) + 2,
  revenue: Math.floor(Math.random() * 200000) + 50000,
}))

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  const cards = [
    { label: 'Total Users',      value: stats?.totalUsers ?? 0,      icon: Users,      color: 'bg-blue-50 text-blue-600',   sub: `${stats?.totalClients} clients · ${stats?.totalManufacturers} manufacturers` },
    { label: 'Total Orders',     value: stats?.totalOrders ?? 0,     icon: Package,    color: 'bg-purple-50 text-purple-600', sub: `${stats?.activeOrders} active · ${stats?.completedOrders} completed` },
    { label: 'Total Bids',       value: stats?.totalBids ?? 0,       icon: Gavel,      color: 'bg-orange-50 text-orange-600', sub: 'Across all orders' },
    { label: 'Total Revenue',    value: fmt(stats?.totalRevenue ?? 0), icon: TrendingUp, color: 'bg-green-50 text-green-600',  sub: `${fmt(stats?.pendingPayments ?? 0)} in escrow` },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Overview</h2>
        <p className="text-gray-500 text-sm mt-0.5">Platform-wide stats and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color.split(' ')[0]}`}>
              <c.icon size={18} className={c.color.split(' ')[1]} />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{c.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-[#0A0A0A]">Orders This Week</p>
            <p className="text-xs text-gray-400 mt-0.5">Daily order volume</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={MOCK_CHART}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={25} />
            <Tooltip contentStyle={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }} />
            <Area type="monotone" dataKey="orders" stroke="#0A0A0A" strokeWidth={2} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0A0A0A]">Recent Orders</p>
            <Link to="/orders" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentOrders || []).slice(0, 5).map(o => (
              <Link key={o.id} to={`/orders/${o.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{o.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{o.clientId?.fullName} · {fmtTime(o.createdAt)}</p>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
                  style={{ color: STATUS_COLOR[o.status] || '#6b7280', background: `${STATUS_COLOR[o.status] || '#6b7280'}18` }}>
                  {o.status}
                </span>
              </Link>
            ))}
            {!stats?.recentOrders?.length && (
              <p className="text-center text-gray-400 text-sm py-8">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-[#0A0A0A]">Recent Users</p>
            <Link to="/users" className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentUsers || []).slice(0, 5).map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{u.fullName.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${
                  u.role === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>{u.role}</span>
              </div>
            ))}
            {!stats?.recentUsers?.length && (
              <p className="text-center text-gray-400 text-sm py-8">No users yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

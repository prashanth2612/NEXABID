import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ShieldCheck, Package, Star,
  Layers, ChevronRight, ArrowRight, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { STATUS_CONFIG } from '@/types/orders'
import type { ActiveOrder } from '@/types/orders'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function DashboardPage() {
  const { manufacturer } = useAuthStore()
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
  const [loading, setLoading] = useState(true)

  const [bidStats, setBidStats] = useState({ total: 0, accepted: 0, pending: 0 })

  useEffect(() => {
    api.get('/bids/my-bids')
      .then((res) => {
        const bids = res.data?.data?.bids || []
        const accepted = bids.filter((b: {status:string}) => b.status === 'accepted')
        const activeOrds = accepted.map((b: {orderId: unknown}) => b.orderId).filter(Boolean)
        setActiveOrders(activeOrds)
        setBidStats({
          total: bids.length,
          accepted: bids.filter((b: {status:string}) => b.status === 'accepted').length,
          pending: bids.filter((b: {status:string}) => b.status === 'pending').length,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Bids',    value: bidStats.total,    sub: 'Submitted',      icon: Layers,      color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Accepted',       value: bidStats.accepted,  sub: 'Won orders',     icon: ShieldCheck, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Active Orders',  value: activeOrders.length,sub: 'In progress',    icon: Package,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Pending Bids',   value: bidStats.pending,   sub: 'Awaiting response', icon: Star,    color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            Welcome back, {manufacturer?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Browse orders and start accepting jobs</p>
        </div>
        <Link to="/browse" className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          <Layers size={15} /> Browse Orders
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon size={17} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{s.value}</p>
            <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Active orders */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[#0A0A0A]">Active Orders</h3>
            <Link to="/orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Package size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm mb-1">No active orders yet</p>
              <p className="text-gray-400 text-xs mb-4">Accept orders from Browse to start manufacturing</p>
              <Link to="/browse" className="px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
                Browse Orders
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeOrders.map((order) => {
                const cfg = STATUS_CONFIG[order.status]
                return (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber} · {order.clientName}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <div className="bg-[#0A0A0A] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-white/50" />
              <span className="text-white/50 text-xs uppercase tracking-wider">Escrow Balance</span>
            </div>
            <p className="text-2xl font-bold tracking-tight mb-1">—</p>
            <p className="text-white/40 text-xs">Available after first order</p>
          </div>

          <Link to="/browse"
            className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors group"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#0A0A0A] transition-colors">
              <Layers size={17} className="text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-semibold text-[#0A0A0A] mb-1">Browse New Orders</p>
            <p className="text-xs text-gray-400">Swipe through live orders and accept jobs that match your capacity.</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-[#0A0A0A]">
              Start swiping <ArrowRight size={12} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

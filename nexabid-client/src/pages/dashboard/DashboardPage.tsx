import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, TrendingUp, ShieldCheck, Clock,
  PlusCircle, ArrowRight, ChevronRight, Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { STATUS_CONFIG } from '@/types/order'
import type { Order } from '@/types/order'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`

interface Stats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  inEscrow: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, activeOrders: 0, completedOrders: 0, inEscrow: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          api.get('/orders/my-orders?limit=3'),
          api.get('/orders/stats'),
        ])
        setOrders(ordersRes.data.data.orders)
        setStats(statsRes.data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Orders',  value: stats.totalOrders,            sub: `${stats.activeOrders} active`,  icon: Package,    color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'In Escrow',     value: formatCurrency(stats.inEscrow), sub: 'Funds secured',              icon: ShieldCheck, color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Completed',     value: stats.completedOrders,        sub: 'All time',                       icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Active Orders', value: stats.activeOrders,           sub: 'In progress',                    icon: Clock,      color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            Good morning, {user?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your orders today.</p>
        </div>
        <Link to="/orders/create" className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          <PlusCircle size={15} /> Post Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((s) => (
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
        {/* Recent Orders */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[#0A0A0A]">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-gray-400" />
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Package size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm mb-1">No orders yet</p>
              <p className="text-gray-400 text-xs mb-4">Post your first order to get bids from manufacturers</p>
              <Link to="/orders/create" className="px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
                Post an Order
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#6b7280', bg: '#f3f4f6' }
                return (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber} · {order.quantity} {order.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                      <span className="text-sm font-semibold text-[#0A0A0A]">
                        {order.isFixedPrice ? formatCurrency(order.fixedPrice!) : `${formatCurrency(order.budgetMin!)}+`}
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
            <p className="text-2xl font-bold tracking-tight mb-1">{formatCurrency(stats.inEscrow)}</p>
            <p className="text-white/40 text-xs">Secured across {stats.activeOrders} active orders</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-1">
              {[
                { label: 'Post a new order', icon: PlusCircle, path: '/orders/create' },
                { label: 'View all orders',  icon: Package,    path: '/orders' },
              ].map((a) => (
                <Link key={a.path} to={a.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <a.icon size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{a.label}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

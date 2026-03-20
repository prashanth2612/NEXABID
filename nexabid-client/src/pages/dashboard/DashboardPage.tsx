import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, TrendingUp, ShieldCheck, Clock,
  PlusCircle, ArrowRight, ChevronRight, Loader2,
  CheckCircle2, MessageSquare, IndianRupee, Bell,
  Truck, FileText, Star, Zap,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { STATUS_CONFIG } from '@/types/order'
import type { Order } from '@/types/order'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { ListRowSkeleton } from '@/components/ui/Skeleton'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

interface Stats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  inEscrow: number
  totalBids?: number
  cancelledOrders?: number
}

interface Activity {
  id: string
  type: 'bid' | 'order' | 'payment' | 'message' | 'delivery' | 'complete' | 'rating'
  title: string
  sub: string
  time: string
  link?: string
}

const ACTIVITY_ICONS = {
  bid:      { icon: TrendingUp,   color: 'text-blue-600',   bg: 'bg-blue-50' },
  order:    { icon: FileText,     color: 'text-purple-600', bg: 'bg-purple-50' },
  payment:  { icon: IndianRupee, color: 'text-green-600',  bg: 'bg-green-50' },
  message:  { icon: MessageSquare,color: 'text-orange-600', bg: 'bg-orange-50' },
  delivery: { icon: Truck,        color: 'text-indigo-600', bg: 'bg-indigo-50' },
  complete: { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
  rating:   { icon: Star,         color: 'text-yellow-600', bg: 'bg-yellow-50' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Mini sparkline bar chart
function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm transition-all"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === values.length - 1 ? 1 : 0.35 + (i / values.length) * 0.5 }} />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, activeOrders: 0, completedOrders: 0, inEscrow: 0 })
  const [activities, setActivities] = useState<Activity[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [ordersRes, statsRes, notifsRes] = await Promise.all([
          api.get('/orders/my-orders?limit=5'),
          api.get('/orders/stats'),
          api.get('/chat/notifications'),
        ])
        const ords: Order[] = ordersRes.data.data.orders || []
        setOrders(ords)
        setStats(statsRes.data.data)
        const notifs = notifsRes.data.data.notifications || []
        setNotifications(notifs.slice(0, 5))

        // Build activity feed from orders + notifications
        const acts: Activity[] = []

        // From recent orders
        ords.slice(0, 3).forEach((o: Order) => {
          if (o.status === 'bidding') {
            acts.push({ id: o.id + '-bid', type: 'bid', title: `New bids on "${o.title}"`, sub: 'Manufacturers are competing', time: o.updatedAt || o.createdAt, link: `/orders/${o.id}` })
          } else if (o.status === 'confirmed') {
            acts.push({ id: o.id + '-conf', type: 'order', title: `Order confirmed`, sub: o.title, time: o.updatedAt || o.createdAt, link: `/orders/${o.id}` })
          } else if (o.status === 'manufacturing') {
            acts.push({ id: o.id + '-mfr', type: 'delivery', title: `In production`, sub: o.title, time: o.updatedAt || o.createdAt, link: `/orders/${o.id}` })
          } else if (o.status === 'completed') {
            acts.push({ id: o.id + '-done', type: 'complete', title: `Order completed`, sub: o.title, time: o.updatedAt || o.createdAt, link: `/orders/${o.id}` })
          } else if (o.status === 'posted') {
            acts.push({ id: o.id + '-post', type: 'order', title: `Order posted`, sub: o.title, time: o.createdAt, link: `/orders/${o.id}` })
          }
        })

        // From notifications
        notifs.slice(0, 4).forEach((n: any) => {
          const typeMap: Record<string, Activity['type']> = {
            bid_received: 'bid', order_confirmed: 'order', payment_escrowed: 'payment',
            payment_released: 'payment', new_message: 'message', order_update: 'delivery',
          }
          acts.push({
            id: n._id || n.id,
            type: typeMap[n.type] || 'order',
            title: n.title,
            sub: n.body,
            time: n.createdAt,
            link: n.link,
          })
        })

        // Sort by time, dedupe
        const seen = new Set()
        acts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        setActivities(acts.filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true }).slice(0, 6))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Fake sparkline data based on stats
  const sparkOrders  = [1, 2, 1, 3, stats.totalOrders - 4, stats.totalOrders - 2, stats.totalOrders].map((v: number) => Math.max(0, v))
  const sparkEscrow  = [0, 1, 2, 1, 3, 2, stats.inEscrow > 0 ? 4 : 0]
  const sparkDone    = [0, 1, 1, 2, stats.completedOrders - 2, stats.completedOrders - 1, stats.completedOrders].map((v: number) => Math.max(0, v))
  const sparkActive  = [1, 2, 1, 2, 3, 2, stats.activeOrders].map((v: number) => Math.max(0, v))

  const statCards = [
    { label: 'Total Orders',   value: String(stats.totalOrders),       sub: `${stats.activeOrders} active`,    icon: Package,    color: 'text-blue-600',   bg: 'bg-blue-50',    spark: sparkOrders,  sparkColor: '#2563eb' },
    { label: 'In Escrow',      value: fmt(stats.inEscrow),             sub: 'Funds secured',                   icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50',   spark: sparkEscrow,  sparkColor: '#16a34a' },
    { label: 'Completed',      value: String(stats.completedOrders),   sub: 'Successfully delivered',          icon: CheckCircle2, color: 'text-purple-600',bg: 'bg-purple-50', spark: sparkDone,    sparkColor: '#9333ea' },
    { label: 'Active Orders',  value: String(stats.activeOrders),      sub: 'In progress right now',           icon: Zap,        color: 'text-orange-600', bg: 'bg-orange-50',  spark: sparkActive,  sparkColor: '#ea580c' },
  ]

  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            {getGreeting()}, {user?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Here's what's happening with your orders today.</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Link to="/notifications"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
              <Bell size={14} />
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            </Link>
          )}
          <Link to="/orders/create"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
            <PlusCircle size={15} /> Post Order
          </Link>
        </div>
      </div>

      {/* Stat Cards with sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bg)}>
                <s.icon size={17} className={s.color} />
              </div>
              <SparkBars values={s.spark} color={s.sparkColor} />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A] tracking-tight">{s.value}</p>
            <p className="text-gray-800 text-xs font-medium mt-1">{s.label}</p>
            <p className="text-gray-400 text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Orders — 2/3 width */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-[#0A0A0A]">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(3)].map((_, i) => <ListRowSkeleton key={i} />)}
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
                const budget = order.isFixedPrice ? fmt(order.fixedPrice!) : `${fmt(order.budgetMin!)} – ${fmt(order.budgetMax!)}`
                return (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Package size={15} className="text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber} · {order.quantity} {order.unit}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                      <span className="text-sm font-semibold text-[#0A0A0A]">{budget}</span>
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Escrow card */}
          <div className="bg-[#0A0A0A] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={15} className="text-white/50" />
              <span className="text-white/50 text-xs uppercase tracking-wider">Escrow Balance</span>
            </div>
            <p className="text-2xl font-bold tracking-tight mb-1">{fmt(stats.inEscrow)}</p>
            <p className="text-white/40 text-xs">Secured across {stats.activeOrders} active order{stats.activeOrders !== 1 ? 's' : ''}</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>Completion rate</span>
                <span>{stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-1">
              {[
                { label: 'Post a new order', icon: PlusCircle,    path: '/orders/create' },
                { label: 'View all orders',  icon: Package,       path: '/orders' },
                { label: 'Messages',         icon: MessageSquare, path: '/chat' },
                { label: 'Payments',         icon: IndianRupee,   path: '/payments' },
              ].map((a) => (
                <Link key={a.path} to={a.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <a.icon size={14} className="text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{a.label}</span>
                  <ChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Recent Activity</h3>
          <Link to="/notifications" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[...Array(4)].map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No recent activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((act) => {
              const cfg = ACTIVITY_ICONS[act.type] || ACTIVITY_ICONS.order
              const Icon = cfg.icon
              return (
                <Link key={act.id} to={act.link || '#'}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg)}>
                    <Icon size={14} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{act.title}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{act.sub}</p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(act.time)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, ShieldCheck, Package, Star,
  ChevronRight, ArrowRight, Loader2, IndianRupee,
  CheckCircle2, Clock, Zap, MessageSquare, Target,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

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

// Donut chart for win rate
function WinRateDonut({ rate }: { rate: number }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (rate / 100) * circ
  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="#0A0A0A" strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[#0A0A0A]">{rate}%</span>
      </div>
    </div>
  )
}

// Mini bar sparkline
function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-sm"
          style={{ height: `${(v / max) * 100}%`, background: color, opacity: i === values.length - 1 ? 1 : 0.3 + (i / values.length) * 0.6 }} />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { manufacturer } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [bids, setBids] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      api.get('/bids/my-bids'),
      api.get('/payments/my-payments'),
      api.get('/chat/notifications'),
      api.get('/profile'),
    ]).then(([bRes, pRes, nRes, prRes]) => {
      setBids(bRes.data?.data?.bids || [])
      setPayments(pRes.data?.data?.payments || [])
      setNotifications((nRes.data?.data?.notifications || []).slice(0, 6))
      setProfile(prRes.data?.data?.profile || prRes.data?.data?.user || {})
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Computed stats
  const totalBids      = bids.length
  const acceptedBids   = bids.filter(b => b.status === 'accepted').length
  const pendingBids    = bids.filter(b => b.status === 'pending').length
  const winRate        = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0
  const released       = payments.filter(p => p.escrowStatus === 'released')
  const escrowed       = payments.filter(p => p.escrowStatus === 'escrowed')
  const totalEarned    = released.reduce((s: number, p: any) => s + (p.manufacturerPayout ?? p.amount), 0)
  const inEscrow       = escrowed.reduce((s: number, p: any) => s + p.amount, 0)
  const avgOrderValue  = released.length > 0 ? Math.round(totalEarned / released.length) : 0
  const rating         = profile?.rating || 0

  // Sparklines
  const sparkBids    = [1, 2, 1, totalBids - 3, totalBids - 2, totalBids - 1, totalBids].map(n => Math.max(0, n))
  const sparkEarned  = [0, 1, 2, 1, 3, released.length - 1, released.length].map(n => Math.max(0, n))

  // Active orders from accepted bids
  const activeOrders = bids.filter(b => b.status === 'accepted' && b.orderId).slice(0, 4)

  // Activity from notifications
  const activities = notifications.map((n: any) => ({
    id: n._id || n.id,
    title: n.title,
    sub: n.body,
    time: n.createdAt,
    link: n.link,
    read: n.read,
  }))

  const statCards = [
    { label: 'Total Bids',    value: String(totalBids),   sub: `${pendingBids} pending`,         icon: Target,       color: 'text-blue-600',   bg: 'bg-blue-50',   spark: sparkBids,   sparkColor: '#2563eb' },
    { label: 'Total Earned',  value: fmt(totalEarned),    sub: 'After platform fees',             icon: IndianRupee,  color: 'text-green-600',  bg: 'bg-green-50',  spark: sparkEarned, sparkColor: '#16a34a' },
    { label: 'In Escrow',     value: fmt(inEscrow),       sub: `${escrowed.length} orders`,       icon: ShieldCheck,  color: 'text-purple-600', bg: 'bg-purple-50', spark: sparkEarned, sparkColor: '#9333ea' },
    { label: 'Avg Order',     value: fmt(avgOrderValue),  sub: `${released.length} completed`,    icon: TrendingUp,   color: 'text-orange-600', bg: 'bg-orange-50', spark: sparkBids,   sparkColor: '#ea580c' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">
            {getGreeting()}, {manufacturer?.fullName?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Your manufacturing business at a glance.</p>
        </div>
        <Link to="/browse"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          <Package size={15} /> Browse Orders
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
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
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                <Package size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm mb-1">No active orders yet</p>
              <p className="text-gray-400 text-xs mb-4">Start bidding on orders to win manufacturing contracts</p>
              <Link to="/browse" className="px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
                Browse Orders
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {activeOrders.map((bid: any) => {
                const order = bid.orderId
                if (!order || typeof order !== 'object') return null
                return (
                  <Link key={bid._id || bid.id} to={`/orders/${order._id || order.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={15} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber} · {order.status}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-green-600">{fmt(bid.proposedPrice)}</span>
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
          {/* Win rate card */}
          <div className="bg-[#0A0A0A] rounded-2xl p-5 text-white">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-4">Bid Win Rate</p>
            <div className="flex items-center gap-4">
              <WinRateDonut rate={winRate} />
              <div>
                <p className="text-2xl font-bold">{winRate}%</p>
                <p className="text-white/40 text-xs mt-1">{acceptedBids} of {totalBids} bids won</p>
              </div>
            </div>
            {rating > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-semibold text-sm">{rating.toFixed(1)}</span>
                <span className="text-white/40 text-xs">average rating</span>
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-1">
              {[
                { label: 'Browse Orders',  icon: Zap,          path: '/browse' },
                { label: 'My Bids',        icon: Target,       path: '/orders' },
                { label: 'Earnings',       icon: IndianRupee,  path: '/earnings' },
                { label: 'Messages',       icon: MessageSquare,path: '/chat' },
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

      {/* Activity feed */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <h3 className="text-sm font-semibold text-[#0A0A0A]">Recent Activity</h3>
          <Link to="/notifications" className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <Clock size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No recent activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((act) => (
              <Link key={act.id} to={act.link || '#'}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors group">
                <div className={cn('w-2 h-2 rounded-full flex-shrink-0', act.read ? 'bg-gray-200' : 'bg-blue-500')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm truncate', act.read ? 'text-gray-600' : 'text-[#0A0A0A] font-medium')}>{act.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{act.sub}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(act.time)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

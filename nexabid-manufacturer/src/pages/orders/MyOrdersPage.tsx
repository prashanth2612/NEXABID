import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ChevronRight, Loader2, IndianRupee,
  CheckCircle2, Clock, XCircle, AlertCircle,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Bid {
  id: string
  proposedPrice: number
  deliveryDays: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  orderId: {
    id: string
    title: string
    orderNumber: string
    status: string
    category: string
    deliveryDate: string
  } | null
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

const BID_STATUS = {
  accepted: { label: 'Accepted', color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  pending:  { label: 'Pending',  color: '#D97706', bg: '#FFFBEB', icon: Clock },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
}

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  posted:        { label: 'Posted',        color: '#2563EB', bg: '#EFF6FF' },
  bidding:       { label: 'Bidding',       color: '#7C3AED', bg: '#F5F3FF' },
  confirmed:     { label: 'Confirmed',     color: '#059669', bg: '#ECFDF5' },
  manufacturing: { label: 'Manufacturing', color: '#D97706', bg: '#FFFBEB' },
  shipped:       { label: 'Shipped',       color: '#0891B2', bg: '#ECFEFF' },
  completed:     { label: 'Completed',     color: '#6B7280', bg: '#F3F4F6' },
  cancelled:     { label: 'Cancelled',     color: '#DC2626', bg: '#FEF2F2' },
}

const TABS = [
  { label: 'All',      value: 'all' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
]

export default function MyOrdersPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    setLoading(true)
    api.get('/bids/my-bids')
      .then((res) => {
        const raw = res.data?.data?.bids
        if (Array.isArray(raw)) {
          setBids(raw)
        } else {
          console.error('Unexpected bids response:', res.data)
          setBids([])
        }
      })
      .catch((e) => {
        console.error('Failed to load bids:', e)
        setError('Failed to load bids. Please refresh.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? bids : bids.filter(b => b.status === tab)

  const countFor = (val: string) => val === 'all' ? bids.length : bids.filter(b => b.status === val).length

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle size={32} className="text-red-400 mb-3" />
      <p className="text-gray-700 font-medium mb-1">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-sm">Retry</button>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">My Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${bids.length} bid${bids.length !== 1 ? 's' : ''} submitted`}
          </p>
        </div>
        <Link to="/browse"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          Browse More
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5',
              tab === t.value ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {t.label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full',
              tab === t.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
            )}>
              {countFor(t.value)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-800 font-semibold mb-1">
            {tab === 'all' ? 'No bids yet' : `No ${tab} bids`}
          </p>
          <p className="text-gray-400 text-sm mb-5">
            {tab === 'all' ? 'Browse orders and submit bids to get started' : `Switch to "All" to see all your bids`}
          </p>
          {tab === 'all' && (
            <Link to="/browse" className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
              Browse Orders
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(bid => {
            const order = bid.orderId
            if (!order) return null

            const bidCfg = BID_STATUS[bid.status]
            const BidIcon = bidCfg.icon
            const orderCfg = ORDER_STATUS[order.status] ?? { label: order.status, color: '#6b7280', bg: '#f3f4f6' }
            const daysLeft = Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

            return (
              <Link key={bid.id} to={`/orders/${order.id}`}
                className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                  bid.status === 'accepted' ? 'bg-green-50' : 'bg-gray-100'
                )}>
                  <Package size={17} className={bid.status === 'accepted' ? 'text-green-600' : 'text-gray-500'} />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#0A0A0A] truncate">{order.title}</p>
                    {bid.status === 'accepted' && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wide flex-shrink-0">
                        ✓ Won
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{order.orderNumber}</span>
                    <span>·</span>
                    <span>{order.category}</span>
                    <span>·</span>
                    <span>{daysLeft > 0 ? `${daysLeft}d left` : 'Overdue'}</span>
                  </div>
                </div>

                {/* Bid amount */}
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    <IndianRupee size={13} className="text-[#0A0A0A]" />
                    <p className="text-sm font-bold text-[#0A0A0A]">{bid.proposedPrice.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{bid.deliveryDays} days</p>
                </div>

                {/* Order status */}
                <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: orderCfg.color, background: orderCfg.bg }}>
                  {orderCfg.label}
                </span>

                {/* Bid status */}
                <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ color: bidCfg.color, background: bidCfg.bg }}>
                  <BidIcon size={11} />
                  {bidCfg.label}
                </span>

                <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-600 transition-colors flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

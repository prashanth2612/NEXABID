import { useEffect, useState } from 'react'
import { Search, Loader2, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { cn, fmt, fmtDate } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  title: string
  category: string
  status: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  escrowAmount?: number
  escrowStatus?: string
  totalBids: number
  clientId: { id: string; fullName: string; companyName?: string }
  acceptedManufacturerId?: { id: string; fullName: string; businessName?: string }
  createdAt: string
  deliveryDate: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  posted:        { label: 'Posted',        color: '#2563EB', bg: '#EFF6FF' },
  bidding:       { label: 'Bidding',       color: '#7C3AED', bg: '#F5F3FF' },
  confirmed:     { label: 'Confirmed',     color: '#059669', bg: '#ECFDF5' },
  manufacturing: { label: 'Manufacturing', color: '#D97706', bg: '#FFFBEB' },
  shipped:       { label: 'Shipped',       color: '#0891B2', bg: '#ECFEFF' },
  completed:     { label: 'Completed',     color: '#6B7280', bg: '#F3F4F6' },
  cancelled:     { label: 'Cancelled',     color: '#DC2626', bg: '#FEF2F2' },
}

const STATUSES = ['all', 'posted', 'bidding', 'confirmed', 'manufacturing', 'shipped', 'completed', 'cancelled']

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/orders')
      .then(r => setOrders(r.data.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (tab !== 'all' && o.status !== tab) return false
    if (search) {
      const q = search.toLowerCase()
      return o.title.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q) ||
        o.clientId?.fullName?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Status tabs */}
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 overflow-x-auto">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setTab(s)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap capitalize',
                tab === s ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
              )}>
              {s === 'all' ? `All (${orders.length})` : `${s} (${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 w-56" />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Client', 'Value', 'Bids', 'Status', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package size={28} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No orders found</p>
              </div>
            ) : filtered.map(o => {
              const cfg = STATUS_CONFIG[o.status] ?? { label: o.status, color: '#6b7280', bg: '#f3f4f6' }
              const value = o.escrowAmount || (o.isFixedPrice ? o.fixedPrice : o.budgetMax) || 0
              return (
                <Link key={o.id} to={`/orders/${o.id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{o.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{o.orderNumber} · {o.category}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{o.clientId?.fullName}</p>
                  <p className="text-sm font-semibold text-[#0A0A0A]">{value ? fmt(value) : '—'}</p>
                  <p className="text-sm text-gray-600">{o.totalBids}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full w-fit capitalize"
                    style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  <p className="text-xs text-gray-400">{fmtDate(o.createdAt)}</p>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

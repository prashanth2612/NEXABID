import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, PlusCircle, Search, Filter, ChevronRight, Loader2 } from 'lucide-react'
import { STATUS_CONFIG } from '@/types/order'
import type { Order, OrderStatus } from '@/types/order'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import { ListRowSkeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`

type TabValue = 'all' | 'pending' | 'active' | 'completed' | 'draft'

const TABS: { label: string; value: TabValue }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Active',    value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft',     value: 'draft' },
]

const TAB_STATUSES: Record<TabValue, string[]> = {
  all:       [],
  pending:   ['posted', 'bidding'],
  active:    ['confirmed', 'manufacturing', 'shipped', 'delivered'],
  completed: ['completed'],
  draft:     ['draft'],
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabValue>('all')
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const activeFilterCount = [minAmount, maxAmount, dateFrom, dateTo].filter(Boolean).length

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const params = ''
        const res = await api.get(`/orders/my-orders${params}`)
        setOrders(res.data.data.orders)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = orders.filter((o) => {
    const tabStatuses = TAB_STATUSES[activeTab]
    if (tabStatuses.length > 0 && !tabStatuses.includes(o.status)) return false
    if (search && !o.title.toLowerCase().includes(search.toLowerCase()) && !o.orderNumber?.toLowerCase().includes(search.toLowerCase())) return false
    if (minAmount && (o.budgetMin || 0) < Number(minAmount)) return false
    if (maxAmount && (o.budgetMin || 0) > Number(maxAmount)) return false
    if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false
    if (dateTo && new Date(o.createdAt) > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">My Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} orders</p>
        </div>
        <Link to="/orders/create" className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          <PlusCircle size={15} /> Post Order
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={cn('flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm transition-colors',
              showFilters || activeFilterCount > 0
                ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}>
            <Filter size={14} />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#0A0A0A] text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={() => { setMinAmount(''); setMaxAmount(''); setDateFrom(''); setDateTo('') }}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Clear filters
            </button>
          )}
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Min Budget (₹)</label>
              <input type="number" placeholder="e.g. 10000" value={minAmount} onChange={e => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Max Budget (₹)</label>
              <input type="number" placeholder="e.g. 500000" value={maxAmount} onChange={e => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Posted After</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Posted Before</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value as TabValue)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.value ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {[...Array(5)].map((_, i) => <ListRowSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            type={search || activeFilterCount > 0 ? 'search' : 'orders'}
            action={!search && activeFilterCount === 0 ? (
              <Link to="/orders/create" className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
                Post your first order
              </Link>
            ) : undefined}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Category', 'Budget', 'Bids', 'Status', ''].map((h) => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#6b7280', bg: '#f3f4f6' }
              return (
                <Link key={order.id} to={`/orders/${order.id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber} · {order.quantity} {order.unit}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{order.category}</p>
                  <p className="text-sm font-medium text-[#0A0A0A]">
                    {order.isFixedPrice ? formatCurrency(order.fixedPrice!) : `${formatCurrency(order.budgetMin!)}+`}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#0A0A0A]">{order.totalBids ?? 0}</span>
                    <span className="text-xs text-gray-400">bids</span>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                  <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

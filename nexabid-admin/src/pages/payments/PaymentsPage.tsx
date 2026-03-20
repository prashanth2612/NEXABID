import { useEffect, useState } from 'react'
import {
  IndianRupee, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, Clock, Loader2, Search,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Payment {
  _id: string
  orderId: { _id: string; title: string; orderNumber: string }
  clientId: { _id: string; fullName: string; email: string }
  manufacturerId: { _id: string; fullName: string; email: string }
  amount: number
  escrowStatus: 'none' | 'escrowed' | 'released' | 'refunded' | 'disputed'
  status: string
  disputeReason?: string
  createdAt: string
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  escrowed: { label: 'In Escrow', color: 'text-blue-700',   bg: 'bg-blue-50',   icon: ShieldCheck },
  released: { label: 'Released',  color: 'text-green-700',  bg: 'bg-green-50',  icon: CheckCircle2 },
  refunded: { label: 'Refunded',  color: 'text-purple-700', bg: 'bg-purple-50', icon: XCircle },
  disputed: { label: 'Disputed',  color: 'text-red-600',    bg: 'bg-red-50',    icon: AlertTriangle },
  none:     { label: 'Pending',   color: 'text-gray-600',   bg: 'bg-gray-50',   icon: Clock },
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [disputeModal, setDisputeModal] = useState<Payment | null>(null)
  const [resolution, setResolution] = useState<'release' | 'refund'>('release')
  const [resolutionNote, setResolutionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/admin/payments')
      setPayments(res.data.data.payments || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleResolve = async () => {
    if (!disputeModal) return
    setSubmitting(true)
    try {
      await api.post(`/payments/${disputeModal._id}/resolve-dispute`, {
        action: resolution,
        note: resolutionNote,
      })
      setDisputeModal(null)
      setResolutionNote('')
      await load()
    } catch (e) { console.error(e) }
    finally { setSubmitting(false) }
  }

  const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'escrowed', label: 'In Escrow' },
    { value: 'released', label: 'Released' },
    { value: 'refunded', label: 'Refunded' },
  ]

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.escrowStatus === filter
    const q = search.toLowerCase()
    const matchSearch = !search ||
      p.orderId?.title?.toLowerCase().includes(q) ||
      p.orderId?.orderNumber?.toLowerCase().includes(q) ||
      p.clientId?.fullName?.toLowerCase().includes(q) ||
      p.manufacturerId?.fullName?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const disputed = payments.filter(p => p.escrowStatus === 'disputed')
  const totalEscrow = payments.filter(p => p.escrowStatus === 'escrowed').reduce((s, p) => s + p.amount, 0)
  const totalReleased = payments.filter(p => p.escrowStatus === 'released').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#0A0A0A]">Payments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Escrow management and dispute resolution</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Payments', value: String(payments.length), icon: IndianRupee,   color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'In Escrow',      value: fmt(totalEscrow),        icon: ShieldCheck,   color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Total Released', value: fmt(totalReleased),      icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Open Disputes',  value: String(disputed.length), icon: AlertTriangle, color: 'text-red-600',    bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon size={17} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-[#0A0A0A]">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Disputed alert */}
      {disputed.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-600" />
            <p className="text-sm font-semibold text-red-700">{disputed.length} dispute{disputed.length > 1 ? 's' : ''} require your attention</p>
          </div>
          <div className="space-y-2">
            {disputed.map(p => (
              <div key={p._id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">{p.orderId?.title}</p>
                  <p className="text-xs text-gray-500">{p.clientId?.fullName} · {fmt(p.amount)}</p>
                  {p.disputeReason && <p className="text-xs text-red-500 mt-0.5">"{p.disputeReason}"</p>}
                </div>
                <button onClick={() => { setDisputeModal(p); setResolution('release') }}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
                  Resolve →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order, client or manufacturer..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                filter === f.value ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={22} className="animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <IndianRupee size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No payments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-6 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <span className="col-span-2">Order</span>
              <span>Client</span>
              <span>Manufacturer</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {filtered.map(p => {
              const cfg = STATUS_CFG[p.escrowStatus] || STATUS_CFG.none
              const Icon = cfg.icon
              return (
                <div key={p._id} className="grid grid-cols-6 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-2 min-w-0 pr-4">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{p.orderId?.title}</p>
                    <p className="text-xs text-gray-400">{p.orderId?.orderNumber}</p>
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-[#0A0A0A] truncate">{p.clientId?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{p.clientId?.email}</p>
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-medium text-[#0A0A0A] truncate">{p.manufacturerId?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{p.manufacturerId?.email}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">{fmt(p.amount)}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', cfg.color, cfg.bg)}>
                      <Icon size={10} />{cfg.label}
                    </span>
                    {p.escrowStatus === 'disputed' && (
                      <button onClick={() => { setDisputeModal(p); setResolution('release') }}
                        className="text-xs text-red-600 font-medium hover:underline">Resolve</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Dispute modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-[#0A0A0A]">Resolve Dispute</h3>
              <button onClick={() => setDisputeModal(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm font-semibold text-[#0A0A0A]">{disputeModal.orderId?.title}</p>
              <p className="text-xs text-gray-500 mt-1">Amount: {fmt(disputeModal.amount)}</p>
              {disputeModal.disputeReason && (
                <p className="text-xs text-red-500 mt-1 italic">"{disputeModal.disputeReason}"</p>
              )}
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Resolution</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setResolution('release')}
                className={cn('p-4 rounded-xl border-2 text-left transition-all', resolution === 'release' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300')}>
                <CheckCircle2 size={16} className={cn('mb-1', resolution === 'release' ? 'text-green-600' : 'text-gray-400')} />
                <p className={cn('text-sm font-bold', resolution === 'release' ? 'text-green-700' : 'text-gray-600')}>Release Funds</p>
                <p className="text-xs text-gray-500 mt-0.5">Pay manufacturer</p>
              </button>
              <button onClick={() => setResolution('refund')}
                className={cn('p-4 rounded-xl border-2 text-left transition-all', resolution === 'refund' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300')}>
                <XCircle size={16} className={cn('mb-1', resolution === 'refund' ? 'text-purple-600' : 'text-gray-400')} />
                <p className={cn('text-sm font-bold', resolution === 'refund' ? 'text-purple-700' : 'text-gray-600')}>Refund Client</p>
                <p className="text-xs text-gray-500 mt-0.5">Return to buyer</p>
              </button>
            </div>
            <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
              placeholder="Resolution note (optional)..." rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 mb-4" />
            <button onClick={handleResolve} disabled={submitting}
              className={cn('w-full py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2',
                resolution === 'release' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700',
                submitting && 'opacity-60 cursor-not-allowed')}>
              {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
              {submitting ? 'Processing...' : resolution === 'release' ? 'Release Funds' : 'Refund Client'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

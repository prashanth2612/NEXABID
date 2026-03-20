import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, CheckCircle2, XCircle,
  Clock, AlertTriangle, Loader2, IndianRupee,
  X, ExternalLink, Calendar, Hash,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import EmptyState from '@/components/ui/EmptyState'

interface Payment {
  id: string
  orderId: { id: string; title: string; orderNumber: string; category: string }
  amount: number
  manufacturerPayout?: number
  platformFee?: number
  status: 'created' | 'paid' | 'escrowed' | 'released' | 'refunded' | 'failed' | 'disputed'
  escrowStatus?: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  disputeReason?: string
  releasedAt?: string
  refundedAt?: string
  createdAt: string
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof ShieldCheck }> = {
  created:  { label: 'Pending',    color: '#D97706', bg: '#FFFBEB', icon: Clock },
  paid:     { label: 'Paid',       color: '#2563EB', bg: '#EFF6FF', icon: CheckCircle2 },
  escrowed: { label: 'In Escrow',  color: '#7C3AED', bg: '#F5F3FF', icon: ShieldCheck },
  released: { label: 'Released',   color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  refunded: { label: 'Refunded',   color: '#6B7280', bg: '#F3F4F6', icon: XCircle },
  failed:   { label: 'Failed',     color: '#DC2626', bg: '#FEF2F2', icon: XCircle },
  disputed: { label: 'Disputed',   color: '#DC2626', bg: '#FEF2F2', icon: AlertTriangle },
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

function PaymentDetailModal({ payment, onClose }: { payment: Payment; onClose: () => void }) {
  const cfg = STATUS_MAP[payment.status] || STATUS_MAP.created
  const StatusIcon = cfg.icon

  const timeline = [
    { label: 'Payment initiated',  date: payment.createdAt,  done: true },
    { label: 'Funds in escrow',    date: payment.status === 'escrowed' || payment.status === 'released' ? payment.createdAt : null, done: ['escrowed','released','refunded'].includes(payment.status) },
    { label: 'Delivery confirmed', date: payment.releasedAt || payment.refundedAt || null, done: !!payment.releasedAt || !!payment.refundedAt },
    { label: payment.refundedAt ? 'Refunded to you' : 'Released to manufacturer', date: payment.releasedAt || payment.refundedAt || null, done: !!payment.releasedAt || !!payment.refundedAt },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">Payment Detail</p>
            <h3 className="text-base font-bold text-[#0A0A0A] mt-0.5 line-clamp-1">{payment.orderId?.title}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status + amount */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <p className="text-3xl font-black text-[#0A0A0A]">{fmt(payment.amount)}</p>
              <p className="text-xs text-gray-400 mt-1">{payment.orderId?.category}</p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full"
              style={{ color: cfg.color, background: cfg.bg }}>
              <StatusIcon size={13} />{cfg.label}
            </span>
          </div>

          {/* Breakdown */}
          {payment.status === 'released' && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Breakdown</p>
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-gray-600">Order amount</span>
                  <span className="text-sm font-semibold text-[#0A0A0A]">{fmt(payment.amount)}</span>
                </div>
                {payment.platformFee !== undefined && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-600">Platform fee (2.5%)</span>
                    <span className="text-sm text-red-500">-{fmt(payment.platformFee)}</span>
                  </div>
                )}
                {payment.manufacturerPayout !== undefined && (
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800">Manufacturer received</span>
                    <span className="text-sm font-bold text-green-600">{fmt(payment.manufacturerPayout)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dispute reason */}
          {payment.disputeReason && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-600 mb-0.5">Dispute Reason</p>
                <p className="text-xs text-red-500">{payment.disputeReason}</p>
              </div>
            </div>
          )}

          {/* References */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">References</p>
            <div className="space-y-1.5">
              {[
                { label: 'Order number', value: payment.orderId?.orderNumber, icon: Hash },
                { label: 'Payment ID', value: payment.razorpayPaymentId || 'Simulated', icon: Hash },
                { label: 'Date', value: new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <r.icon size={13} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{r.label}</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[#0A0A0A]">{r.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timeline</p>
            <div className="relative pl-4">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
              {timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className={cn('w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 z-10',
                    t.done ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200')} />
                  <div>
                    <p className={cn('text-xs font-medium', t.done ? 'text-[#0A0A0A]' : 'text-gray-400')}>{t.label}</p>
                    {t.date && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">Close</button>
          <Link to={`/orders/${payment.orderId?.id}`}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1a1a] transition-colors">
            View Order <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Payment | null>(null)

  useEffect(() => {
    api.get('/payments/my-payments')
      .then((r) => setPayments(r.data.data.payments || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalEscrowed = payments.filter(p => p.status === 'escrowed').reduce((s, p) => s + p.amount, 0)
  const totalReleased = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0)
  const totalRefunded = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Payments</h2>
        <p className="text-gray-500 text-sm mt-0.5">Escrow transactions and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'In Escrow', value: totalEscrowed, icon: ShieldCheck,  color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Released',  value: totalReleased, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Refunded',  value: totalRefunded, icon: XCircle,      color: 'text-gray-500',   bg: 'bg-gray-100' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0A0A0A]">{fmt(s.value)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payments list */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState type="payments" action={
            <Link to="/orders" className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
              View Orders
            </Link>
          } />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Amount', 'Status', 'Date'].map((h) => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {payments.map((payment) => {
              const cfg = STATUS_MAP[payment.status] || STATUS_MAP.created
              const StatusIcon = cfg.icon
              return (
                <button key={payment.id} onClick={() => setSelected(payment)}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors w-full text-left group">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate group-hover:text-blue-600 transition-colors">{payment.orderId?.title || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{payment.orderId?.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee size={13} className="text-gray-500" />
                    <p className="text-sm font-bold text-[#0A0A0A]">{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={{ color: cfg.color, background: cfg.bg }}>
                    <StatusIcon size={11} />{cfg.label}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {selected && <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard, ShieldCheck, CheckCircle2, XCircle,
  Clock, AlertTriangle, Loader2, ChevronRight, IndianRupee,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  orderId: { id: string; title: string; orderNumber: string; category: string }
  amount: number
  status: 'created' | 'paid' | 'escrowed' | 'released' | 'refunded' | 'failed' | 'disputed'
  razorpayPaymentId?: string
  releasedAt?: string
  refundedAt?: string
  createdAt: string
}

const STATUS_MAP: Record<Payment['status'], { label: string; color: string; bg: string; icon: typeof ShieldCheck }> = {
  created:   { label: 'Pending Payment', color: '#D97706', bg: '#FFFBEB',  icon: Clock },
  paid:      { label: 'Paid',            color: '#2563EB', bg: '#EFF6FF',  icon: CheckCircle2 },
  escrowed:  { label: 'In Escrow',       color: '#7C3AED', bg: '#F5F3FF',  icon: ShieldCheck },
  released:  { label: 'Released',        color: '#059669', bg: '#ECFDF5',  icon: CheckCircle2 },
  refunded:  { label: 'Refunded',        color: '#6B7280', bg: '#F3F4F6',  icon: XCircle },
  failed:    { label: 'Failed',          color: '#DC2626', bg: '#FEF2F2',  icon: XCircle },
  disputed:  { label: 'Disputed',        color: '#DC2626', bg: '#FEF2F2',  icon: AlertTriangle },
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/my-payments')
      .then((r) => setPayments(r.data.data.payments))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalEscrowed  = payments.filter(p => p.status === 'escrowed').reduce((s, p) => s + p.amount, 0)
  const totalReleased  = payments.filter(p => p.status === 'released').reduce((s, p) => s + p.amount, 0)
  const totalRefunded  = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Payments</h2>
        <p className="text-gray-500 text-sm mt-0.5">Escrow transactions and payment history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Escrow',  value: totalEscrowed, icon: ShieldCheck,  color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Released',   value: totalReleased, icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Refunded',   value: totalRefunded, icon: XCircle,      color: 'text-gray-500',   bg: 'bg-gray-100' },
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

      {/* Payments table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <CreditCard size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-800 font-semibold mb-1">No payments yet</p>
          <p className="text-gray-400 text-sm mb-5">Payments appear here after you confirm a bid and proceed to checkout</p>
          <Link to="/orders" className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold">
            View Orders
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Amount', 'Status', 'Date', ''].map((h) => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {payments.map((payment) => {
              const cfg = STATUS_MAP[payment.status]
              const StatusIcon = cfg.icon
              return (
                <Link key={payment.id} to={`/orders/${payment.orderId?.id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{payment.orderId?.title || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{payment.orderId?.orderNumber} · {payment.razorpayPaymentId ? `pay_...${payment.razorpayPaymentId.slice(-6)}` : 'Pending'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee size={13} className="text-gray-500" />
                    <p className="text-sm font-bold text-[#0A0A0A]">{payment.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={{ color: cfg.color, background: cfg.bg }}
                  >
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
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

import { useEffect, useState } from 'react'
import { Loader2, CreditCard, Shield, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api'
import { cn, fmt, fmtDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: string
  escrowStatus: string
  razorpayOrderId?: string
  razorpayPaymentId?: string
  createdAt: string
  orderId: { id: string; title: string; orderNumber: string }
  clientId: { id: string; fullName: string }
  manufacturerId?: { id: string; fullName: string }
}

const ESCROW_STATUS = {
  pending:   { label: 'Pending',   color: '#D97706', bg: '#FFFBEB' },
  escrowed:  { label: 'Escrowed',  color: '#2563EB', bg: '#EFF6FF' },
  released:  { label: 'Released',  color: '#059669', bg: '#ECFDF5' },
  refunded:  { label: 'Refunded',  color: '#DC2626', bg: '#FEF2F2' },
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('/admin/payments')
      .then(r => setPayments(r.data.data.payments || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalEscrowed = payments.filter(p => p.escrowStatus === 'escrowed').reduce((s, p) => s + p.amount, 0)
  const totalReleased = payments.filter(p => p.escrowStatus === 'released').reduce((s, p) => s + p.amount, 0)

  const filtered = tab === 'all' ? payments : payments.filter(p => p.escrowStatus === tab)

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Payments</h2>
        <p className="text-gray-500 text-sm mt-0.5">{payments.length} transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'In Escrow',      value: fmt(totalEscrowed), icon: Shield,       color: 'bg-blue-50 text-blue-600' },
          { label: 'Released',       value: fmt(totalReleased), icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
          { label: 'Total Volume',   value: fmt(payments.reduce((s, p) => s + p.amount, 0)), icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.color.split(' ')[0]}`}>
              <c.icon size={18} className={c.color.split(' ')[1]} />
            </div>
            <div>
              <p className="text-xl font-bold text-[#0A0A0A]">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {['all', 'escrowed', 'released', 'refunded'].map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
              tab === s ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}>
            {s} <span className={cn('ml-1 text-xs', tab === s ? 'text-white/60' : 'text-gray-400')}>
              {s === 'all' ? payments.length : payments.filter(p => p.escrowStatus === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Client', 'Amount', 'Escrow Status', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CreditCard size={28} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No payments found</p>
              </div>
            ) : filtered.map(p => {
              const ec = ESCROW_STATUS[p.escrowStatus as keyof typeof ESCROW_STATUS] ?? { label: p.escrowStatus, color: '#6b7280', bg: '#f3f4f6' }
              return (
                <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{p.orderId?.title}</p>
                    <p className="text-xs text-gray-400">{p.orderId?.orderNumber}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{p.clientId?.fullName}</p>
                  <p className="text-sm font-semibold text-[#0A0A0A]">{fmt(p.amount)}</p>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit"
                    style={{ color: ec.color, background: ec.bg }}>{ec.label}</span>
                  <p className="text-xs text-gray-400">{fmtDate(p.createdAt)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

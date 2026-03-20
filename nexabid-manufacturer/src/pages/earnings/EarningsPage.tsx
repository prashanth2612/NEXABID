import { useEffect, useState } from 'react'
import {
  TrendingUp, Shield, CheckCircle2, Clock, Loader2,
  IndianRupee, Package, Building2, AlertCircle, Edit2, X, Save,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  platformFee?: number
  manufacturerPayout?: number
  escrowStatus: string
  status: string
  releasedAt?: string
  createdAt: string
  orderId: { id: string; title: string; orderNumber: string }
  clientId: { fullName: string; companyName?: string }
}

interface BankDetails {
  bankAccountName: string
  bankAccountNumber: string
  bankIfsc: string
  bankName: string
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
const TABS = ['all', 'escrowed', 'released', 'refunded'] as const

export default function EarningsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<typeof TABS[number]>('all')

  // Bank details
  const [bank, setBank] = useState<BankDetails>({ bankAccountName: '', bankAccountNumber: '', bankIfsc: '', bankName: '' })
  const [bankEdit, setBankEdit] = useState(false)
  const [bankLoading, setBankLoading] = useState(false)
  const [bankMsg, setBankMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [hasBankDetails, setHasBankDetails] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/payments/my-payments'),
      api.get('/profile'),
    ]).then(([pRes, prRes]) => {
      setPayments(pRes.data.data.payments || [])
      const p = prRes.data.data.profile || prRes.data.data.user || {}
      const filled = p.bankAccountNumber && p.bankIfsc
      setHasBankDetails(!!filled)
      setBank({
        bankAccountName:   p.bankAccountName   || '',
        bankAccountNumber: p.bankAccountNumber || '',
        bankIfsc:          p.bankIfsc          || '',
        bankName:          p.bankName          || '',
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const handleSaveBank = async () => {
    if (!bank.bankAccountNumber || !bank.bankIfsc || !bank.bankName || !bank.bankAccountName) {
      setBankMsg({ ok: false, text: 'Please fill in all bank details' }); return
    }
    setBankLoading(true); setBankMsg(null)
    try {
      await api.put('/profile', bank)
      setHasBankDetails(true)
      setBankEdit(false)
      setBankMsg({ ok: true, text: 'Bank details saved successfully' })
      setTimeout(() => setBankMsg(null), 3000)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setBankMsg({ ok: false, text: err.response?.data?.message || 'Failed to save bank details' })
    } finally { setBankLoading(false) }
  }

  const released  = payments.filter(p => p.escrowStatus === 'released')
  const escrowed  = payments.filter(p => p.escrowStatus === 'escrowed')
  const totalEarned = released.reduce((s, p) => s + (p.manufacturerPayout ?? p.amount), 0)
  const totalEscrow = escrowed.reduce((s, p) => s + p.amount, 0)
  const totalFees   = released.reduce((s, p) => s + (p.platformFee ?? 0), 0)
  const filtered    = tab === 'all' ? payments : payments.filter(p => p.escrowStatus === tab)

  // Monthly earnings for chart — last 6 months
  const monthlyEarnings = (() => {
    const months: { label: string; value: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const label = d.toLocaleString('en-IN', { month: 'short' })
      const y = d.getFullYear(), m = d.getMonth()
      const value = released
        .filter(p => { const pd = new Date(p.releasedAt || p.createdAt); return pd.getFullYear() === y && pd.getMonth() === m })
        .reduce((s, p) => s + (p.manufacturerPayout ?? p.amount), 0)
      months.push({ label, value })
    }
    return months
  })()
  const chartMax = Math.max(...monthlyEarnings.map(m => m.value), 1)

  const STATUS_CONFIG = {
    escrowed: { label: 'In Escrow',  color: 'text-blue-600',  bg: 'bg-blue-50',   icon: Shield },
    released: { label: 'Released',   color: 'text-green-600', bg: 'bg-green-50',  icon: CheckCircle2 },
    refunded: { label: 'Refunded',   color: 'text-red-500',   bg: 'bg-red-50',    icon: Clock },
    pending:  { label: 'Pending',    color: 'text-gray-500',  bg: 'bg-gray-50',   icon: Clock },
    disputed: { label: 'Disputed',   color: 'text-orange-600',bg: 'bg-orange-50', icon: AlertCircle },
  } as const

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Earnings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Your payment history and payout details</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Earned',  value: fmt(totalEarned),      icon: TrendingUp,   color: 'bg-green-50 text-green-600',  sub: 'After platform fees' },
          { label: 'In Escrow',     value: fmt(totalEscrow),      icon: Shield,       color: 'bg-blue-50 text-blue-600',    sub: 'Awaiting delivery' },
          { label: 'Platform Fees', value: fmt(totalFees),        icon: IndianRupee,  color: 'bg-orange-50 text-orange-600',sub: '2.5% per order' },
          { label: 'Total Orders',  value: String(payments.length),icon: Package,     color: 'bg-purple-50 text-purple-600',sub: 'With payments' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color.split(' ')[0]}`}>
              <c.icon size={18} className={c.color.split(' ')[1]} />
            </div>
            <p className="text-xl font-bold text-[#0A0A0A] tracking-tight">{c.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly Earnings Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-[#0A0A0A]">Monthly Earnings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 6 months · released payments only</p>
          </div>
          <span className="text-lg font-black text-[#0A0A0A]">{fmt(totalEarned)}</span>
        </div>
        <div className="flex items-end gap-3 h-36">
          {monthlyEarnings.map((m, i) => {
            const heightPct = chartMax > 0 ? (m.value / chartMax) * 100 : 0
            const isLast = i === monthlyEarnings.length - 1
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: 112 }}>
                  {m.value > 0 && (
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      <div className="bg-[#0A0A0A] text-white text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
                        {fmt(m.value)}
                      </div>
                    </div>
                  )}
                  <div
                    className={cn('w-full rounded-t-lg transition-all duration-500', isLast ? 'bg-[#0A0A0A]' : 'bg-gray-100 group-hover:bg-gray-200')}
                    style={{ height: `${Math.max(heightPct, m.value > 0 ? 8 : 2)}%` }}
                  />
                </div>
                <span className={cn('text-[10px] font-medium', isLast ? 'text-[#0A0A0A]' : 'text-gray-400')}>{m.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bank details card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={15} className="text-gray-500" />
            <h3 className="text-sm font-semibold text-[#0A0A0A]">Bank Account for Payouts</h3>
            {hasBankDetails && !bankEdit && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={10} /> Saved
              </span>
            )}
          </div>
          <button onClick={() => { setBankEdit(e => !e); setBankMsg(null) }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors font-medium">
            {bankEdit ? <><X size={13} /> Cancel</> : <><Edit2 size={13} /> {hasBankDetails ? 'Edit' : 'Add Bank Details'}</>}
          </button>
        </div>

        <div className="p-5">
          {!bankEdit ? (
            hasBankDetails ? (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Account Holder', value: bank.bankAccountName },
                  { label: 'Bank',           value: bank.bankName },
                  { label: 'Account Number', value: `••••••${bank.bankAccountNumber.slice(-4)}` },
                  { label: 'IFSC Code',      value: bank.bankIfsc },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-sm font-medium text-[#0A0A0A]">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-2">
                <AlertCircle size={15} className="text-orange-500 flex-shrink-0" />
                <p className="text-sm text-gray-500">
                  Add your bank details so Razorpay can settle released payments to your account within 2–3 business days.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'bankAccountName',   label: 'Account Holder Name', placeholder: 'As per bank records' },
                  { key: 'bankName',           label: 'Bank Name',            placeholder: 'e.g. HDFC Bank' },
                  { key: 'bankAccountNumber',  label: 'Account Number',       placeholder: '12-digit account number' },
                  { key: 'bankIfsc',           label: 'IFSC Code',            placeholder: 'e.g. HDFC0001234' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{field.label}</label>
                    <input
                      value={bank[field.key as keyof BankDetails]}
                      onChange={e => setBank(b => ({ ...b, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSaveBank} disabled={bankLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                  {bankLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {bankLoading ? 'Saving...' : 'Save Bank Details'}
                </button>
                {bankMsg && (
                  <p className={cn('text-sm', bankMsg.ok ? 'text-green-600' : 'text-red-500')}>{bankMsg.text}</p>
                )}
              </div>
            </div>
          )}
          {bankMsg && !bankEdit && (
            <p className={cn('text-sm mt-3', bankMsg.ok ? 'text-green-600' : 'text-red-500')}>{bankMsg.text}</p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
              tab === t ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}>
            {t} <span className={cn('ml-1 text-xs', tab === t ? 'text-white/60' : 'text-gray-400')}>
              {t === 'all' ? payments.length : payments.filter(p => p.escrowStatus === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <IndianRupee size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm">No transactions yet</p>
          <p className="text-gray-400 text-xs mt-1">Complete orders to see your earnings here</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Client', 'Amount', 'Payout', 'Status', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map(p => {
              const cfg = STATUS_CONFIG[p.escrowStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
              const Icon = cfg.icon
              const payout = p.manufacturerPayout ?? p.amount
              return (
                <div key={p.id} className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{p.orderId?.title}</p>
                    <p className="text-xs text-gray-400">{p.orderId?.orderNumber}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 truncate">{p.clientId?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{p.clientId?.companyName}</p>
                  </div>
                  <p className="text-sm font-medium text-[#0A0A0A]">{fmt(p.amount)}</p>
                  <div>
                    <p className={cn('text-sm font-semibold', p.escrowStatus === 'released' ? 'text-green-600' : 'text-gray-400')}>
                      {p.escrowStatus === 'released' ? fmt(payout) : '—'}
                    </p>
                    {p.escrowStatus === 'released' && p.platformFee
                      ? <p className="text-xs text-gray-400">−{fmt(p.platformFee)} fee</p>
                      : null}
                  </div>
                  <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs font-medium', cfg.bg, cfg.color)}>
                    <Icon size={11} />{cfg.label}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(p.releasedAt || p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

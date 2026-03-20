import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Mail, Phone, Building2, Star,
  Package, Gavel, CreditCard, CheckCircle2, XCircle,
  Loader2, AlertTriangle, ShieldCheck, Calendar,
} from 'lucide-react'
import api from '@/lib/api'
import { cn, fmt, fmtDate } from '@/lib/utils'

interface UserDetail {
  id: string
  fullName: string
  email: string
  phone: string
  role: 'client' | 'manufacturer'
  companyName?: string
  businessName?: string
  categories?: string[]
  isVerified: boolean
  isActive: boolean
  rating: number
  totalOrders: number
  createdAt: string
  updatedAt: string
}

interface OrderRow   { id: string; title: string; orderNumber: string; status: string; createdAt: string; escrowAmount?: number }
interface BidRow     { id: string; proposedPrice: number; status: string; createdAt: string; orderId: { title: string; orderNumber: string } }
interface PaymentRow { id: string; amount: number; status: string; escrowStatus: string; createdAt: string }

const ORDER_STATUS_COLORS: Record<string, string> = {
  posted: 'bg-blue-50 text-blue-600', bidding: 'bg-purple-50 text-purple-600',
  confirmed: 'bg-green-50 text-green-600', manufacturing: 'bg-yellow-50 text-yellow-700',
  shipped: 'bg-cyan-50 text-cyan-600', completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
}
const BID_STATUS_COLORS: Record<string, string> = {
  accepted: 'bg-green-50 text-green-600', pending: 'bg-yellow-50 text-yellow-700', rejected: 'bg-red-50 text-red-500',
}

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [user, setUser]         = useState<UserDetail | null>(null)
  const [orders, setOrders]     = useState<OrderRow[]>([])
  const [bids, setBids]         = useState<BidRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [stats, setStats]       = useState<{ totalOrders: number; totalBids: number; totalPayments: number } | null>(null)
  const [loading, setLoading]   = useState(true)
  const [toggling, setToggling] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'bids' | 'payments' | 'kyc'>('orders')
  const [kycData, setKycData] = useState<{ kycStatus: string; kycDocuments: any[]; kycRejectionReason?: string } | null>(null)
  const [kycAction, setKycAction] = useState(false)

  const load = () => {
    api.get(`/admin/users/${id}`)
      .then(r => {
        const d = r.data.data
        setUser(d.user); setOrders(d.orders || []); setBids(d.bids || [])
        setPayments(d.payments || []); setStats(d.stats)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleToggle = async () => {
    if (!user) return
    setToggling(true)
    try {
      await api.patch(`/admin/users/${id}/toggle-active`)
      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : prev)
    } catch (e) { console.error(e) }
    finally { setToggling(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={22} className="animate-spin text-gray-400" />
    </div>
  )

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle size={32} className="text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">User not found</p>
      <button onClick={() => navigate('/users')} className="mt-4 text-sm text-gray-400 hover:text-black transition-colors">← Back to users</button>
    </div>
  )

  const TABS = [
    { id: 'orders' as const,   label: 'Orders',   count: orders.length },
    ...(user.role === 'manufacturer' ? [{ id: 'bids' as const, label: 'Bids', count: bids.length }] : []),
    { id: 'payments' as const, label: 'Payments', count: payments.length },
    ...(user.role === 'manufacturer' ? [{ id: 'kyc' as const, label: 'KYC', count: 0 }] : []),
  ]

  const loadKYC = async () => {
    if (user.role !== 'manufacturer') return
    try {
      // Fetch KYC data from admin endpoint
      const res = await api.get(`/admin/users/${id}`)
      const u = res.data.data.user
      setKycData({
        kycStatus: u.kycStatus || 'none',
        kycDocuments: u.kycDocuments || [],
        kycRejectionReason: u.kycRejectionReason,
      })
    } catch {
      // Fallback to embedded user data
      setKycData({
        kycStatus: (user as any).kycStatus || 'none',
        kycDocuments: (user as any).kycDocuments || [],
        kycRejectionReason: (user as any).kycRejectionReason,
      })
    }
  }

  const handleKYCAction = async (status: 'approved' | 'rejected', reason?: string) => {
    setKycAction(true)
    try {
      await api.patch(`/admin/users/${id}/kyc`, { status, reason })
      setKycData(prev => prev ? { ...prev, kycStatus: status, kycRejectionReason: reason } : prev)
    } catch { /* silent */ }
    finally { setKycAction(false) }
  }

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <button onClick={() => navigate('/users')} className="flex items-center gap-2 text-gray-500 hover:text-black text-sm transition-colors">
        <ArrowLeft size={15} /> Back to users
      </button>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0A0A0A] rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xl font-bold">{user.fullName.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0A0A0A] tracking-tight">{user.fullName}</h2>
                {user.isVerified && <ShieldCheck size={15} className="text-blue-500" />}
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                  user.role === 'client' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                )}>{user.role}</span>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                  user.isActive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                )}>{user.isActive ? 'Active' : 'Suspended'}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail size={12} />{user.email}</span>
                <span className="flex items-center gap-1"><Phone size={12} />{user.phone}</span>
                <span className="flex items-center gap-1"><Calendar size={12} />Joined {fmtDate(user.createdAt)}</span>
              </div>
              {(user.companyName || user.businessName) && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Building2 size={12} />{user.companyName || user.businessName}
                </p>
              )}
            </div>
          </div>

          <button onClick={handleToggle} disabled={toggling}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              user.isActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            )}>
            {toggling ? <Loader2 size={13} className="animate-spin" /> : user.isActive ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
            {user.isActive ? 'Suspend Account' : 'Restore Account'}
          </button>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-50">
            {[
              { icon: Package,    label: 'Orders',       value: String(stats.totalOrders) },
              { icon: Gavel,      label: 'Bids',         value: String(stats.totalBids) },
              { icon: CreditCard, label: 'Payment Vol.', value: fmt(stats.totalPayments) },
              { icon: Star,       label: 'Rating',       value: user.rating ? `${user.rating.toFixed(1)} ★` : '—' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <s.icon size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">{s.label}</span>
                </div>
                <p className="text-base font-bold text-[#0A0A0A]">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Categories (manufacturer) */}
        {user.categories && user.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {user.categories.map(c => (
              <span key={c} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* History tabs */}
      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id as any); if (t.id === 'kyc') loadKYC() }}
            className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              activeTab === t.id ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}>
            {t.label}
            <span className={cn('ml-1.5 text-xs', activeTab === t.id ? 'text-white/60' : 'text-gray-400')}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Status', 'Escrow', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
            ) : orders.map(o => (
              <div key={o.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{o.title}</p>
                  <p className="text-xs text-gray-400">{o.orderNumber}</p>
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize w-fit', ORDER_STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-500')}>{o.status}</span>
                <p className="text-sm text-gray-600">{o.escrowAmount ? fmt(o.escrowAmount) : '—'}</p>
                <p className="text-xs text-gray-400">{fmtDate(o.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bids */}
      {activeTab === 'bids' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Bid Price', 'Status', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {bids.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No bids yet</div>
            ) : bids.map(b => (
              <div key={b.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{b.orderId?.title}</p>
                  <p className="text-xs text-gray-400">{b.orderId?.orderNumber}</p>
                </div>
                <p className="text-sm font-semibold text-[#0A0A0A]">{fmt(b.proposedPrice)}</p>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize w-fit', BID_STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-500')}>{b.status}</span>
                <p className="text-xs text-gray-400">{fmtDate(b.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Amount', 'Status', 'Escrow', 'Date'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {payments.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">No payments yet</div>
            ) : payments.map(p => (
              <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors">
                <p className="text-sm font-semibold text-[#0A0A0A]">{fmt(p.amount)}</p>
                <span className="text-xs font-medium text-gray-600 capitalize">{p.status}</span>
                <span className="text-xs font-medium text-gray-600 capitalize">{p.escrowStatus}</span>
                <p className="text-xs text-gray-400">{fmtDate(p.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KYC Tab — manufacturers only */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          {/* KYC Status card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">KYC Status</p>
                <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1',
                  kycData?.kycStatus === 'approved' ? 'bg-green-50 text-green-700' :
                  kycData?.kycStatus === 'pending'  ? 'bg-orange-50 text-orange-600' :
                  kycData?.kycStatus === 'rejected' ? 'bg-red-50 text-red-600' :
                  'bg-gray-50 text-gray-500'
                )}>
                  {kycData?.kycStatus || 'none'}
                </span>
              </div>
              {kycData?.kycStatus === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleKYCAction('approved')}
                    disabled={kycAction}
                    className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
                    Approve KYC
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt('Rejection reason (optional):') || undefined
                      handleKYCAction('rejected', reason)
                    }}
                    disabled={kycAction}
                    className="px-4 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 border border-red-200">
                    Reject
                  </button>
                </div>
              )}
            </div>
            {kycData?.kycRejectionReason && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                Rejection reason: {kycData.kycRejectionReason}
              </p>
            )}
          </div>

          {/* Documents list */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-sm font-semibold text-[#0A0A0A]">Submitted Documents</p>
            </div>
            {!kycData?.kycDocuments?.length ? (
              <div className="py-12 text-center text-gray-400 text-sm">No documents submitted yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {kycData.kycDocuments.map((doc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A] capitalize">{doc.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.type} · {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Submitted</span>
                      {doc.data && (
                        <button
                          onClick={() => {
                            const win = window.open('', '_blank')
                            if (!win) return
                            if (doc.data.startsWith('data:image')) {
                              win.document.write(`<html><body style="margin:0;background:#000"><img src="${doc.data}" style="max-width:100%;height:auto"/></body></html>`)
                            } else {
                              win.document.write(`<html><body style="margin:0"><iframe src="${doc.data}" style="width:100vw;height:100vh;border:none"/></body></html>`)
                            }
                            win.document.close()
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline">
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

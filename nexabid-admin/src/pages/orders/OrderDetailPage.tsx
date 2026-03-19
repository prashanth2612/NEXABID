import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, IndianRupee,
  User, Loader2, CheckCircle2, AlertTriangle, Shield,
  ChevronDown, RefreshCw, Paperclip, FileText, Image,
} from 'lucide-react'
import api from '@/lib/api'
import { cn, fmt, fmtDate } from '@/lib/utils'

interface OrderDetail {
  id: string
  orderNumber: string
  title: string
  description: string
  category: string
  status: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  escrowAmount?: number
  escrowStatus?: string
  quantity: number
  unit: string
  deliveryDate: string
  deliveryLocation: string
  specialNotes?: string
  totalBids: number
  createdAt: string
  updatedAt: string
  attachments?: { name: string; type: string; data: string; size: number }[]
  clientId: { id: string; fullName: string; companyName?: string; email?: string }
  acceptedManufacturerId?: { id: string; fullName: string; businessName?: string; email?: string }
  acceptedBidId?: string
}

interface Bid {
  id: string
  proposedPrice: number
  deliveryDays: number
  message?: string
  status: string
  createdAt: string
  manufacturerId: { id: string; fullName: string; businessName?: string }
}

const STATUS_OPTIONS = ['posted','bidding','confirmed','manufacturing','shipped','delivered','completed','cancelled']

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  posted:        { label: 'Posted',        color: '#2563EB', bg: '#EFF6FF' },
  bidding:       { label: 'Bidding',       color: '#7C3AED', bg: '#F5F3FF' },
  confirmed:     { label: 'Confirmed',     color: '#059669', bg: '#ECFDF5' },
  manufacturing: { label: 'Manufacturing', color: '#D97706', bg: '#FFFBEB' },
  shipped:       { label: 'Shipped',       color: '#0891B2', bg: '#ECFEFF' },
  delivered:     { label: 'Delivered',     color: '#0D9488', bg: '#F0FDFA' },
  completed:     { label: 'Completed',     color: '#6B7280', bg: '#F3F4F6' },
  cancelled:     { label: 'Cancelled',     color: '#DC2626', bg: '#FEF2F2' },
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [newStatus, setNewStatus] = useState('')
  const [overrideNote, setOverrideNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    Promise.all([
      api.get(`/admin/orders/${id}`),
      api.get(`/bids/order/${id}`).catch(() => ({ data: { data: { bids: [] } } })),
    ]).then(([oRes, bRes]) => {
      const o = oRes.data.data.order
      setOrder(o)
      setNewStatus(o.status)
      setBids(bRes.data.data.bids || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleStatusOverride = async () => {
    if (!order || newStatus === order.status) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await api.patch(`/admin/orders/${id}/status`, { status: newStatus, note: overrideNote })
      setOrder(prev => prev ? { ...prev, status: newStatus } : prev)
      setSaveMsg({ ok: true, text: `Status updated to "${STATUS_CONFIG[newStatus]?.label}"` })
      setOverrideNote('')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setSaveMsg({ ok: false, text: err.response?.data?.message || 'Failed to update status' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(null), 3500)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={22} className="animate-spin text-gray-400" />
    </div>
  )

  if (!order) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle size={32} className="text-gray-300 mb-3" />
      <p className="text-gray-500 font-medium">Order not found</p>
      <button onClick={() => navigate('/orders')} className="mt-4 text-sm text-gray-400 hover:text-black transition-colors">
        ← Back to orders
      </button>
    </div>
  )

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.posted

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-black text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center flex-shrink-0">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-[#0A0A0A] tracking-tight">{order.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ color: cfg.color, background: cfg.bg }}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-400">{order.orderNumber} · {order.category} · Posted {fmtDate(order.createdAt)}</p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{order.description}</p>

        {/* Attachments */}
        {order.attachments && order.attachments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Paperclip size={11} /> Attachments ({order.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {order.attachments.map((file, idx) => (
                <a key={idx} href={`data:${file.type};base64,${file.data}`} download={file.name}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                >
                  {file.type?.startsWith('image/')
                    ? <Image size={13} className="text-blue-500" />
                    : <FileText size={13} className="text-gray-400" />
                  }
                  <span className="text-xs text-gray-600 max-w-[120px] truncate">{file.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: IndianRupee, label: 'Value',     value: order.isFixedPrice ? fmt(order.fixedPrice!) : `${fmt(order.budgetMin!)} – ${fmt(order.budgetMax!)}` },
            { icon: Package,     label: 'Quantity',  value: `${order.quantity.toLocaleString()} ${order.unit}` },
            { icon: Calendar,    label: 'Delivery',  value: fmtDate(order.deliveryDate) },
            { icon: MapPin,      label: 'Location',  value: order.deliveryLocation },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">{m.label}</span>
              </div>
              <p className="text-sm font-semibold text-[#0A0A0A] truncate">{m.value}</p>
            </div>
          ))}
        </div>

        {order.escrowAmount && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
            <Shield size={14} className="text-green-600" />
            <p className="text-sm text-green-700">
              <span className="font-semibold">{fmt(order.escrowAmount)}</span> {order.escrowStatus === 'released' ? 'released from escrow' : 'secured in escrow'}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Left: parties + bids */}
        <div className="space-y-5">
          {/* Parties */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Parties</h3>
            <div className="space-y-3">
              {[
                { role: 'Client', user: order.clientId, color: 'bg-blue-50 text-blue-700' },
                ...(order.acceptedManufacturerId
                  ? [{ role: 'Manufacturer', user: order.acceptedManufacturerId, color: 'bg-green-50 text-green-700' }]
                  : []),
              ].map(p => (
                <div key={p.role} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-white rounded-full border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A]">{p.user.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{p.user.email || (p.user as { businessName?: string }).businessName || 'No email'}</p>
                  </div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', p.color)}>{p.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bids */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">Bids ({bids.length})</h3>
            </div>
            {bids.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">No bids yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {bids.map(bid => (
                  <div key={bid.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-gray-500">{bid.manufacturerId?.fullName?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A]">{bid.manufacturerId?.fullName}</p>
                      <p className="text-xs text-gray-400">{bid.deliveryDays} days · {fmtDate(bid.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#0A0A0A]">{fmt(bid.proposedPrice)}</p>
                      <span className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                        bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        bid.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-500'
                      )}>{bid.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: status override */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={14} className="text-gray-500" />
              <h3 className="text-sm font-semibold text-[#0A0A0A]">Override Status</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Manually change the order status. Use for dispute resolution or data correction only.
            </p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New Status</label>
              <div className="relative">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-black/10 pr-8"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s]?.label || s}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Admin Note (optional)</label>
              <textarea
                value={overrideNote}
                onChange={e => setOverrideNote(e.target.value)}
                rows={3}
                placeholder="Reason for status change..."
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400"
              />
            </div>

            {saveMsg && (
              <div className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm mb-3',
                saveMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              )}>
                {saveMsg.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                {saveMsg.text}
              </div>
            )}

            <button
              onClick={handleStatusOverride}
              disabled={saving || newStatus === order.status}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {saving ? 'Updating...' : 'Apply Status Change'}
            </button>
          </div>

          {/* Order meta */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Metadata</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Order ID',      value: order.id.slice(-8) },
                { label: 'Total Bids',    value: String(order.totalBids) },
                { label: 'Price Type',    value: order.isFixedPrice ? 'Fixed Price' : 'Open Bidding' },
                { label: 'Created',       value: fmtDate(order.createdAt) },
                { label: 'Last Updated',  value: fmtDate(order.updatedAt) },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="font-medium text-[#0A0A0A]">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

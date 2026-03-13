import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, IndianRupee,
  CheckCircle2, Clock, Shield, Loader2, MessageSquare,
  Truck, AlertCircle, User, ChevronRight, Sparkles,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Order {
  id: string
  title: string
  orderNumber: string
  description: string
  category: string
  quantity: number
  unit: string
  deliveryDate: string
  deliveryLocation: string
  status: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  escrowAmount?: number
  escrowStatus?: string
  specialNotes?: string
  tags?: string[]
  clientId: { id: string; fullName: string; companyName?: string; email?: string } | null
}

interface MyBid {
  id: string
  proposedPrice: number
  deliveryDays: number
  status: 'pending' | 'accepted' | 'rejected'
  message: string
  clientNote?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  posted:        { label: 'Posted',        color: '#2563EB', bg: '#EFF6FF', desc: 'Order is live' },
  bidding:       { label: 'Bidding',       color: '#7C3AED', bg: '#F5F3FF', desc: 'Bids are being evaluated by the client' },
  confirmed:     { label: 'Confirmed',     color: '#059669', bg: '#ECFDF5', desc: 'Your bid accepted — start production when ready' },
  manufacturing: { label: 'Manufacturing', color: '#D97706', bg: '#FFFBEB', desc: 'In production — mark complete when done' },
  shipped:       { label: 'Shipped',       color: '#0891B2', bg: '#ECFEFF', desc: 'Shipped — awaiting delivery confirmation' },
  delivered:     { label: 'Delivered',     color: '#059669', bg: '#ECFDF5', desc: 'Delivered — waiting for payment release' },
  completed:     { label: 'Completed',     color: '#6B7280', bg: '#F3F4F6', desc: 'Order completed — payment released' },
  cancelled:     { label: 'Cancelled',     color: '#DC2626', bg: '#FEF2F2', desc: 'This order has been cancelled' },
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function ManufacturerOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [myBid, setMyBid] = useState<MyBid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [bidLoading, setBidLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{suggestedPrice:number;reasoning:string;confidenceScore:number;winProbability:number;marketAverage:number|null} | null>(null)
  const [bidForm, setBidForm] = useState({ proposedPrice: '', deliveryDays: '', message: '' })
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState(false)

  const load = async () => {
    if (!id) return
    try {
      setError(null)
      const [orderRes, bidsRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get('/bids/my-bids'),
      ])
      const fetchedOrder = orderRes.data?.data?.order
      const allBids = bidsRes.data?.data?.bids || []
      setOrder(fetchedOrder)
      const bid = allBids.find((b: { orderId: { id: string } | null }) => b.orderId?.id === id)
      setMyBid(bid || null)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleSubmitBid = async () => {
    setBidError(null)
    const price = Number(bidForm.proposedPrice)
    const days = Number(bidForm.deliveryDays)
    if (!price || price <= 0) return setBidError('Enter a valid price')
    if (!days || days <= 0) return setBidError('Enter valid delivery days')
    if (!bidForm.message.trim()) return setBidError('Please write a short pitch')
    setBidLoading(true)
    try {
      await api.post('/bids', {
        orderId: id,
        proposedPrice: price,
        deliveryDays: days,
        message: bidForm.message.trim(),
      })
      setBidSuccess(true)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setBidError(err.response?.data?.message || 'Failed to submit bid')
    } finally {
      setBidLoading(false)
    }
  }

  const fetchAISuggestion = async () => {
    setAiLoading(true)
    try {
      const res = await api.get(`/bids/ai-suggest/${id}`)
      const s = res.data.data
      setAiSuggestion(s)
      // Auto-fill price
      setBidForm(f => ({ ...f, proposedPrice: String(s.suggestedPrice) }))
    } catch (e) { console.error(e) }
    finally { setAiLoading(false) }
  }

  const handleMarkDone = async () => {
    setActionLoading(true)
    try {
      await api.post(`/orders/${id}/manufacturing-complete`)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (error || !order) return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-sm mx-auto">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={22} className="text-red-400" />
      </div>
      <p className="font-semibold text-gray-800 mb-1">{error || 'Order not found'}</p>
      <button onClick={() => navigate('/orders')} className="mt-4 text-sm text-gray-500 hover:text-black transition-colors">
        ← Back to My Orders
      </button>
    </div>
  )

  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#6b7280', bg: '#f3f4f6', desc: '' }
  const canMarkDone = order.status === 'manufacturing' && myBid?.status === 'accepted'
  const canChat = ['confirmed', 'manufacturing', 'shipped', 'delivered', 'completed'].includes(order.status) && myBid?.status === 'accepted'
  const daysLeft = Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-up pb-8">
      {/* Back */}
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-black text-sm transition-colors">
        <ArrowLeft size={15} /> Back to My Orders
      </button>

      {/* Status banner */}
      <div className="rounded-2xl px-5 py-4 flex items-center justify-between"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: cfg.color, background: 'white' }}>
            {cfg.label}
          </span>
          <p className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.desc}</p>
        </div>
        {canChat && (
          <Link to={`/chat/${order.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border border-gray-100 flex-shrink-0 ml-4">
            <MessageSquare size={13} /> Open Chat
          </Link>
        )}
      </div>

      {/* Order card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={19} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-[#0A0A0A] tracking-tight">{order.title}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{order.orderNumber} · {order.category}</p>
          </div>
        </div>

        {order.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-5 pb-5 border-b border-gray-50">{order.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: IndianRupee, label: 'Budget',      value: order.isFixedPrice ? fmt(order.fixedPrice!) : `${fmt(order.budgetMin!)} – ${fmt(order.budgetMax!)}` },
            { icon: Package,     label: 'Quantity',    value: `${order.quantity.toLocaleString()} ${order.unit}` },
            { icon: Calendar,    label: 'Deadline',    value: `${fmtDate(order.deliveryDate)} (${daysLeft > 0 ? daysLeft + 'd' : 'overdue'})` },
            { icon: MapPin,      label: 'Deliver To',  value: order.deliveryLocation },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <item.icon size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-[#0A0A0A] leading-tight">{item.value}</p>
            </div>
          ))}
        </div>

        {order.tags && order.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {order.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}

        {order.specialNotes && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Special Notes: </span>{order.specialNotes}
          </div>
        )}
      </div>

      {/* Client info */}
      {order.clientId && (
        <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0A0A0A] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">{order.clientId.fullName?.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0A0A0A]">{order.clientId.fullName}</p>
            {order.clientId.companyName && <p className="text-xs text-gray-400">{order.clientId.companyName}</p>}
          </div>
          <User size={14} className="text-gray-300" />
        </div>
      )}

      {/* Escrow status */}
      {order.escrowAmount && order.escrowStatus === 'escrowed' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-center gap-3">
          <Shield size={18} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Payment Secured in Escrow</p>
            <p className="text-xs text-green-600 mt-0.5">
              {fmt(order.escrowAmount)} will be released to you once the client confirms delivery
            </p>
          </div>
        </div>
      )}

      {/* My bid */}
      {/* ── Bid section ── */}
      {myBid ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4 flex items-center gap-2">
            My Bid
            <span className={cn('text-xs font-semibold px-2.5 py-0.5 rounded-full',
              myBid.status === 'accepted' ? 'bg-green-100 text-green-700' :
              myBid.status === 'rejected' ? 'bg-red-100 text-red-600' :
              'bg-orange-100 text-orange-600'
            )}>
              {myBid.status === 'accepted' ? '\u2713 Accepted' : myBid.status === 'rejected' ? '\u2717 Rejected' : '\u23f3 Pending'}
            </span>
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Your Price</p>
              <div className="flex items-center gap-1">
                <IndianRupee size={14} className="text-[#0A0A0A]" />
                <p className="text-xl font-bold text-[#0A0A0A]">{myBid.proposedPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Delivery Timeline</p>
              <p className="text-xl font-bold text-[#0A0A0A]">{myBid.deliveryDays} <span className="text-sm font-normal text-gray-500">days</span></p>
            </div>
          </div>
          {myBid.message && (
            <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
              <p className="text-xs text-gray-400 mb-1">Your Pitch</p>
              <p className="text-sm text-gray-700 leading-relaxed">{myBid.message}</p>
            </div>
          )}
          {myBid.clientNote && myBid.status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3.5">
              <p className="text-xs text-red-500 mb-1 font-medium">Client Note</p>
              <p className="text-sm text-red-700">{myBid.clientNote}</p>
            </div>
          )}
        </div>
      ) : ['posted', 'bidding'].includes(order.status) && !order.isFixedPrice ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">Submit Your Bid</h3>
          <p className="text-xs text-gray-400 mb-5">Set your price, timeline, and pitch to win this order.</p>

          {bidSuccess && (
            <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">Bid submitted! Waiting for client response.</p>
            </div>
          )}
          {bidError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-600">{bidError}</p>
            </div>
          )}

          {/* AI Suggestion */}
          <div className="flex items-center justify-between mb-4 p-3.5 bg-[#0A0A0A]/5 rounded-xl border border-[#0A0A0A]/10">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[#0A0A0A]" />
              <span className="text-xs font-semibold text-[#0A0A0A]">AI Price Suggestion</span>
            </div>
            <button onClick={fetchAISuggestion} disabled={aiLoading}
              className="text-xs font-semibold px-3 py-1.5 bg-[#0A0A0A] text-white rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
              {aiLoading ? 'Analyzing...' : 'Get Suggestion'}
            </button>
          </div>
          {aiSuggestion && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-800">Suggested Price</span>
                <span className="text-sm font-bold text-blue-900">₹{aiSuggestion.suggestedPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-blue-700">
                <span>Win probability: <strong>{aiSuggestion.winProbability}%</strong></span>
                <span>Confidence: <strong>{aiSuggestion.confidenceScore}%</strong></span>
                {aiSuggestion.marketAverage && <span>Market avg: <strong>₹{aiSuggestion.marketAverage.toLocaleString('en-IN')}</strong></span>}
              </div>
              <p className="text-xs text-blue-600">{aiSuggestion.reasoning}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Price (\u20b9) *</label>
              <div className="relative">
                <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number" min="1"
                  placeholder={order.budgetMin ? String(order.budgetMin) : '0'}
                  value={bidForm.proposedPrice}
                  onChange={e => setBidForm(f => ({ ...f, proposedPrice: e.target.value }))}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
                />
              </div>
              {order.budgetMin && order.budgetMax && (
                <p className="text-[10px] text-gray-400 mt-1">Budget: {fmt(order.budgetMin)} \u2013 {fmt(order.budgetMax)}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Delivery Days *</label>
              <input
                type="number" min="1" placeholder="e.g. 14"
                value={bidForm.deliveryDays}
                onChange={e => setBidForm(f => ({ ...f, deliveryDays: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
              />
              <p className="text-[10px] text-gray-400 mt-1">Deadline: {fmtDate(order.deliveryDate)}</p>
            </div>
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Your Pitch *</label>
            <textarea
              rows={3}
              placeholder="Describe your capability, quality standards, and why you're the best fit..."
              value={bidForm.message}
              onChange={e => setBidForm(f => ({ ...f, message: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0A0A0A] resize-none focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all placeholder-gray-400"
            />
          </div>

          <button onClick={handleSubmitBid} disabled={bidLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
            {bidLoading ? <Loader2 size={15} className="animate-spin" /> : <IndianRupee size={15} />}
            {bidLoading ? 'Submitting...' : 'Submit Bid'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
          <p className="text-gray-400 text-sm">
            {order.isFixedPrice
              ? `This is a fixed price order at ${fmt(order.fixedPrice!)}. Accept the order to proceed.`
              : 'Bidding is closed for this order.'}
          </p>
        </div>
      )}

      {/* Action: Mark Manufacturing Complete */}
      {canMarkDone && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Ready to Ship?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Mark as complete once you've finished manufacturing and handed off to logistics. The client will be notified to confirm delivery.
              </p>
            </div>
          </div>
          <button onClick={handleMarkDone} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
            {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
            {actionLoading ? 'Updating...' : 'Mark Manufacturing Complete'}
          </button>
        </div>
      )}

      {/* Completed state */}
      {order.status === 'completed' && (
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={22} className="text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-800">Order Completed!</p>
            <p className="text-sm text-green-600 mt-0.5">
              Payment of {myBid ? fmt(myBid.proposedPrice) : 'funds'} has been released. Thank you!
            </p>
          </div>
        </div>
      )}

      {/* Shipped state */}
      {order.status === 'shipped' && (
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-5 flex items-center gap-3">
          <Truck size={18} className="text-cyan-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-cyan-800">Order Shipped</p>
            <p className="text-xs text-cyan-600 mt-0.5">Waiting for the client to confirm delivery and enter OTP to release your payment.</p>
          </div>
        </div>
      )}

      {/* Confirmed — waiting for escrow */}
      {order.status === 'confirmed' && !order.escrowStatus && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-3">
          <Clock size={18} className="text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Waiting for Escrow Payment</p>
            <p className="text-xs text-blue-600 mt-0.5">The client needs to pay into escrow before manufacturing can begin.</p>
          </div>
        </div>
      )}
    </div>
  )
}

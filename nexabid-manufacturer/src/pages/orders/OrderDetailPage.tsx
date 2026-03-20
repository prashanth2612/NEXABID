import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, IndianRupee,
  CheckCircle2, Clock, Shield, Loader2, MessageSquare,
  Truck, AlertCircle, User, ChevronRight, Sparkles, Star,
  Paperclip, FileText, Image,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
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
  attachments?: { name: string; type: string; data: string; size: number }[]
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
  const [myRating, setMyRating] = useState<{ rating: number; review: string } | null>(null)
  const [ratingForm, setRatingForm] = useState({ stars: 0, review: '' })
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingDone, setRatingDone] = useState(false)
  const [matchScore, setMatchScore] = useState<{ score: number; strengths: string[]; tip: string } | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [bidForm, setBidForm] = useState({ proposedPrice: '', deliveryDays: '', message: '' })
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidSuccess, setBidSuccess] = useState(false)
  const [showShipForm, setShowShipForm] = useState(false)
  const [shipForm, setShipForm] = useState({ trackingNumber: '', courierName: '', trackingUrl: '', estimatedDelivery: '' })
  const [shipLoading, setShipLoading] = useState(false)
  const [shipError, setShipError] = useState<string | null>(null)

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

  useEffect(() => {
    load()
    if (id) { api.get(`/ratings/my-rating/${id}`).then(r => { if (r.data.data.rating) setMyRating(r.data.data.rating) }).catch(() => {}) }
  }, [id])

  // Auto-fetch match score — must be before early returns to satisfy Rules of Hooks
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (order && !myBid && ['posted', 'bidding'].includes(order.status) && !matchScore && !matchLoading) {
      fetchMatchScore()
    }
  }, [order?.id, myBid?.id])

  const handleSubmitRating = async () => {
    if (!ratingForm.stars) return setRatingError('Please select a star rating')
    if (ratingForm.review.length < 10) return setRatingError('Review must be at least 10 characters')
    setRatingLoading(true); setRatingError(null)
    try {
      await api.post('/ratings', { orderId: id, rating: ratingForm.stars, review: ratingForm.review })
      setRatingDone(true)
      setMyRating({ rating: ratingForm.stars, review: ratingForm.review })
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setRatingError(err.response?.data?.message || 'Failed to submit rating')
    } finally { setRatingLoading(false) }
  }

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
      setBidForm(f => ({ ...f, proposedPrice: String(s.suggestedPrice) }))
    } catch (e) { console.error(e) }
    finally { setAiLoading(false) }
  }

  const fetchMatchScore = async () => {
    if (!order || matchScore) return
    setMatchLoading(true)
    try {
      const { manufacturer: mfr } = useAuthStore.getState()
      const mfrCategories = mfr?.categories?.join(', ') || 'General manufacturing'
      const prompt = `You are a B2B manufacturing match scoring AI. Score how well this manufacturer matches this order.

Manufacturer specialization: ${mfrCategories}
Order: "${order.title}"
Category: ${order.category}
Quantity: ${order.quantity} ${order.unit}
Budget: ${order.isFixedPrice ? `₹${order.fixedPrice?.toLocaleString('en-IN')} fixed` : `₹${order.budgetMin?.toLocaleString('en-IN')}–₹${order.budgetMax?.toLocaleString('en-IN')}`}
Delivery: ${order.deliveryDays} days

Return ONLY JSON (no markdown):
{"score":82,"strengths":["Category match","Competitive budget"],"tip":"Highlight your quality certifications in your bid"}`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text?.trim()
      if (text) {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
        setMatchScore(parsed)
      }
    } catch { /* silent */ }
    finally { setMatchLoading(false) }
  }

  const handleMarkDone = async () => {
    setActionLoading(true)
    try {
      // Single step: ship immediately, backend auto-generates ref + notifies client
      await api.post(`/orders/${id}/ship`, {})
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleShipOrder = async () => {
    if (!shipForm.trackingNumber.trim() || !shipForm.courierName.trim()) {
      setShipError('Tracking number and courier name are required'); return
    }
    setShipLoading(true); setShipError(null)
    try {
      await api.post(`/orders/${id}/ship`, shipForm)
      setShowShipForm(false)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setShipError(err.response?.data?.message || 'Failed to mark as shipped')
    } finally { setShipLoading(false) }
  }

  const cfg = STATUS_CONFIG[order?.status ?? ''] ?? { label: order?.status ?? '', color: '#6b7280', bg: '#f3f4f6', desc: '' }
  const canMarkDone = order?.status === 'manufacturing' && myBid?.status === 'accepted'
  const canShip = order?.status === 'shipped_pending' || (order?.status === 'manufacturing' && showShipForm)
  void canShip
  const canChat = ['confirmed', 'manufacturing', 'shipped', 'delivered', 'completed'].includes(order?.status ?? '') && myBid?.status === 'accepted'
  const daysLeft = order ? Math.ceil((new Date(order.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

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

        {/* AI Match Score */}
        {(matchScore || matchLoading) && !myBid && ['posted', 'bidding'].includes(order.status) && (
          <div className="mb-5 pb-5 border-b border-gray-50">
            {matchLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 size={12} className="animate-spin text-purple-400" />
                Calculating your match score...
              </div>
            ) : matchScore && (
              <div className="bg-purple-50 rounded-xl border border-purple-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Your Match Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-purple-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full transition-all"
                        style={{ width: `${matchScore.score}%` }} />
                    </div>
                    <span className={cn('text-sm font-bold',
                      matchScore.score >= 80 ? 'text-green-600' :
                      matchScore.score >= 60 ? 'text-orange-500' : 'text-red-500'
                    )}>{matchScore.score}%</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {matchScore.strengths.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 bg-white rounded-full text-xs text-purple-700 border border-purple-200 font-medium">
                      ✓ {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  <span className="font-semibold">Tip:</span> {matchScore.tip}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Attachments */}
        {order.attachments && order.attachments.length > 0 && (
          <div className="mb-5 pb-5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Paperclip size={11} /> Attachments ({order.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {order.attachments.map((file, idx) => {
                const isImg = file.type?.startsWith('image/')
                return (
                  <a key={idx} href={`data:${file.type};base64,${file.data}`} download={file.name}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                  >
                    {isImg
                      ? <Image size={13} className="text-blue-500 flex-shrink-0" />
                      : <FileText size={13} className="text-gray-400 flex-shrink-0" />
                    }
                    <span className="text-xs text-gray-600 group-hover:text-[#0A0A0A] transition-colors max-w-[140px] truncate">{file.name}</span>
                    <span className="text-[10px] text-gray-400">{((file.size || 0) / 1024).toFixed(0)}KB</span>
                  </a>
                )
              })}
            </div>
          </div>
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
          {myBid.status === 'pending' && (
            <button
              onClick={async () => {
                if (!window.confirm('Withdraw your bid? This cannot be undone.')) return
                try {
                  await api.delete(`/bids/${myBid.id}/withdraw`)
                  await load()
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { message?: string } } }
                  alert(err.response?.data?.message || 'Failed to withdraw bid')
                }
              }}
              className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium transition-colors underline">
              Withdraw this bid
            </button>
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

      {/* Action: Mark as Shipped — single button, no form needed */}
      {canMarkDone && !showShipForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck size={16} className="text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Manufacturing Complete?</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Clicking below will mark the order as shipped and notify the client automatically with their delivery address.
              </p>
            </div>
          </div>
          <button onClick={handleMarkDone} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
            {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
            {actionLoading ? 'Processing...' : 'Mark as Shipped — Notify Client'}
          </button>
        </div>
      )}

      {/* Shipped state — show tracking info */}
      {order.status === 'shipped' && (order as any).trackingNumber && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Truck size={16} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Shipment Dispatched</p>
              <p className="text-xs text-gray-400 mt-0.5">Waiting for client to confirm delivery</p>
            </div>
          </div>
          <div className="space-y-2 bg-gray-50 rounded-xl p-4">
            {[
              { label: 'Courier',   value: (order as any).courierName },
              { label: 'Tracking', value: (order as any).trackingNumber },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.label}</span>
                <span className="font-medium text-[#0A0A0A]">{item.value}</span>
              </div>
            ))}
            {(order as any).trackingUrl && (
              <a href={(order as any).trackingUrl} target="_blank" rel="noopener noreferrer"
                className="block text-xs text-blue-500 hover:text-blue-700 mt-2">
                Track shipment →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Completed state + Rate client */}
      {order.status === 'completed' && (
        <div className="space-y-4">
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

          {/* Rate the client */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">
              {myRating || ratingDone ? 'Your Rating' : 'Rate This Client'}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {myRating || ratingDone ? 'You have rated this client' : 'How was your experience working with this buyer?'}
            </p>
            {(myRating || ratingDone) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={20} className={(myRating?.rating || ratingForm.stars) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-[#0A0A0A]">{myRating?.rating || ratingForm.stars}/5</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">{myRating?.review || ratingForm.review}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ratingError && <p className="text-sm text-red-500">{ratingError}</p>}
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setRatingForm(f => ({ ...f, stars: s }))}>
                      <Star size={28} className={ratingForm.stars >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 hover:text-yellow-300 transition-colors'} />
                    </button>
                  ))}
                  {ratingForm.stars > 0 && (
                    <span className="ml-1 text-sm text-gray-500">
                      {['','Poor','Fair','Good','Very Good','Excellent'][ratingForm.stars]}
                    </span>
                  )}
                </div>
                <textarea rows={3} placeholder="How was the client's communication, requirements clarity, payment speed..."
                  value={ratingForm.review}
                  onChange={e => setRatingForm(f => ({ ...f, review: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400"
                />
                <button onClick={handleSubmitRating} disabled={ratingLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                  {ratingLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            )}
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

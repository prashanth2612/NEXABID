import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, IndianRupee,
  Star, CheckCircle2, XCircle, Clock, Shield, Loader2, Sparkles, MessageSquare,
} from 'lucide-react'
import { STATUS_CONFIG } from '@/types/order'
import type { Order, Bid } from '@/types/order'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import PaymentModal from '@/components/payments/PaymentModal'

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [myRating, setMyRating] = useState<{ rating: number; review: string } | null>(null)
  const [ratingForm, setRatingForm] = useState({ stars: 0, review: '' })
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingDone, setRatingDone] = useState(false)

  const load = async () => {
    try {
      const [orderRes, bidsRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/bids/order/${id}`),
      ])
      setOrder(orderRes.data.data.order)
      setBids(bidsRes.data.data.bids)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadRating = async (orderId: string) => {
    try {
      const res = await api.get(`/ratings/my-rating/${orderId}`)
      if (res.data.data.rating) setMyRating(res.data.data.rating)
    } catch {}
  }

  useEffect(() => {
    load()
    if (id) loadRating(id)
  }, [id])

  const handleAcceptBid = async (bidId: string) => {
    setActionLoading(bidId)
    try {
      await api.post(`/bids/${bidId}/accept`)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectBid = async (bidId: string) => {
    setActionLoading(bidId + '-reject')
    try {
      await api.post(`/bids/${bidId}/reject`)
      await load()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Package size={22} className="text-gray-400" />
        </div>
        <p className="font-semibold text-gray-800 mb-2">Order not found</p>
        <Link to="/orders" className="text-sm text-gray-500 hover:text-black transition-colors">← Back to orders</Link>
      </div>
    )
  }

  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#6b7280', bg: '#f3f4f6' }

  const getAIColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-orange-500'
    return 'text-red-500'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-up">
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-black text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      {/* Order header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-[#0A0A0A] rounded-xl flex items-center justify-center flex-shrink-0">
              <Package size={19} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0A0A0A] tracking-tight">{order.title}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium px-3 py-1.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
              {cfg.label}
            </span>
            {['confirmed','manufacturing','shipped','completed'].includes(order.status) && (
              <Link to={`/chat/${order.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-medium transition-colors"
              >
                <MessageSquare size={13} /> Chat
              </Link>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{order.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: IndianRupee, label: 'Budget', value: order.isFixedPrice ? formatCurrency(order.fixedPrice!) : `${formatCurrency(order.budgetMin!)} – ${formatCurrency(order.budgetMax!)}` },
            { icon: Package,     label: 'Quantity', value: `${order.quantity} ${order.unit}` },
            { icon: Calendar,    label: 'Delivery By', value: formatDate(order.deliveryDate) },
            { icon: MapPin,      label: 'Location', value: order.deliveryLocation },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3.5">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon size={13} className="text-gray-400" />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="text-sm font-semibold text-[#0A0A0A]">{item.value}</p>
            </div>
          ))}
        </div>

        {order.escrowAmount && order.escrowStatus === 'escrowed' && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
            <Shield size={15} className="text-green-600" />
            <p className="text-sm text-green-700">
              <span className="font-semibold">{formatCurrency(order.escrowAmount)}</span> secured in escrow
            </p>
          </div>
        )}

        {order.status === 'confirmed' && !order.escrowStatus && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-orange-50 rounded-xl border border-orange-100">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-orange-600" />
              <p className="text-sm text-orange-700 font-medium">Payment pending — secure funds in escrow to start manufacturing</p>
            </div>
            <button onClick={() => setShowPayment(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-xs font-semibold hover:bg-[#1a1a1a] transition-colors whitespace-nowrap ml-4"
            >
              <Shield size={12} /> Pay to Escrow
            </button>
          </div>
        )}

        {order.status === 'shipped' && order.escrowStatus === 'escrowed' && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">Order shipped — confirm delivery to release payment</p>
            </div>
            <button onClick={() => setShowPayment(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-xs font-semibold hover:bg-[#1a1a1a] transition-colors whitespace-nowrap ml-4"
            >
              <CheckCircle2 size={12} /> Confirm Delivery
            </button>
          </div>
        )}
      </div>

      {/* Bids */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0A0A0A]">
            Bids Received
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{bids.length}</span>
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Sparkles size={12} className="text-purple-500" />
            AI confidence scoring active
          </div>
        </div>

        {bids.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <Clock size={28} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-sm">No bids yet</p>
            <p className="text-gray-400 text-xs mt-1">Manufacturers will start bidding soon</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {bids.map((bid, i) => {
              const mfr = bid.manufacturerId as unknown as { fullName: string; businessName?: string; rating?: number }
              return (
                <div key={bid.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-600">{mfr?.fullName?.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#0A0A0A]">{mfr?.businessName || mfr?.fullName}</p>
                          {i === 0 && (
                            <span className="px-2 py-0.5 bg-[#0A0A0A] text-white text-[10px] font-semibold rounded-full uppercase tracking-wide">
                              Best Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={11} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-500">{mfr?.rating || '—'}</span>
                        </div>
                      </div>
                    </div>
                    {bid.aiConfidenceScore !== undefined && (
                      <div className="text-right">
                        <p className={cn('text-lg font-bold', getAIColor(bid.aiConfidenceScore))}>
                          {bid.aiConfidenceScore}%
                        </p>
                        <p className="text-xs text-gray-400">AI score</p>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{bid.message}</p>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Proposed Price</p>
                        <p className="text-base font-bold text-[#0A0A0A]">{formatCurrency(bid.proposedPrice)}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-400 mb-0.5">Delivery</p>
                        <p className="text-base font-bold text-[#0A0A0A]">{bid.deliveryDays} days</p>
                      </div>
                    </div>

                    {['posted', 'bidding'].includes(order.status) && bid.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === bid.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === bid.id + '-reject' ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={14} />}
                          Decline
                        </button>
                      </div>
                    )}

                    {bid.status === 'accepted' && (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold border border-green-100">
                        <CheckCircle2 size={14} /> Accepted
                      </span>
                    )}
                    {bid.status === 'rejected' && (
                      <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-sm border border-gray-100">
                        <XCircle size={14} /> Declined
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {/* ── Rating section — only on completed orders ── */}
      {order.status === 'completed' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">
            {myRating || ratingDone ? 'Your Rating' : 'Rate This Order'}
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            {myRating || ratingDone ? 'You have rated this order' : 'Share your experience with the manufacturer'}
          </p>

          {(myRating || ratingDone) ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={20} className={(myRating?.rating || ratingForm.stars) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />
                ))}
                <span className="ml-2 text-sm font-semibold text-[#0A0A0A]">{myRating?.rating || ratingForm.stars}/5</span>
              </div>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 leading-relaxed">{myRating?.review || ratingForm.review}</p>
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
              <textarea rows={3} placeholder="Describe your experience — quality, communication, delivery..."
                value={ratingForm.review}
                onChange={e => setRatingForm(f => ({ ...f, review: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#0A0A0A] resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400"
              />
              <button onClick={handleSubmitRating} disabled={ratingLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {ratingLoading ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          )}
        </div>
      )}

      {showPayment && order && (
        <PaymentModal
          orderId={order.id}
          orderTitle={order.title}
          amount={order.escrowAmount || (order.isFixedPrice ? order.fixedPrice! : order.budgetMax!)}
          onClose={() => setShowPayment(false)}
          onSuccess={load}
        />
      )}
    </div>
  )
}

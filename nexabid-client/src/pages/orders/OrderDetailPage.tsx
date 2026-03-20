import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Package, MapPin, Calendar, IndianRupee,
  Star, CheckCircle2, XCircle, Clock, Shield, Loader2, Sparkles, MessageSquare,
  Paperclip, FileText, Image,
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
  const [simLoading, setSimLoading] = useState(false)
  const [myRating, setMyRating] = useState<{ rating: number; review: string } | null>(null)
  const [ratingForm, setRatingForm] = useState({ stars: 0, review: '' })
  const [ratingLoading, setRatingLoading] = useState(false)
  const [ratingError, setRatingError] = useState<string | null>(null)
  const [ratingDone, setRatingDone] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeLoading, setDisputeLoading] = useState(false)
  const [disputeError, setDisputeError] = useState<string | null>(null)
  const [disputeSuccess, setDisputeSuccess] = useState(false)
  const [negotiationAdvice, setNegotiationAdvice] = useState<{ verdict: string; reason: string; action: string } | null>(null)
  const [negotiationLoading, setNegotiationLoading] = useState(false)

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

  const handleCancelOrder = async () => {
    if (!order) return
    if (!window.confirm('Cancel this order? This cannot be undone.')) return
    setActionLoading('cancel')
    try {
      await api.delete(`/orders/${id}`)
      navigate('/orders')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to cancel order')
    } finally { setActionLoading(null) }
  }

  const handleSendOtp = async () => {
    setOtpLoading(true)
    setOtpError(null)
    try {
      await api.post(`/payments/order/${id}/send-otp`)
      setOtpSent(true)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setOtpError(err.response?.data?.message || 'Failed to send OTP')
    } finally { setOtpLoading(false) }
  }

  const handleConfirmOtp = async () => {
    setOtpLoading(true)
    setOtpError(null)
    try {
      // find the payment id for this order
      const payRes = await api.get(`/payments/order/${id}`)
      const paymentId = payRes.data.data.payment?.id
      if (!paymentId) { setOtpError('Payment record not found'); return }
      await api.post(`/payments/${paymentId}/confirm-otp`, { otp: otpValue })
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setOtpError(err.response?.data?.message || 'Invalid OTP — please try again')
    } finally { setOtpLoading(false) }
  }

  const handleSubmitRating = async () => {
    if (!ratingForm.stars) { setRatingError('Please select a star rating'); return }
    if (ratingForm.review.length < 10) { setRatingError('Review must be at least 10 characters'); return }
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

  const handleRaiseDispute = async () => {
    if (!disputeReason.trim() || disputeReason.length < 10) {
      setDisputeError('Please describe the issue (min 10 characters)')
      return
    }
    setDisputeLoading(true); setDisputeError(null)
    try {
      // Get payment for this order first
      const payRes = await api.get(`/payments/order/${id}`)
      const paymentId = payRes.data.data.payment?.id
      if (!paymentId) { setDisputeError('No active payment found for this order'); return }
      await api.post(`/payments/${paymentId}/dispute`, { reason: disputeReason })
      setDisputeSuccess(true)
      setShowDisputeModal(false)
      await load()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setDisputeError(err.response?.data?.message || 'Failed to raise dispute')
    } finally { setDisputeLoading(false) }
  }

  const analyzeNegotiation = async () => {
    if (!order || bids.length === 0) return
    setNegotiationLoading(true)
    try {
      const budgetInfo = order.isFixedPrice
        ? `Fixed price: ₹${order.fixedPrice?.toLocaleString('en-IN')}`
        : `Budget range: ₹${order.budgetMin?.toLocaleString('en-IN')} – ₹${order.budgetMax?.toLocaleString('en-IN')}`
      const bidsSummary = bids.slice(0, 5).map(b => {
        const mfr = b.manufacturerId as unknown as { fullName: string; rating?: number }
        return `- ${mfr?.fullName}: ₹${b.proposedPrice?.toLocaleString('en-IN')}, ${b.deliveryDays} days delivery, AI score: ${b.aiConfidenceScore ?? 'N/A'}%, status: ${b.status}`
      }).join('\n')

      const prompt = `You are a B2B procurement negotiation advisor. Analyze these bids and give concise advice.

Order: "${order.title}"
${budgetInfo}
Total bids received: ${bids.length}

Bids:
${bidsSummary}

Respond ONLY with JSON (no markdown):
{"verdict":"Accept Now|Wait for More|Counter Offer","reason":"1 sentence why","action":"1 specific action to take"}`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text?.trim()
      if (text) {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
        setNegotiationAdvice(parsed)
      }
    } catch { /* silent fail */ }
    finally { setNegotiationLoading(false) }
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
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-500 hover:text-black text-sm transition-colors"
        >
          <ArrowLeft size={15} /> Back to orders
        </button>
        {['posted', 'bidding'].includes(order.status) && (
          <button onClick={handleCancelOrder}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
            Cancel Order
          </button>
        )}
      </div>

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
            {['posted','bidding'].includes(order.status) && (
              <button onClick={handleCancelOrder} disabled={actionLoading === 'cancel'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-xs font-medium transition-colors disabled:opacity-50">
                {actionLoading === 'cancel' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed mb-5">{order.description}</p>

        {/* Attachments */}
        {order.attachments && order.attachments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <Paperclip size={11} /> Attachments ({order.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {(order.attachments as { name: string; type: string; data: string; size: number }[]).map((file, idx) => {
                const isImg = file.type?.startsWith('image/')
                return (
                  <a
                    key={idx}
                    href={`data:${file.type};base64,${file.data}`}
                    download={file.name}
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

        {/* Attachments */}
        {(order as any).attachments?.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Paperclip size={11} /> Attachments ({(order as any).attachments.length})
            </p>
            <div className="space-y-2">
              {(order as any).attachments.map((file: { name: string; type: string; data: string; size: number }, idx: number) => {
                const isImg = file.type?.startsWith('image/')
                return (
                  <div key={idx} className="flex items-center gap-3 bg-white px-3 py-2.5 rounded-xl border border-gray-100">
                    {isImg ? (
                      <img src={`data:${file.type};base64,${file.data}`} alt={file.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{file.name}</p>
                      <p className="text-xs text-gray-400">{file.size ? `${(file.size / 1024).toFixed(0)} KB` : ''}</p>
                    </div>
                    {isImg && (
                      <a href={`data:${file.type};base64,${file.data}`} download={file.name}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                        Download
                      </a>
                    )}
                    {!isImg && (
                      <a href={`data:${file.type};base64,${file.data}`} download={file.name}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                        Download
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
            <div className="flex items-center gap-2 ml-4">
              <button onClick={() => setShowPayment(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-xs font-semibold hover:bg-[#1a1a1a] transition-colors whitespace-nowrap"
              >
                <Shield size={12} /> Pay to Escrow
              </button>
              {/* DEV ONLY — remove before production */}
              <button
                onClick={async () => {
                  setSimLoading(true)
                  try {
                    await api.post('/payments/simulate', { orderId: id })
                    await load()
                  } catch (e: unknown) {
                    const err = e as { response?: { data?: { message?: string } } }
                    alert(err.response?.data?.message || 'Simulate failed')
                  } finally { setSimLoading(false) }
                }}
                disabled={simLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl text-xs font-bold hover:bg-yellow-500 disabled:opacity-50 transition-colors whitespace-nowrap border border-yellow-500"
              >
                {simLoading ? <Loader2 size={12} className="animate-spin" /> : '⚡'}
                {simLoading ? 'Simulating...' : 'Simulate Payment'}
              </button>
            </div>
          </div>
        )}

        {order.status === 'shipped' && order.trackingNumber && (
          <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Shield size={13} className="text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Shipment Tracking</p>
            </div>
            <div className="space-y-2 bg-gray-50 rounded-xl p-3 text-sm">
              {[
                { label: 'Courier',    value: order.courierName },
                { label: 'Tracking',  value: order.trackingNumber },
                { label: 'Shipped',   value: order.shippedAt ? new Date(order.shippedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
                { label: 'Est. Delivery', value: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null },
              ].filter(i => i.value).map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-[#0A0A0A]">{item.value}</span>
                </div>
              ))}
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="block text-xs text-blue-500 hover:text-blue-700 font-medium mt-1">
                  Track shipment online →
                </a>
              )}
            </div>
          </div>
        )}

        {order.status === 'shipped' && order.escrowStatus === 'escrowed' && (
          <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-blue-600" />
              <p className="text-sm text-blue-700 font-medium">Order shipped — confirm delivery to release ₹{order.escrowAmount?.toLocaleString('en-IN')} from escrow</p>
            </div>
            {!otpSent ? (
              <button onClick={handleSendOtp} disabled={otpLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {otpLoading ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
                {otpLoading ? 'Sending OTP...' : 'Send Delivery OTP to my email'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-blue-600 font-medium">OTP sent to your registered email. Enter it below to release payment.</p>
                <div className="flex items-center gap-2">
                  <input value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/,'').slice(0,6))}
                    placeholder="6-digit OTP" maxLength={6}
                    className="w-36 px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-300" />
                  <button onClick={handleConfirmOtp} disabled={otpLoading || otpValue.length < 6}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                    {otpLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    {otpLoading ? 'Verifying...' : 'Confirm Delivery'}
                  </button>
                  <button onClick={handleSendOtp} disabled={otpLoading} className="text-xs text-blue-500 hover:text-blue-700 underline">Resend</button>
                </div>
                {otpError && <p className="text-xs text-red-500">{otpError}</p>}
              </div>
            )}
            <div className="pt-1 border-t border-blue-100">
              <button onClick={() => { setShowDisputeModal(true); setDisputeError(null) }}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                ⚠️ Problem with order? Raise a dispute
              </button>
            </div>
          </div>
        )}

        {/* Dispute raised banner */}
        {(order.escrowStatus as string) === 'disputed' && (
          <div className="mt-4 bg-orange-50 rounded-xl border border-orange-200 p-4">
            <p className="text-sm font-semibold text-orange-700">⚠️ Dispute in Progress</p>
            <p className="text-xs text-orange-600 mt-1">An admin is reviewing your dispute. We'll notify you once it's resolved.</p>
          </div>
        )}

        {disputeSuccess && (
          <div className="mt-4 bg-green-50 rounded-xl border border-green-100 p-4">
            <p className="text-sm font-semibold text-green-700">✅ Dispute Raised</p>
            <p className="text-xs text-green-600 mt-1">Admin has been notified and will review your case.</p>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-[#0A0A0A] mb-1">Raise a Dispute</h3>
            <p className="text-xs text-gray-400 mb-4">Describe the problem. An admin will review and resolve this within 24 hours.</p>
            <textarea
              value={disputeReason}
              onChange={e => { setDisputeReason(e.target.value); setDisputeError(null) }}
              rows={4}
              placeholder="e.g. Items delivered are damaged, wrong quantity received, not matching specifications..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10 placeholder-gray-400"
            />
            {disputeError && <p className="text-xs text-red-500 mt-2">{disputeError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={handleRaiseDispute} disabled={disputeLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                {disputeLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                {disputeLoading ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <button onClick={() => setShowDisputeModal(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bids */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#0A0A0A]">
            Bids Received
            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{bids.length}</span>
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Sparkles size={12} className="text-purple-500" />
              AI confidence scoring active
            </div>
            {bids.length > 0 && order.status === 'bidding' && (
              <button onClick={analyzeNegotiation} disabled={negotiationLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors">
                {negotiationLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {negotiationLoading ? 'Analyzing...' : 'AI Advice'}
              </button>
            )}
          </div>
        </div>

        {/* AI Negotiation Advice Panel */}
        {negotiationAdvice && (
          <div className="mx-6 mt-4 p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={14} className="text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-purple-900">AI Negotiation Advisor</p>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold',
                      negotiationAdvice.verdict === 'Accept Now' ? 'bg-green-100 text-green-700' :
                      negotiationAdvice.verdict === 'Wait for More' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    )}>
                      {negotiationAdvice.verdict}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 mb-1">{negotiationAdvice.reason}</p>
                  <p className="text-xs text-purple-600 font-medium">→ {negotiationAdvice.action}</p>
                </div>
              </div>
              <button onClick={() => setNegotiationAdvice(null)}
                className="text-purple-400 hover:text-purple-600 text-xs font-medium flex-shrink-0">✕</button>
            </div>
          </div>
        )}

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

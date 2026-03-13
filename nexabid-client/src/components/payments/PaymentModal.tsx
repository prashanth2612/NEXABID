import { useState } from 'react'
import {
  ShieldCheck, X, Loader2, CheckCircle2, CreditCard,
  Lock, IndianRupee, AlertTriangle, Mail,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface PaymentModalProps {
  orderId: string
  orderTitle: string
  amount: number
  onClose: () => void
  onSuccess: () => void
}

type Step = 'checkout' | 'processing' | 'escrowed' | 'otp' | 'released' | 'error'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default function PaymentModal({ orderId, orderTitle, amount, onClose, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<Step>('checkout')
  const [loading, setLoading] = useState(false)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // Load Razorpay SDK
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Failed to load Razorpay SDK')

      // Initiate payment on backend
      const res = await api.post('/payments/initiate', { orderId })
      const { razorpayOrderId, amount: amountPaise, currency, keyId } = res.data.data

      setStep('processing')

      const options = {
        key: keyId,
        amount: amountPaise,
        currency,
        name: 'NexaBid',
        description: `Escrow payment for: ${orderTitle}`,
        order_id: razorpayOrderId,
        theme: { color: '#0A0A0A' },
        modal: {
          ondismiss: () => setStep('checkout'),
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // Verify payment on backend
            await api.post('/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            // Get the payment ID for OTP step later
            const pmtRes = await api.get(`/payments/order/${orderId}`)
            setPaymentId(pmtRes.data.data.payment.id)
            setStep('escrowed')
          } catch (e: unknown) {
            const err = e as { response?: { data?: { message?: string } } }
            setErrorMsg(err.response?.data?.message || 'Payment verification failed')
            setStep('error')
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } ; message?: string }
      setErrorMsg(err.response?.data?.message || err.message || 'Payment failed')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await api.post(`/payments/order/${orderId}/send-otp`)
      setStep('otp')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setOtpError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) { setOtpError('Enter a valid 6-digit OTP'); return }
    if (!paymentId) { setOtpError('Payment ID missing'); return }
    setLoading(true)
    setOtpError(null)
    try {
      await api.post(`/payments/${paymentId}/confirm-otp`, { otp })
      setStep('released')
      setTimeout(() => { onSuccess(); onClose() }, 2500)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setOtpError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <ShieldCheck size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Secure Escrow Payment</p>
              <p className="text-white/40 text-xs">Funds held until delivery confirmed</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={15} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Amount info */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-400 mb-1">Order</p>
            <p className="text-sm font-medium text-[#0A0A0A] mb-3">{orderTitle}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">Escrow Amount</p>
              <div className="flex items-center gap-1">
                <IndianRupee size={14} className="text-[#0A0A0A]" />
                <p className="text-xl font-bold text-[#0A0A0A]">{amount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* Step: Checkout */}
          {step === 'checkout' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {[
                  { icon: Lock,        text: 'Payment secured by Razorpay PCI-DSS' },
                  { icon: ShieldCheck, text: 'Funds released only after you confirm delivery' },
                  { icon: CreditCard,  text: 'UPI, Net Banking, Cards accepted' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <item.icon size={14} className="text-gray-400 flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
              <button onClick={handleCheckout} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-2xl font-semibold text-sm hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                {loading ? 'Preparing checkout...' : `Pay ${fmt(amount)} to Escrow`}
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === 'processing' && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <Loader2 size={36} className="animate-spin text-gray-400 mb-4" />
              <p className="font-semibold text-[#0A0A0A]">Completing payment...</p>
              <p className="text-gray-400 text-sm mt-1">Please complete the Razorpay checkout</p>
            </div>
          )}

          {/* Step: Escrowed */}
          {step === 'escrowed' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-800 text-sm">Funds Secured in Escrow</p>
                  <p className="text-purple-600 text-xs mt-0.5">{fmt(amount)} is locked until you confirm delivery</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                The manufacturer has been notified and will begin production. Once you receive the delivery, use the OTP to release payment.
              </p>
              <button onClick={handleSendOtp} disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A0A0A] text-white rounded-2xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Send Delivery OTP to My Email
              </button>
            </div>
          )}

          {/* Step: OTP */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-blue-700">
                <Mail size={14} />
                OTP sent to your registered email
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Enter 6-Digit OTP</label>
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(null) }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
                  placeholder="• • • • • •"
                />
                {otpError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} /> {otpError}
                  </p>
                )}
              </div>
              <button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-2xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                {loading ? 'Verifying...' : 'Confirm Delivery & Release Payment'}
              </button>
              <button onClick={() => setStep('escrowed')}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                ← Resend OTP
              </button>
            </div>
          )}

          {/* Step: Released */}
          {step === 'released' && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-[#0A0A0A] mb-1">Payment Released!</p>
              <p className="text-gray-500 text-sm">{fmt(amount)} sent to manufacturer</p>
              <p className="text-gray-400 text-xs mt-2">Order marked as completed</p>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{errorMsg}</p>
              </div>
              <button onClick={() => setStep('checkout')}
                className="w-full py-3 bg-[#0A0A0A] text-white rounded-2xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

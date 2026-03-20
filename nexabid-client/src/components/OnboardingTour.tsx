import { useState, useEffect } from 'react'
import { X, ArrowRight, Package, TrendingUp, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  {
    icon: Package,
    color: 'bg-blue-50 text-blue-600',
    title: 'Post your first order',
    desc: 'Describe what you need — quantity, specs, delivery date and budget. Takes 2 minutes.',
    cta: { label: 'Post an Order', path: '/orders/create' },
  },
  {
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
    title: 'Review competitive bids',
    desc: 'Verified manufacturers compete for your order. Our AI scores each bid on price, quality and delivery time.',
    cta: null,
  },
  {
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
    title: 'Pay into secure escrow',
    desc: 'Accept the best bid and pay via Razorpay. Funds are locked — only released when you confirm delivery.',
    cta: null,
  },
  {
    icon: Truck,
    color: 'bg-orange-50 text-orange-600',
    title: 'Confirm delivery & release',
    desc: 'Track your shipment in real time. Confirm via OTP and funds are instantly released to the manufacturer.',
    cta: null,
  },
]

const STORAGE_KEY = 'nexabid_onboarding_done'

export default function OnboardingTour() {
  const { user } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    // Show only for new users who haven't seen onboarding
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && user) {
      // Small delay so dashboard renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [user])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setVisible(false)
  }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'fadeScaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Welcome to NexaBid</p>
            <h2 className="text-base font-bold text-[#0A0A0A] mt-0.5">How it works</h2>
          </div>
          <button onClick={dismiss}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${i === step ? 'bg-[#0A0A0A]' : i < step ? 'bg-gray-300' : 'bg-gray-100'}`} />
          ))}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${current.color}`}>
            <Icon size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step {step + 1} of {STEPS.length}</p>
          <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">{current.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.desc}</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <button onClick={dismiss}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Skip tour
          </button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {isLast ? (
              current.cta ? (
                <Link to={current.cta.path} onClick={dismiss}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors">
                  {current.cta.label} <ArrowRight size={14} />
                </Link>
              ) : (
                <Link to="/orders/create" onClick={dismiss}
                  className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors">
                  Post an Order <ArrowRight size={14} />
                </Link>
              )
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors">
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        <style>{`
          @keyframes fadeScaleIn {
            from { opacity: 0; transform: scale(0.92); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  )
}

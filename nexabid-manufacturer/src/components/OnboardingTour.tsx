import { useState, useEffect } from 'react'
import { X, ArrowRight, Layers, TrendingUp, ShieldCheck, IndianRupee } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const STEPS = [
  {
    icon: Layers,
    color: 'bg-blue-50 text-blue-600',
    title: 'Browse matching orders',
    desc: 'See orders in your category. Use the AI "For You" tab to get personalized order recommendations.',
    cta: { label: 'Browse Orders', path: '/browse' },
  },
  {
    icon: TrendingUp,
    color: 'bg-purple-50 text-purple-600',
    title: 'Submit competitive bids',
    desc: 'Enter your price, delivery timeline and a pitch. Use AI Bid Suggest for the optimal price.',
    cta: null,
  },
  {
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600',
    title: 'Get paid into escrow',
    desc: 'When client accepts your bid and pays, funds are locked in escrow — guaranteed payment on delivery.',
    cta: null,
  },
  {
    icon: IndianRupee,
    color: 'bg-orange-50 text-orange-600',
    title: 'Ship and receive payment',
    desc: 'Ship with tracking. Client confirms delivery via OTP and your earnings are released instantly.',
    cta: null,
  },
]

const STORAGE_KEY = 'nexabid_mfr_onboarding_done'

export default function OnboardingTour() {
  const { user } = useAuthStore()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && user) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [user])

  const dismiss = () => { localStorage.setItem(STORAGE_KEY, 'true'); setVisible(false) }

  if (!visible) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        style={{ animation: 'fadeScaleIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Welcome to NexaBid</p>
            <h2 className="text-base font-bold text-[#0A0A0A] mt-0.5">Start winning orders</h2>
          </div>
          <button onClick={dismiss} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={14} className="text-gray-500" />
          </button>
        </div>
        <div className="flex gap-1.5 px-6 pt-5">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`h-1 rounded-full flex-1 transition-all duration-300 ${i === step ? 'bg-[#0A0A0A]' : i < step ? 'bg-gray-300' : 'bg-gray-100'}`} />
          ))}
        </div>
        <div className="px-6 py-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${current.color}`}>
            <Icon size={24} />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step {step + 1} of {STEPS.length}</p>
          <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">{current.title}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.desc}</p>
        </div>
        <div className="px-6 pb-6 flex items-center justify-between">
          <button onClick={dismiss} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Skip tour</button>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            {isLast ? (
              <Link to="/browse" onClick={dismiss}
                className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors">
                Browse Orders <ArrowRight size={14} />
              </Link>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 px-5 py-2 bg-[#0A0A0A] text-white text-sm font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors">
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
        <style>{`@keyframes fadeScaleIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }`}</style>
      </div>
    </div>
  )
}

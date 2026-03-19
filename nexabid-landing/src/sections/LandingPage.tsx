import { useEffect, useRef, useState, useCallback } from 'react'

type Page = 'home' | 'about' | 'careers'
interface Props { navigate: (p: Page) => void }

// ── High-quality Unsplash manufacturing images — real workers, real products ──
const HERO_COLS = [
  'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=1400&q=95&auto=format&fit=crop',   // welder sparks - MAIN
  'https://images.unsplash.com/photo-1563906267088-b029e7101114?w=1400&q=95&auto=format&fit=crop',   // circuit board
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1400&q=95&auto=format&fit=crop',   // woman engineer - MAIN
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1400&q=95&auto=format&fit=crop',   // factory floor - MAIN
  'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1400&q=95&auto=format&fit=crop',   // machinery detail - side
]

const TICKER = [
  'AI-Powered Bidding', '₹240Cr+ Processed', '1,200+ Manufacturers', 'Zero Payment Risk',
  'Real-Time Tracking', 'OTP Delivery Verification', 'GST-Ready Invoicing', 'Pan-India Coverage',
  '48-Hour Bid Response', 'Verified Manufacturers', 'Escrow Protected', 'Series A Funded',
]

const CATEGORIES = [
  { name: 'Textiles & Garments', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=900&q=95&auto=format&fit=crop', count: '340+ manufacturers' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=95&auto=format&fit=crop', count: '210+ manufacturers' },
  { name: 'Automotive Parts', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900&q=95&auto=format&fit=crop', count: '180+ manufacturers' },
  { name: 'Hardware & Metals', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=95&auto=format&fit=crop', count: '290+ manufacturers' },
  { name: 'Furniture & Wood', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=95&auto=format&fit=crop', count: '150+ manufacturers' },
  { name: 'Chemicals & Pharma', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900&q=95&auto=format&fit=crop', count: '120+ manufacturers' },
  { name: 'Plastics & Polymers', img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=95&auto=format&fit=crop', count: '95+ manufacturers' },
  { name: 'Paper & Packaging', img: 'https://plus.unsplash.com/premium_photo-1683120796013-f2f18451a907?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=900&q=95&auto=format&fit=crop', count: '110+ manufacturers' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Post your order',
    desc: 'Describe your requirement, set quantity, delivery timeline and budget. Attach spec sheets, reference images or documents.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=95&auto=format&fit=crop',
  },
  {
    step: '02',
    title: 'Manufacturers compete',
    desc: 'Verified manufacturers submit bids. Our AI scores each on price, delivery time and win probability in real time.',
    img: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=95&auto=format&fit=crop',
  },
  {
    step: '03',
    title: 'Pay into escrow',
    desc: 'Accept the best bid. Pay securely via Razorpay — funds are locked until you confirm delivery. Zero payment risk.',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=95&auto=format&fit=crop',
  },
  {
    step: '04',
    title: 'Confirm & release',
    desc: 'Manufacturer ships with live tracking. You confirm delivery via OTP — funds are released instantly.',
    img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=900&q=95&auto=format&fit=crop',
  },
]

const TESTIMONIALS = [
  {
    quote: "We cut procurement time from 3 weeks to 4 days. The escrow system gives our finance team complete peace of mind.",
    name: 'Priya Mehta',
    role: 'Procurement Head, Reliance Retail',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=90&auto=format&fit=crop&face',
  },
  {
    quote: "As a manufacturer in Surat, we used to rely on middlemen. NexaBid gave us direct access to corporate buyers across India.",
    name: 'Ramesh Patel',
    role: 'Owner, Patel Textiles Pvt. Ltd.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=90&auto=format&fit=crop&face',
  },
  {
    quote: "The AI bid suggestion alone saved us ₹18 lakhs in the first quarter. This is how B2B procurement should work.",
    name: 'Anita Sharma',
    role: 'COO, TechBuild Manufacturing',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=90&auto=format&fit=crop&face',
  },
]

const NEWS = [
  {
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=95&auto=format&fit=crop',
    tag: 'Funding',
    title: 'NexaBid raises ₹45Cr Series A to expand AI-powered manufacturing marketplace',
  },
  {
    img: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=800&q=95&auto=format&fit=crop',
    tag: 'Product',
    title: 'How NexaBid\'s escrow system eliminated payment fraud for 500+ Indian manufacturers',
  },
  {
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=95&auto=format&fit=crop',
    tag: 'Vision',
    title: 'Building India\'s largest B2B manufacturing network — NexaBid\'s 2025 roadmap',
  },
]

// ── Hooks ────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

function useCounter(target: number) {
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      let start = 0
      const duration = 1800
      const startTime = performance.now()
      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setN(Math.floor(eased * target))
        if (progress < 1) requestAnimationFrame(animate)
        else setN(target)
      }
      requestAnimationFrame(animate)
      obs.disconnect()
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return { n, ref }
}

function StatCount({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { n, ref } = useCounter(value)
  return (
    <div className="text-center">
      <span ref={ref} className="block text-5xl md:text-6xl font-bold text-[#1c1e21] tracking-tight leading-none">
        {n.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="block text-sm text-[#65676b] mt-3 leading-5 font-medium">{label}</span>
    </div>
  )
}

// ── Process Stepper — interactive animated ───────────────────────
const STEP_ICONS = [
  // Post order — document/pen
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="21" cy="21" r="5" fill="currentColor" opacity="0.15"/><path d="M19.5 21h3M21 19.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  // Manufacturers bid — chart/gavel
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M5 22l5-5 4 4 9-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="17" r="1.5" fill="currentColor"/><circle cx="14" cy="21" r="1.5" fill="currentColor"/><circle cx="23" cy="12" r="1.5" fill="currentColor"/><path d="M18 6l2.5 2.5-6 6L12 12l6-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
  // Escrow — shield/lock
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4l8 3v7c0 5-4 8-8 9-4-1-8-4-8-9V7l8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><rect x="11" y="13" width="6" height="5" rx="1" stroke="currentColor" strokeWidth="1.8"/><path d="M12.5 13v-2a1.5 1.5 0 013 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  // Confirm delivery — truck/checkmark
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 8h14v10H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M18 11h3l3 4v3h-6V11z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="8" cy="20" r="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="21" cy="20" r="2" stroke="currentColor" strokeWidth="1.8"/><path d="M10 13l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
]

function ProcessStepper() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const DURATION = 4000

  const goTo = useCallback((i: number) => {
    setActive(i)
    setProgress(0)
    setAnimKey(k => k + 1)
    if (timerRef.current) clearInterval(timerRef.current)
    let start = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min((elapsed / DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timerRef.current!)
        setTimeout(() => goTo((i + 1) % HOW_IT_WORKS.length), 200)
      }
    }, 16)
  }, [])

  useEffect(() => { goTo(0); return () => { if (timerRef.current) clearInterval(timerRef.current) } }, [])

  const step = HOW_IT_WORKS[active]

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">

      {/* LEFT — step tabs */}
      <div className="flex flex-row md:flex-col gap-2 md:gap-0 flex-shrink-0 w-full md:w-[300px] overflow-x-auto md:overflow-visible">
        {HOW_IT_WORKS.map((s, i) => (
          <button key={s.step} onClick={() => goTo(i)}
            className="flex-shrink-0 md:flex-shrink text-left w-full group transition-all duration-200"
            style={{ outline: 'none' }}>
            <div className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${active === i ? 'bg-[#f0f4ff]' : 'hover:bg-[#f7f8fa]'}`}>
              {/* Icon circle */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${active === i ? 'bg-[#0064e0] text-white shadow-lg shadow-blue-600/25' : 'bg-[#f0f2f5] text-[#65676b]'}`}>
                {STEP_ICONS[i]}
              </div>
              {/* Label */}
              <div className="min-w-0">
                <p className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-0.5 transition-colors ${active === i ? 'text-[#0064e0]' : 'text-[#9ca3af]'}`}>
                  Step {s.step}
                </p>
                <p className={`font-bold text-[15px] leading-tight transition-colors ${active === i ? 'text-[#1c1e21]' : 'text-[#65676b]'}`}>
                  {s.title}
                </p>
              </div>
            </div>
            {/* Progress bar under active tab */}
            {active === i && (
              <div className="mx-4 h-[3px] bg-[#e4e6eb] rounded-full overflow-hidden mt-0.5 mb-2">
                <div className="h-full bg-[#0064e0] rounded-full transition-none"
                  style={{ width: `${progress}%` }} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* RIGHT — animated content panel */}
      <div className="flex-1 w-full min-w-0" key={animKey}
        style={{ animation: 'stepFadeSlide 0.45s cubic-bezier(0.25,0.46,0.45,0.94) both' }}>
        <div className="bg-[#f7f8fa] rounded-3xl overflow-hidden">
          {/* Image */}
          <div className="relative overflow-hidden" style={{ height: 'clamp(240px, 35vw, 420px)' }}>
            <img src={step.img} alt={step.title}
              className="w-full h-full object-cover"
              style={{ animation: 'stepZoom 4.5s ease forwards' }} />
            {/* Step number watermark */}
            <span className="absolute bottom-4 right-6 font-black text-white/15 select-none pointer-events-none"
              style={{ fontSize: 'clamp(80px, 12vw, 130px)', lineHeight: 1, letterSpacing: '-0.05em' }}>
              {step.step}
            </span>
            {/* Gradient fade bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32"
              style={{ background: 'linear-gradient(to top, rgba(247,248,250,0.9), transparent)' }} />
          </div>
          {/* Text */}
          <div className="px-8 py-7 bg-white border-t border-[#f0f2f5]">
            <h3 className="text-[#1c1e21] font-bold mb-3"
              style={{ fontSize: 'clamp(20px, 2.5vw, 26px)', letterSpacing: '-0.3px' }}>
              {step.title}
            </h3>
            <p className="text-[#65676b] leading-relaxed mb-5" style={{ fontSize: 15, maxWidth: 520 }}>
              {step.desc}
            </p>
            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {HOW_IT_WORKS.map((_, i) => (
                <button key={i} onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? '#0064e0' : '#d1d5db' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes stepFadeSlide {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes stepZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.06); }
        }
      `}</style>
    </div>
  )
}

// ── Hero Carousel — full drag/swipe/mouse support ───────────────
function HeroCarousel({ navigate: _navigate }: { navigate: (p: Page) => void }) {
  const [idx, setIdx] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const dragDist = useRef(0)

  // Auto-advance
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_COLS.length), 5500)
    return () => clearInterval(t)
  }, [])

  const goTo = useCallback((next: number) => {
    setIdx((next + HERO_COLS.length) % HERO_COLS.length)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    startX.current = e.clientX
    dragDist.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    dragDist.current = e.clientX - startX.current
  }
  const onPointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    if (dragDist.current < -50) goTo(idx + 1)
    else if (dragDist.current > 50) goTo(idx - 1)
    dragDist.current = 0
  }

  return (
    <section
      ref={trackRef}
      className="relative w-full overflow-hidden bg-white select-none"
      style={{ height: 'min(78vh, 640px)', cursor: 'grab', padding: '20px 0' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Side panel LEFT */}
      <div className="absolute left-0 top-0 h-full overflow-hidden pointer-events-none"
        style={{ width: 'clamp(40px, 8vw, 130px)', padding: '20px 0' }}>
        <div style={{ height: '100%', borderRadius: '0 16px 16px 0', overflow: 'hidden' }}>
          <img src={HERO_COLS[(idx + HERO_COLS.length - 1) % HERO_COLS.length]} alt=""
            className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/50" />
        </div>
      </div>

      {/* Side panel RIGHT */}
      <div className="absolute right-0 top-0 h-full overflow-hidden pointer-events-none"
        style={{ width: 'clamp(40px, 8vw, 130px)', padding: '20px 0' }}>
        <div style={{ height: '100%', borderRadius: '16px 0 0 16px', overflow: 'hidden' }}>
          <img src={HERO_COLS[(idx + 1) % HERO_COLS.length]} alt=""
            className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-white/50" />
        </div>
      </div>

      {/* CENTER CARD */}
      <div className="absolute top-0 h-full"
        style={{ left: 'clamp(50px, 9vw, 145px)', right: 'clamp(50px, 9vw, 145px)', padding: '20px 0' }}>
        <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>

          {/* Images — crossfade */}
          {HERO_COLS.map((src, i) => (
            <div key={i} className="absolute inset-0"
              style={{
                opacity: idx === i ? 1 : 0,
                transition: 'opacity 1s ease',
                zIndex: idx === i ? 2 : 1,
              }}>
              <img src={src} alt="" className="w-full h-full object-cover"
                style={{ transition: 'transform 7s ease', transform: idx === i ? 'scale(1.04)' : 'scale(1)' }} />
            </div>
          ))}

          {/* Gradient */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.05) 100%)', zIndex: 3 }} />

          {/* Text */}
          <div className="absolute inset-0 flex flex-col justify-center pointer-events-none"
            style={{ padding: 'clamp(28px, 5vw, 64px)', maxWidth: 640, zIndex: 4 }}>
            <p className="text-white/55 text-[11px] font-bold uppercase tracking-[0.3em] mb-4">NEXABID</p>
            <h1 className="text-white font-bold mb-5"
              style={{ fontSize: 'clamp(26px, 3.2vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              India's B2B<br />Manufacturing<br />Marketplace —<br />powered by AI
            </h1>
            <p className="text-white/70 mb-7"
              style={{ fontSize: 'clamp(14px, 1.3vw, 17px)', lineHeight: 1.65, maxWidth: 400 }}>
              Post orders. Get competitive bids. Pay into escrow. Receive with confidence.
            </p>
            {/* Buttons need pointer-events back */}
            <div className="flex flex-wrap gap-3" style={{ pointerEvents: 'all' }}>
              <a href="http://localhost:5173/auth/register" target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 bg-[#0064e0] text-white font-bold rounded-full hover:bg-[#1877f2] transition-all shadow-lg"
                style={{ fontSize: 14, zIndex: 10, position: 'relative' }}
                onPointerDown={e => e.stopPropagation()}>
                Post an Order
              </a>
              <a href="http://localhost:5174/auth/register" target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 text-white font-semibold rounded-full border-2 border-white/50 hover:bg-white/15 transition-all"
                style={{ fontSize: 14, zIndex: 10, position: 'relative' }}
                onPointerDown={e => e.stopPropagation()}>
                Join as Manufacturer
              </a>
            </div>
          </div>

          {/* Dot nav */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none" style={{ zIndex: 5 }}>
            {HERO_COLS.map((_, i) => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{ width: idx === i ? 24 : 7, height: 7, background: idx === i ? 'white' : 'rgba(255,255,255,0.35)' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Draggable / swipeable card carousel ─────────────────────────
function CardCarousel({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const velocity = useRef(0)
  const lastX = useRef(0)
  const rafId = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (!trackRef.current) return
    isDragging.current = true
    startX.current = e.clientX
    scrollLeft.current = trackRef.current.scrollLeft
    lastX.current = e.clientX
    velocity.current = 0
    trackRef.current.style.cursor = 'grabbing'
    trackRef.current.setPointerCapture(e.pointerId)
    cancelAnimationFrame(rafId.current)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return
    e.preventDefault()
    const dx = e.clientX - startX.current
    velocity.current = e.clientX - lastX.current
    lastX.current = e.clientX
    trackRef.current.scrollLeft = scrollLeft.current - dx
  }, [])

  const onPointerUp = useCallback(() => {
    if (!trackRef.current) return
    isDragging.current = false
    trackRef.current.style.cursor = 'grab'
    // Momentum scroll
    const applyMomentum = () => {
      if (!trackRef.current || Math.abs(velocity.current) < 0.5) return
      trackRef.current.scrollLeft -= velocity.current * 0.9
      velocity.current *= 0.92
      rafId.current = requestAnimationFrame(applyMomentum)
    }
    rafId.current = requestAnimationFrame(applyMomentum)
  }, [])

  return (
    <div
      ref={trackRef}
      className={`overflow-x-auto select-none scroll-smooth ${className}`}
      style={{ cursor: 'grab', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {children}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────
export default function LandingPage({ navigate }: Props) {
  useReveal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeTesti, setActiveTesti] = useState(0)

  // Testimonial auto-advance
  useEffect(() => {
    const t = setInterval(() => setActiveTesti(i => (i + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", WebkitFontSmoothing: 'antialiased' }}>

      {/* ─────────────── NAVBAR ─────────────────────────────────── */}
      <nav className="sticky top-0 z-50">
        {/* Blur backdrop */}
        <div className="absolute inset-0 bg-white/85 backdrop-blur-xl border-b border-[#e4e6eb]/80" />

        <div className="relative meta-container">
          <div className="flex items-center h-[68px] md:h-[76px]">

            {/* Logo */}
            <div className="flex items-center gap-3 mr-0 md:mr-12 flex-grow md:flex-grow-0">
              <div className="w-9 h-9 bg-[#0064e0] rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-600/25">
                <span className="text-white text-[13px] font-extrabold tracking-tight">NB</span>
              </div>
              <span className="font-bold text-[17px] text-[#1c1e21] tracking-[-0.3px]">NexaBid</span>
            </div>

            {/* Nav links */}
            <div className="hidden md:flex items-center gap-7 flex-grow">
              <button onClick={() => navigate('about')}
                className="text-[15px] font-medium text-[#4b4f56] hover:text-[#1c1e21] transition-colors tracking-[-0.1px]">
                About
              </button>
              <a href="#how"
                className="text-[15px] font-medium text-[#4b4f56] hover:text-[#1c1e21] transition-colors tracking-[-0.1px]">
                How it Works
              </a>
              <button onClick={() => navigate('careers')}
                className="text-[15px] font-medium text-[#4b4f56] hover:text-[#1c1e21] transition-colors tracking-[-0.1px]">
                Careers
              </button>
            </div>

            {/* CTA buttons — all 4 */}
            <div className="hidden md:flex items-center gap-2.5">
              <a href="http://localhost:5173" target="_blank"
                className="px-[18px] py-[8px] text-[14px] font-semibold text-[#0064e0] border-2 border-[#0064e0] rounded-[100px] hover:bg-[#e8f0fd] transition-all tracking-[-0.1px]">
                Client Login
              </a>
              <a href="http://localhost:5174" target="_blank"
                className="px-[18px] py-[8px] text-[14px] font-semibold text-[#0064e0] border-2 border-[#0064e0] rounded-[100px] hover:bg-[#e8f0fd] transition-all tracking-[-0.1px]">
                Manufacturer Login
              </a>
              <a href="http://localhost:5173/auth/register" target="_blank"
                className="px-[20px] py-[9px] text-[14px] font-bold text-white bg-[#0064e0] rounded-[100px] hover:bg-[#1877f2] transition-all shadow-md shadow-blue-600/20 tracking-[-0.1px]">
                Post an Order
              </a>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden ml-auto p-2 rounded-lg hover:bg-[#f0f2f5] transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                {menuOpen
                  ? <path d="M5 5L17 17M17 5L5 17" stroke="#1c1e21" strokeWidth="1.8" strokeLinecap="round"/>
                  : <path d="M4 6H18M4 11H18M4 16H18" stroke="#1c1e21" strokeWidth="1.8" strokeLinecap="round"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-[#e4e6eb] py-4 px-4 space-y-1 shadow-lg">
            {(['About', 'How it Works', 'Careers'] as const).map((label) => (
              <button key={label}
                onClick={() => { if (label === 'About') navigate('about'); if (label === 'Careers') navigate('careers'); setMenuOpen(false) }}
                className="block w-full text-left py-3 px-3 text-[15px] text-[#1c1e21] font-medium hover:bg-[#f0f2f5] rounded-xl">
                {label}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-3">
              <a href="http://localhost:5173" target="_blank" className="py-2.5 text-center text-[14px] font-semibold text-[#0064e0] border-2 border-[#0064e0] rounded-[100px]">Client</a>
              <a href="http://localhost:5174" target="_blank" className="py-2.5 text-center text-[14px] font-semibold text-[#0064e0] border-2 border-[#0064e0] rounded-[100px]">Manufacturer</a>
            </div>
            <a href="http://localhost:5173/auth/register" target="_blank"
              className="block py-3 text-center text-[14px] font-bold text-white bg-[#0064e0] rounded-[100px] mt-2">
              Post an Order
            </a>
          </div>
        )}
      </nav>

      {/* ─────────────── HERO — Draggable swipe carousel ────────── */}
      <HeroCarousel navigate={navigate} />

      {/* ─────────────── STATS ──────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="meta-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 px-4 md:px-10">
            <StatCount value={1200} suffix="+" label="Verified Manufacturers" />
            <StatCount value={8500} suffix="+" label="Orders Completed" />
            <StatCount value={240} suffix="Cr+" label="GMV Processed (₹)" />
            <StatCount value={98}   suffix="%" label="Escrow Success Rate" />
          </div>
        </div>
      </section>

      {/* ─────────────── CATEGORY CARDS — tall portrait style ───── */}
      <section className="py-20 md:py-24 bg-[#f0f2f5] overflow-hidden">
        <div className="meta-container mb-10">
          <p className="text-[#0064e0] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 reveal">Categories</p>
          <div className="flex items-end justify-between">
            <h2 className="text-[28px] md:text-4xl font-bold text-[#1c1e21] tracking-tight leading-tight reveal reveal-delay-1">
              Every Industry.<br />One Platform.
            </h2>
            <p className="hidden md:block text-[13px] text-[#65676b] reveal reveal-delay-2">← Drag to explore →</p>
          </div>
        </div>

        <CardCarousel className="px-6 md:px-[max(24px,calc((100vw-1504px)/2+32px))]">
          <div className="flex gap-5 pb-6 pt-2" style={{ paddingRight: 40 }}>
            {CATEGORIES.map((cat) => (
              <div key={cat.name}
                className="flex-shrink-0 group cursor-pointer"
                style={{ width: 'clamp(240px, 21vw, 310px)' }}>
                {/* Image — tall portrait */}
                <div className="relative overflow-hidden rounded-2xl mb-4"
                  style={{ height: 360 }}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                  />
                </div>
                {/* Text below — clean, no background */}
                <p className="text-[#1c1e21] font-bold text-[17px] leading-snug mb-1">{cat.name}</p>
                <p className="text-[#65676b] text-[13px]">{cat.count}</p>
              </div>
            ))}
          </div>
        </CardCarousel>
      </section>

      {/* ─────────────── HOW IT WORKS ────────────────────────────── */}
      <section id="how" className="py-20 md:py-28 bg-white overflow-hidden">
        <div className="meta-container">
          <p className="text-[#0064e0] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 reveal">Process</p>
          <h2 className="text-[28px] md:text-4xl font-bold text-[#1c1e21] tracking-tight mb-16 reveal reveal-delay-1">
            Four Steps to Zero Procurement Risk.
          </h2>

          {/* ── Stepper ── */}
          <ProcessStepper />
        </div>
      </section>

      {/* ─────────────── PORTALS ────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#1c1e21]">
        <div className="meta-container">
          <p className="text-[#0064e0] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 reveal">Access</p>
          <h2 className="text-[28px] md:text-4xl font-bold text-white tracking-tight mb-14 reveal reveal-delay-1">
            Built for Both Sides of the Transaction.
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                label: 'For Buyers',
                title: 'Post orders. Get the best manufacturer.',
                desc: 'Review AI-scored bids, pay into escrow, track delivery in real time.',
                img: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=900&q=95&auto=format&fit=crop',
                cta: 'Open Client Portal',
                href: 'http://localhost:5173',
                btnColor: '#0064e0',
              },
              {
                label: 'For Manufacturers',
                title: 'Browse orders. Win more business.',
                desc: 'Swipe through matching orders, bid with AI guidance, get paid on delivery.',
                img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=95&auto=format&fit=crop',
                cta: 'Open Manufacturer Portal',
                href: 'http://localhost:5174',
                btnColor: '#1a7f37',
              },
              {
                label: 'For Admins',
                title: 'Full visibility. Complete control.',
                desc: 'Manage users, resolve disputes, track payments and platform health.',
                img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=95&auto=format&fit=crop',
                cta: 'Admin Panel',
                href: 'http://localhost:5175',
                btnColor: '#6e40c9',
              },
            ].map((portal, i) => (
              <div key={portal.label} className={`reveal reveal-delay-${i + 1} group rounded-2xl overflow-hidden bg-[#2d2f33] hover:bg-[#35373b] transition-all duration-300 hover:shadow-xl hover:shadow-black/30`}>
                <div className="relative h-48 overflow-hidden">
                  <img src={portal.img} alt={portal.label}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 opacity-75 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2d2f33] to-transparent" />
                  <span className="absolute top-4 left-4 text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]">{portal.label}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-[16px] font-bold text-white mb-2 tracking-[-0.1px]">{portal.title}</h3>
                  <p className="text-[13px] text-white/50 leading-relaxed mb-5">{portal.desc}</p>
                  <a href={portal.href} target="_blank"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[100px] text-[13px] font-bold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: portal.btnColor }}>
                    {portal.cta} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="meta-container">
          <p className="text-[#0064e0] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 reveal">Testimonials</p>
          <h2 className="text-[28px] md:text-4xl font-bold text-[#1c1e21] tracking-tight mb-12 reveal reveal-delay-1">
            Trusted by India's Best Procurement Teams.
          </h2>
          <div className="md:flex md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i}
                className={`reveal reveal-delay-${i + 1} flex-1 bg-[#f0f2f5] rounded-2xl p-7 mb-4 md:mb-0 cursor-pointer transition-all duration-300
                  ${activeTesti === i ? 'ring-2 ring-[#0064e0] shadow-lg shadow-blue-600/10' : 'hover:shadow-md'}`}
                onClick={() => setActiveTesti(i)}>
                <p className="text-[15px] text-[#1c1e21] leading-relaxed mb-5 font-medium">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white" />
                  <div>
                    <p className="text-[13px] font-bold text-[#1c1e21]">{t.name}</p>
                    <p className="text-[12px] text-[#65676b]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── NEWS CARDS — draggable ─────────────────── */}
      <section className="py-20 md:py-24 bg-[#f0f2f5]">
        <div className="meta-container mb-10">
          <p className="text-[#0064e0] text-[11px] font-bold uppercase tracking-[0.25em] mb-3 reveal">Latest</p>
          <h2 className="text-[28px] md:text-4xl font-bold text-[#1c1e21] tracking-tight reveal reveal-delay-1">News & Updates</h2>
        </div>
        <CardCarousel className="px-6 md:px-[max(24px,calc((100vw-1504px)/2+32px))]">
          <div className="flex gap-5 pb-3 pt-1" style={{ paddingRight: 40 }}>
            {NEWS.map((n, i) => (
              <div key={i}
                className="flex-shrink-0 w-[200px] md:w-[250px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="relative h-[110px] overflow-hidden">
                  <img src={n.img} alt=""
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  <span className="absolute top-4 left-4 bg-[#0064e0] text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {n.tag}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[14px] font-semibold text-[#1c1e21] leading-snug">{n.title}</p>
                  <p className="text-[13px] text-[#0064e0] font-bold mt-3">Read more →</p>
                </div>
              </div>
            ))}
          </div>
        </CardCarousel>
      </section>

      {/* ─────────────── CTA BANNER ─────────────────────────────── */}
      <section className="py-20 md:py-28 bg-[#0064e0] relative overflow-hidden">
        {/* Subtle animated background circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3"
          style={{ animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 -translate-x-1/3 translate-y-1/3"
          style={{ animation: 'pulse 4s 2s ease-in-out infinite' }} />
        <div className="meta-container relative z-10 text-center">
          <h2 className="text-[32px] md:text-5xl font-bold text-white mb-5 tracking-tight reveal">
            Ready to Transform Your Procurement?
          </h2>
          <p className="text-white/75 text-[15px] md:text-lg mb-10 reveal reveal-delay-1">
            Join 1,200+ manufacturers and 500+ corporate buyers already on NexaBid.
          </p>
          <div className="flex flex-wrap justify-center gap-4 reveal reveal-delay-2">
            <a href="http://localhost:5173/auth/register" target="_blank"
              className="px-8 py-3.5 bg-white text-[#0064e0] text-[15px] font-bold rounded-[100px] hover:bg-white/90 transition-all shadow-lg">
              Post Your First Order — Free
            </a>
            <a href="http://localhost:5174/auth/register" target="_blank"
              className="px-8 py-3.5 bg-white/10 border-2 border-white/40 text-white text-[15px] font-semibold rounded-[100px] hover:bg-white/20 transition-all backdrop-blur">
              Register as Manufacturer
            </a>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100%{transform:scale(1) translate(33%,-33%)}50%{transform:scale(1.08) translate(33%,-33%)} }`}</style>
      </section>

      {/* ─────────────── FOOTER ─────────────────────────────────── */}
      <footer className="bg-[#1c1e21] pt-16 pb-8">
        <div className="meta-container">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">

            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#0064e0] rounded-[10px] flex items-center justify-center">
                  <span className="text-white text-[13px] font-extrabold">NB</span>
                </div>
                <span className="font-bold text-[17px] text-white tracking-[-0.3px]">NexaBid</span>
              </div>
              <p className="text-[#8a8d91] text-[13px] leading-relaxed max-w-xs mb-6">
                India's most trusted B2B manufacturing marketplace. AI-powered bidding, zero-risk escrow payments, pan-India coverage.
              </p>
              <div className="flex gap-2.5">
                {['X', 'in', 'f', 'yt'].map(s => (
                  <button key={s} className="w-9 h-9 rounded-full bg-white/8 text-white/40 text-xs font-bold hover:bg-white/15 hover:text-white/80 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-white text-[13px] font-bold uppercase tracking-[0.15em] mb-5">Platform</p>
              <ul className="space-y-3">
                {['For Buyers', 'For Manufacturers', 'Pricing', 'AI Features', 'Escrow System', 'Order Tracking'].map(item => (
                  <li key={item}><a href="#" className="text-[#8a8d91] text-[13px] hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white text-[13px] font-bold uppercase tracking-[0.15em] mb-5">Company</p>
              <ul className="space-y-3">
                {[['About Us', 'about' as Page], ['Careers', 'careers' as Page], ['Blog', null], ['Press', null], ['Contact', null]].map(([label, page]) => (
                  <li key={label as string}>
                    <button onClick={() => page && navigate(page as Page)}
                      className="text-[#8a8d91] text-[13px] hover:text-white transition-colors text-left">
                      {label as string}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white text-[13px] font-bold uppercase tracking-[0.15em] mb-5">Legal</p>
              <ul className="space-y-3">
                {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy', 'Grievance Policy'].map(item => (
                  <li key={item}><a href="#" className="text-[#8a8d91] text-[13px] hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[#8a8d91] text-[12px]">
              © 2025 NexaBid Technologies Pvt. Ltd. · CIN: U74999MH2024PTC000001 · GST: 27AAAXX0000X1ZX
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-[#8a8d91] text-[12px]">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

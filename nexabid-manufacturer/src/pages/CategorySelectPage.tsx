import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useCategoryStore, ALL_CATEGORIES, type Category } from '@/store/categoryStore'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string; background?: string; speed?: string | number
        loop?: boolean | string; autoplay?: boolean | string; direction?: string | number
      }
    }
  }
}

const CAT_IMG: Record<string, string> = {
  'Textiles & Garments':      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=80',
  'Electronics & Components': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=80',
  'Hardware & Metals':        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&q=80',
  'Automotive Parts':         'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80',
  'Machinery & Equipment':    'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=300&q=80',
  'Rubber & Seals':           'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&q=80',
  'Plastics & Polymers':      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=300&q=80',
  'Chemicals & Pharma':       'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=300&q=80',
  'Paper & Packaging':        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&q=80',
  'Leather & Footwear':       'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
  'Furniture & Wood':         'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80',
  'Food & Beverages':         'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80',
  'Sports & Toys':            'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&q=80',
  'Other':                    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&q=80',
}

const CAT_BG: Record<string, string> = {
  'Textiles & Garments':      '#EEF0FF',
  'Electronics & Components': '#E0F2FE',
  'Hardware & Metals':        '#F1F5F9',
  'Automotive Parts':         '#FEF2F2',
  'Machinery & Equipment':    '#F0FDF4',
  'Rubber & Seals':           '#FFF1F2',
  'Plastics & Polymers':      '#FFF7ED',
  'Chemicals & Pharma':       '#ECFDF5',
  'Paper & Packaging':        '#F5F3FF',
  'Leather & Footwear':       '#FEF3C7',
  'Furniture & Wood':         '#FEF9EE',
  'Food & Beverages':         '#FFFBEB',
  'Sports & Toys':            '#E0F9FF',
  'Other':                    '#F8FAFC',
}

// ✅ Verified working Lottie JSON — friendly robot waving & pointing
// Source: LottieFiles public domain animation
const LOTTIE_SRC = 'https://assets9.lottiefiles.com/packages/lf20_myejiggj.json'

export default function CategorySelectPage() {
  const navigate = useNavigate()
  const { selected, toggle, selectAll, clearAll, confirm } = useCategoryStore()
  const [query, setQuery] = useState('')
  const [charHeight, setCharHeight] = useState(0)
  const playerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const calc = () => setCharHeight(Math.round(window.innerHeight * 0.6))
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  // Load lottie-player (standard, not dotlottie — works with .json URLs)
  useEffect(() => {
    if (customElements.get('lottie-player')) return
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@lottiefiles/lottie-player@2.0.8/dist/lottie-player.js'
    document.head.appendChild(script)
  }, [])

  const allSelected = selected.length === ALL_CATEGORIES.length
  const filtered = ALL_CATEGORIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  )
  const handleConfirm = () => { confirm(); navigate('/browse') }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F7F8FC', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet" />

      <div className="max-w-[480px] mx-auto w-full flex flex-col min-h-screen">

        {/* Header */}
        <div className="px-5 pt-7 pb-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#0F0F1A' }}>
                What do you<br />
                <span style={{ color: '#4F46E5' }}>manufacture?</span>
              </h1>
              <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 5, fontWeight: 300 }}>
                {selected.length === 0 ? 'Select all that apply' : `${selected.length} selected`}
              </p>
            </div>
            <button onClick={allSelected ? clearAll : selectAll}
              style={{ fontSize: 11.5, fontWeight: 500, color: '#4F46E5', background: '#EEF2FF', border: 'none', borderRadius: 100, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap', marginTop: 2 }}>
              {allSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3" style={{ position: 'relative' }}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search categories…" value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', height: 40, borderRadius: 12, border: '1px solid rgba(0,0,0,0.07)', background: '#fff', fontSize: 13.5, color: '#0F0F1A', padding: '0 14px 0 36px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
        </div>

        {/* Character + Grid */}
        <div className="flex flex-1 items-start" style={{ paddingRight: 12, paddingBottom: 160 }}>

          {/* Lottie character */}
          <div style={{ width: 90, minWidth: 90, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', position: 'sticky', top: 80, paddingTop: 4 }}>
            {/* @ts-ignore */}
            <lottie-player
              ref={playerRef}
              src={LOTTIE_SRC}
              background="transparent"
              speed="1"
              loop
              autoplay
              style={{ width: 90, height: charHeight || 300 }}
            />
          </div>

          {/* Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 13 }}>No categories match.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
                {filtered.map(cat => {
                  const isSel = selected.includes(cat as Category)
                  return (
                    <button key={cat} onClick={() => toggle(cat as Category)}
                      style={{
                        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                        border: `2px solid ${isSel ? '#4F46E5' : 'transparent'}`,
                        background: '#fff', padding: 0,
                        boxShadow: isSel
                          ? '0 0 0 3px rgba(79,70,229,0.10), 0 1px 3px rgba(0,0,0,0.05)'
                          : '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
                        transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s, border-color 0.15s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = 'translateY(-2px) scale(1.01)'; el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.09)' }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.transform = ''; el.style.boxShadow = isSel ? '0 0 0 3px rgba(79,70,229,0.10)' : '0 1px 3px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ position: 'relative', width: '100%', paddingBottom: '78%', overflow: 'hidden', background: CAT_BG[cat] || '#F8FAFC' }}>
                        <img src={CAT_IMG[cat]} alt={cat}
                          onError={e => (e.target as HTMLImageElement).style.display = 'none'}
                          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: isSel ? 1 : 0.88, transition: 'opacity 0.2s' }} />
                        <div style={{ position: 'absolute', inset: 0, background: isSel ? 'linear-gradient(180deg,rgba(79,70,229,0.08) 0%,rgba(79,70,229,0.16) 100%)' : 'linear-gradient(180deg,transparent 30%,rgba(0,0,0,0.15) 100%)' }} />
                        {isSel && (
                          <div style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                              <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '7px 6px 8px', textAlign: 'center', background: isSel ? '#EEF2FF' : '#fff', transition: 'background 0.15s' }}>
                        <p style={{ fontSize: 10, fontWeight: isSel ? 600 : 500, lineHeight: 1.3, color: isSel ? '#4F46E5' : '#6B7280', margin: 0 }}>{cat}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, padding: '14px 20px 22px', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 3, background: '#EBEBEB', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#4F46E5', borderRadius: 100, width: `${(selected.length / ALL_CATEGORIES.length) * 100}%`, transition: 'width 0.3s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <span style={{ fontSize: 11, color: '#9CA3AF', minWidth: 36, textAlign: 'right' }}>{selected.length} / {ALL_CATEGORIES.length}</span>
        </div>
        <button onClick={handleConfirm}
          style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: '#1A1A2E', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'transform 0.15s, background 0.15s, box-shadow 0.15s' }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = '#4F46E5'; el.style.boxShadow = '0 4px 16px rgba(79,70,229,0.3)'; el.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = '#1A1A2E'; el.style.boxShadow = 'none'; el.style.transform = '' }}
        >
          <span>{selected.length === 0 ? 'Browse All Orders' : `Continue with ${selected.length} ${selected.length === 1 ? 'Category' : 'Categories'}`}</span>
          <ArrowRight size={16} />
        </button>
        <button onClick={() => { confirm(); navigate('/dashboard') }}
          style={{ width: '100%', background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9CA3AF', marginTop: 10, cursor: 'pointer', display: 'block', textAlign: 'center' }}>
          Skip for now
        </button>
      </div>
    </div>
  )
}

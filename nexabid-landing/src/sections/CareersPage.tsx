import { useEffect, useState } from 'react'

type Page = 'home' | 'about' | 'careers'
interface Props { navigate: (p: Page) => void }

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
}

const JOBS = [
  { dept: 'Engineering', title: 'Senior Full-Stack Engineer', location: 'Mumbai / Remote', hot: true },
  { dept: 'Engineering', title: 'Backend Engineer — Payments', location: 'Mumbai', hot: true },
  { dept: 'Engineering', title: 'ML Engineer — Bid Intelligence', location: 'Remote', hot: false },
  { dept: 'Product', title: 'Senior Product Manager', location: 'Mumbai', hot: false },
  { dept: 'Product', title: 'Product Designer (UX/UI)', location: 'Mumbai / Remote', hot: true },
  { dept: 'Operations', title: 'Manufacturer Onboarding Lead', location: 'Surat / Pune', hot: false },
  { dept: 'Operations', title: 'Dispute Resolution Specialist', location: 'Mumbai', hot: false },
  { dept: 'Growth', title: 'Enterprise Sales Manager', location: 'Delhi / Mumbai', hot: false },
  { dept: 'Growth', title: 'Growth Marketing Lead', location: 'Remote', hot: false },
  { dept: 'Finance', title: 'Head of Finance & Compliance', location: 'Mumbai', hot: false },
]

const PERKS = [
  { img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=95&auto=format&fit=crop', title: 'Competitive Compensation', desc: 'Top 20% market pay + meaningful ESOPs from day one.' },
  { img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=95&auto=format&fit=crop', title: 'Full Health Coverage', desc: 'Family medical insurance from day one. No fine print.' },
  { img: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=95&auto=format&fit=crop', title: 'Unlimited Leave', desc: 'We trust you to manage your time. No approval theater.' },
  { img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=95&auto=format&fit=crop', title: '₹1L Learning Budget', desc: 'Courses, conferences, certifications — your call.' },
  { img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=95&auto=format&fit=crop', title: 'Flexible Work', desc: 'Hybrid by default. Full remote for most engineering roles.' },
  { img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&q=95&auto=format&fit=crop', title: 'Real Ownership', desc: 'Features you ship go live to 10,000+ users within days.' },
]

const DEPTS = ['All', 'Engineering', 'Product', 'Operations', 'Growth', 'Finance']

const OFFICE_PHOTOS = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=90',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=90',
  'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&q=90',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=90',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=90',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=90',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=90',
]

export default function CareersPage({ navigate }: Props) {
  useReveal()
  const [activeDept, setActiveDept] = useState('All')
  const filtered = activeDept === 'All' ? JOBS : JOBS.filter(j => j.dept === activeDept)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 relative">
        <div className="absolute inset-0 backdrop-blur-[20px] bg-white/80 pointer-events-none" />
        <div className="relative meta-container">
          <div className="flex items-center h-14 md:h-16">
            <button onClick={() => navigate('home')} className="flex items-center gap-2 mr-10">
              <div className="w-8 h-8 bg-[#0064e0] rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-extrabold">NB</span>
              </div>
              <span className="font-bold text-base text-[#1c1e21]">NexaBid</span>
            </button>
            <div className="hidden md:flex items-center gap-6 flex-grow">
              <button onClick={() => navigate('home')} className="meta-label text-[#65676b] hover:text-[#1c1e21]">Home</button>
              <button onClick={() => navigate('about')} className="meta-label text-[#65676b] hover:text-[#1c1e21]">About</button>
            </div>
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <a href="http://localhost:5173" target="_blank" className="btn-meta-secondary text-sm">Sign In</a>
              <a href="http://localhost:5173/auth/register" target="_blank" className="btn-meta-primary text-sm">Post an Order</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero with photo background */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=90"
            alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1c1e21]/75" />
        </div>
        <div className="relative z-10 meta-container">
          <div style={{ maxWidth: '720px' }}>
            <span className="meta-label text-white/60 block mb-4">CAREERS AT NEXABID</span>
            <h1 className="text-[32px] md:text-[56px] font-medium text-white leading-tight mb-5">
              Build the future of India's ₹80 lakh crore economy.
            </h1>
            <p className="meta-body-lg text-white/70 mb-8">
              We're an 80-person team solving one of the hardest problems in Indian commerce. We move fast, ship real things, and we're just getting started.
            </p>
            <div className="flex flex-wrap gap-6">
              {[['80+', 'Team Size'], ['4.8★', 'Glassdoor'], ['₹45Cr', 'Series A'], ['3 yrs', 'Avg. tenure']].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perks — Meta card grid */}
      <section className="py-16 md:py-20 bg-white">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex justify-center pb-8 px-3 md:px-0">
              <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
                <span className="meta-label block mb-2 text-[#65676b]">WHY NEXABID</span>
                <h2 className="meta-heading-xl text-[#1c1e21] mb-4">We take care of the people who build this.</h2>
              </div>
            </div>
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4">
              {PERKS.map((perk: { img: string; title: string; desc: string }) => (
                <div key={perk.title} className="reveal shrink-0 w-full md:w-1/3 mt-4 px-2 md:px-4">
                  <div className="bg-[#f0f2f5] rounded-2xl overflow-hidden h-full group hover:shadow-md transition-all duration-300">
                    <div className="relative h-36 overflow-hidden">
                      <img src={perk.img} alt={perk.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 brightness-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#f0f2f5]/80 to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="text-[15px] font-bold text-[#1c1e21] mb-1.5">{perk.title}</p>
                      <p className="text-[13px] text-[#65676b] leading-relaxed">{perk.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Office photo strip */}
      <div className="overflow-x-auto flex gap-3 py-3 px-4" style={{ scrollbarWidth: 'none' }}>
        {OFFICE_PHOTOS.map((src, i) => (
          <img key={i} src={src} alt="" className="flex-shrink-0 h-44 w-64 object-cover rounded-2xl" />
        ))}
      </div>

      {/* Open roles */}
      <section className="py-16 md:py-20 bg-[#f0f2f5]">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex flex-col mb-6">
              <span className="meta-label mb-2 text-[#65676b]">OPEN ROLES</span>
              <h2 className="meta-heading-lg text-[#1c1e21] mb-6">{JOBS.length} open positions</h2>

              {/* Dept filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                {DEPTS.map(dept => (
                  <button key={dept} onClick={() => setActiveDept(dept)}
                    className={`px-4 py-2 rounded-[100px] text-sm font-semibold transition-all border ${
                      activeDept === dept
                        ? 'bg-[#1c1e21] text-white border-[#1c1e21]'
                        : 'bg-white text-[#65676b] border-[#ccd0d5] hover:border-[#1c1e21] hover:text-[#1c1e21]'
                    }`}>
                    {dept}
                  </button>
                ))}
              </div>

              {/* Job rows */}
              <div className="space-y-2">
                {filtered.map((job, i) => (
                  <div key={i}
                    className="bg-white rounded-2xl px-6 py-5 flex items-center justify-between group cursor-pointer hover:shadow-md transition-shadow border border-[#e4e6eb]">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-medium text-[#1c1e21] group-hover:text-[#0064e0] transition-colors">{job.title}</p>
                        {job.hot && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0064e0]/10 text-[#0064e0] rounded-full uppercase tracking-wide">Hiring now</span>
                        )}
                      </div>
                      <p className="text-sm text-[#65676b]">{job.dept} · {job.location} · Full-time</p>
                    </div>
                    <a href="mailto:careers@nexabid.com"
                      className="opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 btn-meta-primary text-xs">
                      Apply →
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#65676b] mb-3">Don't see a role that fits?</p>
                <a href="mailto:careers@nexabid.com"
                  className="btn-meta-secondary text-sm">
                  Send us your resume
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="py-16 md:py-20 bg-white">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4 items-center">
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <span className="meta-label block mb-2 text-[#65676b]">OUR CULTURE</span>
                <h3 className="meta-heading-lg text-[#1c1e21] mb-5">We ship. We learn. We win together.</h3>
                <div className="space-y-3 meta-body-lg text-[#65676b]">
                  <p>No politics. No hierarchy theater. You'll present your work to the founders every sprint — and they'll push back if it's not good enough.</p>
                  <p>We don't have a ping-pong table. We have a platform that real businesses depend on. That's a different kind of motivation.</p>
                  <p>Friday demos are sacred. If you shipped it, you show it.</p>
                </div>
              </div>
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&q=90',
                    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&q=90',
                    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500&q=90',
                    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=90',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-full h-36 object-cover rounded-2xl" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e4e6eb] py-6">
        <div className="meta-container flex justify-between items-center">
          <button onClick={() => navigate('home')} className="text-sm text-[#65676b] hover:text-[#0064e0]">← Back to Home</button>
          <p className="text-xs text-[#8a8d91]">© 2025 NexaBid Technologies Pvt. Ltd.</p>
          <a href="mailto:careers@nexabid.com" className="text-sm text-[#65676b] hover:text-[#0064e0]">careers@nexabid.com</a>
        </div>
      </footer>
    </div>
  )
}

import { useEffect } from 'react'

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

const TEAM = [
  { name: 'Arjun Kapoor', role: 'Co-founder & CEO', img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=90', bio: 'Ex-McKinsey. Built procurement systems for Fortune 500s in India for 8 years.' },
  { name: 'Meera Nair', role: 'Co-founder & CTO', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=90', bio: 'MIT grad. Previously VP Engineering at Razorpay.' },
  { name: 'Vikram Singh', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=90', bio: 'Shipped products at Flipkart and OYO. Obsessed with B2B UX.' },
  { name: 'Divya Reddy', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=90', bio: 'Led manufacturer onboarding at IndiaMart. 500+ manufacturer relationships.' },
]

const VALUES = [
  { img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=95&auto=format&fit=crop', title: 'Velocity', desc: 'Procurement delays cost real money. Every hour saved is margin earned.' },
  { img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=95&auto=format&fit=crop', title: 'Trust', desc: 'Every payment is in escrow. Every manufacturer is verified. Trust is our product.' },
  { img: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=95&auto=format&fit=crop', title: 'Intelligence', desc: 'AI is built into every layer — bid scoring, fraud detection, price suggestions.' },
  { img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=95&auto=format&fit=crop', title: 'Fairness', desc: 'Flat 2.5% fee. No hidden charges, no preferential treatment.' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=95&auto=format&fit=crop', title: 'Scale', desc: 'Works for a 2-person workshop in Surat and a 2,000-worker factory in Pune.' },
  { img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=95&auto=format&fit=crop', title: 'Transparency', desc: 'Every bid, payment, and status update — visible to all parties in real time.' },
]

const MILESTONES = [
  { year: '2022', event: 'Founded in Mumbai. First 10 manufacturers onboarded.' },
  { year: '2023 Q1', event: 'Launched escrow payments. ₹10Cr GMV in first quarter.' },
  { year: '2023 Q3', event: 'AI bid suggestion launched. 40% improvement in bid acceptance.' },
  { year: '2024 Q1', event: 'Crossed ₹100Cr GMV. 15 manufacturing categories.' },
  { year: '2024 Q3', event: 'Series A — ₹45Cr raised. Team expanded to 80+.' },
  { year: '2025', event: '1,200+ manufacturers. ₹240Cr+ GMV. Profitable.' },
]

function Navbar({ navigate }: Props) {
  return (
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
            <button onClick={() => navigate('careers')} className="meta-label text-[#65676b] hover:text-[#1c1e21]">Careers</button>
          </div>
          <div className="hidden md:flex items-center gap-3 ml-auto">
            <a href="http://localhost:5173" target="_blank" className="btn-meta-secondary text-sm">Sign In</a>
            <a href="http://localhost:5173/auth/register" target="_blank" className="btn-meta-primary text-sm">Post an Order</a>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function AboutPage({ navigate }: Props) {
  useReveal()
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar navigate={navigate} />

      {/* Hero */}
      <section className="py-16 md:py-20 bg-white">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4 items-center">
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <span className="meta-label block mb-3 text-[#65676b]">ABOUT NEXABID</span>
                <h1 className="text-[32px] md:text-5xl font-medium text-[#1c1e21] leading-tight mb-5">
                  We're fixing India's broken procurement.
                </h1>
                <p className="meta-body-lg text-[#65676b]">
                  ₹80 lakh crore of manufacturing happens in India every year. Most of it is still managed over WhatsApp, phone calls, and prayer. We're changing that.
                </p>
              </div>
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <div className="overflow-hidden rounded-3xl">
                  <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: '4/3' }}>
                    <img src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1000&q=90"
                      alt="Manufacturing floor" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-20 bg-[#f0f2f5]">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4 items-center">
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <div className="overflow-hidden rounded-3xl">
                  <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: '1/1' }}>
                    <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=90"
                      alt="NexaBid founding team" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-full mt-4 px-2 md:w-6/12 md:px-4">
                <div className="flex h-full justify-start md:justify-center">
                  <div className="self-start md:self-center w-full md:w-4/5">
                    <span className="meta-label block mb-3 text-[#65676b]">OUR STORY</span>
                    <h3 className="meta-heading-lg text-[#1c1e21] mb-5">Born from a ₹40 lakh mistake.</h3>
                    <div className="space-y-3 meta-body-lg text-[#65676b]">
                      <p>In 2021, our co-founder Arjun was running procurement for a D2C brand. He placed a ₹40 lakh order with a manufacturer he found on IndiaMART. The goods arrived 6 weeks late, wrong specs — and the money was gone.</p>
                      <p>He spent 6 months talking to 200+ buyers and 300+ manufacturers across India. Every single one had the same story. That's when NexaBid was born.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-white">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex justify-center pb-8 px-3 md:px-0">
              <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
                <span className="meta-label block mb-2 text-[#65676b]">WHAT WE BELIEVE</span>
                <h2 className="meta-heading-xl text-[#1c1e21]">Our values</h2>
              </div>
            </div>
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4">
              {VALUES.map((v) => (
                <div key={v.title} className="reveal shrink-0 w-1/2 md:w-1/3 mt-4 px-2 md:px-4">
                  <div className="bg-[#f0f2f5] rounded-2xl p-5 h-full">
                    <span className="text-2xl block mb-3">{v.icon}</span>
                    <p className="text-base font-semibold text-[#1c1e21] mb-1">{v.title}</p>
                    <p className="text-sm text-[#65676b] leading-5">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-20 bg-[#f0f2f5]">
        <div className="meta-container">
          <div className="flex justify-center pb-8 px-3 md:px-0">
            <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
              <span className="meta-label block mb-2 text-[#65676b]">OUR JOURNEY</span>
              <h2 className="meta-heading-lg text-[#1c1e21] mb-10">How we got here</h2>
              <div className="relative">
                <div className="absolute left-[72px] top-0 bottom-0 w-px bg-[#ccd0d5]" />
                {MILESTONES.map((m, i) => (
                  <div key={i} className="reveal flex gap-6 mb-8 last:mb-0">
                    <div className="w-[72px] shrink-0 text-right pt-0.5">
                      <span className="text-xs font-bold text-[#0064e0]">{m.year}</span>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-[#0064e0]" />
                      <p className="text-sm text-[#65676b] leading-5">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-20 bg-white">
        <div className="meta-container">
          <div className="meta-inner">
            <div className="flex justify-center pb-8 px-3 md:px-0">
              <div style={{ maxWidth: '1000px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
                <span className="meta-label block mb-2 text-[#65676b]">THE TEAM</span>
                <h2 className="meta-heading-xl text-[#1c1e21]">People who've done this before.</h2>
              </div>
            </div>
            <div className="flex flex-wrap -mt-4 -mx-2 md:-mx-4">
              {TEAM.map((member) => (
                <div key={member.name} className="reveal shrink-0 w-1/2 md:w-1/4 mt-4 px-2 md:px-4">
                  <div className="meta-card bg-white border border-[#e4e6eb]">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '1/1' }}>
                      <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-bold text-[#1c1e21]">{member.name}</p>
                      <p className="text-xs text-[#0064e0] font-medium mb-2">{member.role}</p>
                      <p className="text-xs text-[#65676b] leading-4">{member.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Investors */}
      <section className="py-12 bg-[#f0f2f5] border-t border-[#e4e6eb]">
        <div className="meta-container">
          <div className="text-center">
            <span className="meta-label text-[#65676b] block mb-6">BACKED BY</span>
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
              {['Sequoia India', 'Lightspeed', 'Blume Ventures', 'BEENEXT', 'Elevation Capital'].map(inv => (
                <span key={inv} className="text-base font-bold text-[#bcc0c4] hover:text-[#65676b] transition-colors cursor-default">{inv}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e4e6eb] py-6">
        <div className="meta-container flex justify-between items-center">
          <button onClick={() => navigate('home')} className="text-sm text-[#65676b] hover:text-[#0064e0]">← Back to Home</button>
          <p className="text-xs text-[#8a8d91]">© 2025 NexaBid Technologies Pvt. Ltd.</p>
          <button onClick={() => navigate('careers')} className="text-sm text-[#65676b] hover:text-[#0064e0]">Careers →</button>
        </div>
      </footer>
    </div>
  )
}

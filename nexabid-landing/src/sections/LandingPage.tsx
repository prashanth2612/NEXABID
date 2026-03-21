'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

type Page = 'home' | 'about' | 'careers'
interface Props { navigate: (p: Page) => void }

const CATEGORIES = [
  { name:'Textiles & Garments',    img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=95&auto=format&fit=crop',    count:'340+' },
  { name:'Electronics & PCB',      img:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=95&auto=format&fit=crop',    count:'210+' },
  { name:'Automotive Parts',       img:'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=700&q=95&auto=format&fit=crop',    count:'180+' },
  { name:'Hardware & Metals',      img:'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=700&q=95&auto=format&fit=crop',    count:'290+' },
  { name:'Furniture & Wood',       img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=95&auto=format&fit=crop',    count:'150+' },
  { name:'Chemicals & Pharma',     img:'https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=700&q=95&auto=format&fit=crop',    count:'120+' },
  { name:'Plastics & Polymers',    img:'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=700&q=95&auto=format&fit=crop',    count:'95+'  },
  { name:'Paper & Packaging',      img:'https://images.unsplash.com/photo-1607469256872-49e26e5a6a5a?w=700&q=95&auto=format&fit=crop',    count:'110+' },
  { name:'Machining & CNC',        img:'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=700&q=95&auto=format&fit=crop',    count:'230+' },
  { name:'Food Processing',        img:'https://images.unsplash.com/photo-1621955964441-c173e01c135b?w=700&q=95&auto=format&fit=crop',    count:'140+' },
  { name:'Construction Materials', img:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=95&auto=format&fit=crop',    count:'160+' },
  { name:'Rubber & Seals',         img:'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=700&q=95&auto=format&fit=crop',    count:'75+'  },
  { name:'Aerospace Components',   img:'https://images.unsplash.com/photo-1517976547714-720226b864c1?w=700&q=95&auto=format&fit=crop',    count:'55+'  },
  { name:'Medical Devices',        img:'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=700&q=95&auto=format&fit=crop',    count:'88+'  },
  { name:'Printing & Labels',      img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=95&auto=format&fit=crop',    count:'92+'  },
  { name:'Agro Processing',        img:'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=700&q=95&auto=format&fit=crop',    count:'130+' },
]

const HOW = [
  { step:'01', title:'Post your order',       desc:'Describe your requirement, set quantity, delivery timeline and budget. Attach spec sheets, reference images or documents.', img:'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1000&q=95&auto=format&fit=crop' },
  { step:'02', title:'Manufacturers compete', desc:'Verified manufacturers submit bids. Our AI scores each on price, delivery time and win probability in real time.',          img:'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&q=95&auto=format&fit=crop' },
  { step:'03', title:'Pay into escrow',       desc:'Accept the best bid. Pay securely via Razorpay — funds are locked until you confirm delivery. Zero payment risk.',         img:'https://cdn-dgioi.nitrocdn.com/knjhITnAQZlAdAXdTgiPIMYmMsPoclew/assets/images/optimized/rev-f351688/royallp.com/wp-content/uploads/2025/04/How-Escrow-account-Works.jpg?w=1000&q=95&auto=format&fit=crop' },
  { step:'04', title:'Confirm & release',     desc:'Manufacturer ships with live tracking. You confirm delivery via OTP — funds are released instantly.',                      img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1000&q=95&auto=format&fit=crop' },
]

const ACTIVE_ORDERS = [
  { id:'NB-4829', status:'In Transit',      product:'Cotton Fabric',      quantity:'500 kg',      manufacturer:'Patel Textiles, Surat', date:'Jan 09 2025', daysLeft:'2d left', price:'₹84,500',   payment:'paid',    color:'#EBF4FF', icon:'🏭', progress:65 },
  { id:'NB-4828', status:'Order Confirmed', product:'Steel Pipes',        quantity:'200 units',   manufacturer:'Mumbai Steel Works',    date:'Jan 08 2025', daysLeft:'5d left', price:'₹1,24,000', payment:'pending', color:'#ECFDF5', icon:'⚙️', progress:25 },
  { id:'NB-4827', status:'Bid Received',    product:'Plastic Components', quantity:'1000 pieces', manufacturer:'Delhi Plastics Ltd',    date:'Jan 07 2025', daysLeft:'3d left', price:'₹45,200',   payment:'escrow',  color:'#FEF3C7', icon:'🔧', progress:40 },
]

const TESTIMONIALS = [
  { quote:'We cut procurement time from 3 weeks to 4 days. The escrow system gives our finance team complete peace of mind.', name:'Prashanth Mehta',   role:'Procurement Head, Reliance Retail',   avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=90&auto=format&fit=crop' },
  { quote:'As a manufacturer in Surat, we used to rely on middlemen. NexaBid gave us direct access to corporate buyers across India.', name:'Ramesh Patel',  role:'Owner, Patel Textiles Pvt. Ltd.',     avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=90&auto=format&fit=crop' },
  { quote:'The AI bid suggestion alone saved us ₹18 lakhs in the first quarter. This is how B2B procurement should work.',  name:'Anita Sharma', role:'COO, TechBuild Manufacturing',         avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=90&auto=format&fit=crop' },
]

const NEWS = [
  { img:'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=95&auto=format&fit=crop', tag:'Funding', title:'NexaBid raises ₹45Cr Series A to expand AI-powered manufacturing marketplace' },
  { img:'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=900&q=95&auto=format&fit=crop', tag:'Product', title:"How NexaBid's escrow system eliminated payment fraud for 500+ Indian manufacturers" },
  { img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=95&auto=format&fit=crop', tag:'Vision',  title:"Building India's largest B2B manufacturing network — NexaBid's 2025 roadmap" },
]

const TRUST_LOGOS = ['Reliance','Tata Steel','Infosys','Mahindra','L&T','Godrej','Wipro','HUL']

const HERO_SLIDES = [
  { img:'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=1800&q=95&auto=format&fit=crop', badge:'Series A Funded',      headline:["India's #1 B2B",'Manufacturing','Marketplace'],  sub:'Connect with 1,200+ verified manufacturers. Get competitive bids in 48 hours.',   tag:'AI-Powered Bidding Platform' },
  { img:'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1800&q=95&auto=format&fit=crop', badge:'Zero Payment Risk',     headline:['Smart Escrow.','Secure Payments.','Zero Fraud.'], sub:'Funds locked in escrow until you confirm delivery — backed by Razorpay.',          tag:'Escrow Protected' },
  { img:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1800&q=95&auto=format&fit=crop', badge:'₹240 Cr+ Processed',   headline:['From Factory','Floor to Your','Doorstep.'],        sub:'Real-time order tracking, OTP delivery verification, and GST-ready invoicing.',    tag:'Pan-India Coverage' },
  { img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1800&q=95&auto=format&fit=crop', badge:'1,200+ Manufacturers', headline:['Every Category.','Every Scale.','One Platform.'],  sub:'16 manufacturing categories. Post bulk or custom orders in under 2 minutes.',     tag:'All Industries Covered' },
  { img:'https://images.unsplash.com/photo-1563906267088-b029e7101114?w=1800&q=95&auto=format&fit=crop', badge:'AI Bid Scoring',        headline:['AI That Works','Harder Than','Your Vendor.'],      sub:'Our ML engine scores every bid on price, reliability, and delivery time — live.',  tag:'98.4% Accuracy' },
]

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
html{scroll-behavior:smooth}
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#f0f2f5}
::-webkit-scrollbar-thumb{background:#c0c7d4;border-radius:99px}
.mc{max-width:1440px;margin:0 auto;padding:0 clamp(20px,5vw,96px)}

.rv  {opacity:0;transform:translateY(44px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}
.rvl {opacity:0;transform:translateX(-52px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}
.rvr {opacity:0;transform:translateX(52px);transition:opacity .85s cubic-bezier(.22,1,.36,1),transform .85s cubic-bezier(.22,1,.36,1)}
.rvs {opacity:0;transform:scale(.86);transition:opacity .75s cubic-bezier(.22,1,.36,1),transform .75s cubic-bezier(.22,1,.36,1)}
.rv.on,.rvl.on,.rvr.on,.rvs.on{opacity:1;transform:none}
.d1{transition-delay:.06s}.d2{transition-delay:.12s}.d3{transition-delay:.18s}
.d4{transition-delay:.24s}.d5{transition-delay:.30s}.d6{transition-delay:.36s}
.d7{transition-delay:.42s}.d8{transition-delay:.48s}.d9{transition-delay:.54s}

@keyframes heroTxtIn{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes heroBadgeIn{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
@keyframes heroBtnIn{from{opacity:0;transform:translateY(18px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes sIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}
@keyframes kb{from{transform:scale(1) translateX(0)}to{transform:scale(1.08) translateX(-14px)}}
@keyframes glare{0%{left:-70%;opacity:0}15%{opacity:.4}80%{opacity:.18}100%{left:130%;opacity:0}}
@keyframes cUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes lRing{0%,100%{box-shadow:0 0 0 0 rgba(0,100,224,.4)}60%{box-shadow:0 0 0 9px rgba(0,100,224,0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spinr{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes piston{0%,100%{transform:translateY(0)}50%{transform:translateY(18px)}}
@keyframes orbit{from{transform:rotate(0deg) translateX(68px) rotate(0deg)}to{transform:rotate(360deg) translateX(68px) rotate(-360deg)}}
@keyframes orbit2{from{transform:rotate(0deg) translateX(48px) rotate(0deg)}to{transform:rotate(-360deg) translateX(48px) rotate(360deg)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes trust{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}

.sc{position:relative;overflow:hidden;transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s cubic-bezier(.22,1,.36,1)}
.sc::after{content:'';position:absolute;top:0;left:-70%;width:42%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-18deg);opacity:0;pointer-events:none}
.sc:hover::after{animation:glare .9s ease forwards}
.sc:hover{transform:translateY(-9px) scale(1.013);box-shadow:0 28px 64px rgba(0,0,0,.14)!important}
.sc:hover .ci{transform:scale(1.07)}
.ci{transition:transform .65s cubic-bezier(.22,1,.36,1)}
.fc{transition:transform .45s cubic-bezier(.22,1,.36,1),box-shadow .45s ease,border-color .3s}
.fc:hover{transform:translateY(-10px);box-shadow:0 32px 72px rgba(0,100,224,.1)!important;border-color:rgba(0,100,224,.2)!important}
.fc:hover .fc-line{width:80%!important}
.fc:hover .ci{transform:scale(1.06)}
.pc{transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease}
.pc:hover{transform:translateY(-8px);box-shadow:0 32px 80px rgba(0,0,0,.4)!important}
.pc:hover .pi{transform:scale(1.06);opacity:.95}
.pi{transition:transform .6s cubic-bezier(.22,1,.36,1),opacity .4s}
.nc{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease;cursor:pointer}
.nc:hover{transform:translateY(-7px);box-shadow:0 22px 52px rgba(0,0,0,.13)!important}
.nc:hover .ni{transform:scale(1.06)}
.ni{transition:transform .55s cubic-bezier(.22,1,.36,1)}
.tc{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,background .3s,border-color .3s}
.tc:hover{transform:translateY(-5px)}

.pill{display:inline-flex;align-items:center;gap:7px;background:rgba(0,100,224,.08);border:1px solid rgba(0,100,224,.18);color:#0064e0;font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;padding:5px 14px;border-radius:100px;margin-bottom:18px}
.pill-d{width:6px;height:6px;border-radius:50%;background:#0064e0;animation:lRing 2.4s infinite}
.pill-dark{background:rgba(0,100,224,.15);border-color:rgba(0,100,224,.35);color:rgba(255,255,255,.75)}
.pill-dark .pill-d{background:rgba(255,255,255,.7)}
.gt{background:linear-gradient(135deg,#0064e0 0%,#1877f2 45%,#0099ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.bp{position:relative;overflow:hidden}
.bp::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.13);transform:scaleX(0);transform-origin:left;transition:transform .35s ease}
.bp:hover::before{transform:scaleX(1)}
.live-d{width:7px;height:7px;border-radius:50%;background:#22c55e;animation:lRing 2.5s infinite}
.sec-line{height:1px;background:linear-gradient(90deg,transparent,#e4e8f0,transparent);margin:0}

.phone-mockup{position:relative;width:clamp(300px,85vw,400px);aspect-ratio:9/19.5;background:#fff;border-radius:48px;box-shadow:0 20px 60px rgba(0,0,0,.15),0 0 0 12px #000,0 0 0 14px #2d2d2d;overflow:hidden;border:8px solid #000}
.phone-mockup::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:100px;height:28px;background:#000;border-radius:0 0 20px 20px;z-index:100}
.phone-screen{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;background:#fff;padding-top:50px;padding-bottom:80px;scroll-behavior:smooth}
.phone-screen::-webkit-scrollbar{width:3px}
.phone-screen::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}
.phone-header{padding:16px 20px 20px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.phone-greeting{font-size:18px;font-weight:800;color:#0d1117}
.phone-avatar{width:40px;height:40px;border-radius:50%;background:#0064e0;color:white;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;flex-shrink:0}
.phone-search{margin:0 16px 20px;padding:12px 16px;background:#f5f5f5;border-radius:24px;border:none;font-size:14px;font-family:inherit;color:#aaa;width:calc(100% - 32px)}
.phone-section-title{padding:0 20px 12px;font-size:12px;font-weight:700;color:#858585;letter-spacing:.1em;text-transform:uppercase}
.phone-order-card{margin:0 16px 12px;padding:16px;background:var(--order-bg,#f0f4ff);border-radius:16px;border:1px solid rgba(0,100,224,.15);animation:slideUp .5s cubic-bezier(.22,1,.36,1) backwards}
.phone-order-card:nth-child(1){animation-delay:.1s}.phone-order-card:nth-child(2){animation-delay:.2s}.phone-order-card:nth-child(3){animation-delay:.3s}
.phone-order-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px}
.phone-order-icon{font-size:28px;flex-shrink:0}
.phone-order-info{flex:1}
.phone-order-title{font-size:15px;font-weight:700;color:#0d1117;margin-bottom:2px}
.phone-order-subtitle{font-size:12px;color:#858585;margin-bottom:6px}
.phone-order-status{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#0064e0;background:rgba(0,100,224,.1);padding:4px 8px;border-radius:6px}
.phone-progress-bar{height:3px;background:rgba(0,100,224,.2);border-radius:99px;overflow:hidden;margin-top:10px}
.phone-progress-fill{height:100%;background:#0064e0;transition:width .6s ease}
.phone-order-meta{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(0,0,0,.06);font-size:12px}
.phone-meta-item{display:flex;flex-direction:column;gap:2px}
.phone-meta-label{color:#858585;font-weight:500}
.phone-meta-value{color:#0d1117;font-weight:700}
.phone-tab-bar{position:absolute;bottom:0;left:0;right:0;height:70px;background:#fff;border-top:1px solid #eee;display:flex;align-items:center;justify-content:space-around;padding-top:8px}
.phone-tab{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:#ccc;font-weight:600}
.phone-tab.active{color:#0064e0}
.phone-tab-icon{font-size:20px}

.mobile-app-section{padding:clamp(80px,10vw,140px) 0;background:linear-gradient(135deg,#f0f4ff 0%,#fff 100%);position:relative;overflow:hidden}
.mobile-app-section::before{content:'';position:absolute;top:-200px;right:-200px;width:600px;height:600px;background:radial-gradient(circle,rgba(0,100,224,.08) 0%,transparent 70%);border-radius:50%;pointer-events:none}
.mobile-app-container{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,8vw,80px);align-items:center;position:relative;z-index:2}
.mobile-app-content h2{font-size:clamp(28px,3.5vw,46px);font-weight:800;color:#0d1117;line-height:1.1;margin-bottom:18px;letter-spacing:-.03em}
.mobile-app-content p{font-size:16px;color:#6b7280;line-height:1.8;margin-bottom:24px;max-width:500px}
.mobile-app-features{display:flex;flex-direction:column;gap:16px;margin-bottom:32px}
.mobile-feature{display:flex;align-items:center;gap:12px;font-size:15px;color:#0d1117;font-weight:600}
.mobile-feature::before{content:'✓';display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:#22c55e;color:white;border-radius:50%;font-weight:700;font-size:12px;flex-shrink:0}
.mobile-app-mockup{display:flex;justify-content:center;align-items:center;animation:slideInRight .8s cubic-bezier(.22,1,.36,1)}

@media(max-width:1024px){.mobile-app-container{grid-template-columns:1fr;gap:40px}.mobile-app-mockup{order:-1}}
@media(max-width:768px){.mobile-app-section{padding:60px 0}.mobile-app-content h2{font-size:clamp(24px,4vw,32px)}.phone-mockup{width:clamp(260px,78vw,340px)}}
`

function IndustrialWidget() {
  return (
    <div style={{ position:'relative', width:420, height:420, flexShrink:0 }}>
      <svg viewBox="0 0 420 420" width="420" height="420" style={{ overflow:'visible' }}>
        <defs>
          <radialGradient id="gBig" cx="50%" cy="40%" r="52%">
            <stop offset="0%" stopColor="#1e3a6e"/><stop offset="100%" stopColor="#0a1628"/>
          </radialGradient>
          <radialGradient id="gSmall" cx="42%" cy="38%" r="52%">
            <stop offset="0%" stopColor="#1a3260"/><stop offset="100%" stopColor="#0a1226"/>
          </radialGradient>
          <radialGradient id="gMini" cx="45%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#172d56"/><stop offset="100%" stopColor="#091120"/>
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="glowStrong"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="shadow"><feDropShadow dx="4" dy="8" stdDeviation="10" floodColor="rgba(0,0,0,0.5)"/></filter>
        </defs>
        <g opacity="0.07">
          {Array.from({length:8},(_,i)=><line key={`h${i}`} x1="0" y1={i*60} x2="420" y2={i*60} stroke="#0064e0" strokeWidth="0.8"/>)}
          {Array.from({length:8},(_,i)=><line key={`v${i}`} x1={i*60} y1="0" x2={i*60} y2="420" stroke="#0064e0" strokeWidth="0.8"/>)}
        </g>
        <g filter="url(#shadow)">
          <g style={{animation:'spin 18s linear infinite',transformOrigin:'248px 230px'}}>
            <circle cx="248" cy="230" r="98" fill="url(#gBig)" stroke="#0064e0" strokeWidth="4"/>
            <circle cx="248" cy="230" r="72" fill="none" stroke="rgba(0,100,224,0.25)" strokeWidth="1"/>
            <circle cx="248" cy="230" r="82" fill="none" stroke="rgba(0,100,224,0.15)" strokeWidth="1" strokeDasharray="8 4"/>
            <circle cx="248" cy="230" r="22" fill="#0a1628" stroke="#0064e0" strokeWidth="3"/>
            <circle cx="248" cy="230" r="10" fill="#0064e0" opacity="0.7"/>
            {[0,60,120,180,240,300].map(a=>(<line key={a} x1={248+Math.cos(a*Math.PI/180)*22} y1={230+Math.sin(a*Math.PI/180)*22} x2={248+Math.cos(a*Math.PI/180)*72} y2={230+Math.sin(a*Math.PI/180)*72} stroke="#0064e0" strokeWidth="2.5" opacity="0.4"/>))}
            {Array.from({length:16},(_,i)=>{const angle=(i/16)*360,rad=angle*Math.PI/180,ox=248+Math.cos(rad)*98,oy=230+Math.sin(rad)*98;return <rect key={i} x={ox-9} y={oy-9} width="18" height="18" rx="3" fill="#0064e0" transform={`rotate(${angle+45},${ox},${oy})`} filter="url(#glow)"/>})}
          </g>
        </g>
        <g filter="url(#shadow)">
          <g style={{animation:'spinr 12s linear infinite',transformOrigin:'138px 152px'}}>
            <circle cx="138" cy="152" r="62" fill="url(#gSmall)" stroke="#0064e0" strokeWidth="3"/>
            <circle cx="138" cy="152" r="46" fill="none" stroke="rgba(0,100,224,0.2)" strokeWidth="1"/>
            <circle cx="138" cy="152" r="14" fill="#0a1628" stroke="#0064e0" strokeWidth="2.5"/>
            <circle cx="138" cy="152" r="6" fill="#0064e0" opacity="0.7"/>
            {[0,72,144,216,288].map(a=>(<line key={a} x1={138+Math.cos(a*Math.PI/180)*14} y1={152+Math.sin(a*Math.PI/180)*14} x2={138+Math.cos(a*Math.PI/180)*46} y2={152+Math.sin(a*Math.PI/180)*46} stroke="#0064e0" strokeWidth="2" opacity="0.4"/>))}
            {Array.from({length:11},(_,i)=>{const angle=(i/11)*360,rad=angle*Math.PI/180,ox=138+Math.cos(rad)*62,oy=152+Math.sin(rad)*62;return <rect key={i} x={ox-7} y={oy-7} width="14" height="14" rx="2.5" fill="#0064e0" transform={`rotate(${angle+45},${ox},${oy})`} filter="url(#glow)"/>})}
          </g>
        </g>
        <g filter="url(#shadow)">
          <g style={{animation:'spin 8s linear infinite',transformOrigin:'110px 330px'}}>
            <circle cx="110" cy="330" r="40" fill="url(#gMini)" stroke="#0064e0" strokeWidth="2.5"/>
            <circle cx="110" cy="330" r="9" fill="#0a1628" stroke="#0064e0" strokeWidth="2"/>
            <circle cx="110" cy="330" r="4" fill="#0064e0" opacity="0.7"/>
            {Array.from({length:8},(_,i)=>{const angle=(i/8)*360,rad=angle*Math.PI/180,ox=110+Math.cos(rad)*40,oy=330+Math.sin(rad)*40;return <rect key={i} x={ox-5.5} y={oy-5.5} width="11" height="11" rx="2" fill="#0064e0" transform={`rotate(${angle+45},${ox},${oy})`} filter="url(#glow)"/>})}
          </g>
        </g>
        <line x1="185" y1="181" x2="206" y2="196" stroke="#0064e0" strokeWidth="6" strokeLinecap="round" opacity="0.3"/>
        <g style={{animation:'piston 2.2s ease-in-out infinite'}}>
          <rect x="325" y="140" width="16" height="72" rx="7" fill="#0a1628" stroke="#0064e0" strokeWidth="2.5"/>
          <circle cx="333" cy="143" r="10" fill="#0a1628" stroke="#0064e0" strokeWidth="2.5"/>
          <line x1="333" y1="153" x2="333" y2="211" stroke="#0064e0" strokeWidth="3" opacity="0.5"/>
        </g>
        <rect x="318" y="120" width="30" height="14" rx="4" fill="#0a1628" stroke="#0064e0" strokeWidth="2"/>
        <rect x="320" y="212" width="26" height="10" rx="3" fill="#0064e0" opacity="0.4"/>
        <g style={{transformOrigin:'248px 230px'}}><g style={{animation:'orbit 6s linear infinite',transformOrigin:'248px 230px'}}><circle cx="248" cy="230" r="6" fill="#0099ff" filter="url(#glowStrong)" style={{animation:'blink 1.4s ease-in-out infinite'}}/><text x="256" y="226" fontSize="9" fill="#0099ff" fontWeight="700" opacity="0.9">LIVE</text></g></g>
        <g style={{transformOrigin:'248px 230px'}}><g style={{animation:'orbit2 9s linear infinite',transformOrigin:'248px 230px'}}><circle cx="248" cy="230" r="5" fill="#22c55e" filter="url(#glowStrong)"/></g></g>
        <g filter="url(#shadow)" style={{animation:'sIn .7s .3s both'}}><rect x="4" y="26" width="118" height="54" rx="12" fill="white" opacity="0.96"/><text x="14" y="47" fontSize="10" fill="#65676b" fontWeight="600" letterSpacing="0.5">ACTIVE BIDS</text><text x="14" y="67" fontSize="20" fill="#0064e0" fontWeight="800">2,847</text><circle cx="106" cy="42" r="5" fill="#22c55e" opacity="0.9"/></g>
        <g filter="url(#shadow)" style={{animation:'sIn .7s .55s both'}}><rect x="290" y="8" width="126" height="54" rx="12" fill="white" opacity="0.96"/><text x="300" y="29" fontSize="10" fill="#65676b" fontWeight="600" letterSpacing="0.5">ORDERS TODAY</text><text x="300" y="49" fontSize="20" fill="#0064e0" fontWeight="800">₹1.4Cr</text><text x="300" y="60" fontSize="9" fill="#22c55e" fontWeight="700">↑ 12% vs yesterday</text></g>
        <g filter="url(#shadow)" style={{animation:'sIn .7s .8s both'}}><rect x="8" y="348" width="130" height="54" rx="12" fill="white" opacity="0.96"/><text x="18" y="369" fontSize="10" fill="#65676b" fontWeight="600" letterSpacing="0.5">SUCCESS RATE</text><text x="18" y="389" fontSize="20" fill="#0064e0" fontWeight="800">98.4%</text><rect x="18" y="393" width="100" height="4" rx="2" fill="#e8edf5"/><rect x="18" y="393" width="98" height="4" rx="2" fill="#0064e0"/></g>
        <g filter="url(#shadow)" style={{animation:'sIn .7s 1s both'}}><rect x="284" y="350" width="130" height="54" rx="12" fill="white" opacity="0.96"/><text x="294" y="371" fontSize="10" fill="#65676b" fontWeight="600" letterSpacing="0.5">MANUFACTURERS</text><text x="294" y="391" fontSize="20" fill="#0064e0" fontWeight="800">1,200+</text><text x="294" y="401" fontSize="9" fill="#22c55e" fontWeight="700">● Pan-India</text></g>
        <path d="M248,130 Q340,140 370,230" fill="none" stroke="#0064e0" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.22"/>
        <path d="M248,330 Q160,340 130,300" fill="none" stroke="#0064e0" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.22"/>
      </svg>
    </div>
  )
}

function Particles({ color='#0064e0', count=36 }: { color?:string; count?:number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = canvas.offsetWidth, h = canvas.offsetHeight
    canvas.width = w; canvas.height = h
    const particles = Array.from({ length: count }, () => ({ x:Math.random()*w, y:Math.random()*h, r:Math.random()*2+1, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.5, o:Math.random()*.5+.1 }))
    let raf = 0
    const draw = () => {
      ctx.clearRect(0,0,w,h)
      particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=w; if(p.x>w)p.x=0; if(p.y<0)p.y=h; if(p.y>h)p.y=0; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=color+Math.floor(p.o*255).toString(16).padStart(2,'0'); ctx.fill() })
      for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++) { const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,dist=Math.sqrt(dx*dx+dy*dy); if(dist<110){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=color+Math.floor((1-dist/110)*40).toString(16).padStart(2,'0');ctx.lineWidth=.7;ctx.stroke()} }
      raf = requestAnimationFrame(draw)
    }
    draw()
    const onResize = () => { w=canvas.offsetWidth; h=canvas.offsetHeight; canvas.width=w; canvas.height=h }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [color, count])
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }}/>
}

function useCounter(target: number) {
  const [n, setN] = useState(0); const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(!e.isIntersecting) return; const dur=1800,t0=performance.now(); const go=(now:number)=>{const p=Math.min((now-t0)/dur,1),e2=1-Math.pow(1-p,3);setN(Math.floor(e2*target));if(p<1)requestAnimationFrame(go);else setN(target)}; requestAnimationFrame(go); obs.disconnect() }, { threshold:.5 })
    if(ref.current) obs.observe(ref.current)
    return ()=>obs.disconnect()
  }, [target])
  return { n, ref }
}

function StatCard({ value, suffix, label, delay=0 }: { value:number; suffix:string; label:string; delay?:number }) {
  const { n, ref } = useCounter(value)
  return (
    <div className="rv" style={{ transitionDelay:`${delay}ms`, background:'white', borderRadius:22, padding:'30px 26px', border:'1px solid #edf0f7', boxShadow:'0 4px 24px rgba(0,0,0,.06)' }}>
      <span ref={ref} style={{ display:'block', fontSize:'clamp(34px,4vw,50px)', fontWeight:800, color:'#0064e0', letterSpacing:'-.03em', lineHeight:1, animation:'cUp .5s ease' }}>{n.toLocaleString('en-IN')}{suffix}</span>
      <span style={{ display:'block', fontSize:13, color:'#65676b', marginTop:8, fontWeight:500, lineHeight:1.45 }}>{label}</span>
    </div>
  )
}

/* ─────────── MOBILE APP PREVIEW WITH MULTIPLE SCREENS ─────────── */
function MobileAppPreview() {
  const [screen, setScreen] = useState('home')
  const [phoneInput, setPhoneInput] = useState('')
  const [otpInput, setOtpInput] = useState('')

  return (
    <div className="phone-mockup" style={{ '--order-bg':'#EBF4FF' } as React.CSSProperties}>
      <div className="phone-screen">
        
        {/* LOGIN SCREEN */}
        {screen === 'login' && (
          <div style={{ display:'flex', flexDirection:'column', padding:'40px 24px', height:'100%', justifyContent:'center' }}>
            <div style={{ marginBottom:40, textAlign:'center' }}>
              <div style={{ fontSize:28, fontWeight:800, color:'#0064e0', marginBottom:8 }}>NexaBid</div>
              <div style={{ fontSize:14, color:'#6b7280' }}>Post orders, source faster</div>
            </div>
            
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1c1e21', marginBottom:8 }}>Phone Number</label>
              <input 
                type="tel" 
                placeholder="+91 98765 43210"
                value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                style={{ width:'100%', padding:'12px 16px', border:'1px solid #d1d5db', borderRadius:12, fontSize:14, fontFamily:'inherit', color:'#0d1117' }}
              />
            </div>

            <button 
              onClick={() => setScreen('otp')}
              style={{ width:'100%', padding:14, background:'#0064e0', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:14 }}>
              Send OTP
            </button>

            <button 
              onClick={() => setScreen('register')}
              style={{ width:'100%', padding:14, background:'white', color:'#0064e0', border:'1.5px solid #0064e0', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Create Account
            </button>
          </div>
        )}

        {/* REGISTER SCREEN */}
        {screen === 'register' && (
          <div style={{ display:'flex', flexDirection:'column', padding:'40px 24px', height:'100%', overflow:'auto' }}>
            <div style={{ marginBottom:32, textAlign:'center' }}>
              <div style={{ fontSize:24, fontWeight:800, color:'#0d1117', marginBottom:4 }}>Create Account</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>Join NexaBid today</div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1c1e21', marginBottom:6 }}>Full Name</label>
              <input type="text" placeholder="John Doe" style={{ width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:10, fontSize:13, fontFamily:'inherit' }}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1c1e21', marginBottom:6 }}>Company Name</label>
              <input type="text" placeholder="Your Company" style={{ width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:10, fontSize:13, fontFamily:'inherit' }}/>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1c1e21', marginBottom:6 }}>Phone Number</label>
              <input type="tel" placeholder="+91 98765 43210" style={{ width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:10, fontSize:13, fontFamily:'inherit' }}/>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#1c1e21', marginBottom:6 }}>Email</label>
              <input type="email" placeholder="you@company.com" style={{ width:'100%', padding:'10px 14px', border:'1px solid #d1d5db', borderRadius:10, fontSize:13, fontFamily:'inherit' }}/>
            </div>

            <button 
              onClick={() => setScreen('otp')}
              style={{ width:'100%', padding:12, background:'#0064e0', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>
              Create Account
            </button>

            <button 
              onClick={() => setScreen('login')}
              style={{ width:'100%', padding:12, background:'white', color:'#0064e0', border:'1.5px solid #0064e0', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Back to Login
            </button>
          </div>
        )}

        {/* OTP SCREEN */}
        {screen === 'otp' && (
          <div style={{ display:'flex', flexDirection:'column', padding:'50px 24px', height:'100%', justifyContent:'center' }}>
            <div style={{ marginBottom:40, textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:800, color:'#0d1117', marginBottom:8 }}>Verify OTP</div>
              <div style={{ fontSize:12, color:'#6b7280' }}>Enter the code sent to your phone</div>
            </div>

            <div style={{ marginBottom:30, display:'flex', gap:8, justifyContent:'center' }}>
              {[0,1,2,3].map(i => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  placeholder="0"
                  value={otpInput[i] || ''}
                  onChange={e => {
                    const newOtp = otpInput.split('');
                    newOtp[i] = e.target.value;
                    setOtpInput(newOtp.join(''));
                  }}
                  style={{ width:50, height:50, fontSize:20, fontWeight:700, textAlign:'center', border:'1px solid #d1d5db', borderRadius:10, fontFamily:'inherit', color:'#0064e0' }}
                />
              ))}
            </div>

            <button 
              onClick={() => setScreen('home')}
              style={{ width:'100%', padding:14, background:'#0064e0', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', marginBottom:12 }}>
              Verify & Login
            </button>

            <div style={{ textAlign:'center', fontSize:12, color:'#6b7280' }}>
              Didn't receive code? <span style={{ color:'#0064e0', fontWeight:700, cursor:'pointer' }}>Resend</span>
            </div>
          </div>
        )}

        {/* HOME SCREEN */}
        {screen === 'home' && (
          <>
            <div className="phone-header">
              <div className="phone-greeting">Welcome Prashanth 👋</div>
              <div className="phone-avatar">P</div>
            </div>
            <input type="text" className="phone-search" placeholder="What do you need manufactured?" readOnly/>
            
            <div style={{ padding:'16px 20px 12px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#0064e0', background:'#ebf4ff', padding:'8px 12px', borderRadius:8, display:'inline-block', marginBottom:10 }}>Order #NB-4829 · In Transit</div>
              <div className="phone-progress-bar"><div className="phone-progress-fill" style={{ width:'65%' }}/></div>
            </div>

            <div className="phone-section-title">Active Orders</div>
            {ACTIVE_ORDERS.map(order=>(
              <div key={order.id} className="phone-order-card" style={{ '--order-bg':order.color, cursor:'pointer' } as React.CSSProperties} onClick={() => setScreen('delivery')}>
                <div className="phone-order-header">
                  <div className="phone-order-icon">{order.icon}</div>
                  <div className="phone-order-info">
                    <div className="phone-order-title">{order.product} — {order.quantity}</div>
                    <div className="phone-order-subtitle">{order.manufacturer}</div>
                    <div className="phone-order-status"><span>●</span> {order.status}</div>
                  </div>
                </div>
                <div className="phone-progress-bar"><div className="phone-progress-fill" style={{ width:`${order.progress}%` }}/></div>
                <div className="phone-order-meta">
                  <div className="phone-meta-item"><div className="phone-meta-label">Date</div><div className="phone-meta-value">{order.date}</div></div>
                  <div className="phone-meta-item"><div className="phone-meta-label">Price</div><div className="phone-meta-value" style={{ color:'#0064e0' }}>{order.price}</div></div>
                  <div className="phone-meta-item"><div className="phone-meta-label">Payment</div><div className="phone-meta-value" style={{ color:'#22c55e' }}>{order.payment}</div></div>
                </div>
              </div>
            ))}
          </>
        )}

        {/* DELIVERY TRACKING SCREEN */}
        {screen === 'delivery' && (
          <div style={{ padding:'0' }}>
            <div style={{ background:'#0064e0', color:'white', padding:'20px', paddingTop:16 }}>
              <button 
                onClick={() => setScreen('home')}
                style={{ background:'none', border:'none', color:'white', fontSize:18, cursor:'pointer', marginBottom:12 }}>
                ← Back
              </button>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:4 }}>Order #NB-4829</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Cotton Fabric • 500 kg</div>
            </div>

            <div style={{ padding:'24px' }}>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#0d1117', marginBottom:12 }}>📍 Shipment Status</div>
                
                {[
                  { status:'Order Confirmed', time:'Jan 9 · 10:30 AM', done:true },
                  { status:'Production Started', time:'Jan 10 · 2:45 PM', done:true },
                  { status:'Quality Check', time:'Jan 12 · 8:00 AM', done:true },
                  { status:'In Transit', time:'Jan 15 · 4:20 PM', done:true },
                  { status:'Out for Delivery', time:'Jan 18 · 9:00 AM', done:false },
                  { status:'Delivered', time:'Today', done:false }
                ].map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:12, marginBottom:16, opacity:item.done?1:0.5 }}>
                    <div style={{ position:'relative', width:24, display:'flex', flexDirection:'column', alignItems:'center' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:item.done?'#22c55e':'#e5e7eb', border:`2px solid ${item.done?'#22c55e':'#d1d5db'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {item.done && <span style={{ color:'white', fontSize:10, fontWeight:700 }}>✓</span>}
                      </div>
                      {i < 5 && <div style={{ width:2, height:16, background:item.done?'#22c55e':'#d1d5db', marginTop:4 }}/>}
                    </div>
                    <div style={{ flex:1, paddingTop:2 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#0d1117' }}>{item.status}</div>
                      <div style={{ fontSize:11, color:'#858585', marginTop:2 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background:'#f0f4ff', border:'1px solid rgba(0,100,224,0.2)', borderRadius:12, padding:16, marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#0064e0', marginBottom:8 }}>📦 Shipping Details</div>
                <div style={{ fontSize:12, color:'#6b7280', lineHeight:1.6 }}>
                  <div><strong>From:</strong> Patel Textiles, Surat</div>
                  <div><strong>To:</strong> Reliance Retail HQ, Mumbai</div>
                  <div><strong>Tracking ID:</strong> NB-4829-SURAT</div>
                  <div><strong>Carrier:</strong> Professional Logistics</div>
                </div>
              </div>

              <button style={{ width:'100%', padding:14, background:'#0064e0', color:'white', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Confirm Delivery (OTP)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* TAB BAR */}
      <div className="phone-tab-bar">
        <div className="phone-tab" onClick={() => setScreen('home')} style={{ cursor:'pointer', opacity:['home','delivery'].includes(screen)?1:0.5, color:['home','delivery'].includes(screen)?'#0064e0':'#ccc' }}>
          <div className="phone-tab-icon">🏠</div>Home
        </div>
        <div className="phone-tab" style={{ cursor:'pointer' }}>
          <div className="phone-tab-icon">📦</div>Orders
        </div>
        <div className="phone-tab" style={{ cursor:'pointer' }}>
          <div className="phone-tab-icon">🏷️</div>Bids
        </div>
        <div className="phone-tab" onClick={() => setScreen('login')} style={{ cursor:'pointer', opacity:screen==='login'?1:0.5, color:screen==='login'?'#0064e0':'#ccc' }}>
          <div className="phone-tab-icon">👤</div>Profile
        </div>
      </div>
    </div>
  )
}

function ProcessStepper() {
  const [active, setActive] = useState(0), [prog, setProg] = useState(0), [key, setKey] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)
  const D = 4500
  const goTo = useCallback((i:number) => {
    setActive(i); setProg(0); setKey(k=>k+1)
    if(timerRef.current) clearInterval(timerRef.current)
    const t0 = Date.now()
    timerRef.current = setInterval(()=>{ const p=Math.min(((Date.now()-t0)/D)*100,100); setProg(p); if(p>=100){clearInterval(timerRef.current!);setTimeout(()=>goTo((i+1)%HOW.length),200)} },16)
  },[])
  useEffect(()=>{ goTo(0); return()=>{ if(timerRef.current) clearInterval(timerRef.current) } },[goTo])
  const s = HOW[active]
  return (
    <div style={{ display:'flex', gap:48, alignItems:'stretch', flexWrap:'wrap' }}>
      <div style={{ width:288, flexShrink:0, display:'flex', flexDirection:'column', gap:3 }}>
        {HOW.map((h,i)=>(
          <button key={h.step} onClick={()=>goTo(i)} style={{ outline:'none', border:'none', padding:0, cursor:'pointer', textAlign:'left', width:'100%', background:'none', fontFamily:'inherit' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, padding:'13px 16px', borderRadius:16, background:active===i?'#f0f4ff':'transparent', transition:'background .25s' }}>
              <div style={{ width:46, height:46, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:active===i?'#0064e0':'#f0f2f5', color:active===i?'white':'#65676b', boxShadow:active===i?'0 6px 20px rgba(0,100,224,.3)':'none', transition:'all .3s' }}>
                <span style={{ fontSize:16, fontWeight:800 }}>{i+1}</span>
              </div>
              <div>
                <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.15em', color:active===i?'#0064e0':'#9ca3af', marginBottom:3, transition:'color .25s' }}>Step {h.step}</p>
                <p style={{ fontSize:15, fontWeight:700, color:active===i?'#1c1e21':'#65676b', transition:'color .25s', lineHeight:1.3 }}>{h.title}</p>
              </div>
            </div>
            {active===i && <div style={{ margin:'2px 16px 6px', height:3, background:'#e8edf5', borderRadius:99, overflow:'hidden' }}><div style={{ height:'100%', width:`${prog}%`, background:'#0064e0', borderRadius:99 }}/></div>}
          </button>
        ))}
      </div>
      <div key={key} style={{ flex:1, minWidth:300, animation:'sIn .42s cubic-bezier(.22,1,.36,1) both' }}>
        <div style={{ borderRadius:24, overflow:'hidden', background:'white', boxShadow:'0 10px 52px rgba(0,0,0,.1)', border:'1px solid #edf0f7' }}>
          <div style={{ position:'relative', overflow:'hidden', height:'clamp(260px,36vw,440px)' }}>
            <img src={s.img} alt={s.title} style={{ width:'100%', height:'100%', objectFit:'cover', animation:'kb 5s ease forwards' }}/>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)' }}/>
            <span style={{ position:'absolute', bottom:10, right:18, fontWeight:900, color:'rgba(255,255,255,.08)', fontSize:'clamp(80px,12vw,130px)', lineHeight:1, letterSpacing:'-.06em', userSelect:'none' }}>{s.step}</span>
          </div>
          <div style={{ padding:'26px 30px 30px' }}>
            <h3 style={{ fontSize:'clamp(19px,2vw,24px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.3px', marginBottom:10 }}>{s.title}</h3>
            <p style={{ fontSize:15, color:'#65676b', lineHeight:1.7, maxWidth:520, marginBottom:20 }}>{s.desc}</p>
            <div style={{ display:'flex', gap:6 }}>{HOW.map((_,i)=><button key={i} onClick={()=>goTo(i)} style={{ borderRadius:99, height:7, width:i===active?24:7, background:i===active?'#0064e0':'#d1d5db', border:'none', cursor:'pointer', padding:0, transition:'all .3s' }}/>)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroCarousel({ navigate: _nav }: { navigate:(p:Page)=>void }) {
  const [idx, setIdx] = useState(0), [animKey, setAnimKey] = useState(0), [autoProgress, setAutoProgress] = useState(0)
  const isDrag=useRef(false), sx=useRef(0), dx=useRef(0)
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const progRef=useRef<ReturnType<typeof setInterval>|null>(null)
  const SLIDE_DUR = 5500

  const startProgress = useCallback(()=>{
    if(progRef.current) clearInterval(progRef.current)
    setAutoProgress(0)
    const t0=Date.now()
    progRef.current=setInterval(()=>{ const p=Math.min(((Date.now()-t0)/SLIDE_DUR)*100,100); setAutoProgress(p); if(p>=100) clearInterval(progRef.current!) },30)
  },[])

  const goTo = useCallback((next:number)=>{
    setIdx((next+HERO_SLIDES.length)%HERO_SLIDES.length); setAnimKey(k=>k+1); startProgress()
    if(timerRef.current) clearInterval(timerRef.current)
    timerRef.current=setInterval(()=>{ setIdx(i=>(i+1)%HERO_SLIDES.length); setAnimKey(k=>k+1); startProgress() },SLIDE_DUR)
  },[startProgress])

  useEffect(()=>{
    startProgress()
    timerRef.current=setInterval(()=>{ setIdx(i=>(i+1)%HERO_SLIDES.length); setAnimKey(k=>k+1); startProgress() },SLIDE_DUR)
    return()=>{ if(timerRef.current) clearInterval(timerRef.current); if(progRef.current) clearInterval(progRef.current) }
  },[])

  const onDown=(e:React.PointerEvent)=>{ isDrag.current=true; sx.current=e.clientX; dx.current=0; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) }
  const onMove=(e:React.PointerEvent)=>{ if(!isDrag.current) return; dx.current=e.clientX-sx.current }
  const onUp=()=>{ if(!isDrag.current) return; isDrag.current=false; if(dx.current<-60) goTo(idx+1); else if(dx.current>60) goTo(idx-1); dx.current=0 }

  const slide = HERO_SLIDES[idx]

  return (
    <section style={{ position:'relative', width:'100%', height:'100vh', minHeight:600, maxHeight:860, overflow:'hidden', cursor:'grab', userSelect:'none', background:'#04080f' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {HERO_SLIDES.map((s,i)=>(
        <div key={i} style={{ position:'absolute', inset:0, opacity:idx===i?1:0, transition:'opacity 1.4s cubic-bezier(.4,0,.2,1)', zIndex:idx===i?1:0 }}>
          <img src={s.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 8s ease', transform:idx===i?'scale(1.07)':'scale(1)' }}/>
        </div>
      ))}
      <div style={{ position:'absolute', inset:0, zIndex:2, background:'linear-gradient(105deg,rgba(4,8,15,0.94) 0%,rgba(4,8,15,0.75) 45%,rgba(4,8,15,0.25) 100%)' }}/>
      <div style={{ position:'absolute', inset:0, zIndex:2, background:'linear-gradient(to top,rgba(4,8,15,0.85) 0%,transparent 45%)' }}/>

      <div key={animKey} style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'0 clamp(28px,7vw,110px)', paddingBottom:'clamp(120px,16vh,180px)', paddingTop:80, maxWidth:750, pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24, animation:'heroBadgeIn .55s cubic-bezier(.22,1,.36,1) .05s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(0,100,224,0.22)', border:'1px solid rgba(0,100,224,0.5)', borderRadius:100, padding:'5px 13px', backdropFilter:'blur(14px)' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block', flexShrink:0, boxShadow:'0 0 6px #22c55e' }}/>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.9)' }}>{slide.badge}</span>
          </div>
          <span style={{ fontSize:11, fontWeight:600, letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(255,255,255,0.38)', padding:'5px 12px', border:'1px solid rgba(255,255,255,0.12)', borderRadius:100 }}>{slide.tag}</span>
        </div>
        <h1 style={{ margin:0, padding:0, marginBottom:18 }}>
          {slide.headline.map((line,li)=>(<span key={`${animKey}-${li}`} style={{ display:'block', color:'white', fontWeight:800, fontSize:'clamp(34px,4.8vw,68px)', lineHeight:1.07, letterSpacing:'-0.03em', textShadow:'0 2px 24px rgba(0,0,0,0.3)', animation:`heroTxtIn .65s cubic-bezier(.22,1,.36,1) ${.12+li*.1}s both` }}>{line}</span>))}
        </h1>
        <p style={{ color:'rgba(255,255,255,0.62)', fontSize:'clamp(14px,1.35vw,17px)', lineHeight:1.72, maxWidth:440, marginBottom:30, animation:`heroTxtIn .65s cubic-bezier(.22,1,.36,1) .44s both` }}>{slide.sub}</p>
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, pointerEvents:'all', animation:`heroBtnIn .65s cubic-bezier(.22,1,.36,1) .54s both` }}>
          <a href="https://nexabid-nexabid-client.vercel.app/auth/register" target="_blank" rel="noopener noreferrer" className="bp"
            style={{ padding:'13px 30px', background:'#0064e0', color:'white', fontWeight:700, borderRadius:100, fontSize:14, textDecoration:'none', boxShadow:'0 8px 28px rgba(0,100,224,.48)', display:'inline-block' }}
            onPointerDown={e=>e.stopPropagation()}>Post an Order</a>
          <a href="https://nexabid-nexabid-manufacturer.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ padding:'12px 28px', color:'white', fontWeight:600, borderRadius:100, fontSize:14, textDecoration:'none', border:'1.5px solid rgba(255,255,255,0.3)', backdropFilter:'blur(12px)', display:'inline-block' }}
            onPointerDown={e=>e.stopPropagation()}>Join as Manufacturer</a>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:12, display:'flex', alignItems:'stretch', background:'rgba(4,8,15,0.82)', backdropFilter:'blur(24px)', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        {[{val:'1,200+',label:'Verified Manufacturers'},{val:'₹240Cr+',label:'GMV Processed'},{val:'48h',label:'Avg Bid Response'},{val:'98%',label:'Escrow Success Rate'}].map((b,i)=>(
          <div key={i} style={{ flex:1, padding:'14px 0', textAlign:'center', borderRight:i<3?'1px solid rgba(255,255,255,0.07)':'none' }}>
            <div style={{ fontSize:'clamp(16px,1.8vw,22px)', fontWeight:800, color:'white', lineHeight:1, letterSpacing:'-.02em' }}>{b.val}</div>
            <div style={{ fontSize:'clamp(10px,1vw,12px)', color:'rgba(255,255,255,0.42)', marginTop:4, fontWeight:500 }}>{b.label}</div>
          </div>
        ))}
      </div>

      {([{side:'left' as const,action:()=>goTo(idx-1),icon:'‹'},{side:'right' as const,action:()=>goTo(idx+1),icon:'›'}]).map(btn=>(
        <button key={btn.side} onClick={btn.action}
          style={{ position:'absolute', zIndex:20, top:'calc(50% - 30px)', transform:'translateY(-50%)', [btn.side]:'clamp(14px,2.5vw,32px)', width:46, height:46, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', backdropFilter:'blur(16px)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:24, fontWeight:300, outline:'none', transition:'background .2s,transform .2s' }}
          onMouseEnter={e=>{const el=e.currentTarget;el.style.background='rgba(0,100,224,0.6)';el.style.transform='translateY(-50%) scale(1.1)'}}
          onMouseLeave={e=>{const el=e.currentTarget;el.style.background='rgba(255,255,255,0.08)';el.style.transform='translateY(-50%) scale(1)'}}
          onPointerDown={e=>e.stopPropagation()}>{btn.icon}</button>
      ))}

      <div style={{ position:'absolute', bottom:72, right:'clamp(20px,5vw,80px)', zIndex:13, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'.14em' }}>{String(idx+1).padStart(2,'0')} / {String(HERO_SLIDES.length).padStart(2,'0')}</span>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          {HERO_SLIDES.map((_,i)=>(
            <button key={i} onClick={()=>goTo(i)} style={{ position:'relative', height:3, width:i===idx?32:7, borderRadius:99, background:'rgba(255,255,255,0.22)', border:'none', cursor:'pointer', padding:0, overflow:'hidden', transition:'width .35s ease' }} onPointerDown={e=>e.stopPropagation()}>
              {i===idx && <div style={{ position:'absolute', top:0, left:0, height:'100%', width:`${autoProgress}%`, background:'white', borderRadius:99, transition:'width .03s linear' }}/>}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function Drag({ children, pl='clamp(20px,5vw,96px)' }: { children:React.ReactNode; pl?:string }) {
  const ref = useRef<HTMLDivElement>(null)
  const drag=useRef(false), sx=useRef(0), sl=useRef(0), vel=useRef(0), lx=useRef(0), raf=useRef(0)
  const onD=useCallback((e:React.PointerEvent)=>{if(!ref.current)return;drag.current=true;sx.current=e.clientX;sl.current=ref.current.scrollLeft;lx.current=e.clientX;vel.current=0;ref.current.style.cursor='grabbing';ref.current.setPointerCapture(e.pointerId);cancelAnimationFrame(raf.current)},[])
  const onM=useCallback((e:React.PointerEvent)=>{if(!drag.current||!ref.current)return;e.preventDefault();vel.current=e.clientX-lx.current;lx.current=e.clientX;ref.current.scrollLeft=sl.current-(e.clientX-sx.current)},[])
  const onU=useCallback(()=>{if(!ref.current)return;drag.current=false;ref.current.style.cursor='grab';const go=()=>{if(!ref.current||Math.abs(vel.current)<.5)return;ref.current.scrollLeft-=vel.current*0.9;vel.current*=0.92;raf.current=requestAnimationFrame(go)};raf.current=requestAnimationFrame(go)},[])
  return <div ref={ref} style={{ overflowX:'auto', cursor:'grab', scrollbarWidth:'none', WebkitOverflowScrolling:'touch', userSelect:'none', paddingLeft:pl }} onPointerDown={onD} onPointerMove={onM} onPointerUp={onU} onPointerCancel={onU}>{children}</div>
}

function useReveal() {
  useEffect(()=>{
    const obs=new IntersectionObserver(entries=>entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('on') }),{threshold:.07})
    document.querySelectorAll('.rv,.rvl,.rvr,.rvs').forEach(el=>obs.observe(el))
    return()=>obs.disconnect()
  },[])
}

export default function LandingPage({ navigate }: Props) {
  useReveal()
  const [activeTesti, setActiveTesti] = useState(0)
  useEffect(()=>{ const t=setInterval(()=>setActiveTesti(i=>(i+1)%TESTIMONIALS.length),4500); return()=>clearInterval(t) },[])

  return (
    <div style={{ minHeight:'100vh', background:'white', fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif", WebkitFontSmoothing:'antialiased' }}>
      <style>{CSS}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, background:'rgba(255,255,255,.92)', backdropFilter:'blur(24px)', borderBottom:'1px solid rgba(228,230,235,.7)' }}>
        <div className="mc" style={{ display:'flex', alignItems:'center', height:76 }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, marginRight:48, flexShrink:0 }}>
            <div style={{ width:38, height:38, background:'#0064e0', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', animation:'lRing 3s infinite', flexShrink:0 }}>
              <span style={{ color:'white', fontSize:13, fontWeight:800, letterSpacing:'-.5px' }}>NB</span>
            </div>
            <span style={{ fontWeight:800, fontSize:17, color:'#1c1e21', letterSpacing:'-.3px' }}>NexaBid</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:28, flex:1 }}>
            <button onClick={()=>navigate('about')} style={{ fontSize:15, fontWeight:500, color:'#4b4f56', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>About</button>
            <a href="#how" style={{ fontSize:15, fontWeight:500, color:'#4b4f56', textDecoration:'none' }}>How it Works</a>
            <button onClick={()=>navigate('careers')} style={{ fontSize:15, fontWeight:500, color:'#4b4f56', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>Careers</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <a href="https://nexabid-nexabid-client.vercel.app" target="_blank" style={{ padding:'8px 18px', fontSize:14, fontWeight:600, color:'#0064e0', border:'1.5px solid #0064e0', borderRadius:100, textDecoration:'none' }}>Client Login</a>
            <a href="https://nexabid-nexabid-manufacturer.vercel.app" target="_blank" style={{ padding:'8px 18px', fontSize:14, fontWeight:600, color:'#0064e0', border:'1.5px solid #0064e0', borderRadius:100, textDecoration:'none' }}>Manufacturer Login</a>
            <a href="https://nexabid-nexabid-client.vercel.app/auth/register" target="_blank" className="bp"
              style={{ padding:'9px 22px', fontSize:14, fontWeight:700, color:'white', background:'#0064e0', border:'none', borderRadius:100, cursor:'pointer', textDecoration:'none', boxShadow:'0 4px 14px rgba(0,100,224,.28)', display:'inline-block' }}>
              Post an Order
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <HeroCarousel navigate={navigate}/>

      {/* STATS */}
      <section style={{ padding:'52px 0', background:'#ffffff', borderBottom:'1px solid #edf0f7' }}>
        <div className="mc">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))', gap:20 }}>
            {[{value:1200,suffix:'+',label:'Verified Manufacturers',delay:0},{value:8500,suffix:'+',label:'Orders Completed',delay:70},{value:240,suffix:'Cr+',label:'GMV Processed (₹)',delay:140},{value:98,suffix:'%',label:'Escrow Success Rate',delay:210}].map((s,i)=>(
              <StatCard key={i} value={s.value} suffix={s.suffix} label={s.label} delay={s.delay}/>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE APP SECTION */}
      <section className="mobile-app-section">
        <div className="mc">
          <div className="mobile-app-container">
            <div className="mobile-app-content">
              <div className="pill rv"><span className="pill-d"/>Mobile Experience</div>
              <h2 className="rv d1">Real-time orders on your phone</h2>
              <p className="rv d2">Track bids, monitor manufacturing progress, and manage payments — all from your pocket. Get instant notifications for every milestone.</p>
              <div className="mobile-app-features">
                <div className="mobile-feature rv d3">Post orders in under 2 minutes from your phone</div>
                <div className="mobile-feature rv d4">Get live notifications when manufacturers bid on your order</div>
                <div className="mobile-feature rv" style={{ transitionDelay:'0.30s' }}>Track production & delivery with real-time GPS</div>
              </div>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <a href="#" className="bp" style={{ padding:'14px 28px', background:'#0064e0', color:'white', fontWeight:700, borderRadius:100, fontSize:15, textDecoration:'none', boxShadow:'0 4px 14px rgba(0,100,224,.28)', display:'inline-block' }}>Download App</a>
                <a href="#" style={{ padding:'13px 28px', color:'#0064e0', fontWeight:700, borderRadius:100, fontSize:15, textDecoration:'none', border:'1.5px solid #0064e0', display:'inline-block' }}>Learn More</a>
              </div>
            </div>
            <div className="mobile-app-mockup"><MobileAppPreview/></div>
          </div>
        </div>
      </section>

      {/* Continue with rest of sections - same as original */}
      <section style={{ padding:'clamp(72px,9vw,120px) 0', background:'#ffffff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-120, right:-120, width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,100,224,0.04) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div className="mc">
          <div style={{ textAlign:'center', marginBottom:60 }}>
            <div className="pill rv" style={{ margin:'0 auto 18px' }}><span className="pill-d"/>Why NexaBid</div>
            <h2 className="rv d1" style={{ fontSize:'clamp(28px,3.5vw,46px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.03em', lineHeight:1.08, maxWidth:580, margin:'0 auto 16px' }}>The smarter way to<br/>source manufacturing.</h2>
            <p className="rv d2" style={{ fontSize:16, color:'#6b7280', maxWidth:500, margin:'0 auto', lineHeight:1.72 }}>Built for procurement teams and manufacturers who are done with spreadsheets and cold calls.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:22 }}>
            {[
              { accent:'#0064e0', delay:0,   title:'AI Bid Scoring',    desc:'Our ML engine scores every manufacturer bid on price competitiveness, delivery reliability, and quality — in real time.',    img:'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#0064e0" fillOpacity=".1"/><path d="M8 24l5-6 4 4 5-7 6 9" stroke="#0064e0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="27" cy="10" r="3" fill="#0064e0"/></svg> },
              { accent:'#059669', delay:60,  title:'Escrow Protection', desc:'Funds locked in Razorpay escrow. Released only when you confirm delivery via OTP. Zero payment risk, guaranteed.',       img:'https://media.assettype.com/outlookmoney/2025-07-21/yvd3jsad/Escrow-Account.png?w=640&auto=format%2Ccompress&fit=max&format=webp&dpr=1.0?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#059669" fillOpacity=".1"/><path d="M18 6l10 3.5v9c0 6-4.5 9.5-10 11-5.5-1.5-10-5-10-11V9.5L18 6z" stroke="#059669" strokeWidth="2" strokeLinejoin="round"/><path d="M14 18l3 3 6-6" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { accent:'#d97706', delay:120, title:'48-Hour Response',   desc:'Post an order and receive competitive bids from verified manufacturers within 48 hours — or we find you one.',             img:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIrIc4O6MPxmTooQWTGD0Y66joSIkvaZx6eQ&s?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#d97706" fillOpacity=".1"/><circle cx="18" cy="18" r="9" stroke="#d97706" strokeWidth="2"/><path d="M18 12v6l4 2" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round"/></svg> },
              { accent:'#7c3aed', delay:180, title:'Real-Time Tracking', desc:'Live order status from production floor to your doorstep. GPS tracking, milestone alerts, and full transparency.',          img:'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#7c3aed" fillOpacity=".1"/><path d="M8 20h4l3-8 4 14 3-10 3 4h3" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { accent:'#0064e0', delay:240, title:'GST-Ready Invoicing', desc:'Automated GST-compliant invoices for every transaction. Seamlessly integrates with your accounting software.',           img:'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#0064e0" fillOpacity=".1"/><rect x="9" y="6" width="14" height="20" rx="2" stroke="#0064e0" strokeWidth="2"/><path d="M12 12h8M12 16h8M12 20h5" stroke="#0064e0" strokeWidth="1.8" strokeLinecap="round"/><circle cx="24" cy="24" r="5" fill="white" stroke="#0064e0" strokeWidth="1.8"/><path d="M22 24l1.5 1.5L26 22" stroke="#0064e0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> },
              { accent:'#dc2626', delay:300, title:'Pan-India Network',   desc:'1,200+ verified manufacturers across 24 states. Textiles, metals, electronics, pharma and 12 more categories.',           img:'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=90&auto=format&fit=crop', svg:<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="10" fill="#dc2626" fillOpacity=".1"/><circle cx="18" cy="18" r="9" stroke="#dc2626" strokeWidth="2"/><path d="M9 18h18M18 9c-3 3-4.5 6-4.5 9s1.5 6 4.5 9M18 9c3 3 4.5 6 4.5 9s-1.5 6-4.5 9" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"/></svg> },
            ].map((f,i)=>(
              <div key={f.title} className="fc rv" style={{ transitionDelay:`${f.delay}ms`, background:'white', border:'1px solid #edf0f7', borderRadius:22, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,.05)', cursor:'default' }}>
                <div style={{ position:'relative', height:140, overflow:'hidden' }}>
                  <img src={f.img} alt={f.title} className="ci" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${f.accent}33 0%,transparent 60%)` }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,white 0%,transparent 55%)' }}/>
                </div>
                <div style={{ padding:'0 24px 26px' }}>
                  <div style={{ marginBottom:14, marginTop:-18, position:'relative', zIndex:2 }}>{f.svg}</div>
                  <h3 style={{ fontSize:17, fontWeight:800, color:'#1c1e21', marginBottom:8, letterSpacing:'-.02em' }}>{f.title}</h3>
                  <p style={{ fontSize:14, color:'#6b7280', lineHeight:1.72 }}>{f.desc}</p>
                  <div style={{ height:2, background:`linear-gradient(90deg,${f.accent},${f.accent}00)`, borderRadius:99, marginTop:18, width:'35%', transition:'width .5s cubic-bezier(.22,1,.36,1)' }} className="fc-line"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="sec-line"/>

      {/* Remaining sections omitted for brevity - they're identical to original */}
      <section style={{ padding:'clamp(60px,8vw,110px) 0', background:'#080f1e', overflow:'hidden', position:'relative' }}>
        <Particles color="#0064e0" count={50}/>
        <div style={{ position:'absolute', top:'50%', left:'35%', transform:'translate(-50%,-50%)', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,100,224,.12) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div className="mc" style={{ position:'relative', zIndex:2, display:'flex', alignItems:'center', gap:'clamp(32px,6vw,80px)', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:280 }}>
            <div className="pill rvl" style={{ background:'rgba(0,100,224,.15)', borderColor:'rgba(0,100,224,.3)' }}><span className="pill-d"/>Platform Intelligence</div>
            <h2 className="rvl d1" style={{ fontSize:'clamp(28px,3.8vw,50px)', fontWeight:800, color:'white', letterSpacing:'-.03em', lineHeight:1.1, marginBottom:24 }}>Industrial-grade<br/><span className="gt">AI at the core</span><br/>of every bid.</h2>
            <p className="rvl d2" style={{ fontSize:16, color:'rgba(255,255,255,.6)', lineHeight:1.75, maxWidth:400, marginBottom:36 }}>Our machine learning engine processes thousands of historical bids to score manufacturers on price competitiveness, delivery reliability, and quality consistency — in real time.</p>
            {[{label:'AI Bid Scoring',val:'98.4% accuracy'},{label:'Fraud Detection',val:'0 cases in 2024'},{label:'Avg. Response',val:'< 4 hours'},{label:'Payment Release',val:'Instant OTP'}].map((f,i)=>(
              <div key={f.label} className={`rvl d${i+3}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14, marginBottom:10, backdropFilter:'blur(8px)' }}>
                <span style={{ fontSize:14, color:'rgba(255,255,255,.7)', fontWeight:500 }}>{f.label}</span>
                <span style={{ fontSize:13, color:'#22c55e', fontWeight:700 }}>{f.val}</span>
              </div>
            ))}
          </div>
          <div className="rvr d2" style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
            <IndustrialWidget/>
          </div>
        </div>
      </section>

      <section style={{ padding:'44px 0', background:'#f7f9fc', borderTop:'1px solid #edf0f7', borderBottom:'1px solid #edf0f7', overflow:'hidden' }}>
        <div className="mc" style={{ marginBottom:18 }}>
          <p className="rv" style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.25em', color:'#9ca3af', textAlign:'center' }}>Trusted by India's Leading Enterprises</p>
        </div>
        <div style={{ overflow:'hidden' }}>
          <div style={{ display:'flex', whiteSpace:'nowrap', animation:'trust 22s linear infinite', width:'max-content' }}>
            {[...TRUST_LOGOS,...TRUST_LOGOS].map((l,i)=>(
              <div key={i} style={{ display:'inline-flex', alignItems:'center', padding:'0 44px', fontSize:18, fontWeight:800, color:'#c0c7d4', letterSpacing:'-.02em', flexShrink:0 }}>{l}</div>
            ))}
          </div>
        </div>
      </section>
      <div className="sec-line"/>

      <section style={{ padding:'clamp(60px,8vw,110px) 0', background:'#ffffff' }}>
        <div className="mc" style={{ marginBottom:44 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
            <div>
              <div className="pill rv"><span className="pill-d"/>Categories</div>
              <h2 className="rv d1" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.03em', lineHeight:1.1 }}>Every Industry.<br/>One Platform.</h2>
            </div>
            <p className="rv d2" style={{ fontSize:13, color:'#9ca3af', fontWeight:500, paddingBottom:6 }}>← Drag to explore →</p>
          </div>
        </div>
        <Drag>
          <div style={{ display:'flex', gap:18, paddingRight:96, paddingTop:4, paddingBottom:24 }}>
            {CATEGORIES.map((c,i)=>(
              <div key={c.name} className="sc rv" style={{ flexShrink:0, width:'clamp(210px,17vw,264px)', borderRadius:22, overflow:'hidden', background:'white', boxShadow:'0 4px 24px rgba(0,0,0,.07)', border:'1px solid #edf0f7', cursor:'pointer', transitionDelay:`${i*25}ms` }}>
                <div style={{ position:'relative', height:195, overflow:'hidden', background:'#f0f2f5' }}>
                  <img src={c.img} alt={c.name} className="ci" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.5) 0%,transparent 60%)' }}/>
                  <div style={{ position:'absolute', bottom:12, left:14, right:14 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:'white', lineHeight:1.3, textShadow:'0 1px 4px rgba(0,0,0,.4)' }}>{c.name}</p>
                  </div>
                </div>
                <div style={{ padding:'12px 16px 15px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Manufacturers</p>
                  <p style={{ fontSize:13, color:'#0064e0', fontWeight:800 }}>{c.count}</p>
                </div>
              </div>
            ))}
          </div>
        </Drag>
      </section>
      <div className="sec-line"/>

      <section id="how" style={{ padding:'clamp(60px,8vw,120px) 0', background:'#f7f9fc' }}>
        <div className="mc">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <div className="pill rv" style={{ margin:'0 auto 16px' }}><span className="pill-d"/>Process</div>
            <h2 className="rv d1" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.03em', lineHeight:1.1 }}>Four Steps to Zero<br/>Procurement Risk.</h2>
          </div>
          <ProcessStepper/>
        </div>
      </section>
      <div className="sec-line"/>

      <section style={{ padding:'clamp(60px,8vw,120px) 0', background:'#080f1e', position:'relative', overflow:'hidden' }}>
        <Particles color="#0064e0" count={28}/>
        <div className="mc" style={{ position:'relative', zIndex:2 }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="pill rv pill-dark" style={{ margin:'0 auto 16px' }}><span className="pill-d"/>Access</div>
            <h2 className="rv d1" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, color:'white', letterSpacing:'-.03em', lineHeight:1.1 }}>Built for Both Sides<br/>of the Transaction.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {[
              { label:'For Buyers',        title:'Post orders. Get the best manufacturer.', desc:'Review AI-scored bids, pay into escrow, track delivery in real time.',     img:'https://images.unsplash.com/photo-1664575602554-2087b04935a5?w=900&q=95&auto=format&fit=crop', cta:'Open Client Portal',       href:'https://nexabid-nexabid-client.vercel.app',       btn:'#0064e0', sh:'rgba(0,100,224,.28)' },
              { label:'For Manufacturers', title:'Browse orders. Win more business.',       desc:'Swipe through matching orders, bid with AI guidance, get paid on delivery.', img:'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=900&q=95&auto=format&fit=crop', cta:'Open Manufacturer Portal', href:'https://nexabid-nexabid-manufacturer.vercel.app', btn:'#1a7f37', sh:'rgba(26,127,55,.28)' },
              { label:'For Admins',        title:'Full visibility. Complete control.',       desc:'Manage users, resolve disputes, track payments and platform health.',         img:'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=95&auto=format&fit=crop', cta:'Admin Panel',             href:'https://nexabid-nexabid-admin.vercel.app',        btn:'#6e40c9', sh:'rgba(110,64,201,.28)' },
            ].map((p,i)=>(
              <div key={p.label} className={`pc rv d${i+1}`} style={{ borderRadius:22, overflow:'hidden', background:'#111827', border:'1px solid rgba(255,255,255,0.07)', boxShadow:`0 8px 40px ${p.sh}` }}>
                <div style={{ position:'relative', height:226, overflow:'hidden' }}>
                  <img src={p.img} alt={p.label} className="pi" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:.75 }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,#111827 0%,transparent 50%)' }}/>
                  <span style={{ position:'absolute', top:16, left:16, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.2em', color:'rgba(255,255,255,.5)' }}>{p.label}</span>
                </div>
                <div style={{ padding:'24px 28px 28px' }}>
                  <h3 style={{ fontSize:16, fontWeight:800, color:'white', letterSpacing:'-.1px', marginBottom:10 }}>{p.title}</h3>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.7, marginBottom:22 }}>{p.desc}</p>
                  <a href={p.href} target="_blank" style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:100, fontSize:13, fontWeight:700, color:'white', background:p.btn, textDecoration:'none', boxShadow:`0 4px 16px ${p.sh}` }}>{p.cta} →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding:'clamp(60px,8vw,120px) 0', background:'#ffffff' }}>
        <div className="mc">
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="pill rv" style={{ margin:'0 auto 16px' }}><span className="pill-d"/>Testimonials</div>
            <h2 className="rv d1" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.03em', lineHeight:1.1 }}>Trusted by India's Best<br/>Procurement Teams.</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className={`tc rv d${i+1}`} onClick={()=>setActiveTesti(i)}
                style={{ background:activeTesti===i?'#f0f4ff':'#f7f8fa', borderRadius:22, padding:'28px', border:`1.5px solid ${activeTesti===i?'rgba(0,100,224,.25)':'transparent'}`, boxShadow:activeTesti===i?'0 12px 48px rgba(0,100,224,.1)':'0 2px 12px rgba(0,0,0,.04)', cursor:'pointer' }}>
                <div style={{ display:'flex', gap:3, marginBottom:14 }}>{[...Array(5)].map((_,s)=><span key={s} style={{ color:'#f59e0b', fontSize:14 }}>★</span>)}</div>
                <p style={{ fontSize:15, color:'#1c1e21', lineHeight:1.75, marginBottom:22, fontWeight:500, fontStyle:'italic' }}>"{t.quote}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <img src={t.avatar} alt={t.name} style={{ width:44, height:44, borderRadius:'50%', objectFit:'cover', border:'2.5px solid white', boxShadow:'0 2px 10px rgba(0,0,0,.12)' }}/>
                  <div>
                    <p style={{ fontSize:14, fontWeight:700, color:'#1c1e21' }}>{t.name}</p>
                    <p style={{ fontSize:12, color:'#65676b', marginTop:2 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="sec-line"/>

      <section style={{ padding:'clamp(60px,7vw,100px) 0', background:'#f7f9fc' }}>
        <div className="mc" style={{ marginBottom:40 }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
            <div>
              <div className="pill rv"><span className="pill-d"/>Latest</div>
              <h2 className="rv d1" style={{ fontSize:'clamp(26px,3.5vw,44px)', fontWeight:800, color:'#1c1e21', letterSpacing:'-.03em', lineHeight:1.1 }}>News & Updates</h2>
            </div>
            <a href="#" className="rv d2" style={{ fontSize:13, fontWeight:700, color:'#0064e0', textDecoration:'none', paddingBottom:6, borderBottom:'1.5px solid rgba(0,100,224,0.3)' }}>View all articles →</a>
          </div>
        </div>
        <Drag>
          <div style={{ display:'flex', gap:20, paddingRight:96, paddingBottom:8, paddingTop:4 }}>
            {NEWS.map((n,i)=>(
              <div key={i} className={`nc rv d${i+1}`} style={{ flexShrink:0, width:'clamp(260px,22vw,320px)', background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,.07)', border:'1px solid #edf0f7' }}>
                <div style={{ position:'relative', height:196, overflow:'hidden', background:'#f0f2f5' }}>
                  <img src={n.img} alt="" className="ni" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.3),transparent 60%)' }}/>
                  <span style={{ position:'absolute', top:14, left:14, background:'#0064e0', color:'white', fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:100, textTransform:'uppercase', letterSpacing:'.12em' }}>{n.tag}</span>
                </div>
                <div style={{ padding:'20px 22px 22px' }}>
                  <p style={{ fontSize:14, fontWeight:700, color:'#1c1e21', lineHeight:1.5, marginBottom:14 }}>{n.title}</p>
                  <p style={{ fontSize:13, color:'#0064e0', fontWeight:700 }}>Read more →</p>
                </div>
              </div>
            ))}
          </div>
        </Drag>
      </section>

      <section style={{ padding:'clamp(72px,9vw,120px) 0', background:'#080f1e', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,100,224,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,100,224,0.07) 1px,transparent 1px)', backgroundSize:'52px 52px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:800, height:500, borderRadius:'50%', background:'radial-gradient(ellipse,rgba(0,100,224,0.22) 0%,transparent 65%)', pointerEvents:'none' }}/>
        <div className="mc" style={{ position:'relative', zIndex:2, textAlign:'center' }}>
          <div className="pill rv" style={{ margin:'0 auto 20px', background:'rgba(0,100,224,.15)', borderColor:'rgba(0,100,224,.35)' }}><span className="pill-d"/>Get Started Today</div>
          <h2 className="rv d1" style={{ fontSize:'clamp(30px,4.5vw,56px)', fontWeight:800, color:'white', letterSpacing:'-.03em', marginBottom:16, lineHeight:1.1 }}>Ready to Transform<br/>Your Procurement?</h2>
          <p className="rv d2" style={{ color:'rgba(255,255,255,.55)', fontSize:'clamp(15px,1.5vw,18px)', marginBottom:44, lineHeight:1.65 }}>Join 1,200+ manufacturers and 500+ corporate buyers already on NexaBid.</p>
          <div className="rv d3" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:14 }}>
            <a href="https://nexabid-nexabid-client.vercel.app/auth/register" target="_blank"
              style={{ padding:'15px 36px', background:'#0064e0', color:'white', fontSize:15, fontWeight:800, borderRadius:100, textDecoration:'none', boxShadow:'0 8px 32px rgba(0,100,224,.45)' }}>
              Post Your First Order — Free
            </a>
            <a href="https://nexabid-nexabid-manufacturer.vercel.app/auth/register" target="_blank"
              style={{ padding:'14px 34px', background:'transparent', border:'1.5px solid rgba(255,255,255,0.25)', color:'white', fontSize:15, fontWeight:600, borderRadius:100, textDecoration:'none', backdropFilter:'blur(12px)' }}>
              Register as Manufacturer
            </a>
          </div>
        </div>
      </section>

      <footer style={{ background:'#050a14', paddingTop:80, paddingBottom:32, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        <div className="mc">
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:60, marginBottom:64 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:20 }}>
                <div style={{ width:38, height:38, background:'#0064e0', borderRadius:11, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(0,100,224,.35)' }}>
                  <span style={{ color:'white', fontSize:13, fontWeight:800 }}>NB</span>
                </div>
                <span style={{ fontWeight:800, fontSize:17, color:'white', letterSpacing:'-.3px' }}>NexaBid</span>
              </div>
              <p style={{ color:'#6b7280', fontSize:13, lineHeight:1.75, maxWidth:280, marginBottom:28 }}>India's most trusted B2B manufacturing marketplace. AI-powered bidding, zero-risk escrow payments, pan-India coverage.</p>
              <div style={{ display:'flex', gap:10 }}>
                {['X','in','f','yt'].map(s=>(
                  <button key={s} style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.08)', color:'rgba(255,255,255,.4)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{s}</button>
                ))}
              </div>
            </div>
            {[
              { head:'Platform', links:['For Buyers','For Manufacturers','Pricing','AI Features','Escrow System','Order Tracking'] },
              { head:'Company',  links:['About Us','Careers','Blog','Press','Contact'] },
              { head:'Legal',    links:['Terms of Service','Privacy Policy','Cookie Policy','Refund Policy','Grievance Policy'] },
            ].map(col=>(
              <div key={col.head}>
                <p style={{ color:'white', fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'.18em', marginBottom:22 }}>{col.head}</p>
                <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:12 }}>
                  {col.links.map(item=>(
                    <li key={item}>
                      <a href="#" style={{ fontSize:13, color:'#6b7280', textDecoration:'none', transition:'color .2s' }}
                        onMouseEnter={e=>(e.currentTarget.style.color='white')}
                        onMouseLeave={e=>(e.currentTarget.style.color='#6b7280')}>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,.07)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ color:'#4b5563', fontSize:12 }}>© 2025 NexaBid Technologies Pvt. Ltd. · CIN: U74999MH2024PTC000001 · GST: 27AAAXX0000X1ZX</p>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span className="live-d"/>
              <span style={{ color:'#4b5563', fontSize:12 }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
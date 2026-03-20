// EmptyState.tsx — rich illustrated empty states for all pages

interface Props {
  type: 'orders' | 'bids' | 'payments' | 'notifications' | 'chat' | 'browse' | 'search'
  title?: string
  description?: string
  action?: React.ReactNode
}

const ILLUSTRATIONS = {
  orders: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <rect x="35" y="30" width="50" height="60" rx="6" fill="white" stroke="#E4E6EB" strokeWidth="2"/>
      <rect x="43" y="42" width="34" height="4" rx="2" fill="#D1D5DB"/>
      <rect x="43" y="52" width="24" height="4" rx="2" fill="#E5E7EB"/>
      <rect x="43" y="62" width="28" height="4" rx="2" fill="#E5E7EB"/>
      <rect x="43" y="72" width="20" height="4" rx="2" fill="#F3F4F6"/>
      <circle cx="80" cy="78" r="16" fill="#0064E0"/>
      <path d="M74 78h12M80 72v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  bids: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <path d="M30 80L50 55l15 15 15-20 10 10" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="80" r="4" fill="#E5E7EB"/>
      <circle cx="50" cy="55" r="4" fill="#E5E7EB"/>
      <circle cx="65" cy="70" r="4" fill="#E5E7EB"/>
      <circle cx="80" cy="50" r="4" fill="#E5E7EB"/>
      <circle cx="90" cy="60" r="4" fill="#E5E7EB"/>
      <rect x="52" y="30" width="36" height="20" rx="5" fill="white" stroke="#E4E6EB" strokeWidth="1.5"/>
      <rect x="58" y="37" width="8" height="3" rx="1.5" fill="#D1D5DB"/>
      <rect x="68" y="37" width="14" height="3" rx="1.5" fill="#E5E7EB"/>
      <rect x="58" y="43" width="18" height="3" rx="1.5" fill="#F3F4F6"/>
    </svg>
  ),
  payments: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <rect x="25" y="45" width="70" height="45" rx="8" fill="white" stroke="#E4E6EB" strokeWidth="2"/>
      <rect x="25" y="52" width="70" height="12" fill="#F0F2F5"/>
      <rect x="33" y="72" width="20" height="6" rx="3" fill="#E5E7EB"/>
      <rect x="33" y="82" width="14" height="4" rx="2" fill="#F3F4F6"/>
      <circle cx="82" cy="75" r="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5"/>
      <path d="M78 75l3 3 5-5" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="35" y="30" width="50" height="20" rx="6" fill="white" stroke="#E4E6EB" strokeWidth="1.5"/>
      <circle cx="45" cy="40" r="5" fill="#F0F2F5"/>
      <rect x="54" y="37" width="20" height="3" rx="1.5" fill="#D1D5DB"/>
      <rect x="54" y="43" width="12" height="3" rx="1.5" fill="#E5E7EB"/>
    </svg>
  ),
  notifications: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <path d="M60 28c-15 0-24 11-24 24v14l-6 8h60l-6-8V52c0-13-9-24-24-24z" fill="white" stroke="#E4E6EB" strokeWidth="2"/>
      <path d="M54 84c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="84" cy="36" r="8" fill="#10B981"/>
      <path d="M80 36l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chat: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <rect x="25" y="35" width="50" height="35" rx="10" fill="white" stroke="#E4E6EB" strokeWidth="2"/>
      <path d="M35 70l-8 10 10-4" fill="white" stroke="#E4E6EB" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="33" y="46" width="20" height="4" rx="2" fill="#D1D5DB"/>
      <rect x="33" y="54" width="30" height="4" rx="2" fill="#E5E7EB"/>
      <rect x="50" y="55" width="36" height="28" rx="8" fill="#0064E0" opacity="0.1" stroke="#0064E0" strokeWidth="1.5"/>
      <rect x="57" y="63" width="18" height="3" rx="1.5" fill="#0064E0" opacity="0.5"/>
      <rect x="57" y="70" width="12" height="3" rx="1.5" fill="#0064E0" opacity="0.3"/>
      <path d="M80 83l6 8-8-3" fill="#0064E0" opacity="0.15" stroke="#0064E0" strokeWidth="1.2" strokeOpacity="0.5" strokeLinejoin="round"/>
    </svg>
  ),
  browse: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <circle cx="55" cy="52" r="20" fill="white" stroke="#E4E6EB" strokeWidth="2.5"/>
      <path d="M70 67l14 14" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
      <path d="M49 52h12M55 46v12" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0F2F5"/>
      <circle cx="54" cy="50" r="18" fill="white" stroke="#D1D5DB" strokeWidth="2.5"/>
      <path d="M67 63l14 14" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round"/>
      <path d="M48 45l12 10-12 10" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const DEFAULTS = {
  orders:        { title: 'No orders yet',        description: "Post your first order and get competitive bids from verified manufacturers." },
  bids:          { title: 'No bids yet',           description: "Browse open orders and submit your first bid to start winning contracts." },
  payments:      { title: 'No payments yet',       description: "Payments appear here after you confirm a bid and pay into escrow." },
  notifications: { title: 'All caught up!',        description: "You have no new notifications. We'll let you know when something happens." },
  chat:          { title: 'No conversations yet',  description: "Messages with clients and manufacturers will appear here." },
  browse:        { title: 'No orders available',   description: "Check back soon — new orders are posted every day." },
  search:        { title: 'No results found',      description: "Try adjusting your search or clearing your filters." },
}

export default function EmptyState({ type, title, description, action }: Props) {
  const defaults = DEFAULTS[type]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-5 opacity-90">
        {ILLUSTRATIONS[type]}
      </div>
      <h3 className="text-base font-semibold text-[#1c1e21] mb-2">
        {title || defaults.title}
      </h3>
      <p className="text-sm text-[#65676b] max-w-xs leading-relaxed mb-5">
        {description || defaults.description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}

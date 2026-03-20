// EmptyStates.tsx — SVG illustration components for empty states

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

// Empty orders illustration
export function EmptyOrders({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-80">
        <rect x="20" y="15" width="80" height="90" rx="8" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <rect x="32" y="30" width="40" height="5" rx="2.5" fill="#d1d5db"/>
        <rect x="32" y="42" width="56" height="5" rx="2.5" fill="#e5e7eb"/>
        <rect x="32" y="54" width="48" height="5" rx="2.5" fill="#e5e7eb"/>
        <rect x="32" y="66" width="30" height="5" rx="2.5" fill="#e5e7eb"/>
        <circle cx="85" cy="85" r="20" fill="#0a0a0a"/>
        <path d="M85 77v8M85 89v2" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}

// Empty bids illustration
export function EmptyBids({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-80">
        <circle cx="60" cy="50" r="32" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <path d="M48 50l8 8 16-16" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="25" y="80" width="70" height="8" rx="4" fill="#e5e7eb"/>
        <rect x="35" y="93" width="50" height="6" rx="3" fill="#f3f4f6"/>
      </svg>
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}

// Empty payments illustration
export function EmptyPayments({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-80">
        <rect x="15" y="35" width="90" height="58" rx="8" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <rect x="15" y="48" width="90" height="12" fill="#e5e7eb"/>
        <rect x="26" y="68" width="24" height="5" rx="2.5" fill="#d1d5db"/>
        <rect x="26" y="78" width="16" height="4" rx="2" fill="#e5e7eb"/>
        <rect x="74" y="65" width="20" height="10" rx="3" fill="#0a0a0a" opacity="0.15"/>
        <circle cx="89" cy="38" r="14" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
        <path d="M89 32v6l3 3" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-5 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}

// Empty notifications
export function EmptyNotifications({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-80">
        <path d="M60 20c-18 0-30 13-30 30v20l-8 12h76l-8-12V50c0-17-12-30-30-30z" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <path d="M54 98c0 3.3 2.7 6 6 6s6-2.7 6-6" stroke="#d1d5db" strokeWidth="2" fill="none"/>
        <circle cx="85" cy="32" r="10" fill="#0a0a0a" opacity="0.08"/>
        <circle cx="85" cy="32" r="5" fill="#e5e7eb"/>
      </svg>
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
    </div>
  )
}

// Empty chat
export function EmptyChat({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mb-6 opacity-80">
        <rect x="15" y="20" width="65" height="48" rx="10" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
        <rect x="27" y="34" width="41" height="5" rx="2.5" fill="#d1d5db"/>
        <rect x="27" y="44" width="30" height="5" rx="2.5" fill="#e5e7eb"/>
        <path d="M20 68l8 10h52l-8-10" fill="#f3f4f6"/>
        <rect x="40" y="52" width="65" height="40" rx="10" fill="white" stroke="#e5e7eb" strokeWidth="2"/>
        <rect x="52" y="64" width="41" height="5" rx="2.5" fill="#e5e7eb"/>
        <rect x="52" y="74" width="28" height="5" rx="2.5" fill="#f3f4f6"/>
      </svg>
      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
    </div>
  )
}

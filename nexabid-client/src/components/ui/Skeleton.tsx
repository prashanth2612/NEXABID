import { cn } from '@/lib/utils'

// Base shimmer skeleton block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn(
      'animate-pulse rounded-lg bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%]',
      className
    )}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  )
}

// Stat card skeleton (4-up grid)
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
        <div className="flex items-end gap-0.5 h-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-3 rounded-sm bg-gray-100 animate-pulse"
              style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
        </div>
      </div>
      <Skeleton className="h-7 w-20 mb-1" />
      <Skeleton className="h-3 w-24 mb-0.5" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

// Order / bid list row skeleton
export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
      <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="w-5 h-5 rounded" />
    </div>
  )
}

// Order detail header skeleton
export function OrderDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <Skeleton className="h-5 w-32" />
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton className="w-11 h-11 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Full page loading (dashboard)
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <Skeleton className="h-4 w-32" />
        </div>
        {[...Array(4)].map((_, i) => <ListRowSkeleton key={i} />)}
      </div>
    </div>
  )
}

// Inject shimmer keyframes into document
if (typeof document !== 'undefined') {
  const id = 'skeleton-shimmer-style'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `
    document.head.appendChild(style)
  }
}

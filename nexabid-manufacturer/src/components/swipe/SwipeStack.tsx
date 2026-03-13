import { useState } from 'react'
import { CheckCircle2, XCircle, Keyboard, RotateCcw } from 'lucide-react'
import SwipeCard from './SwipeCard'
import type { SwipeOrder } from '@/types/orders'

interface SwipeStackProps {
  orders: SwipeOrder[]
  onAccept: (order: SwipeOrder) => void
  onReject: (order: SwipeOrder) => void
}

export default function SwipeStack({ orders: initialOrders, onAccept, onReject }: SwipeStackProps) {
  const [queue, setQueue] = useState<SwipeOrder[]>(initialOrders)
  const [lastAction, setLastAction] = useState<{ order: SwipeOrder; action: 'accept' | 'reject' } | null>(null)
  const [accepted, setAccepted] = useState(0)
  const [rejected, setRejected] = useState(0)

  const handleSwipe = (id: string, action: 'accept' | 'reject') => {
    const order = queue.find((o) => o.id === id)
    if (!order) return

    setLastAction({ order, action })

    if (action === 'accept') {
      setAccepted((p) => p + 1)
      onAccept(order)
    } else {
      setRejected((p) => p + 1)
      onReject(order)
    }

    setQueue((prev) => prev.filter((o) => o.id !== id))
  }

  const visible = queue.slice(0, 3)
  const isEmpty = queue.length === 0

  return (
    <div className="flex flex-col items-center w-full">
      {/* Session stats */}
      <div className="flex items-center gap-6 mb-6 text-sm">
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 size={15} />
          <span className="font-semibold">{accepted}</span>
          <span className="text-gray-400">accepted</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2 text-red-500">
          <XCircle size={15} />
          <span className="font-semibold">{rejected}</span>
          <span className="text-gray-400">rejected</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="text-gray-400">
          <span className="font-semibold text-gray-600">{queue.length}</span> remaining
        </div>
      </div>

      {/* Card stack */}
      <div className="relative w-[360px] h-[560px]">
        {isEmpty ? (
          <EmptyState lastAction={lastAction} onReset={() => { /* connect to API */ }} />
        ) : (
          visible.map((order, i) => (
            <SwipeCard
              key={order.id}
              order={order}
              onSwipe={handleSwipe}
              stackIndex={i}
              totalInStack={visible.length}
            />
          ))
        )}
      </div>

      {/* Keyboard hint */}
      {!isEmpty && (
        <div className="mt-6 flex items-center gap-1.5 text-xs text-gray-400">
          <Keyboard size={13} />
          <span>Use</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">←</kbd>
          <span>to reject,</span>
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">→</kbd>
          <span>to accept</span>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  lastAction,
  onReset,
}: {
  lastAction: { order: SwipeOrder; action: 'accept' | 'reject' } | null
  onReset: () => void
}) {
  return (
    <div className="w-full h-full bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center p-8 shadow-sm">
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <CheckCircle2 size={28} className="text-gray-400" />
      </div>
      <p className="text-lg font-bold text-[#0A0A0A] mb-2">You're all caught up!</p>
      <p className="text-gray-400 text-sm mb-6 leading-relaxed">
        No more orders in the queue right now. New orders appear as clients post them.
      </p>
      {lastAction && (
        <p className="text-xs text-gray-400 mb-4">
          Last{' '}
          <span
            className={
              lastAction.action === 'accept' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'
            }
          >
            {lastAction.action}ed
          </span>{' '}
          — {lastAction.order.title}
        </p>
      )}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors"
      >
        <RotateCcw size={14} />
        Refresh Queue
      </button>
    </div>
  )
}

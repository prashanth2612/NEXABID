import { useState, useRef, useCallback, useEffect } from 'react'
import {
  CheckCircle2, XCircle, MapPin, Calendar,
  IndianRupee, Package, Star, ShieldCheck,
  Zap, Layers, Clock,
} from 'lucide-react'
import type { SwipeOrder } from '@/types/orders'
import { CATEGORY_COLORS } from '@/types/orders'
import { cn } from '@/lib/utils'

interface SwipeCardProps {
  order: SwipeOrder
  onSwipe: (id: string, action: 'accept' | 'reject') => void
  stackIndex: number       // 0 = top, 1 = second, 2 = third
  totalInStack: number
}

const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

export default function SwipeCard({ order, onSwipe, stackIndex }: SwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const startX = useRef(0)
  const startY = useRef(0)
  const isDragging = useRef(false)

  const THRESHOLD = 90

  // How far swipe goes as a 0–1 ratio
  const ratio = Math.min(Math.abs(offsetX) / THRESHOLD, 1)
  const isGoingRight = offsetX > 0
  const isGoingLeft = offsetX < 0
  const showAccept = isGoingRight && ratio > 0.2
  const showReject = isGoingLeft && ratio > 0.2

  const triggerSwipe = useCallback(
    (direction: 'accept' | 'reject') => {
      if (!cardRef.current) return
      const flyX = direction === 'accept' ? 600 : -600
      cardRef.current.style.transition = 'transform 0.35s ease, opacity 0.35s ease'
      cardRef.current.style.transform = `translateX(${flyX}px) rotate(${direction === 'accept' ? 20 : -20}deg)`
      cardRef.current.style.opacity = '0'
      setTimeout(() => onSwipe(order.id, direction), 340)
    },
    [onSwipe, order.id]
  )

  // Pointer events (works for both mouse + touch)
  const onPointerDown = (e: React.PointerEvent) => {
    if (stackIndex !== 0) return
    isDragging.current = true
    setDragging(true)
    startX.current = e.clientX
    startY.current = e.clientY
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || stackIndex !== 0) return
    setOffsetX(e.clientX - startX.current)
    setOffsetY((e.clientY - startY.current) * 0.2)
  }

  const onPointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    setDragging(false)

    if (offsetX > THRESHOLD) {
      triggerSwipe('accept')
    } else if (offsetX < -THRESHOLD) {
      triggerSwipe('reject')
    } else {
      // Snap back
      setOffsetX(0)
      setOffsetY(0)
    }
  }

  // Keyboard support
  useEffect(() => {
    if (stackIndex !== 0) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') triggerSwipe('accept')
      if (e.key === 'ArrowLeft') triggerSwipe('reject')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [stackIndex, triggerSwipe])

  // Stack visual offsets
  const stackY = stackIndex * 10
  const stackScale = 1 - stackIndex * 0.04
  const stackZ = 10 - stackIndex

  const rotation = stackIndex === 0 ? (offsetX / 20) : 0
  const cardTransform =
    stackIndex === 0
      ? `translateX(${offsetX}px) translateY(${offsetY + stackY}px) rotate(${rotation}deg) scale(${stackScale})`
      : `translateY(${stackY}px) scale(${stackScale})`

  const categoryColor = CATEGORY_COLORS[order.category] || '#6b7280'

  return (
    <div
      ref={cardRef}
      className={cn(
        'absolute w-full select-none',
        stackIndex === 0 ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      )}
      style={{
        transform: cardTransform,
        zIndex: stackZ,
        transition: dragging ? 'none' : 'transform 0.3s ease',
        willChange: 'transform',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">

        {/* Accept overlay */}
        <div
          className="absolute inset-0 bg-green-500/20 backdrop-blur-[1px] rounded-3xl z-20 flex items-center justify-center transition-opacity pointer-events-none"
          style={{ opacity: showAccept ? ratio : 0 }}
        >
          <div className="bg-green-500 text-white rounded-2xl px-8 py-4 flex items-center gap-3 shadow-lg -rotate-12">
            <CheckCircle2 size={28} strokeWidth={2.5} />
            <span className="text-2xl font-bold tracking-tight">ACCEPT</span>
          </div>
        </div>

        {/* Reject overlay */}
        <div
          className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px] rounded-3xl z-20 flex items-center justify-center transition-opacity pointer-events-none"
          style={{ opacity: showReject ? ratio : 0 }}
        >
          <div className="bg-red-500 text-white rounded-2xl px-8 py-4 flex items-center gap-3 shadow-lg rotate-12">
            <XCircle size={28} strokeWidth={2.5} />
            <span className="text-2xl font-bold tracking-tight">REJECT</span>
          </div>
        </div>

        {/* Card header — colored category bar */}
        <div
          className="h-[140px] relative flex flex-col justify-between p-5"
          style={{ background: `linear-gradient(135deg, ${categoryColor}22, ${categoryColor}44)` }}
        >
          {/* Top badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {order.isNew && (
                <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  New
                </span>
              )}
              {order.isUrgent && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Zap size={9} />
                  Urgent
                </span>
              )}
              {order.isBulk && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  <Layers size={9} />
                  Bulk
                </span>
              )}
            </div>
            {order.clientVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                <ShieldCheck size={10} />
                Verified
              </span>
            )}
          </div>

          {/* Category pill */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${categoryColor}33` }}
            >
              <Package size={15} style={{ color: categoryColor }} />
            </div>
            <span className="text-sm font-semibold" style={{ color: categoryColor }}>
              {order.category}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-5 space-y-4">
          {/* Client info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gray-600">
                {order.clientName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-[#0A0A0A]">{order.clientName}</p>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-0.5">
                  <Star size={11} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xs text-gray-500">{order.clientRating}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400">{order.clientCompany}</p>
            </div>
            <p className="ml-auto text-xs text-gray-400">{order.orderNumber}</p>
          </div>

          {/* Title */}
          <p className="text-base font-bold text-[#0A0A0A] leading-tight">{order.title}</p>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Quantity</p>
              <p className="text-base font-bold text-[#0A0A0A]">{order.quantity.toLocaleString()}</p>
              <p className="text-[10px] text-gray-400">{order.unit}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Value</p>
              <p className="text-sm font-bold text-green-600">
                {order.isFixedPrice
                  ? formatCurrency(order.fixedPrice!)
                  : formatCurrency(order.budgetMax!)}
              </p>
              <p className="text-[10px] text-gray-400">
                {order.isFixedPrice ? 'Fixed' : 'Max budget'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Due Date</p>
              <p className="text-sm font-bold text-[#0A0A0A]">{formatDate(order.deliveryDate)}</p>
              <p className="text-[10px] text-gray-400">{order.deliveryDays} days</p>
            </div>
          </div>

          {/* Location + time */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {order.deliveryLocation}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {new Date(order.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Special notes */}
          {order.specialNotes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                💬 {order.specialNotes}
              </p>
            </div>
          )}

          {/* Budget range bar */}
          {!order.isFixedPrice && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-0.5">
                <IndianRupee size={10} />
                {formatCurrency(order.budgetMin!)}
              </span>
              <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 rounded-full w-3/4" />
              </div>
              <span className="text-green-600 font-semibold flex items-center gap-0.5">
                <IndianRupee size={10} />
                {formatCurrency(order.budgetMax!)}
              </span>
            </div>
          )}

          {/* Price type badge */}
          {order.isFixedPrice && (
            <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-xl border border-green-100">
              <IndianRupee size={13} className="text-green-600" />
              <span className="text-sm font-bold text-green-600">
                {formatCurrency(order.fixedPrice!)} — Fixed Price
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); triggerSwipe('reject') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors border border-red-100"
          >
            <XCircle size={16} />
            Reject
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); triggerSwipe('accept') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#0A0A0A] text-white font-semibold text-sm hover:bg-[#1a1a1a] transition-colors"
          >
            <CheckCircle2 size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

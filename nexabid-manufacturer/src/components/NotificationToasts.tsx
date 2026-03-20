import { useEffect, useState, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { Bell, X, TrendingUp, Package, IndianRupee, MessageSquare, CheckCircle2, Truck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ToastNotif {
  id: string
  title: string
  body: string
  link?: string
  type: string
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  bid_received:     TrendingUp,
  bid_accepted:     CheckCircle2,
  bid_rejected:     X,
  order_confirmed:  Package,
  order_update:     Truck,
  payment_escrowed: IndianRupee,
  payment_released: IndianRupee,
  new_message:      MessageSquare,
  rating:           Star,
}

const TYPE_COLORS: Record<string, string> = {
  bid_received:     'bg-blue-500',
  bid_accepted:     'bg-green-500',
  bid_rejected:     'bg-red-500',
  order_confirmed:  'bg-purple-500',
  order_update:     'bg-indigo-500',
  payment_escrowed: 'bg-emerald-500',
  payment_released: 'bg-green-600',
  new_message:      'bg-orange-500',
  rating:           'bg-yellow-500',
}

function Toast({ notif, onClose }: { notif: ToastNotif; onClose: () => void }) {
  const Icon = TYPE_ICONS[notif.type] || Bell
  const color = TYPE_COLORS[notif.type] || 'bg-gray-700'

  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  const content = (
    <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={14} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">{notif.title}</p>
        <p className="text-xs text-white/70 mt-0.5 line-clamp-2">{notif.body}</p>
      </div>
    </div>
  )

  return (
    <div className="flex items-start gap-2 bg-[#1c1e21] border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40 w-80 backdrop-blur-md"
      style={{ animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
      {notif.link ? (
        <Link to={notif.link} className="flex-1 min-w-0" onClick={onClose}>{content}</Link>
      ) : (
        <div className="flex-1 min-w-0">{content}</div>
      )}
      <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors flex-shrink-0 mt-0.5">
        <X size={14} />
      </button>
    </div>
  )
}

export default function NotificationToasts() {
  const [toasts, setToasts] = useState<ToastNotif[]>([])
  const socket = useSocket()

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    if (!socket) return
    const handler = (notif: any) => {
      const toast: ToastNotif = {
        id: notif._id || notif.id || String(Date.now()),
        title: notif.title,
        body: notif.body,
        link: notif.link,
        type: notif.type,
        createdAt: notif.createdAt || new Date().toISOString(),
      }
      setToasts(prev => [toast, ...prev].slice(0, 5))
    }
    socket.on('notification', handler)
    return () => { socket.off('notification', handler) }
  }, [socket])

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(100%) scale(0.9); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <Toast key={t.id} notif={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </>
  )
}

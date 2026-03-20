import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, Loader2, TrendingUp, Package,
  IndianRupee, MessageSquare, Truck, CheckCircle2,
  Star, AlertTriangle, Trash2,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  bid_received:     { icon: TrendingUp,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  order_confirmed:  { icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
  payment_escrowed: { icon: IndianRupee,   color: 'text-purple-600', bg: 'bg-purple-50' },
  payment_released: { icon: IndianRupee,   color: 'text-green-600',  bg: 'bg-green-50' },
  new_message:      { icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
  order_update:     { icon: Truck,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
  bid_accepted:     { icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50' },
  bid_rejected:     { icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50' },
  rating:           { icon: Star,          color: 'text-yellow-500', bg: 'bg-yellow-50' },
  default:          { icon: Bell,          color: 'text-gray-500',   bg: 'bg-gray-100' },
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days === 1) return 'Yesterday'
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/chat/notifications')
      setNotifications(res.data.data.notifications || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.patch('/chat/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) { console.error(e) }
    finally { setMarkingAll(false) }
  }

  const markRead = async (id: string) => {
    try {
      await api.patch(`/chat/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch {}
  }

  const handleClick = (notif: Notification) => {
    if (!notif.read) markRead(notif.id)
    if (notif.link) navigate(notif.link)
  }

  const unread = notifications.filter(n => !n.read).length

  // Group by date
  const groups: Record<string, Notification[]> = {}
  notifications.forEach(n => {
    const date = new Date(n.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    let key = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    if (date.toDateString() === today.toDateString()) key = 'Today'
    else if (date.toDateString() === yesterday.toDateString()) key = 'Yesterday'
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  })

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Notifications</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {unread > 0 ? <span className="text-blue-600 font-medium">{unread} unread</span> : 'All caught up'}
            {notifications.length > 0 && ` · ${notifications.length} total`}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} disabled={markingAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:border-gray-300 hover:text-black transition-all disabled:opacity-50">
            {markingAll ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
            <Bell size={22} className="text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm">No notifications yet</p>
          <p className="text-gray-400 text-xs mt-1">We'll notify you when something happens</p>
        </div>
      ) : (
        Object.entries(groups).map(([dateLabel, items]) => (
          <div key={dateLabel} className="space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-2">{dateLabel}</p>
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {items.map((notif, i) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.default
                const Icon = cfg.icon
                return (
                  <button key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={cn(
                      'w-full flex items-start gap-4 px-5 py-4 text-left transition-colors',
                      i !== 0 && 'border-t border-gray-50',
                      !notif.read ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50/50'
                    )}>
                    {/* Icon */}
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
                      <Icon size={16} className={cfg.color} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !notif.read ? 'font-semibold text-[#0A0A0A]' : 'font-medium text-gray-700')}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{notif.body}</p>
                    </div>
                    {/* Time + unread dot */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

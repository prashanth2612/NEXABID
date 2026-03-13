import { useEffect, useState, useRef } from 'react'
import { Bell, Search, CheckCheck, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { getSocket, disconnectSocket } from '@/lib/socket'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard', '/orders': 'My Orders',
  '/orders/create': 'Post New Order', '/chat': 'Messages',
  '/payments': 'Payments', '/profile': 'Profile', '/settings': 'Settings',
}

const notifIcon: Record<string, string> = {
  bid_received: '💰', bid_accepted: '🎉', bid_rejected: '❌',
  order_confirmed: '✅', payment_released: '💸', payment_escrowed: '🔒',
  new_message: '💬', system: '🔔',
}

export default function Topbar() {
  const { user, token } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [showPanel, setShowPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const getTitle = () => {
    if (location.pathname.startsWith('/orders/') && location.pathname !== '/orders/create') return 'Order Details'
    if (location.pathname.startsWith('/chat/')) return 'Chat'
    return pageTitles[location.pathname] || 'NexaBid'
  }

  const loadNotifications = async () => {
    try {
      const res = await api.get('/chat/notifications')
      setNotifications(res.data.data.notifications)
      setUnread(res.data.data.unreadCount)
    } catch { }
  }

  useEffect(() => {
    if (!token) return
    loadNotifications()
    const socket = getSocket(token)
    socket.on('notification', (n: Notification) => {
      setNotifications((prev) => [n, ...prev].slice(0, 30))
      setUnread((c) => c + 1)
    })
    return () => { socket.off('notification') }
  }, [token])

  useEffect(() => { if (!user) disconnectSocket() }, [user])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await api.patch('/chat/notifications/read-all').catch(() => {})
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnread(0)
  }

  const markRead = async (id: string, link?: string) => {
    await api.patch(`/chat/notifications/${id}/read`).catch(() => {})
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    setUnread((c) => Math.max(0, c - 1))
    if (link) navigate(link)
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <h1 className="text-base font-semibold text-[#0A0A0A] tracking-tight">{getTitle()}</h1>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <Search size={17} />
        </button>
        <div ref={panelRef} className="relative">
          <button onClick={() => setShowPanel(!showPanel)}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showPanel && (
            <div className="absolute right-0 top-11 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  Notifications {unread > 0 && <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">{unread}</span>}
                </p>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors">
                      <CheckCheck size={12} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowPanel(false)} className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                    <X size={12} />
                  </button>
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <Bell size={24} className="text-gray-300 mb-2" />
                    <p className="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                ) : notifications.map((n) => (
                  <div key={n.id} onClick={() => { markRead(n.id); setShowPanel(false) }}
                    className={cn('flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50/80 transition-colors', !n.isRead && 'bg-blue-50/40')}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5">{notifIcon[n.type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !n.isRead ? 'font-semibold text-[#0A0A0A]' : 'text-gray-700')}>{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.body}</p>
                      <p className="text-[10px] text-gray-300 mt-1">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex items-center justify-center ml-1 cursor-pointer">
          <span className="text-white text-xs font-semibold">{user?.fullName?.charAt(0).toUpperCase()}</span>
        </div>
      </div>
    </header>
  )
}

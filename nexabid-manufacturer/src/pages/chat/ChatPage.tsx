import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Send, MessageSquare, Loader2, Package, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getSocket } from '@/lib/socket'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderRole: 'client' | 'manufacturer'
  senderId: { id: string; fullName: string }
  createdAt: string
}

interface Thread {
  order: { id: string; title: string; orderNumber: string; status: string }
  lastMessage: Message | null
  unreadCount: number
}

export default function ChatPage() {
  const { orderId } = useParams<{ orderId?: string }>()
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const [threads, setThreads] = useState<Thread[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [otherTyping, setOtherTyping] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [loadingThreads, setLoadingThreads] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingRef = useRef(false)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const joinedRoom = useRef<string | null>(null)

  const scrollBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
  }, [])

  const [directOrder, setDirectOrder] = useState<{id:string;title:string;orderNumber:string;status:string}|null>(null)

  const loadThreads = useCallback(() => {
    api.get('/chat/threads')
      .then((r) => setThreads(r.data.data.threads || []))
      .catch(console.error)
      .finally(() => setLoadingThreads(false))
  }, [])

  useEffect(() => { loadThreads() }, [loadThreads])

  // If orderId is in URL but not in threads (e.g. opened from notification), load order directly
  useEffect(() => {
    if (!orderId) return
    api.get(`/orders/${orderId}`)
      .then((r) => setDirectOrder(r.data.data.order))
      .catch(() => {})
  }, [orderId])

  // Socket: join room + listen
  useEffect(() => {
    if (!token) return
    const socket = getSocket(token)

    // Always clean up old listeners first
    socket.off('chat:history')
    socket.off('chat:message')
    socket.off('chat:typing')

    if (!orderId) return

    // Leave old room if different
    if (joinedRoom.current && joinedRoom.current !== orderId) {
      socket.emit('chat:leave', joinedRoom.current)
    }
    joinedRoom.current = orderId
    setMessages([])
    setLoadingMsgs(true)

    socket.on('chat:history', (msgs: Message[]) => {
      setMessages(msgs)
      setLoadingMsgs(false)
      scrollBottom()
    })

    socket.on('chat:message', (msg: Message) => {
      setMessages((prev) => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      setOtherTyping(false)
      scrollBottom()
      loadThreads()
    })

    socket.on('chat:typing', ({ isTyping }: { isTyping: boolean }) => {
      setOtherTyping(isTyping)
    })

    // Join triggers chat:history response from server
    socket.emit('chat:join', orderId)

    return () => {
      socket.off('chat:history')
      socket.off('chat:message')
      socket.off('chat:typing')
    }
  }, [orderId, token, scrollBottom, loadThreads])

  const handleSend = () => {
    if (!text.trim() || !orderId || !token) return
    const socket = getSocket(token)
    socket.emit('chat:send', { orderId, content: text.trim() })
    setText('')
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingRef.current = false
    socket.emit('chat:typing', { orderId, isTyping: false })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = (value: string) => {
    setText(value)
    if (!orderId || !token) return
    const socket = getSocket(token)
    if (!typingRef.current) {
      typingRef.current = true
      socket.emit('chat:typing', { orderId, isTyping: true })
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      typingRef.current = false
      socket.emit('chat:typing', { orderId, isTyping: false })
    }, 1500)
  }

  const activeThread = threads.find(t => t.order.id === orderId) || 
    (directOrder ? { order: directOrder, lastMessage: null, unreadCount: 0 } : null)

  return (
    // Full height, no overflow on outer container
    <div className="flex h-full bg-gray-50">

      {/* Thread list — fixed width sidebar */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-[#0A0A0A]">Messages</span>
          {loadingThreads && <Loader2 size={13} className="animate-spin text-gray-400" />}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!loadingThreads && threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare size={28} className="text-gray-300 mb-3" />
              <p className="text-gray-600 text-sm font-medium">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Chat opens once your bid is accepted
              </p>
              <button
                onClick={() => navigate('/orders')}
                className="mt-4 px-4 py-2 bg-[#0A0A0A] text-white rounded-xl text-xs font-semibold hover:bg-[#1a1a1a] transition-colors"
              >
                Go to Orders
              </button>
            </div>
          ) : (
            threads.map(t => (
              <Link
                key={t.order.id}
                to={`/chat/${t.order.id}`}
                className={cn(
                  'flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                  orderId === t.order.id && 'bg-blue-50/50 border-l-2 border-l-[#0A0A0A]'
                )}
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package size={14} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#0A0A0A] truncate">{t.order.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {t.lastMessage
                      ? (t.lastMessage.senderRole === 'client' ? 'You: ' : '') + t.lastMessage.content
                      : t.order.orderNumber}
                  </p>
                </div>
                {t.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    {t.unreadCount}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {!orderId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-white rounded-2xl border border-gray-100 flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-semibold mb-1">Select a conversation</p>
            <p className="text-gray-400 text-sm">Pick an order from the left to open the chat</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
              <Link to="/chat" className="text-gray-400 hover:text-gray-700 transition-colors">
                <ArrowLeft size={16} />
              </Link>
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Package size={13} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] truncate">
                  {activeThread?.order.title || '...'}
                </p>
                <p className="text-xs text-gray-400">{activeThread?.order.orderNumber}</p>
              </div>
              {activeThread && (
                <Link
                  to={`/orders/${activeThread.order.id}`}
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  View Order →
                </Link>
              )}
            </div>

            {/* Messages — flex-1 + overflow-y-auto keeps input pinned to bottom */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={22} className="animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                  <p className="text-gray-400 text-sm">No messages yet — say hello!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderRole === 'manufacturer'
                  return (
                    <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2.5',
                        isMe
                          ? 'bg-[#0A0A0A] text-white rounded-br-sm'
                          : 'bg-white text-[#0A0A0A] border border-gray-100 rounded-bl-sm shadow-sm'
                      )}>
                        {!isMe && (
                          <p className="text-[10px] font-semibold mb-1 text-gray-400">
                            {msg.senderId?.fullName || 'Client'}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                        <p className={cn('text-[10px] mt-1', isMe ? 'text-white/40 text-right' : 'text-gray-300')}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}

              {otherTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input — always visible at bottom */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-2 flex-shrink-0">
              <textarea
                value={text}
                onChange={e => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Enter to send)"
                rows={1}
                className="flex-1 resize-none px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim()}
                className="w-11 h-11 flex-shrink-0 bg-[#0A0A0A] text-white rounded-2xl flex items-center justify-center hover:bg-[#1a1a1a] disabled:opacity-30 transition-all"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

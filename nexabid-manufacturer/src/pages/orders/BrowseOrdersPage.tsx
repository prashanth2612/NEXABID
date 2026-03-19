import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Package, SlidersHorizontal, X, Loader2, Sparkles } from 'lucide-react'
import SwipeStack from '@/components/swipe/SwipeStack'
import { useCategoryStore, ALL_CATEGORIES, CATEGORY_META, type Category } from '@/store/categoryStore'
import type { SwipeOrder } from '@/types/orders'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

interface RankedOrder extends SwipeOrder { matchScore: number; matchReason: string }

export default function BrowseOrdersPage() {
  const navigate = useNavigate()
  const { manufacturer } = useAuthStore()
  const { selected, toggle, confirm } = useCategoryStore()
  const [orders, setOrders] = useState<SwipeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptedOrders, setAcceptedOrders] = useState<SwipeOrder[]>([])
  const [justAccepted, setJustAccepted] = useState<SwipeOrder | null>(null)
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [browseTab, setBrowseTab] = useState<'swipe' | 'foryou'>('swipe')
  const [recommended, setRecommended] = useState<RankedOrder[]>([])
  const [recLoading, setRecLoading] = useState(false)
  const [recGenerated, setRecGenerated] = useState(false)

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = selected.length > 0 ? `?categories=${selected.join(',')}` : ''
      const res = await api.get(`/orders/swipe-stack${params}`)
      // Map backend order shape to SwipeOrder shape
      const mapped: SwipeOrder[] = res.data.data.orders.map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        title: o.title,
        category: o.category,
        clientName: o.clientId?.fullName || 'Client',
        clientCompany: o.clientId?.companyName || '',
        clientRating: o.clientId?.rating || 0,
        clientVerified: o.clientId?.isVerified || false,
        quantity: o.quantity,
        unit: o.unit,
        isFixedPrice: o.isFixedPrice,
        fixedPrice: o.fixedPrice,
        budgetMin: o.budgetMin,
        budgetMax: o.budgetMax,
        deliveryDate: o.deliveryDate,
        deliveryDays: Math.max(0, Math.ceil((new Date(o.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) - 3), // minus 3 days transit
        deliveryLocation: o.deliveryLocation,
        specialNotes: o.specialNotes,
        isNew: (Date.now() - new Date(o.createdAt).getTime()) < 48 * 60 * 60 * 1000,
        isUrgent: Math.ceil((new Date(o.deliveryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 7,
        isBulk: o.quantity >= 500,
        postedAt: o.createdAt,
      }))
      setOrders(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [selected.join(',')])

  useEffect(() => { loadOrders() }, [selected.join(',')])

  const generateRecommendations = async () => {
    if (orders.length === 0 || recGenerated) return
    setRecLoading(true)
    try {
      const mfrCategories = manufacturer?.categories?.join(', ') || selected.join(', ') || 'General manufacturing'
      const mfrName = manufacturer?.businessName || manufacturer?.fullName || 'Manufacturer'
      const orderList = orders.slice(0, 12).map((o, i) =>
        `${i + 1}. ID:${o.id} | "${o.title}" | Category:${o.category} | Budget:${o.isFixedPrice ? `₹${o.fixedPrice} fixed` : `₹${o.budgetMin}-₹${o.budgetMax}`} | Qty:${o.quantity} ${o.unit} | Delivery:${o.deliveryDays}d | Urgent:${o.isUrgent} | Bulk:${o.isBulk}`
      ).join('\n')

      const prompt = `You are a smart manufacturing order matching AI for NexaBid.

Manufacturer: ${mfrName}
Specialization: ${mfrCategories}

Available orders:
${orderList}

Rank the TOP 5 orders best suited for this manufacturer. Return ONLY JSON array, no markdown:
[{"id":"order_id","matchScore":85,"matchReason":"Short reason why this is a good match"}]
matchScore is 0-100. Sort by matchScore descending.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text?.trim()
      if (text) {
        const ranked: { id: string; matchScore: number; matchReason: string }[] = JSON.parse(text.replace(/```json|```/g, '').trim())
        const enriched: RankedOrder[] = ranked
          .map(r => {
            const order = orders.find(o => o.id === r.id)
            if (!order) return null
            return { ...order, matchScore: r.matchScore, matchReason: r.matchReason }
          })
          .filter(Boolean) as RankedOrder[]
        setRecommended(enriched)
        setRecGenerated(true)
      }
    } catch { /* silent fail */ }
    finally { setRecLoading(false) }
  }

  // Keyboard shortcuts: ArrowRight = accept, ArrowLeft = reject
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!orders.length) return
      const top = orders[orders.length - 1]
      if (e.key === 'ArrowRight') { e.preventDefault(); handleAccept(top) }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); handleReject(top) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [orders])

  const handleAccept = (order: SwipeOrder) => {
    setAcceptedOrders((prev) => [order, ...prev])
    setJustAccepted(order)
    // Record swipe interest
    api.post(`/orders/${order.id}/swipe`, { action: 'accept' }).catch(console.error)
    // Navigate to order detail to submit bid after short delay
    setTimeout(() => {
      navigate(`/orders/${order.id}`)
    }, 600)
  }

  const handleReject = (order: SwipeOrder) => {
    api.post(`/orders/${order.id}/swipe`, { action: 'reject' }).catch(console.error)
  }

  const handleApplyFilter = () => {
    confirm()
    setShowFilterPanel(false)
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Browse Orders</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading...' : `${orders.length} orders available · `}
            {selected.length === 0 ? 'All categories' : `${selected.length} categories selected`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => setBrowseTab('swipe')}
              className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                browseTab === 'swipe' ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
              )}>Swipe</button>
            <button onClick={() => { setBrowseTab('foryou'); generateRecommendations() }}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                browseTab === 'foryou' ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
              )}>
              <Sparkles size={12} />For You
            </button>
          </div>
          <button
            onClick={() => setShowFilterPanel(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-colors"
          >
            <SlidersHorizontal size={15} />
            Filter Categories
            {selected.length > 0 && (
              <span className="w-5 h-5 bg-[#0A0A0A] text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {selected.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selected.map((cat) => (
            <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700">
              {CATEGORY_META[cat].emoji} {cat}
              <button onClick={() => toggle(cat)} className="ml-0.5 text-gray-400 hover:text-gray-700 transition-colors">
                <X size={11} />
              </button>
            </span>
          ))}
          <button
            onClick={() => useCategoryStore.getState().clearAll()}
            className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* Swipe stack OR For You feed */}
        <div className="flex-1 flex flex-col items-center">
          {browseTab === 'swipe' ? (
            loading ? (
              <div className="w-[360px] h-[400px] bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-3">
                <Loader2 size={24} className="animate-spin text-gray-400" />
                <p className="text-sm text-gray-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="w-[360px] h-[400px] bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center p-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-base font-bold text-[#0A0A0A] mb-2">No orders available</p>
                <p className="text-gray-400 text-sm mb-5">
                  {selected.length > 0
                    ? 'No orders in selected categories. Try different filters.'
                    : 'No orders posted yet. Check back soon.'}
                </p>
                {selected.length > 0 && (
                  <button
                    onClick={() => useCategoryStore.getState().clearAll()}
                    className="px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold"
                  >
                    Show All Orders
                  </button>
                )}
              </div>
            ) : (
              <SwipeStack orders={orders} onAccept={handleAccept} onReject={handleReject} />
            )
          ) : (
            /* For You feed */
            <div className="w-full max-w-xl space-y-3">
              {recLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={22} className="animate-spin text-purple-400" />
                  <p className="text-sm text-gray-400">AI is ranking orders for you...</p>
                </div>
              ) : recommended.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 text-center px-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-3">
                    <Sparkles size={20} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A] mb-1">No recommendations yet</p>
                  <p className="text-xs text-gray-400 mb-4">Make sure orders are loaded, then click "For You" again</p>
                  <button onClick={() => { setRecGenerated(false); generateRecommendations() }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors">
                    Regenerate
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-purple-500" />
                    <p className="text-sm font-semibold text-[#0A0A0A]">Top picks based on your specialization</p>
                    <button onClick={() => { setRecGenerated(false); generateRecommendations() }}
                      className="ml-auto text-xs text-purple-500 hover:text-purple-700 font-medium">Refresh</button>
                  </div>
                  {recommended.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0A0A0A] truncate">{order.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.clientCompany || order.clientName} · {order.category}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 rounded-full">
                            <Sparkles size={10} className="text-purple-500" />
                            <span className="text-xs font-bold text-purple-600">{order.matchScore}% match</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 bg-purple-50 rounded-lg px-3 py-2 mb-3">{order.matchReason}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>📦 {order.quantity.toLocaleString()} {order.unit}</span>
                          <span>📅 {order.deliveryDays}d delivery</span>
                          <span className="font-semibold text-green-600">
                            {order.isFixedPrice ? `₹${order.fixedPrice?.toLocaleString('en-IN')}` : `₹${order.budgetMax?.toLocaleString('en-IN')} max`}
                          </span>
                        </div>
                        <button onClick={() => navigate(`/orders/${order.id}`)}
                          className="px-3 py-1.5 bg-[#0A0A0A] text-white text-xs font-semibold rounded-lg hover:bg-[#1a1a1a] transition-colors">
                          View Order
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
        {/* Accepted panel */}
        <div className="w-[280px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-[#0A0A0A]">
                Accepted This Session
                {acceptedOrders.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                    {acceptedOrders.length}
                  </span>
                )}
              </h3>
            </div>
            {acceptedOrders.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                  <Package size={17} className="text-gray-400" />
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">Orders you accept appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">
                {acceptedOrders.map((order) => (
                  <Link key={order.id} to={`/orders/${order.id}`}
                    className="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 size={13} className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0A0A0A] truncate">{order.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.orderNumber}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {acceptedOrders.length > 0 && (
              <div className="p-4 border-t border-gray-50">
                <Link to="/orders"
                  className="block w-full py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold text-center hover:bg-[#1a1a1a] transition-colors"
                >
                  Go to My Orders →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {showFilterPanel && <FilterPanel onApply={handleApplyFilter} onClose={() => setShowFilterPanel(false)} />}

      {/* Toast */}
      {justAccepted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-[#0A0A0A] text-white rounded-2xl shadow-2xl">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <p className="text-sm font-semibold">Order Accepted!</p>
              <p className="text-white/60 text-xs">Opening bid form...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterPanel({ onApply, onClose }: { onApply: () => void; onClose: () => void }) {
  const { selected, toggle, selectAll, clearAll } = useCategoryStore()
  const allSelected = selected.length === ALL_CATEGORIES.length

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-white z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-[#0A0A0A]">Filter by Category</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-500">{selected.length === 0 ? 'None (shows all)' : `${selected.length} selected`}</p>
          <button onClick={allSelected ? clearAll : selectAll} className="text-sm font-semibold text-[#0A0A0A] hover:opacity-70 transition-opacity">
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-1 gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat]
              const isSelected = selected.includes(cat)
              return (
                <button key={cat} onClick={() => toggle(cat)}
                  className={cn('flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                    isSelected ? 'border-[#0A0A0A] bg-gray-50' : 'border-transparent bg-gray-50 hover:border-gray-200'
                  )}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: `${meta.color}18` }}>
                    {meta.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0A0A0A]">{cat}</p>
                    <p className="text-xs text-gray-400">{meta.description}</p>
                  </div>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected ? 'bg-[#0A0A0A] border-[#0A0A0A]' : 'border-gray-300'
                  )}>
                    {isSelected && <CheckCircle2 size={11} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        <div className="px-6 py-5 border-t border-gray-100">
          <button onClick={onApply}
            className="w-full py-3.5 bg-[#0A0A0A] text-white rounded-2xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors"
          >
            {selected.length === 0 ? 'Show All Orders' : `Show Orders in ${selected.length} ${selected.length === 1 ? 'Category' : 'Categories'}`}
          </button>
        </div>
      </div>
    </>
  )
}

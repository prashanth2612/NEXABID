import { useEffect, useState } from 'react'
import { Loader2, Gavel } from 'lucide-react'
import api from '@/lib/api'
import { cn, fmt, fmtDate } from '@/lib/utils'

interface Bid {
  id: string
  proposedPrice: number
  deliveryDays: number
  status: 'pending' | 'accepted' | 'rejected'
  aiConfidenceScore?: number
  createdAt: string
  orderId: { id: string; title: string; orderNumber: string; status: string }
  manufacturerId: { id: string; fullName: string; businessName?: string }
}

const BID_STATUS = {
  accepted: { color: '#059669', bg: '#ECFDF5' },
  pending:  { color: '#D97706', bg: '#FFFBEB' },
  rejected: { color: '#DC2626', bg: '#FEF2F2' },
}

export default function BidsPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    api.get('/admin/bids')
      .then(r => setBids(r.data.data.bids || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = tab === 'all' ? bids : bids.filter(b => b.status === tab)

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Bids</h2>
        <p className="text-gray-500 text-sm mt-0.5">{bids.length} total bids across all orders</p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {['all', 'pending', 'accepted', 'rejected'].map(s => (
          <button key={s} onClick={() => setTab(s)}
            className={cn('px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize',
              tab === s ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}>
            {s} <span className={cn('ml-1 text-xs', tab === s ? 'text-white/60' : 'text-gray-400')}>
              {s === 'all' ? bids.length : bids.filter(b => b.status === s).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center py-24">
          <Loader2 size={22} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-gray-50 bg-gray-50/50">
            {['Order', 'Manufacturer', 'Bid Price', 'Delivery', 'AI Score', 'Status'].map(h => (
              <span key={h} className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gavel size={28} className="text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No bids found</p>
              </div>
            ) : filtered.map(b => {
              const sc = BID_STATUS[b.status]
              return (
                <div key={b.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{b.orderId?.title}</p>
                    <p className="text-xs text-gray-400">{b.orderId?.orderNumber}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate">{b.manufacturerId?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{b.manufacturerId?.businessName}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A]">{fmt(b.proposedPrice)}</p>
                  <p className="text-sm text-gray-600">{b.deliveryDays}d</p>
                  <div className="flex items-center gap-1.5">
                    {b.aiConfidenceScore ? (
                      <>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#0A0A0A]"
                            style={{ width: `${b.aiConfidenceScore}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{b.aiConfidenceScore}%</span>
                      </>
                    ) : <span className="text-xs text-gray-300">—</span>}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit capitalize"
                    style={{ color: sc.color, background: sc.bg }}>{b.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

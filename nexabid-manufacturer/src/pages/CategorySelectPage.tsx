import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, SkipForward } from 'lucide-react'
import {
  useCategoryStore,
  ALL_CATEGORIES,
  CATEGORY_META,
  type Category,
} from '@/store/categoryStore'
import { cn } from '@/lib/utils'

export default function CategorySelectPage() {
  const navigate = useNavigate()
  const { selected, toggle, selectAll, clearAll, confirm } = useCategoryStore()

  const handleConfirm = () => {
    confirm()
    navigate('/browse')
  }

  const handleSkip = () => {
    confirm()
    navigate('/dashboard')
  }

  const allSelected = selected.length === ALL_CATEGORIES.length

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">NB</span>
            </div>
            <span className="text-[#0A0A0A] font-semibold text-sm">NexaBid</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight mb-2">
            What do you manufacture?
          </h1>
          <p className="text-gray-500 text-sm">
            Select categories to see matching orders. You can change this anytime.
          </p>
        </div>

        {/* Select all / clear row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {selected.length === 0
              ? 'None selected — shows all orders'
              : `${selected.length} of ${ALL_CATEGORIES.length} selected`}
          </p>
          <button
            onClick={allSelected ? clearAll : selectAll}
            className="text-sm font-semibold text-[#0A0A0A] hover:opacity-70 transition-opacity"
          >
            {allSelected ? 'Clear all' : 'Select all'}
          </button>
        </div>

        {/* Category grid — 2 columns */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ALL_CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat as Category]
            const isSelected = selected.includes(cat as Category)

            return (
              <button
                key={cat}
                onClick={() => toggle(cat as Category)}
                className={cn(
                  'relative flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 bg-white',
                  isSelected
                    ? 'border-[#0A0A0A] shadow-sm'
                    : 'border-transparent hover:border-gray-200'
                )}
              >
                {/* Color accent bar */}
                <div
                  className="w-1 absolute left-0 top-4 bottom-4 rounded-r-full"
                  style={{ background: isSelected ? meta.color : 'transparent' }}
                />

                {/* Emoji icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ background: `${meta.color}18` }}
                >
                  {meta.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      isSelected ? 'text-[#0A0A0A]' : 'text-gray-700'
                    )}
                  >
                    {cat}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
                </div>

                {/* Check */}
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected
                      ? 'bg-[#0A0A0A] border-[#0A0A0A]'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  {isSelected && (
                    <CheckCircle2 size={12} className="text-white" strokeWidth={3} />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-5 py-3 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <SkipForward size={15} />
            Skip for now
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#0A0A0A] text-white rounded-2xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors"
          >
            {selected.length === 0 ? (
              <>Browse All Orders <ArrowRight size={15} /></>
            ) : (
              <>Show {selected.length === ALL_CATEGORIES.length ? 'All' : selected.length} {selected.length === 1 ? 'Category' : 'Categories'} <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

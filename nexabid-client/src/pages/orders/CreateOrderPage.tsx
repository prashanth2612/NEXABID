import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Loader2, IndianRupee, Package,
  MapPin, Calendar, FileText, ChevronDown,
} from 'lucide-react'
import { ORDER_CATEGORIES, ORDER_UNITS } from '@/types/order'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Describe your requirement in detail (min 20 chars)'),
  category: z.string().min(1, 'Select a category'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Select a unit'),
  deliveryDate: z.string().min(1, 'Select a delivery date'),
  deliveryLocation: z.string().min(3, 'Enter delivery location'),
  specialNotes: z.string().optional(),
  fixedPrice: z.coerce.number().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
})

type FormData = z.infer<typeof schema>

const inputClass = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all'
const labelClass = 'block text-sm font-medium text-[#0A0A0A] mb-1.5'
const errorClass = 'text-xs text-red-500 mt-1.5'

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isFixedPrice, setIsFixedPrice] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    // Validate pricing fields manually based on current mode
    if (isFixedPrice) {
      if (!data.fixedPrice || data.fixedPrice < 1) {
        setSubmitError('Enter a valid fixed price')
        return
      }
    } else {
      if (!data.budgetMin || data.budgetMin < 1) {
        setSubmitError('Enter minimum budget')
        return
      }
      if (!data.budgetMax || data.budgetMax < 1) {
        setSubmitError('Enter maximum budget')
        return
      }
      if (data.budgetMin >= data.budgetMax) {
        setSubmitError('Max budget must be greater than min budget')
        return
      }
    }

    setSubmitError(null)
    setLoading(true)
    try {
      await api.post('/orders', {
        title: data.title,
        description: data.description,
        category: data.category,
        quantity: data.quantity,
        unit: data.unit,
        isFixedPrice,
        fixedPrice: isFixedPrice ? data.fixedPrice : undefined,
        budgetMin: !isFixedPrice ? data.budgetMin : undefined,
        budgetMax: !isFixedPrice ? data.budgetMax : undefined,
        deliveryDate: data.deliveryDate,
        deliveryLocation: data.deliveryLocation,
        specialNotes: data.specialNotes,
      })
      navigate('/orders')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const msg = e.response?.data?.message || 'Failed to create order'
      setSubmitError(msg)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <button onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-gray-500 hover:text-black text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to orders
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-7 py-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0A0A0A] tracking-tight">Post a New Order</h2>
              <p className="text-gray-500 text-sm">Manufacturers will bid on your requirement</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-7 py-6 space-y-6">

          {/* Title */}
          <div>
            <label className={labelClass}>Order Title</label>
            <input {...register('title')} className={inputClass} placeholder="e.g. Cotton T-Shirts Bulk Order — 500 units" />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description <span className="text-gray-400 font-normal ml-1">— be specific</span></label>
            <textarea {...register('description')} rows={4} className={cn(inputClass, 'resize-none')}
              placeholder="Describe material, size, colour, finish, any special requirements..." />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          {/* Category + Quantity + Unit */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <select {...register('category')} className={cn(inputClass, 'appearance-none pr-8')}>
                  <option value="">Select...</option>
                  {ORDER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.category && <p className={errorClass}>{errors.category.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Quantity</label>
              <input {...register('quantity')} type="number" min="1" className={inputClass} placeholder="500" />
              {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Unit</label>
              <div className="relative">
                <select {...register('unit')} className={cn(inputClass, 'appearance-none pr-8')}>
                  <option value="">Select...</option>
                  {ORDER_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.unit && <p className={errorClass}>{errors.unit.message}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className={labelClass}>Pricing</label>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-4">
              {[{ label: 'Budget Range', fixed: false }, { label: 'Fixed Price', fixed: true }].map((opt) => (
                <button key={String(opt.fixed)} type="button" onClick={() => setIsFixedPrice(opt.fixed)}
                  className={cn('px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isFixedPrice === opt.fixed ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {isFixedPrice ? (
              <div className="relative">
                <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input {...register('fixedPrice')} type="number" min="1" className={cn(inputClass, 'pl-9')} placeholder="35000" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('budgetMin')} type="number" min="1" className={cn(inputClass, 'pl-9')} placeholder="Min budget" />
                </div>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input {...register('budgetMax')} type="number" min="1" className={cn(inputClass, 'pl-9')} placeholder="Max budget" />
                </div>
              </div>
            )}
          </div>

          {/* Delivery date + location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><Calendar size={13} className="inline mr-1.5 text-gray-400" />Delivery Date</label>
              <input {...register('deliveryDate')} type="date" min={today} className={inputClass} />
              {errors.deliveryDate && <p className={errorClass}>{errors.deliveryDate.message}</p>}
            </div>
            <div>
              <label className={labelClass}><MapPin size={13} className="inline mr-1.5 text-gray-400" />Delivery Location</label>
              <input {...register('deliveryLocation')} className={inputClass} placeholder="Mumbai, Maharashtra" />
              {errors.deliveryLocation && <p className={errorClass}>{errors.deliveryLocation.message}</p>}
            </div>
          </div>

          {/* Special notes */}
          <div>
            <label className={labelClass}><FileText size={13} className="inline mr-1.5 text-gray-400" />Special Notes <span className="text-gray-400 font-normal ml-1">— optional</span></label>
            <textarea {...register('specialNotes')} rows={2} className={cn(inputClass, 'resize-none')}
              placeholder="Sample requirements, certifications needed, etc." />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" />Posting order...</> : 'Post Order'}
            </button>
            <button type="button" onClick={() => navigate('/orders')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

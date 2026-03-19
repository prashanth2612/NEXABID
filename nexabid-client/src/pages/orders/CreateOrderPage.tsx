<<<<<<< HEAD
import { useState, useRef } from 'react'
=======
import { useState } from 'react'
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Loader2, IndianRupee, Package,
  MapPin, Calendar, FileText, ChevronDown,
<<<<<<< HEAD
  Paperclip, X, Upload, Image, Sparkles,
=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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
<<<<<<< HEAD
  const [attachments, setAttachments] = useState<{ name: string; type: string; data: string; size: number }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aiDescLoading, setAiDescLoading] = useState(false)
  const [aiDescError, setAiDescError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { alert(`${file.name} is too large (max 5MB)`); return }
      if (attachments.length >= 5) { alert('Maximum 5 attachments allowed'); return }
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        setAttachments(prev => [...prev, { name: file.name, type: file.type, data: base64, size: file.size }])
      }
      reader.readAsDataURL(file)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx))

  const generateAIDescription = async () => {
    const title = watch('title')
    const category = watch('category')
    const quantity = watch('quantity')
    const unit = watch('unit')
    if (!title || title.length < 5) { setAiDescError('Enter an order title first'); return }
    setAiDescLoading(true); setAiDescError(null)
    try {
      const prompt = `You are a B2B manufacturing procurement expert. Generate a detailed, professional order description for a manufacturing order with these details:
Title: ${title}
Category: ${category || 'General manufacturing'}
Quantity: ${quantity ? `${quantity} ${unit || 'units'}` : 'Not specified'}

Write 3-4 sentences covering: material specifications, quality standards, finish/appearance requirements, and any relevant compliance or certification needs. Be specific and technical. Return ONLY the description text, no preamble.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text
      if (text) {
        setValue('description', text, { shouldValidate: true })
      } else {
        setAiDescError('AI generation failed — try again')
      }
    } catch {
      setAiDescError('Failed to generate description')
    } finally { setAiDescLoading(false) }
  }

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
=======

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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
<<<<<<< HEAD
        attachments: attachments.length > 0 ? attachments : undefined,
=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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
<<<<<<< HEAD
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass} style={{marginBottom: 0}}>Description <span className="text-gray-400 font-normal ml-1">— be specific</span></label>
              <button type="button" onClick={generateAIDescription} disabled={aiDescLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors">
                {aiDescLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                {aiDescLoading ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea {...register('description')} rows={4} className={cn(inputClass, 'resize-none')}
              placeholder="Describe material, size, colour, finish, any special requirements..." />
            {aiDescError && <p className="text-xs text-red-500 mt-1">{aiDescError}</p>}
=======
            <label className={labelClass}>Description <span className="text-gray-400 font-normal ml-1">— be specific</span></label>
            <textarea {...register('description')} rows={4} className={cn(inputClass, 'resize-none')}
              placeholder="Describe material, size, colour, finish, any special requirements..." />
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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

<<<<<<< HEAD
          {/* Attachments */}
          <div>
            <label className={labelClass}>
              <Paperclip size={13} className="inline mr-1.5 text-gray-400" />
              Attachments <span className="text-gray-400 font-normal ml-1">— optional, up to 5 files (5MB each)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50/50 transition-all"
            >
              <Upload size={20} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload spec sheets, reference images, or documents</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF, DOC, XLS — max 5MB each</p>
            </div>
            {/* Attached files list */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, idx) => {
                  const isImg = file.type.startsWith('image/')
                  return (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                        {isImg
                          ? <Image size={14} className="text-blue-500" />
                          : <FileText size={14} className="text-gray-400" />
                        }
                      </div>
                      {isImg && (
                        <img
                          src={`data:${file.type};base64,${file.data}`}
                          alt={file.name}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A0A0A] truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removeAttachment(idx)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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

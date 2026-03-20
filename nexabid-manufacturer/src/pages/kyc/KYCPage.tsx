import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck, Upload, CheckCircle2, Clock, XCircle,
  AlertTriangle, FileText, Loader2, X, Info,
} from 'lucide-react'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface KYCDoc {
  type: string
  label: string
  uploadedAt: string
}

interface KYCStatus {
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected'
  kycRejectionReason?: string
  kycDocuments: KYCDoc[]
}

const DOC_TYPES = [
  { type: 'gst',     label: 'GST Certificate',     desc: 'GST registration certificate',       required: true },
  { type: 'pan',     label: 'PAN Card',             desc: 'Business or personal PAN card',      required: true },
  { type: 'aadhaar', label: 'Aadhaar Card',         desc: 'Proprietor / Director Aadhaar',      required: false },
  { type: 'other',   label: 'Other Document',       desc: 'MSME certificate, trade licence etc', required: false },
]

const STATUS_CONFIG = {
  none:     { label: 'Not Submitted',   icon: Info,         color: 'text-gray-500',  bg: 'bg-gray-50',   border: 'border-gray-200' },
  pending:  { label: 'Under Review',    icon: Clock,        color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  approved: { label: 'KYC Approved',    icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50',  border: 'border-green-200' },
  rejected: { label: 'KYC Rejected',    icon: XCircle,      color: 'text-red-500',   bg: 'bg-red-50',    border: 'border-red-200' },
}

export default function KYCPage() {
  const [kyc, setKyc] = useState<KYCStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    api.get('/profile/kyc')
      .then(r => setKyc(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getDoc = (type: string) => kyc?.kycDocuments.find(d => d.type === type)

  const handleFile = async (type: string, label: string, file: File) => {
    // Validate
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setErrors(e => ({ ...e, [type]: 'Only PDF, JPG, PNG or WebP allowed' })); return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(e => ({ ...e, [type]: 'File must be under 5MB' })); return
    }
    setErrors(e => ({ ...e, [type]: '' }))
    setUploading(type)

    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        try {
          const res = await api.post('/profile/kyc', {
            type,
            label,
            data: ev.target?.result,
          })
          setKyc(res.data.data)
        } catch (err: unknown) {
          const e = err as { response?: { data?: { message?: string } } }
          setErrors(prev => ({ ...prev, [type]: e.response?.data?.message || 'Upload failed' }))
        } finally {
          setUploading(null)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setUploading(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={22} className="animate-spin text-gray-400" />
    </div>
  )

  const status = kyc?.kycStatus || 'none'
  const cfg = STATUS_CONFIG[status]
  const StatusIcon = cfg.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight flex items-center gap-2">
          <ShieldCheck size={20} /> KYC Verification
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Upload your business documents to get verified and unlock higher order limits.
        </p>
      </div>

      {/* Status banner */}
      <div className={cn('flex items-start gap-3 p-4 rounded-2xl border', cfg.bg, cfg.border)}>
        <StatusIcon size={18} className={cn('flex-shrink-0 mt-0.5', cfg.color)} />
        <div>
          <p className={cn('font-semibold text-sm', cfg.color)}>{cfg.label}</p>
          {status === 'none' && (
            <p className="text-gray-500 text-xs mt-0.5">Upload at least GST and PAN to submit for review.</p>
          )}
          {status === 'pending' && (
            <p className="text-gray-500 text-xs mt-0.5">Our team will review your documents within 24 hours.</p>
          )}
          {status === 'approved' && (
            <p className="text-green-700 text-xs mt-0.5">Your account is fully verified. You can now bid on all orders.</p>
          )}
          {status === 'rejected' && kyc?.kycRejectionReason && (
            <p className="text-red-600 text-xs mt-0.5">Reason: {kyc.kycRejectionReason}</p>
          )}
        </div>
      </div>

      {/* Document upload cards */}
      <div className="space-y-4">
        {DOC_TYPES.map((doc) => {
          const uploaded = getDoc(doc.type)
          const isUploading = uploading === doc.type
          const error = errors[doc.type]

          return (
            <div key={doc.type} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#0A0A0A] text-sm">{doc.label}</p>
                    {doc.required && (
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Required</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{doc.desc}</p>
                </div>
                {uploaded && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={11} /> Uploaded
                  </span>
                )}
              </div>

              {uploaded && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 rounded-xl">
                  <FileText size={13} className="text-gray-400" />
                  <span className="text-xs text-gray-600 flex-1">{doc.label}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(uploaded.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-1.5 mb-3">
                  <AlertTriangle size={12} className="text-red-500" />
                  <p className="text-xs text-red-500">{error}</p>
                </div>
              )}

              <input
                ref={el => { fileRefs.current[doc.type] = el }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(doc.type, doc.label, file)
                  e.target.value = ''
                }}
              />

              <button
                onClick={() => fileRefs.current[doc.type]?.click()}
                disabled={isUploading || status === 'approved'}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  status === 'approved'
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : uploaded
                      ? 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      : 'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a]'
                )}
              >
                {isUploading
                  ? <><Loader2 size={13} className="animate-spin" /> Uploading...</>
                  : uploaded
                    ? <><Upload size={13} /> Replace</>
                    : <><Upload size={13} /> Upload</>
                }
              </button>
            </div>
          )
        })}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-700 text-xs font-semibold">Why do we need KYC?</p>
          <p className="text-blue-600 text-xs mt-0.5 leading-relaxed">
            Verified manufacturers get a verified badge, higher visibility in search, and the ability to bid on large orders above ₹5 lakh. Your documents are stored securely and only reviewed by our compliance team.
          </p>
        </div>
      </div>
    </div>
  )
}

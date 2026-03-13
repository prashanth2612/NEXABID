import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  User, Mail, Phone, Building2, FileText, MapPin, Globe,
  Linkedin, Lock, CheckCircle2, Loader2, Package, TrendingUp,
  ShieldCheck, XCircle, Edit3, Save, X,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'

interface ProfileData {
  fullName: string
  email: string
  phone: string
  companyName?: string
  gstNumber?: string
  bio?: string
  address?: string
  website?: string
  linkedin?: string
  isVerified: boolean
  rating: number
  createdAt: string
}

interface Stats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  cancelledOrders: number
}

const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all disabled:bg-gray-50 disabled:text-gray-500'
const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password form
  const [changingPw, setChangingPw] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileData>()
  const pwForm = useForm<{ currentPassword: string; newPassword: string; confirmPassword: string }>()

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/profile'),
          api.get('/profile/stats'),
        ])
        const p = profileRes.data.data.user
        setProfile(p)
        setStats(statsRes.data.data)
        reset(p)
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  const onSave = async (data: ProfileData) => {
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await api.put('/profile', data)
      const updated = res.data.data.user
      setProfile(updated)
      setUser({ ...user!, ...updated })
      setEditing(false)
      setSaveMsg({ type: 'success', text: 'Profile updated successfully' })
      setTimeout(() => setSaveMsg(null), 3000)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setSaveMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setPwLoading(true)
    setPwMsg(null)
    try {
      await api.post('/profile/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      pwForm.reset()
      setChangingPw(false)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' })
    } finally {
      setPwLoading(false)
    }
  }

  const initials = profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Profile</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account details and preferences</p>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Orders',     value: stats.totalOrders,     icon: Package,     color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Active',           value: stats.activeOrders,    icon: TrendingUp,  color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Completed',        value: stats.completedOrders, icon: ShieldCheck, color: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Cancelled',        value: stats.cancelledOrders, icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-[#0A0A0A]">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A0A0A] px-6 pt-6 pb-14 relative">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Account Details</p>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Edit3 size={12} /> Edit Profile
              </button>
            ) : (
              <button onClick={() => { setEditing(false); reset(profile || {}) }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <X size={12} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Avatar overlap */}
        <div className="px-6 -mt-10 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-[#0A0A0A]">{initials}</span>
          </div>
        </div>

        {saveMsg && (
          <div className={cn('mx-6 mb-4 px-4 py-3 rounded-xl flex items-center gap-2 text-sm',
            saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          )}>
            {saveMsg.type === 'success' ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
            {saveMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSave)} className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}><User size={11} className="inline mr-1" />Full Name</label>
              <input {...register('fullName')} disabled={!editing} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Mail size={11} className="inline mr-1" />Email</label>
              <input value={profile?.email || ''} disabled className={inputClass} />
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className={labelClass}><Phone size={11} className="inline mr-1" />Phone</label>
              <input {...register('phone')} disabled={!editing} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><Building2 size={11} className="inline mr-1" />Company Name</label>
              <input {...register('companyName')} disabled={!editing} className={inputClass} placeholder="Your company name" />
            </div>
            <div>
              <label className={labelClass}><FileText size={11} className="inline mr-1" />GST Number</label>
              <input {...register('gstNumber')} disabled={!editing} className={inputClass} placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label className={labelClass}><MapPin size={11} className="inline mr-1" />Address</label>
              <input {...register('address')} disabled={!editing} className={inputClass} placeholder="Mumbai, Maharashtra" />
            </div>
            <div>
              <label className={labelClass}><Globe size={11} className="inline mr-1" />Website</label>
              <input {...register('website')} disabled={!editing} className={inputClass} placeholder="https://yourcompany.com" />
            </div>
            <div>
              <label className={labelClass}><Linkedin size={11} className="inline mr-1" />LinkedIn</label>
              <input {...register('linkedin')} disabled={!editing} className={inputClass} placeholder="linkedin.com/in/yourprofile" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea {...register('bio')} disabled={!editing} rows={3}
              className={cn(inputClass, 'resize-none')}
              placeholder="Tell manufacturers about your business and requirements..." />
          </div>

          {editing && (
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => { setEditing(false); reset(profile || {}) }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
              <Lock size={14} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A]">Password</p>
              <p className="text-xs text-gray-400">Keep your account secure</p>
            </div>
          </div>
          <button onClick={() => setChangingPw(!changingPw)}
            className="text-sm font-medium text-[#0A0A0A] hover:opacity-70 transition-opacity"
          >
            {changingPw ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {changingPw && (
          <form onSubmit={pwForm.handleSubmit(onChangePassword)} className="px-6 py-5 space-y-4">
            {pwMsg && (
              <div className={cn('px-4 py-3 rounded-xl flex items-center gap-2 text-sm',
                pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
              )}>
                {pwMsg.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {pwMsg.text}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 max-w-sm">
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" {...pwForm.register('currentPassword', { required: true })}
                  className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <input type="password" {...pwForm.register('newPassword', { required: true, minLength: 8 })}
                  className={inputClass} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelClass}>Confirm New Password</label>
                <input type="password" {...pwForm.register('confirmPassword', { required: true })}
                  className={inputClass} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account Info</p>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Role</p>
            <p className="font-medium text-[#0A0A0A] capitalize">{profile?.isVerified ? '✓ Verified ' : ''}Client</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Member Since</p>
            <p className="font-medium text-[#0A0A0A]">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs mb-0.5">Rating</p>
            <p className="font-medium text-[#0A0A0A]">{profile?.rating || '—'} / 5.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

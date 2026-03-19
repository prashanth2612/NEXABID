import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Bell, Shield, User, Trash2, Loader2,
  CheckCircle2, ChevronRight, Mail, Smartphone, Eye, EyeOff,
} from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Enter current password'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type PwForm = z.infer<typeof pwSchema>

const inputClass = 'w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all'

export default function SettingsPage() {
  const { manufacturer } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'account'>('notifications')

  const [notifPrefs, setNotifPrefs] = useState({
    emailOrderReceived:   true,
    emailBidAccepted:     true,
    emailPaymentReleased: true,
    emailMessages:        false,
    pushOrderReceived:    true,
    pushBidAccepted:      true,
    pushPaymentReleased:  true,
    pushMessages:         true,
  })
  const [notifSaved, setNotifSaved] = useState(false)
  const saveNotifPrefs = () => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2500) }

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) })

  const onChangePw = async (data: PwForm) => {
    setPwLoading(true); setPwError(null); setPwSuccess(false)
    try {
      await api.post('/profile/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      setPwSuccess(true); reset()
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setPwError(err.response?.data?.message || 'Failed to change password')
    } finally { setPwLoading(false) }
  }

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { logout } = useAuthStore()

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleteLoading(true)
    try {
      await api.delete('/profile')
      logout(); window.location.href = '/auth/login'
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      alert(err.response?.data?.message || 'Failed to delete account')
    } finally { setDeleteLoading(false) }
  }

  const TABS = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'account',       label: 'Account',        icon: User },
  ] as const

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your preferences and account</p>
      </div>

      <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === t.id ? 'bg-[#0A0A0A] text-white' : 'text-gray-500 hover:text-gray-800'
            )}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <h3 className="font-semibold text-[#0A0A0A] text-sm">Notification Preferences</h3>
            <p className="text-gray-400 text-xs mt-0.5">Choose when and how you get notified</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email Notifications</span>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'emailOrderReceived',   label: 'New order matches',      sub: 'When a new order matches your categories' },
                  { key: 'emailBidAccepted',     label: 'Bid accepted',           sub: 'When a client accepts your bid' },
                  { key: 'emailPaymentReleased', label: 'Payment released',       sub: 'When escrow is released after delivery' },
                  { key: 'emailMessages',        label: 'New messages',           sub: 'When you receive a chat message' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={cn('relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-[#0A0A0A]' : 'bg-gray-200'
                      )}>
                      <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'left-5' : 'left-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-50" />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={14} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">In-App Notifications</span>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'pushOrderReceived',    label: 'New order matches',    sub: 'Appears in your notification bell' },
                  { key: 'pushBidAccepted',      label: 'Bid accepted',         sub: 'Real-time bid status alerts' },
                  { key: 'pushPaymentReleased',  label: 'Payment released',     sub: 'Escrow and payout notifications' },
                  { key: 'pushMessages',         label: 'New messages',         sub: 'Chat notifications' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-sm font-medium text-[#0A0A0A]">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <button
                      onClick={() => setNotifPrefs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                      className={cn('relative w-10 h-6 rounded-full transition-colors flex-shrink-0',
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'bg-[#0A0A0A]' : 'bg-gray-200'
                      )}>
                      <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                        notifPrefs[item.key as keyof typeof notifPrefs] ? 'left-5' : 'left-1'
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={saveNotifPrefs}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a] transition-colors">
              {notifSaved ? <><CheckCircle2 size={14} />Saved!</> : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h3 className="font-semibold text-[#0A0A0A] text-sm">Change Password</h3>
              <p className="text-gray-400 text-xs mt-0.5">Use a strong password you don't use elsewhere</p>
            </div>
            <form onSubmit={handleSubmit(onChangePw)} className="p-6 space-y-4">
              {[
                { field: 'currentPassword',  label: 'Current Password',      show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                { field: 'newPassword',      label: 'New Password',          show: showNew,     toggle: () => setShowNew(p => !p) },
                { field: 'confirmPassword',  label: 'Confirm New Password',  show: showNew,     toggle: () => setShowNew(p => !p) },
              ].map(item => (
                <div key={item.field}>
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">{item.label}</label>
                  <div className="relative">
                    <input {...register(item.field as keyof PwForm)} type={item.show ? 'text' : 'password'}
                      className={cn(inputClass, 'pr-10')} placeholder="••••••••" />
                    <button type="button" onClick={item.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {item.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors[item.field as keyof PwForm] && (
                    <p className="text-xs text-red-500 mt-1.5">{errors[item.field as keyof PwForm]?.message}</p>
                  )}
                </div>
              ))}
              {pwError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-xl">{pwError}</p>}
              {pwSuccess && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2.5 rounded-xl text-sm">
                  <CheckCircle2 size={15} /> Password changed successfully
                </div>
              )}
              <button type="submit" disabled={pwLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors">
                {pwLoading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h3 className="font-semibold text-[#0A0A0A] text-sm">Account Information</h3>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Full Name',     value: manufacturer?.fullName },
                { label: 'Email',         value: manufacturer?.email },
                { label: 'Role',          value: 'Manufacturer' },
                { label: 'Business Name', value: manufacturer?.businessName || '—' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-[#0A0A0A]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'account' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <h3 className="font-semibold text-[#0A0A0A] text-sm">Account Actions</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: 'Edit Profile',       sub: 'Update business info, categories, contact details', href: '/profile' },
                { label: 'View Earnings',       sub: 'Payments, escrow history, payouts',                href: '/earnings' },
                { label: 'Browse Orders',       sub: 'Find new manufacturing opportunities',             href: '/browse' },
              ].map(item => (
                <a key={item.label} href={item.href}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#0A0A0A]">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-400" />
                </a>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-red-50 bg-red-50/50">
              <h3 className="font-semibold text-red-600 text-sm flex items-center gap-2">
                <Trash2 size={14} /> Danger Zone
              </h3>
              <p className="text-red-400 text-xs mt-0.5">These actions are permanent and cannot be undone</p>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Deleting your account will remove all your bids, order history, and earnings data.
                Active escrow payments must be settled before deletion.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Type <span className="font-bold text-red-500">DELETE</span> to confirm
                </label>
                <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition-all"
                  placeholder="Type DELETE" />
              </div>
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== 'DELETE' || deleteLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleteLoading ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

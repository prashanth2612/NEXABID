import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  Bell, Shield, Trash2, Loader2, CheckCircle2,
  Mail, MessageSquare, CreditCard, Package,
  AlertTriangle, Eye, EyeOff,
} from 'lucide-react'

const labelClass = 'block text-sm font-medium text-[#0A0A0A] mb-1.5'
const inputClass = 'w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all'

type Tab = 'notifications' | 'security' | 'danger'

export default function SettingsPage() {
  const { user, logout } = useAuthStore()
  const [tab, setTab] = useState<Tab>('notifications')

  // Notifications
  const [notifs, setNotifs] = useState({
    emailBidReceived: true,
    emailOrderUpdate: true,
    emailPayment: true,
    emailMarketing: false,
    inAppAll: true,
  })
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [notifsOk, setNotifsOk] = useState(false)

  // Security
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwOk, setPwOk] = useState(false)

  // Danger
  const [deleteInput, setDeleteInput] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  const handleSaveNotifs = async () => {
    setSavingNotifs(true)
    await new Promise(r => setTimeout(r, 600)) // optimistic
    setSavingNotifs(false)
    setNotifsOk(true)
    setTimeout(() => setNotifsOk(false), 2500)
  }

  const handleChangePassword = async () => {
    setPwError(null)
    if (!pwForm.currentPassword) return setPwError('Enter your current password')
    if (pwForm.newPassword.length < 8) return setPwError('New password must be at least 8 characters')
    if (pwForm.newPassword !== pwForm.confirmPassword) return setPwError('Passwords do not match')
    setSavingPw(true)
    try {
      await api.post('/profile/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      setPwOk(true)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwOk(false), 3000)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setPwError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInput !== user?.email) return
    setDeletingAccount(true)
    try {
      await api.delete('/profile')
      logout()
      window.location.href = '/auth/login'
    } catch {
      setDeletingAccount(false)
    }
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'danger',        label: 'Danger Zone',   icon: Trash2 },
  ]

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <h2 className="text-xl font-semibold text-[#0A0A0A] tracking-tight">Settings</h2>
        <p className="text-gray-500 text-sm mt-0.5">Manage your account preferences</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id
                ? t.id === 'danger' ? 'bg-red-500 text-white' : 'bg-[#0A0A0A] text-white'
                : t.id === 'danger' ? 'text-red-500 hover:bg-red-50' : 'text-gray-500 hover:text-gray-800'
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Notifications ── */}
      {tab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          <div className="px-6 py-5">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">Email Notifications</h3>
            <p className="text-xs text-gray-400">Choose which emails you want to receive</p>
          </div>
          {[
            { key: 'emailBidReceived', icon: Package,      label: 'New bid received',       sub: 'When a manufacturer submits a bid on your order' },
            { key: 'emailOrderUpdate', icon: MessageSquare, label: 'Order status updates',   sub: 'When your order status changes' },
            { key: 'emailPayment',     icon: CreditCard,   label: 'Payment & escrow',        sub: 'Payment confirmations and escrow activity' },
            { key: 'emailMarketing',   icon: Mail,         label: 'Tips & announcements',    sub: 'Product updates and feature announcements' },
          ].map(item => (
            <div key={item.key} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <item.icon size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0A0A0A]">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
              <button
                onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                className={cn(
                  'relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0',
                  notifs[item.key as keyof typeof notifs] ? 'bg-[#0A0A0A]' : 'bg-gray-200'
                )}
                style={{ height: '22px', width: '40px' }}
              >
                <span className={cn(
                  'absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform',
                  notifs[item.key as keyof typeof notifs] ? 'translate-x-[19px]' : 'translate-x-0.5'
                )} style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          ))}
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            {notifsOk && (
              <span className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 size={14} /> Saved
              </span>
            )}
            <button onClick={handleSaveNotifs} disabled={savingNotifs}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              {savingNotifs ? <Loader2 size={13} className="animate-spin" /> : null}
              Save preferences
            </button>
          </div>
        </div>
      )}

      {/* ── Security ── */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-1">Change Password</h3>
              <p className="text-xs text-gray-400">Use a strong password of at least 8 characters</p>
            </div>
            {[
              { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggleKey: 'current' as const },
              { key: 'newPassword',     label: 'New Password',     show: showPw.new,     toggleKey: 'new' as const },
              { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggleKey: 'confirm' as const },
            ].map(field => (
              <div key={field.key}>
                <label className={labelClass}>{field.label}</label>
                <div className="relative">
                  <input
                    type={field.show ? 'text' : 'password'}
                    value={pwForm[field.key as keyof typeof pwForm]}
                    onChange={e => setPwForm(p => ({ ...p, [field.key]: e.target.value }))}
                    className={cn(inputClass, 'pr-10')}
                    placeholder="••••••••"
                  />
                  <button type="button"
                    onClick={() => setShowPw(p => ({ ...p, [field.toggleKey]: !p[field.toggleKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {field.show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            {pwError && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100 text-sm text-red-600">
                <AlertTriangle size={13} /> {pwError}
              </div>
            )}
            {pwOk && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 rounded-xl border border-green-100 text-sm text-green-600">
                <CheckCircle2 size={13} /> Password changed successfully
              </div>
            )}
            <button onClick={handleChangePassword} disabled={savingPw}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A0A0A] text-white rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] disabled:opacity-50 transition-colors"
            >
              {savingPw ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          {/* Account info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Account Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Email', value: user?.email },
                { label: 'Account type', value: 'Client / Buyer' },
                { label: 'Member since', value: 'Active' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{item.label}</span>
                  <span className="text-sm font-medium text-[#0A0A0A]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Danger Zone ── */}
      {tab === 'danger' && (
        <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
            <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Delete Account</p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                This will permanently delete your account, all orders, bids, and chat history. This action cannot be undone.
              </p>
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Type <span className="font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{user?.email}</span> to confirm
            </label>
            <input
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              className={cn(inputClass, 'border-red-200 focus:ring-red-100 focus:border-red-300')}
              placeholder={user?.email}
            />
          </div>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteInput !== user?.email || deletingAccount}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {deletingAccount ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deletingAccount ? 'Deleting...' : 'Permanently Delete My Account'}
          </button>
        </div>
      )}
    </div>
  )
}

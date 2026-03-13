import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('admin@nexabid.com')
  const [password, setPassword] = useState('Admin@123456')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [seedMsg, setSeedMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { user, accessToken } = res.data.data
      if (user.role !== 'admin') {
        setError('This account does not have admin access.')
        return
      }
      login(user, accessToken)
      navigate('/')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    setSeedMsg(null)
    setError(null)
    try {
      const res = await api.post('/admin/seed', { email, password })
      if (res.data.success) {
        setSeedMsg(`✅ Admin created! You can now sign in.`)
      } else {
        setSeedMsg(res.data.message)
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setSeedMsg(e.response?.data?.message || 'Seed failed — is the backend running?')
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <Shield size={24} className="text-[#0A0A0A]" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">NexaBid Admin</h1>
          <p className="text-white/40 text-sm mt-1">Control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {seedMsg && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-green-400 text-sm">{seedMsg}</p>
            </div>
          )}

          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all" />
          </div>

          <div>
            <label className="block text-white/70 text-xs font-medium mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all pr-11" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-white text-[#0A0A0A] rounded-xl text-sm font-bold hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* First-time setup */}
        <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-white/50 text-xs mb-3 text-center">First time? Create the admin account</p>
          <button onClick={handleSeed} disabled={seeding}
            className="w-full py-2.5 border border-white/20 text-white/70 rounded-xl text-sm font-medium hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {seeding ? 'Creating admin...' : 'Create Admin Account'}
          </button>
          <p className="text-white/30 text-[11px] text-center mt-2">
            This button disappears once an admin exists
          </p>
        </div>
      </div>
    </div>
  )
}

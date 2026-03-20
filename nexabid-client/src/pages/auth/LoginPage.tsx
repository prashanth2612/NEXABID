import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import GoogleAuthButton from '@/components/GoogleAuthButton'
import api from '@/lib/api'
import type { LoginFormData } from '@/types/auth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, setLoading, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setSubmitError(null)
      setLoading(true)
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      })
      const { user, accessToken } = response.data.data
      login(user, accessToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setSubmitError(error.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    await sleep(800)
    // Google OAuth — connect to backend later
    alert('Google OAuth will be connected to backend in Phase 2.')
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0A0A0A] relative overflow-hidden flex-col justify-between p-12">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white opacity-[0.025] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white opacity-[0.03] blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm tracking-tighter">NB</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">NexaBid</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium mb-4">
              Client Portal
            </p>
            <h1 className="text-white text-4xl font-semibold leading-[1.1] tracking-[-0.03em]">
              The smarter way to{' '}
              <span className="text-white/50">source manufacturing</span>{' '}
              partners.
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '1,200+', label: 'Manufacturers' },
              { value: '₹10Cr+', label: 'Orders Placed' },
              { value: '95%', label: 'Completion Rate' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4"
              >
                <div className="text-white text-xl font-bold tracking-tight">
                  {stat.value}
                </div>
                <div className="text-white/40 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5">
            <p className="text-white/70 text-sm leading-relaxed">
              "NexaBid cut our sourcing time by 60%. The escrow system means we
              never worry about payment disputes anymore."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold">
                RK
              </div>
              <div>
                <div className="text-white text-xs font-medium">Rahul Kumar</div>
                <div className="text-white/40 text-xs">Head of Procurement, TechCorp India</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-white/25 text-xs">
            © 2024 NexaBid. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">NB</span>
            </div>
            <span className="font-semibold text-base tracking-tight">NexaBid</span>
          </div>
        </div>

        <div className="max-w-[400px] w-full mx-auto lg:mx-0">
          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <h2 className="text-[#0A0A0A] text-3xl font-semibold tracking-[-0.03em] mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Sign in to your client account to continue
            </p>
          </div>

          {/* Google OAuth */}
          <div className="animate-fade-up animate-delay-100">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 mb-6"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6 animate-fade-up animate-delay-200">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or continue with email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-up animate-delay-300">
            {/* Error banner */}
            {submitError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none',
                  'placeholder:text-gray-400 bg-white',
                  errors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-gray-500 hover:text-black transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={cn(
                    'w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all duration-200 outline-none',
                    'placeholder:text-gray-400 bg-white',
                    errors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                {...register('rememberMe')}
                type="checkbox"
                id="rememberMe"
                className="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 cursor-pointer accent-black"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
                'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a] active:scale-[0.99]',
                'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'
              )}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth */}
          <div className="mt-4">
            <div className="relative flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <GoogleAuthButton
              role="client"
              onSuccess={(user, accessToken) => { login(user, accessToken); navigate('/dashboard') }}
              onError={(msg) => setError('email', { message: msg })}
            />
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-500 animate-fade-up animate-delay-400">
            Don't have an account?{' '}
            <Link
              to="/auth/register"
              className="text-black font-semibold hover:underline underline-offset-2"
            >
              Create account
            </Link>
          </p>

          {/* Manufacturer link */}
          <div className="mt-8 pt-6 border-t border-gray-100 animate-fade-up animate-delay-500">
            <p className="text-center text-xs text-gray-400">
              Are you a manufacturer?{' '}
              <a
                href={import.meta.env.VITE_MANUFACTURER_URL || 'http://localhost:5174'}
                className="text-gray-600 font-medium hover:text-black transition-colors"
              >
                Login to Manufacturer Portal →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

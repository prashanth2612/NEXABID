import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Building2, FileText, Mail, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { MANUFACTURING_CATEGORIES } from '@/types/auth'
import type { RegisterFormData } from '@/types/auth'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Enter a valid phone number')
      .regex(/^[+]?[\d\s\-()]{10,15}$/, 'Enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    companyName: z.string().optional(),
    gstNumber: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
        'Enter a valid GST number (e.g. 22AAAAA0000A1Z5)'
      ),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Number', valid: /[0-9]/.test(password) },
  ]

  if (!password) return null

  return (
    <div className="flex gap-2 mt-2">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-1">
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              check.valid ? 'bg-green-500' : 'bg-gray-200'
            )}
          />
          <span
            className={cn(
              'text-xs transition-colors',
              check.valid ? 'text-green-600' : 'text-gray-400'
            )}
          >
            {check.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login, setLoading, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showOptional, setShowOptional] = useState(false)
  const [verifyStep, setVerifyStep] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingUser, setPendingUser] = useState<{ user: any; accessToken: string } | null>(null)
  const [otp, setOtp] = useState('')
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { agreeToTerms: false },
  })

  const passwordValue = watch('password', '')

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setSubmitError(null)
      setLoading(true)
      const response = await api.post('/auth/register', {
        ...data,
        role: 'client',
      })
      const { user, accessToken } = response.data.data
      login(user, accessToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setSubmitError(error.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { setVerifyError('Enter the 6-digit code'); return }
    setVerifyLoading(true)
    setVerifyError('')
    try {
      const res = await api.post('/auth/verify-email', { email: pendingEmail, otp })
      const { user, accessToken } = res.data.data
      login(user, accessToken)
      navigate('/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setVerifyError(e.response?.data?.message || 'Invalid code. Try again.')
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    try {
      await api.post('/auth/send-verification', { email: pendingEmail })
      startResendCooldown()
    } catch { /* silent */ }
  }
  // ── Email Verification Screen ──────────────────────────────────
  if (verifyStep) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-2">Verify your email</h2>
            <p className="text-gray-500 text-sm">
              We sent a 6-digit code to <span className="font-semibold text-[#0A0A0A]">{pendingEmail}</span>
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-5">
            {/* OTP Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30 transition-all"
              />
            </div>

            {verifyError && (
              <p className="text-sm text-red-500 text-center">{verifyError}</p>
            )}

            <button
              onClick={handleVerify}
              disabled={verifyLoading || otp.length !== 6}
              className="w-full py-3.5 bg-[#0A0A0A] text-white font-semibold rounded-xl hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifyLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
              {verifyLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="font-semibold text-[#0A0A0A] hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                </button>
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 text-center">
              <button
                onClick={() => { setVerifyStep(false); setOtp(''); setVerifyError('') }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[46%] bg-[#0A0A0A] relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white opacity-[0.025] blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-white opacity-[0.03] blur-[90px]" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm tracking-tighter">NB</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">NexaBid</span>
          </div>
        </div>

        {/* Steps */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-[0.2em] font-medium mb-4">
              Get started in minutes
            </p>
            <h1 className="text-white text-3xl font-semibold leading-[1.15] tracking-[-0.03em]">
              Post your first order
              <br />
              <span className="text-white/45">in under 5 minutes.</span>
            </h1>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Set up your client profile in seconds',
              },
              {
                step: '02',
                title: 'Post your order',
                desc: 'Describe what you need, set your budget',
              },
              {
                step: '03',
                title: 'Pay to escrow',
                desc: 'Funds are held securely until delivery',
              },
              {
                step: '04',
                title: 'Choose your manufacturer',
                desc: 'Review bids and select the best fit',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="flex items-start gap-4 bg-white/[0.04] border border-white/[0.07] rounded-xl p-4"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white/60 text-xs font-bold">{item.step}</span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{item.title}</div>
                  <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
                </div>
                <CheckCircle2 size={16} className="text-white/20 ml-auto mt-0.5 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/25 text-xs">© 2024 NexaBid. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">NB</span>
            </div>
            <span className="font-semibold text-base tracking-tight">NexaBid</span>
          </div>
        </div>

        <div className="max-w-[440px] w-full mx-auto lg:mx-0">
          {/* Header */}
          <div className="mb-7 animate-fade-up">
            <h2 className="text-[#0A0A0A] text-3xl font-semibold tracking-[-0.03em] mb-2">
              Create your account
            </h2>
            <p className="text-gray-500 text-sm">
              Join 500+ businesses sourcing on NexaBid
            </p>
          </div>

          {/* Google OAuth */}
          <div className="animate-fade-up animate-delay-100 mb-5">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5 animate-fade-up animate-delay-200">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or fill in your details</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-up animate-delay-300">
            {submitError && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{submitError}</p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <input
                {...register('fullName')}
                type="text"
                autoComplete="name"
                placeholder="Rahul Kumar"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
                  errors.fullName
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                )}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1.5">{errors.fullName.message}</p>
              )}
            </div>

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
                  'w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
                  errors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                )}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone number
              </label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 min-w-[72px]">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  className={cn(
                    'flex-1 px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
                    errors.phone
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                  )}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  className={cn(
                    'w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
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
              <PasswordStrength password={passwordValue} />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={cn(
                    'w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
                    errors.confirmPassword
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Optional Business Details Toggle */}
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors pt-1"
            >
              <Building2 size={15} />
              <span>{showOptional ? 'Hide' : 'Add'} business details</span>
              <span className="text-gray-400 text-xs">(optional)</span>
              <span className="ml-auto text-gray-400">{showOptional ? '−' : '+'}</span>
            </button>

            {/* Optional Fields */}
            {showOptional && (
              <div className="space-y-4 pt-1 pb-1 border-t border-gray-100 animate-fade-up">
                {/* Company Name */}
                <div className="pt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company name
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('companyName')}
                      type="text"
                      placeholder="Your Company Pvt. Ltd."
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100 text-sm transition-all duration-200 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    GST number
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('gstNumber')}
                      type="text"
                      placeholder="22AAAAA0000A1Z5"
                      className={cn(
                        'w-full pl-9 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400 uppercase',
                        errors.gstNumber
                          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                          : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                      )}
                    />
                  </div>
                  {errors.gstNumber && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.gstNumber.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Terms */}
            <div>
              <div className="flex items-start gap-2.5">
                <input
                  {...register('agreeToTerms')}
                  type="checkbox"
                  id="agreeToTerms"
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 cursor-pointer accent-black flex-shrink-0"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-black font-medium hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-black font-medium hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1.5">{errors.agreeToTerms.message}</p>
              )}
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
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-gray-500 animate-fade-up animate-delay-400">
            Already have an account?{' '}
            <Link
              to="/auth/login"
              className="text-black font-semibold hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>

          {/* Manufacturer link */}
          <div className="mt-6 pt-5 border-t border-gray-100 animate-fade-up animate-delay-500">
            <p className="text-center text-xs text-gray-400">
              Are you a manufacturer?{' '}
              <a
                href={import.meta.env.VITE_MANUFACTURER_URL || 'http://localhost:5174'}
                className="text-gray-600 font-medium hover:text-black transition-colors"
              >
                Register as Manufacturer →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

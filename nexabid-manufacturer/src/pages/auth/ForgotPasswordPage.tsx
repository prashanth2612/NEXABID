import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = { email: string }

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await api.post('/auth/forgot-password', { email: data.email })
    setSentEmail(data.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-[400px] w-full text-center animate-fade-up">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] mb-3">Check your inbox</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            We've sent a password reset link to
          </p>
          <p className="text-black font-medium text-sm mb-8">{sentEmail}</p>
          <p className="text-gray-400 text-xs mb-8">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => setSent(false)}
              className="text-black font-medium hover:underline"
            >
              try again
            </button>
          </p>
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-[400px] w-full animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">NB</span>
          </div>
          <span className="font-semibold text-base tracking-tight">NexaBid</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-[0.12em] border border-gray-200 rounded-full px-2 py-0.5">
            Manufacturer
          </span>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-[-0.03em] mb-2">
            Reset your password
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@factory.com"
                className={cn(
                  'w-full pl-9 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none placeholder:text-gray-400',
                  errors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-100'
                )}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200',
              'bg-[#0A0A0A] text-white hover:bg-[#1a1a1a] active:scale-[0.99]',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending link...
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

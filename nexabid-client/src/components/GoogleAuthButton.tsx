import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import api from '@/lib/api'

// Google Client ID — set in .env as VITE_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

interface Props {
  role: 'client' | 'manufacturer'
  onSuccess: (user: any, accessToken: string) => void
  onError?: (msg: string) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (el: HTMLElement, config: any) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function GoogleAuthButton({ role, onSuccess, onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    // Load Google Identity Services script
    const existing = document.getElementById('google-gsi-script')
    if (existing) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!scriptLoaded || !buttonRef.current || !GOOGLE_CLIENT_ID) return

    window.google?.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setLoading(true)
        try {
          const res = await api.post('/auth/google', {
            idToken: response.credential,
            role,
          })
          const { user, accessToken } = res.data.data
          onSuccess(user, accessToken)
        } catch (err: unknown) {
          const e = err as { response?: { data?: { message?: string } } }
          onError?.(e.response?.data?.message || 'Google sign-in failed')
        } finally {
          setLoading(false)
        }
      },
    })

    window.google?.accounts.id.renderButton(buttonRef.current, {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      text: 'continue_with',
      size: 'large',
      logo_alignment: 'left',
      width: buttonRef.current.offsetWidth,
    })
  }, [scriptLoaded, role])

  if (!GOOGLE_CLIENT_ID) return null

  if (loading) {
    return (
      <div className="w-full h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        Signing in with Google...
      </div>
    )
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full [&>div]:w-full [&>div>div]:w-full [&_iframe]:w-full" />
    </div>
  )
}

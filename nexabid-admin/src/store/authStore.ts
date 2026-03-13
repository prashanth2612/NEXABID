import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Admin {
  id: string
  fullName: string
  email: string
  role: string
}

interface AuthStore {
  admin: Admin | null
  token: string | null
  isAuthenticated: boolean
  login: (admin: Admin, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      login: (admin, token) => {
        localStorage.setItem('nexabid-admin-token', token)
        set({ admin, token, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('nexabid-admin-token')
        set({ admin: null, token: null, isAuthenticated: false })
      },
    }),
    { name: 'nexabid-admin-auth', partialize: (s) => ({ admin: s.admin, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)

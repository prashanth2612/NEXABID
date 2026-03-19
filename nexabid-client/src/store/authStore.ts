import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '@/types/auth'

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void
  setUser: (user: User, token?: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setUser: (user, token) => set((s) => ({ user, token: token ?? s.token })),

      setError: (error) => set({ error }),
    }),
    {
      name: 'nexabid-client-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

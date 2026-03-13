import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, Manufacturer } from '@/types/auth'

interface AuthStore extends AuthState {
  login: (manufacturer: Manufacturer, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      manufacturer: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (manufacturer, token) =>
        set({
          manufacturer,
          token,
          isAuthenticated: true,
          error: null,
        }),

      logout: () =>
        set({
          manufacturer: null,
          token: null,
          isAuthenticated: false,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setUser: (user) => set({ user }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'nexabid-manufacturer-auth',
      partialize: (state) => ({
        manufacturer: state.manufacturer,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

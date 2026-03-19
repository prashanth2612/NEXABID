import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User } from '@/types/auth'

interface AuthStore extends AuthState {
  login: (user: User, token: string) => void
<<<<<<< HEAD
  setUser: (user: User, token?: string) => void
=======
  setUser: (user: User) => void
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
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

<<<<<<< HEAD
      setUser: (user, token) => set((s) => ({ user, token: token ?? s.token })),
=======
      setUser: (user) => set({ user }),
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c

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

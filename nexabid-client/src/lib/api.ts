import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

<<<<<<< HEAD
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: BASE,
=======
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
<<<<<<< HEAD
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise: Promise<string | null> | null = null

const tryRefresh = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise
  refreshPromise = (async () => {
    try {
      const res = await axios.post(`${BASE}/auth/refresh-token`, {}, { withCredentials: true })
      const { token: newToken, user } = res.data?.data ?? {}
      if (newToken && user) {
        useAuthStore.getState().login(user, newToken)
        return newToken
      }
    } catch {
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    } finally {
      refreshPromise = null
    }
    return null
  })()
  return refreshPromise
}

// Handle errors — auto token refresh on 401, retry on 429
=======
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors — auto logout on 401, retry on 429
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
<<<<<<< HEAD
    const cfg = error.config

    if (status === 401 && !cfg._refreshed) {
      cfg._refreshed = true
      const newToken = await tryRefresh()
      if (newToken) {
        cfg.headers.Authorization = `Bearer ${newToken}`
        return api(cfg)
      }
      // tryRefresh already redirected to login
      return Promise.reject(error)
    }

    if (status === 429 && !cfg._retried) {
      cfg._retried = true
      await new Promise(r => setTimeout(r, 2000))
      return api(cfg)
    }

=======
    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/auth/login'
    }
    if (status === 429) {
      // Wait 2s and retry once
      const cfg = error.config
      if (!cfg._retried) {
        cfg._retried = true
        await new Promise(r => setTimeout(r, 2000))
        return api(cfg)
      }
    }
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
    return Promise.reject(error)
  }
)

export default api

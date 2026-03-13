import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors — auto logout on 401, retry on 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
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
    return Promise.reject(error)
  }
)

export default api

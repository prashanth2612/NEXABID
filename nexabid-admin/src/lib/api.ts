import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexabid-admin-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nexabid-admin-token')
      window.location.href = '/login'
    }
    if (error.response?.status === 429) {
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

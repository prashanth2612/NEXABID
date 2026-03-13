export interface LoginFormData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterFormData {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  companyName?: string
  gstNumber?: string
  agreeToTerms: boolean
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  gstNumber?: string
  role: 'client'
  avatar?: string
  isVerified: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

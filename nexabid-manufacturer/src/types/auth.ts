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
  businessName?: string
  gstNumber?: string
  category?: string
  agreeToTerms: boolean
}

export interface Manufacturer {
  id: string
  fullName: string
  email: string
  phone: string
  businessName?: string
  gstNumber?: string
  category?: string
  role: 'manufacturer'
  avatar?: string
  isVerified: boolean
  rating?: number
  totalOrders?: number
  createdAt: string
}

export interface AuthState {
  manufacturer: Manufacturer | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export const MANUFACTURING_CATEGORIES = [
  'Textiles & Garments',
  'Electronics & Components',
  'Hardware & Metals',
  'Plastics & Polymers',
  'Furniture & Wood',
  'Chemicals & Pharma',
  'Food & Beverages',
  'Automotive Parts',
  'Paper & Packaging',
  'Other',
] as const

export type ManufacturingCategory = typeof MANUFACTURING_CATEGORIES[number]

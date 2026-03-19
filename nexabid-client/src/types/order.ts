export type OrderStatus =
  | 'draft'
  | 'posted'
  | 'bidding'
  | 'confirmed'
  | 'manufacturing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type OrderCategory =
  | 'Textiles & Garments'
  | 'Electronics & Components'
  | 'Hardware & Metals'
  | 'Plastics & Polymers'
  | 'Furniture & Wood'
  | 'Chemicals & Pharma'
  | 'Food & Beverages'
  | 'Automotive Parts'
  | 'Paper & Packaging'
  | 'Other'

export interface Order {
  id: string
  orderNumber: string
  title: string
  description: string
  category: OrderCategory
  quantity: number
  unit: string
  budgetMin: number
  budgetMax: number
  isFixedPrice: boolean
  fixedPrice?: number
  deliveryDate: string
  deliveryLocation: string
  specialNotes?: string
  attachments?: string[]
  status: OrderStatus
  clientId: string
  escrowStatus?: 'pending' | 'escrowed' | 'released' | 'refunded'
  trackingNumber?: string
  trackingUrl?: string
  courierName?: string
  shippedAt?: string
  estimatedDelivery?: string
  escrowAmount?: number
  totalBids: number
  acceptedBidId?: string
  createdAt: string
  updatedAt: string
}

export interface Bid {
  id: string
  orderId: string
  manufacturerId: string | { fullName: string; businessName?: string; rating?: number }
  proposedPrice: number
  deliveryDays: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  aiConfidenceScore?: number
  createdAt: string
}

export interface CreateOrderInput {
  title: string
  description: string
  category: OrderCategory
  quantity: number
  unit: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  deliveryDate: string
  deliveryLocation: string
  specialNotes?: string
}

export const ORDER_CATEGORIES: OrderCategory[] = [
  'Textiles & Garments', 'Electronics & Components', 'Hardware & Metals',
  'Plastics & Polymers', 'Furniture & Wood', 'Chemicals & Pharma',
  'Food & Beverages', 'Automotive Parts', 'Paper & Packaging', 'Other',
]

export const ORDER_UNITS = [
  'Pieces', 'Units', 'Kg', 'Tonnes',
  'Meters', 'Liters', 'Boxes', 'Sets', 'Pairs',
]

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  draft:         { label: 'Draft',          color: '#6b7280', bg: '#f3f4f6' },
  posted:        { label: 'Posted',         color: '#2563eb', bg: '#eff6ff' },
  bidding:       { label: 'Bids Received',  color: '#7c3aed', bg: '#f5f3ff' },
  confirmed:     { label: 'Confirmed',      color: '#0891b2', bg: '#ecfeff' },
  manufacturing: { label: 'Manufacturing',  color: '#d97706', bg: '#fffbeb' },
  shipped:       { label: 'Shipped',        color: '#ea580c', bg: '#fff7ed' },
  delivered:     { label: 'Delivered',      color: '#16a34a', bg: '#f0fdf4' },
  completed:     { label: 'Completed',      color: '#15803d', bg: '#f0fdf4' },
  cancelled:     { label: 'Cancelled',      color: '#dc2626', bg: '#fef2f2' },
} as Record<string, { label: string; color: string; bg: string }>

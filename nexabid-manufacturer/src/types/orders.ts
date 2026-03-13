export type SwipeAction = 'accept' | 'reject'

export type OrderStatus =
  | 'posted'
  | 'bidding'
  | 'confirmed'
  | 'manufacturing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export interface SwipeOrder {
  id: string
  orderNumber: string
  title: string
  category: string
  clientName: string
  clientCompany: string
  clientRating: number
  clientVerified: boolean
  quantity: number
  unit: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  deliveryDate: string
  deliveryDays: number
  deliveryLocation: string
  specialNotes?: string
  isUrgent: boolean
  isBulk: boolean
  isNew: boolean
  postedAt: string
}

export interface ActiveOrder extends SwipeOrder {
  status: OrderStatus
  acceptedAt: string
  agreedPrice?: number
  manufacturingStarted?: boolean
  manufacturingCompletedAt?: string
  escrowAmount: number
  bidId?: string
}

export interface ManufacturerStats {
  totalEarnings: number
  inEscrow: number
  activeOrders: number
  completedOrders: number
  acceptanceRate: number
  avgResponseTime: string
  rating: number
  totalReviews: number
}

export const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  posted:        { label: 'Pending Bid',    color: '#2563eb', bg: '#eff6ff' },
  bidding:       { label: 'Bids Received',  color: '#7c3aed', bg: '#f5f3ff' },
  confirmed:     { label: 'Confirmed',      color: '#0891b2', bg: '#ecfeff' },
  manufacturing: { label: 'Manufacturing',  color: '#d97706', bg: '#fffbeb' },
  shipped:       { label: 'Shipped',        color: '#ea580c', bg: '#fff7ed' },
  delivered:     { label: 'Delivered',      color: '#16a34a', bg: '#f0fdf4' },
  completed:     { label: 'Completed',      color: '#15803d', bg: '#f0fdf4' },
  cancelled:     { label: 'Cancelled',      color: '#dc2626', bg: '#fef2f2' },
}

export const CATEGORY_COLORS: Record<string, string> = {
  'Textiles & Garments':      '#6366f1',
  'Electronics & Components': '#0ea5e9',
  'Hardware & Metals':        '#64748b',
  'Plastics & Polymers':      '#f97316',
  'Furniture & Wood':         '#92400e',
  'Chemicals & Pharma':       '#10b981',
  'Food & Beverages':         '#f59e0b',
  'Automotive Parts':         '#ef4444',
  'Paper & Packaging':        '#8b5cf6',
  'Other':                    '#6b7280',
}

export const ORDER_CATEGORIES = [
  'Textiles & Garments', 'Electronics & Components', 'Hardware & Metals',
  'Plastics & Polymers', 'Furniture & Wood', 'Chemicals & Pharma',
  'Food & Beverages', 'Automotive Parts', 'Paper & Packaging', 'Other',
] as const

import { z } from 'zod'

export const createBidSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  proposedPrice: z.coerce.number().min(1, 'Price must be at least 1'),
  deliveryDays: z.coerce.number().min(1, 'Delivery days must be at least 1'),
  message: z.string().min(10, 'Message must be at least 10 characters').trim(),
})

export const rejectBidSchema = z.object({
  clientNote: z.string().optional(),
})

export type CreateBidInput = z.infer<typeof createBidSchema>
export type RejectBidInput = z.infer<typeof rejectBidSchema>

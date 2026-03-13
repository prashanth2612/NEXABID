import { z } from 'zod'

const orderBaseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').trim(),
  description: z.string().min(20, 'Description must be at least 20 characters').trim(),
  category: z.enum([
    'Textiles & Garments', 'Electronics & Components', 'Hardware & Metals',
    'Plastics & Polymers', 'Furniture & Wood', 'Chemicals & Pharma',
    'Food & Beverages', 'Automotive Parts', 'Paper & Packaging', 'Other',
  ]),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  isFixedPrice: z.boolean(),
  fixedPrice: z.coerce.number().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  deliveryDate: z.string().min(1, 'Delivery date is required').refine(
    (d) => !isNaN(new Date(d).getTime()),
    'Enter a valid delivery date'
  ),
  deliveryLocation: z.string().min(3, 'Delivery location is required').trim(),
  specialNotes: z.string().optional(),
  saveDraft: z.boolean().optional().default(false),
})

export const createOrderSchema = orderBaseSchema.superRefine((data, ctx) => {
  if (data.isFixedPrice) {
    if (!data.fixedPrice || data.fixedPrice < 1) {
      ctx.addIssue({ code: 'custom', path: ['fixedPrice'], message: 'Enter a valid fixed price' })
    }
  } else {
    if (!data.budgetMin || data.budgetMin < 1) {
      ctx.addIssue({ code: 'custom', path: ['budgetMin'], message: 'Enter minimum budget' })
    }
    if (!data.budgetMax || data.budgetMax < 1) {
      ctx.addIssue({ code: 'custom', path: ['budgetMax'], message: 'Enter maximum budget' })
    }
    if (data.budgetMin && data.budgetMax && data.budgetMin >= data.budgetMax) {
      ctx.addIssue({ code: 'custom', path: ['budgetMax'], message: 'Max budget must be greater than min' })
    }
  }
})

// Use base schema (without superRefine) for partial updates
export const updateOrderSchema = orderBaseSchema.partial()

export const swipeOrderSchema = z.object({
  action: z.enum(['accept', 'reject']),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>
export type SwipeOrderInput = z.infer<typeof swipeOrderSchema>

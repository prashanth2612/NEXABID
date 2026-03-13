import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').trim(),
  email: z.string().email('Enter a valid email address').toLowerCase(),
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  role: z.enum(['client', 'manufacturer'], {
    errorMap: () => ({ message: 'Role must be client or manufacturer' }),
  }),
  // Client optional fields
  companyName: z.string().optional(),
  gstNumber: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      'Enter a valid GST number'
    ),
  // Manufacturer optional fields
  businessName: z.string().optional(),
  category: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
})

export const verifyOTPSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address').toLowerCase(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

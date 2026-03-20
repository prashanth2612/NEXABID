import { Router } from 'express'
import * as authController from './auth.controller'
import { authenticate } from '../../middleware/auth'
import { validate } from '../../middleware/validate'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOTPSchema,
  resetPasswordSchema,
} from './auth.schema'

const router = Router()

// Public routes
router.post('/register', validate(registerSchema), authController.register)
router.post('/login', validate(loginSchema), authController.login)
router.post('/refresh-token', authController.refreshTokens)
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/verify-otp', validate(verifyOTPSchema), authController.verifyOTP)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)
router.post('/send-verification', authController.sendEmailVerification)
router.post('/verify-email', authController.verifyEmailOTP)
router.post('/google', authController.googleLogin)

// Protected routes
router.get('/me', authenticate, authController.getMe)
router.post('/logout', authenticate, authController.logout)

export default router

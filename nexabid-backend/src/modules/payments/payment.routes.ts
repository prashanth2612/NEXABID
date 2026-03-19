import { Router } from 'express'
import * as paymentController from './payment.controller'
import { authenticate, authorizeRoles } from '../../middleware/auth'

const router = Router()

// Webhook — no auth (Razorpay calls this)
router.post('/webhook', paymentController.handleWebhook)

// All other routes require auth
router.use(authenticate)

// Client initiates payment for a confirmed order
router.post('/initiate', authorizeRoles('client'), paymentController.initiatePayment)

<<<<<<< HEAD
// DEV ONLY — simulate payment without going through Razorpay
router.post('/simulate', authorizeRoles('client'), paymentController.simulatePayment)

=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
// Client verifies Razorpay payment after checkout
router.post('/verify', authorizeRoles('client'), paymentController.verifyPayment)

// Client gets their payment history
router.get('/my-payments', authorizeRoles('client'), paymentController.getMyPayments)

// Get payment by order ID
router.get('/order/:orderId', paymentController.getPaymentByOrder)

// Get single payment status
router.get('/:id/status', paymentController.getPaymentStatus)

// Client sends OTP for delivery verification
router.post('/order/:orderId/send-otp', authorizeRoles('client'), paymentController.sendDeliveryOtp)

// Client verifies OTP → releases escrow
router.post('/:id/confirm-otp', authorizeRoles('client'), paymentController.verifyOtpAndRelease)

// Client requests refund
router.post('/:id/refund', authorizeRoles('client'), paymentController.initiateRefund)

<<<<<<< HEAD
// Client raises a dispute on an escrowed payment
router.post('/:id/dispute', authorizeRoles('client'), paymentController.raiseDispute)

// Admin resolves dispute (release to manufacturer OR refund to client)
router.post('/:id/resolve-dispute', authorizeRoles('admin'), paymentController.resolveDispute)

=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
export default router

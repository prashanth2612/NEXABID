import { Response, NextFunction } from 'express'
import * as paymentService from './payment.service'
import { sendSuccess } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'
import crypto from 'crypto'
import { env } from '../../config/env'
import { Payment } from './payment.model'
import { Order } from '../orders/order.model'

export const initiatePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await paymentService.initiatePayment(req.body.orderId, req.user!.userId)
    sendSuccess(res, result, 'Payment initiated', 201)
  } catch (e) { next(e) }
}

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body
    const payment = await paymentService.verifyPayment(
      razorpayOrderId, razorpayPaymentId, razorpaySignature, req.user!.userId
    )
    sendSuccess(res, { payment }, 'Payment verified — funds in escrow')
  } catch (e) { next(e) }
}

export const sendDeliveryOtp = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await paymentService.sendDeliveryOtp(req.params.orderId, req.user!.userId)
    sendSuccess(res, result, 'OTP sent to your email')
  } catch (e) { next(e) }
}

export const verifyOtpAndRelease = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await paymentService.verifyOtpAndRelease(req.params.id, req.body.otp, req.user!.userId)
    sendSuccess(res, { payment }, 'OTP verified — payment released to manufacturer 🎉')
  } catch (e) { next(e) }
}

export const getPaymentByOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await paymentService.getPaymentByOrder(req.params.orderId, req.user!.userId)
    sendSuccess(res, { payment }, 'Payment fetched')
  } catch (e) { next(e) }
}

export const getPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('orderId', 'title orderNumber status')
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' })
      return
    }
    sendSuccess(res, { payment }, 'Payment status fetched')
  } catch (e) { next(e) }
}

export const initiateRefund = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await paymentService.initiateRefund(req.params.id, req.user!.userId, req.body.reason || 'Client requested refund')
    sendSuccess(res, { payment }, 'Refund initiated')
  } catch (e) { next(e) }
}

export const getMyPayments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await paymentService.getMyPayments(req.user!.userId)
    sendSuccess(res, { payments }, 'Payments fetched')
  } catch (e) { next(e) }
}

// Razorpay webhook handler
export const handleWebhook = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex')
      if (expectedSig !== signature) {
        res.status(400).json({ success: false, message: 'Invalid webhook signature' })
        return
      }
    }

    const event = req.body.event
    const payload = req.body.payload?.payment?.entity

    if (event === 'payment.captured' && payload) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: payload.order_id },
        { status: 'escrowed', razorpayPaymentId: payload.id }
      )
      await Order.findOneAndUpdate(
        { orderNumber: payload.receipt },
        { escrowStatus: 'escrowed', status: 'manufacturing' }
      )
    }

    if (event === 'payment.failed' && payload) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: payload.order_id },
        { status: 'failed' }
      )
    }

    res.json({ received: true })
  } catch (e) { next(e) }
}

export const raiseDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await (await import('./payment.service')).raiseDispute(req.params.id, req.user!.userId, req.body.reason || 'No reason provided')
    sendSuccess(res, { payment }, 'Dispute raised — admin has been notified')
  } catch (e) { next(e) }
}

export const resolveDispute = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payment = await (await import('./payment.service')).resolveDispute(req.params.id, req.body.resolution, req.body.adminNote || '')
    sendSuccess(res, { payment }, `Dispute resolved — payment ${req.body.resolution === 'release' ? 'released to manufacturer' : 'refunded to client'}`)
  } catch (e) { next(e) }
}

// DEV ONLY — simulate payment without Razorpay
export const simulatePayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ success: false, message: 'Simulate payment is disabled in production' })
      return
    }
    const result = await (await import('./payment.service')).simulatePayment(req.body.orderId, req.user!.userId)
    sendSuccess(res, result, '✅ Payment simulated — escrow active, order moved to manufacturing')
  } catch (e) { next(e) }
}

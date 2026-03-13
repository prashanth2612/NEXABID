import crypto from 'crypto'
import mongoose from 'mongoose'
import { getRazorpay } from '../../config/razorpay'
import { Payment } from './payment.model'
import { Order } from '../orders/order.model'
import { createError } from '../../middleware/errorHandler'
import { sendEmail } from '../../shared/utils/email'
import { env } from '../../config/env'

// ─── Generate 6-digit OTP ─────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000))

// ─── 1. Initiate Payment — create Razorpay order ──────────────────
export const initiatePayment = async (orderId: string, clientId: string) => {
  const order = await Order.findById(orderId).populate('clientId', 'email fullName')
  if (!order) throw createError('Order not found', 404)
  if (order.clientId._id.toString() !== clientId) throw createError('Access denied', 403)
  if (!['confirmed', 'bidding', 'posted'].includes(order.status)) {
    throw createError('Order must be confirmed before payment', 400)
  }

  // Amount in paise (Razorpay requires smallest currency unit)
  const amount = order.escrowAmount || order.fixedPrice || order.budgetMax || 0
  if (amount <= 0) throw createError('Invalid order amount', 400)
  const amountPaise = Math.round(amount * 100)

  const razorpay = getRazorpay()
  const rzpOrder = await razorpay.orders.create({
    amount: amountPaise,
    currency: 'INR',
    receipt: order.orderNumber,
    notes: {
      orderId: orderId,
      clientId: clientId,
    },
  })

  // Save payment record
  const payment = await Payment.create({
    orderId: new mongoose.Types.ObjectId(orderId),
    clientId: new mongoose.Types.ObjectId(clientId),
    manufacturerId: order.acceptedManufacturerId,
    amount,
    currency: 'INR',
    razorpayOrderId: rzpOrder.id,
    status: 'created',
  })

  // Update order escrow status
  await Order.findByIdAndUpdate(orderId, {
    escrowStatus: 'pending',
    escrowAmount: amount,
  })

  return {
    payment,
    razorpayOrderId: rzpOrder.id,
    amount: amountPaise,
    currency: 'INR',
    keyId: env.RAZORPAY_KEY_ID,
  }
}

// ─── 2. Verify Payment — called after Razorpay checkout success ───
export const verifyPayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  clientId: string
) => {
  // Verify signature
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex')

  if (expectedSignature !== razorpaySignature) {
    throw createError('Payment verification failed — invalid signature', 400)
  }

  const payment = await Payment.findOne({ razorpayOrderId })
  if (!payment) throw createError('Payment record not found', 404)
  if (payment.clientId.toString() !== clientId) throw createError('Access denied', 403)

  // Mark payment as escrowed
  payment.razorpayPaymentId = razorpayPaymentId
  payment.razorpaySignature = razorpaySignature
  payment.status = 'escrowed'
  await payment.save()

  // Update order
  await Order.findByIdAndUpdate(payment.orderId, {
    escrowStatus: 'escrowed',
    status: 'manufacturing',
  })

  return payment
}

// ─── 3. Send Delivery OTP ─────────────────────────────────────────
export const sendDeliveryOtp = async (orderId: string, clientId: string) => {
  const payment = await Payment.findOne({ orderId, status: 'escrowed' }).select('+deliveryOtp')
  if (!payment) throw createError('No active escrow found for this order', 404)
  if (payment.clientId.toString() !== clientId) throw createError('Access denied', 403)

  const otp = generateOtp()
  payment.deliveryOtp = otp
  payment.otpSentAt = new Date()
  payment.otpAttempts = 0
  await payment.save()

  // Get client email
  const { User } = await import('../auth/auth.model')
  const client = await User.findById(clientId)
  if (client?.email) {
    await sendEmail({
      to: client.email,
      subject: 'NexaBid — Delivery Verification OTP',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">Delivery Verification OTP</h2>
          <p>Your order is ready for delivery. Share this OTP with the delivery agent to confirm receipt and release payment to the manufacturer.</p>
          <div style="background:#f3f4f6;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Your OTP</p>
            <p style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#0A0A0A;margin:0">${otp}</p>
          </div>
          <p style="color:#6b7280;font-size:13px">This OTP expires in 30 minutes. Do not share with anyone except the delivery agent.</p>
        </div>
      `,
    })
  }

  return { message: 'OTP sent to your registered email', otpSentAt: payment.otpSentAt }
}

// ─── 4. Verify OTP + Release Escrow ──────────────────────────────
export const verifyOtpAndRelease = async (paymentId: string, otp: string, clientId: string) => {
  const payment = await Payment.findById(paymentId).select('+deliveryOtp')
  if (!payment) throw createError('Payment not found', 404)
  if (payment.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (payment.status !== 'escrowed') throw createError('Payment is not in escrow', 400)

  // Check OTP attempts
  if (payment.otpAttempts >= 5) throw createError('Too many OTP attempts. Contact support.', 429)

  // Check OTP expiry (30 min)
  if (payment.otpSentAt) {
    const elapsed = Date.now() - payment.otpSentAt.getTime()
    if (elapsed > 30 * 60 * 1000) throw createError('OTP has expired. Request a new one.', 400)
  }

  payment.otpAttempts += 1

  if (payment.deliveryOtp !== otp) {
    await payment.save()
    throw createError(`Invalid OTP. ${5 - payment.otpAttempts} attempts remaining.`, 400)
  }

  // OTP correct — release escrow
  payment.status = 'released'
  payment.otpVerifiedAt = new Date()
  payment.releasedAt = new Date()
  await payment.save()

  // Update order
  await Order.findByIdAndUpdate(payment.orderId, {
    escrowStatus: 'released',
    status: 'completed',
  })

  // Notify manufacturer
  if (payment.manufacturerId) {
    const { User } = await import('../auth/auth.model')
    const manufacturer = await User.findById(payment.manufacturerId)
    if (manufacturer?.email) {
      await sendEmail({
        to: manufacturer.email,
        subject: 'NexaBid — Payment Released! 🎉',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#0A0A0A">Payment Released!</h2>
            <p>Great news! The client has confirmed delivery and your payment of <strong>₹${payment.amount.toLocaleString('en-IN')}</strong> has been released from escrow.</p>
            <p>The funds will be transferred to your registered bank account within 2-3 business days as per Razorpay's settlement schedule.</p>
            <p style="color:#6b7280;font-size:13px">Thank you for completing the order successfully.</p>
          </div>
        `,
      })
    }
  }

  return payment
}

// ─── 5. Get Payment by Order ──────────────────────────────────────
export const getPaymentByOrder = async (orderId: string, userId: string) => {
  const payment = await Payment.findOne({ orderId })
  if (!payment) throw createError('No payment found for this order', 404)

  // Allow both client and manufacturer to view
  const isOwner =
    payment.clientId.toString() === userId ||
    payment.manufacturerId?.toString() === userId
  if (!isOwner) throw createError('Access denied', 403)

  return payment
}

// ─── 6. Initiate Refund ───────────────────────────────────────────
export const initiateRefund = async (paymentId: string, clientId: string, reason: string) => {
  const payment = await Payment.findById(paymentId)
  if (!payment) throw createError('Payment not found', 404)
  if (payment.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (!['escrowed', 'paid'].includes(payment.status)) {
    throw createError('Only escrowed payments can be refunded', 400)
  }

  const razorpay = getRazorpay()

  if (payment.razorpayPaymentId) {
    await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount * 100,
      notes: { reason },
    })
  }

  payment.status = 'refunded'
  payment.refundedAt = new Date()
  payment.refundReason = reason
  await payment.save()

  await Order.findByIdAndUpdate(payment.orderId, {
    escrowStatus: 'refunded',
    status: 'cancelled',
  })

  return payment
}

// ─── 7. Get Client Payment History ───────────────────────────────
export const getMyPayments = async (clientId: string) => {
  const payments = await Payment.find({ clientId })
    .populate('orderId', 'title orderNumber category')
    .sort({ createdAt: -1 })
  return payments
}

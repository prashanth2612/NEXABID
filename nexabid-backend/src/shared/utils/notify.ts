import { Notification, type NotificationType } from '../../modules/chat/notification.model'
import type { Server as SocketServer } from 'socket.io'
import mongoose from 'mongoose'

let io: SocketServer | null = null

export const setSocketServer = (server: SocketServer) => { io = server }

export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
  meta?: Record<string, unknown>
) => {
  const notification = await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    type, title, body, link, meta,
  })

  // Emit via socket if user is connected
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification.toJSON())
  }

  return notification
}

export const notifyBidReceived = (clientId: string, orderId: string, orderTitle: string, manufacturerName: string) =>
  createNotification(clientId, 'bid_received', 'New Bid Received', `${manufacturerName} submitted a bid on "${orderTitle}"`, `/orders/${orderId}`, { orderId })

export const notifyBidAccepted = (manufacturerId: string, orderId: string, orderTitle: string) =>
  createNotification(manufacturerId, 'bid_accepted', 'Bid Accepted! 🎉', `Your bid on "${orderTitle}" was accepted`, `/orders/${orderId}`, { orderId })

export const notifyBidRejected = (manufacturerId: string, orderId: string, orderTitle: string) =>
  createNotification(manufacturerId, 'bid_rejected', 'Bid Declined', `Your bid on "${orderTitle}" was not selected`, `/orders/${orderId}`, { orderId })

export const notifyOrderConfirmed = (manufacturerId: string, orderId: string, orderTitle: string) =>
  createNotification(manufacturerId, 'order_confirmed', 'Order Confirmed', `Order "${orderTitle}" is confirmed — you can start production`, `/orders/${orderId}`, { orderId })

export const notifyPaymentEscrowed = (manufacturerId: string, orderId: string, amount: number) =>
  createNotification(manufacturerId, 'payment_escrowed', 'Payment Secured', `₹${amount.toLocaleString('en-IN')} secured in escrow for your order`, `/orders/${orderId}`, { orderId, amount })

export const notifyPaymentReleased = (manufacturerId: string, orderId: string, amount: number) =>
  createNotification(manufacturerId, 'payment_released', 'Payment Released! 💰', `₹${amount.toLocaleString('en-IN')} has been released to your account`, `/orders/${orderId}`, { orderId, amount })

export const notifyNewMessage = (userId: string, orderId: string, senderName: string) =>
  createNotification(userId, 'new_message', 'New Message', `${senderName} sent you a message`, `/chat/${orderId}`, { orderId })

// ─── Email helper (non-blocking) ─────────────────────────────────
import { sendEmail } from './email'
import { User } from '../../modules/auth/auth.model'

export const emailBidAccepted = async (manufacturerId: string, orderTitle: string, orderId: string, amount: number) => {
  try {
    const user = await User.findById(manufacturerId).select('email fullName')
    if (!user?.email) return
    await sendEmail({
      to: user.email,
      subject: `NexaBid — Your bid was accepted! 🎉`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">Bid Accepted!</h2>
          <p>Hi ${user.fullName}, your bid of <strong>₹${amount.toLocaleString('en-IN')}</strong> on "<strong>${orderTitle}</strong>" has been accepted by the client.</p>
          <p>The client will now pay into escrow. Once confirmed, you can start production.</p>
          <a href="http://localhost:5174/orders/${orderId}" style="display:inline-block;background:#0A0A0A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Order</a>
        </div>`,
    })
  } catch {}
}

export const emailBidRejected = async (manufacturerId: string, orderTitle: string) => {
  try {
    const user = await User.findById(manufacturerId).select('email fullName')
    if (!user?.email) return
    await sendEmail({
      to: user.email,
      subject: `NexaBid — Bid update on "${orderTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">Bid Not Selected</h2>
          <p>Hi ${user.fullName}, unfortunately your bid on "<strong>${orderTitle}</strong>" was not selected this time.</p>
          <p>Keep browsing orders — there are plenty of opportunities waiting for you.</p>
          <a href="http://localhost:5174/browse" style="display:inline-block;background:#0A0A0A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Browse Orders</a>
        </div>`,
    })
  } catch {}
}

export const emailBidReceived = async (clientId: string, orderTitle: string, orderId: string, manufacturerName: string, amount: number) => {
  try {
    const user = await User.findById(clientId).select('email fullName')
    if (!user?.email) return
    await sendEmail({
      to: user.email,
      subject: `NexaBid — New bid on "${orderTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">New Bid Received</h2>
          <p>Hi ${user.fullName}, <strong>${manufacturerName}</strong> has submitted a bid of <strong>₹${amount.toLocaleString('en-IN')}</strong> on your order "<strong>${orderTitle}</strong>".</p>
          <a href="http://localhost:5173/orders/${orderId}" style="display:inline-block;background:#0A0A0A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Review Bid</a>
        </div>`,
    })
  } catch {}
}

export const emailOrderConfirmed = async (manufacturerId: string, orderTitle: string, orderId: string) => {
  try {
    const user = await User.findById(manufacturerId).select('email fullName')
    if (!user?.email) return
    await sendEmail({
      to: user.email,
      subject: `NexaBid — Order confirmed, start production! 🚀`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#0A0A0A">Order Confirmed</h2>
          <p>Hi ${user.fullName}, the order "<strong>${orderTitle}</strong>" is confirmed and funds are secured in escrow.</p>
          <p>You can now start production. Click the button below to view full order details.</p>
          <a href="http://localhost:5174/orders/${orderId}" style="display:inline-block;background:#0A0A0A;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">View Order</a>
        </div>`,
    })
  } catch {}
}

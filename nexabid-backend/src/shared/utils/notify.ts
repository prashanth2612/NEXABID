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

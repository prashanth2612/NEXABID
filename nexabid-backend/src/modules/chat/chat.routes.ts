import { Router, Response, NextFunction } from 'express'
import { authenticate } from '../../middleware/auth'
import { Message } from './message.model'
import { Notification } from './notification.model'
import { Order } from '../orders/order.model'
import { sendSuccess } from '../../shared/utils/response'
import { createError } from '../../middleware/errorHandler'
import type { AuthRequest } from '../../middleware/auth'
import mongoose from 'mongoose'

const router = Router()
router.use(authenticate)

// ─── Get all chat threads (orders with messages) ──────────────────
router.get('/threads', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId)
    const role = req.user!.role

    // Get orders this user is involved in
    // For clients: all their orders. For manufacturers: orders where bid was accepted
    const orderQuery = role === 'client'
      ? { clientId: userId, status: { $nin: ['draft', 'cancelled'] } }
      : { acceptedManufacturerId: userId }

    const orders = await Order.find(orderQuery)
      .populate('clientId', 'fullName companyName')
      .populate('acceptedManufacturerId', 'fullName businessName')
      .sort({ updatedAt: -1 })

    // Get last message + unread count for each order
    const threads = await Promise.all(
      orders.map(async (order) => {
        const [lastMessage, unreadCount] = await Promise.all([
          Message.findOne({ orderId: order._id }).sort({ createdAt: -1 }).populate('senderId', 'fullName'),
          Message.countDocuments({ orderId: order._id, readBy: { $ne: userId } }),
        ])
        return { order, lastMessage, unreadCount }
      })
    )

    // Sort: threads with messages first, then by order update time
    const sorted = threads.sort((a, b) => {
      if (a.lastMessage && !b.lastMessage) return -1
      if (!a.lastMessage && b.lastMessage) return 1
      return 0
    })
    sendSuccess(res, { threads: sorted }, 'Threads fetched')
  } catch (e) { next(e) }
})

// ─── Get messages for an order ────────────────────────────────────
router.get('/order/:orderId', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId } = req.params
    const userId = req.user!.userId

    const order = await Order.findById(orderId)
    if (!order) throw createError('Order not found', 404)

    const hasAccess =
      order.clientId.toString() === userId ||
      order.acceptedManufacturerId?.toString() === userId ||
      req.user!.role === 'admin'
    if (!hasAccess) throw createError('Access denied', 403)

    const messages = await Message.find({ orderId })
      .populate('senderId', 'fullName businessName companyName')
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark as read
    await Message.updateMany(
      { orderId, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, readBy: { $ne: new mongoose.Types.ObjectId(userId) } },
      { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }
    )

    sendSuccess(res, { messages }, 'Messages fetched')
  } catch (e) { next(e) }
})

// ─── Notifications ────────────────────────────────────────────────
router.get('/notifications', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(30)
    const unreadCount = await Notification.countDocuments({ userId: req.user!.userId, isRead: false })
    sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched')
  } catch (e) { next(e) }
})

router.patch('/notifications/read-all', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user!.userId, isRead: false }, { isRead: true })
    sendSuccess(res, null, 'All notifications marked as read')
  } catch (e) { next(e) }
})

router.patch('/notifications/:id/read', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user!.userId }, { isRead: true })
    sendSuccess(res, null, 'Notification marked as read')
  } catch (e) { next(e) }
})

export default router

import { Server as HttpServer } from 'http'
import { Server as SocketServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from './config/env'
import { Message } from './modules/chat/message.model'
import { Order } from './modules/orders/order.model'
import { setSocketServer } from './shared/utils/notify'
import mongoose from 'mongoose'

interface AuthSocket extends Socket {
  userId?: string
  userRole?: string
  userName?: string
}

export const initSocket = (httpServer: HttpServer): SocketServer => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, env.MANUFACTURER_URL, env.ADMIN_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  // ─── Auth middleware ───────────────────────────────────────────
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1]
    if (!token) return next(new Error('Authentication required'))
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string; fullName?: string }
      socket.userId = decoded.userId
      socket.userRole = decoded.role
      socket.userName = decoded.fullName || 'User'
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  // ─── Connection handler ────────────────────────────────────────
  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!
    const userRole = socket.userRole!

    // Join personal room for notifications
    socket.join(`user:${userId}`)

    console.log(`[Socket] ${userRole} ${userId} connected`)

    // ─── Join order chat room ──────────────────────────────────
    socket.on('chat:join', async (orderId: string) => {
      try {
        // Verify user has access to this order
        const order = await Order.findById(orderId)
        if (!order) return

        const hasAccess =
          order.clientId.toString() === userId ||
          order.acceptedManufacturerId?.toString() === userId ||
          userRole === 'admin'

        if (!hasAccess) return

        socket.join(`order:${orderId}`)
        socket.emit('chat:joined', { orderId })

        // Send last 50 messages on join
        const messages = await Message.find({ orderId })
          .populate('senderId', 'fullName businessName companyName')
          .sort({ createdAt: 1 })
          .limit(50)
        socket.emit('chat:history', messages)

        // Mark messages as read
        await Message.updateMany(
          { orderId, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, readBy: { $ne: new mongoose.Types.ObjectId(userId) } },
          { $addToSet: { readBy: new mongoose.Types.ObjectId(userId) } }
        )
      } catch (e) {
        console.error('[Socket] chat:join error', e)
      }
    })

    // ─── Send message ──────────────────────────────────────────
    socket.on('chat:send', async (data: { orderId: string; content: string }) => {
      try {
        const { orderId, content } = data
        if (!content?.trim() || !orderId) return

        const order = await Order.findById(orderId).populate('clientId', 'fullName').populate('acceptedManufacturerId', 'fullName businessName')
        if (!order) return

        const clientIdStr = (order.clientId as any)?._id?.toString() || order.clientId?.toString()
        const mfrIdStr = (order.acceptedManufacturerId as any)?._id?.toString() || order.acceptedManufacturerId?.toString()
        const hasAccess = clientIdStr === userId || mfrIdStr === userId || userRole === 'admin'

        if (!hasAccess) {
          console.log('[Socket] chat:send access denied for user', userId)
          return
        }

        const message = await Message.create({
          orderId: new mongoose.Types.ObjectId(orderId),
          senderId: new mongoose.Types.ObjectId(userId),
          senderRole: userRole as 'client' | 'manufacturer',
          content: content.trim(),
          readBy: [new mongoose.Types.ObjectId(userId)],
        })

        const populated = await Message.findById(message._id)
          .populate('senderId', 'fullName businessName companyName')

        // Broadcast to order room
        io.to(`order:${orderId}`).emit('chat:message', populated)

        // Notify the other party
        const { notifyNewMessage } = await import('./shared/utils/notify')
        const otherUserId = order.clientId._id.toString() === userId
          ? order.acceptedManufacturerId?._id?.toString()
          : order.clientId._id.toString()

        if (otherUserId) {
          notifyNewMessage(otherUserId, orderId, socket.userName || 'Someone').catch(() => {})
        }
      } catch (e) {
        console.error('[Socket] chat:send error', e)
      }
    })

    // ─── Typing indicator ──────────────────────────────────────
    socket.on('chat:typing', (data: { orderId: string; isTyping: boolean }) => {
      socket.to(`order:${data.orderId}`).emit('chat:typing', {
        userId,
        isTyping: data.isTyping,
      })
    })

    // ─── Leave room ────────────────────────────────────────────
    socket.on('chat:leave', (orderId: string) => {
      socket.leave(`order:${orderId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[Socket] ${userRole} ${userId} disconnected`)
    })
  })

  // Make io available to notification utils
  setSocketServer(io)

  return io
}

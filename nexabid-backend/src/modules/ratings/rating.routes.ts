import { Router, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { authenticate, AuthRequest } from '../../middleware/auth'
import { Rating } from './rating.model'
import { Order } from '../orders/order.model'
import { User } from '../auth/auth.model'
import { sendSuccess, sendError } from '../../shared/utils/response'

const router = Router()
router.use(authenticate)

// ── POST /ratings — submit a rating ──────────────────────────────
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, rating, review } = req.body
    const fromUserId = req.user!.userId
    const fromRole = req.user!.role as 'client' | 'manufacturer'

    if (!orderId || !rating || !review) {
      sendError(res, 'orderId, rating, and review are required', 400); return
    }
    if (rating < 1 || rating > 5) {
      sendError(res, 'Rating must be between 1 and 5', 400); return
    }

    const order = await Order.findById(orderId)
    if (!order) { sendError(res, 'Order not found', 404); return }
    if (order.status !== 'completed') { sendError(res, 'Can only rate completed orders', 400); return }

    // Determine who to rate
    const clientId = order.clientId.toString()
    const mfrId = order.acceptedManufacturerId?.toString()

    if (fromRole === 'client' && clientId !== fromUserId) {
      sendError(res, 'Access denied', 403); return
    }
    if (fromRole === 'manufacturer' && mfrId !== fromUserId) {
      sendError(res, 'Access denied', 403); return
    }

    const toUserId = fromRole === 'client' ? mfrId : clientId
    if (!toUserId) { sendError(res, 'No counterparty to rate', 400); return }

    // Check duplicate
    const existing = await Rating.findOne({ orderId, fromUserId })
    if (existing) { sendError(res, 'You have already rated this order', 409); return }

    const newRating = await Rating.create({
      orderId: new mongoose.Types.ObjectId(orderId),
      fromUserId: new mongoose.Types.ObjectId(fromUserId),
      toUserId: new mongoose.Types.ObjectId(toUserId),
      fromRole,
      rating,
      review,
    })

    // Update user's average rating
    const allRatings = await Rating.find({ toUserId })
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length
    await User.findByIdAndUpdate(toUserId, { rating: Math.round(avg * 10) / 10, totalOrders: allRatings.length })

    sendSuccess(res, { rating: newRating }, 'Rating submitted', 201)
  } catch (e) { next(e) }
})

// ── GET /ratings/order/:orderId — ratings for an order ───────────
router.get('/order/:orderId', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ratings = await Rating.find({ orderId: req.params.orderId })
      .populate('fromUserId', 'fullName companyName businessName role')
    sendSuccess(res, { ratings })
  } catch (e) { next(e) }
})

// ── GET /ratings/user/:userId — all ratings received by a user ───
router.get('/user/:userId', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ratings = await Rating.find({ toUserId: req.params.userId })
      .populate('fromUserId', 'fullName role')
      .populate('orderId', 'title orderNumber')
      .sort({ createdAt: -1 })
    sendSuccess(res, { ratings })
  } catch (e) { next(e) }
})

// ── GET /ratings/my-rating/:orderId — check if I've rated ────────
router.get('/my-rating/:orderId', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rating = await Rating.findOne({ orderId: req.params.orderId, fromUserId: req.user!.userId })
    sendSuccess(res, { rating })
  } catch (e) { next(e) }
})

export default router

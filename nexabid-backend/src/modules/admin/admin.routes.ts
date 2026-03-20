import { Router, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { authenticate, authorizeRoles, AuthRequest } from '../../middleware/auth'
import { User } from '../auth/auth.model'
import { Order } from '../orders/order.model'
import { Bid } from '../bids/bid.model'
import { Payment } from '../payments/payment.model'
import { sendSuccess } from '../../shared/utils/response'

const router = Router()

// ── GET /admin/stats ──────────────────────────────────────────────
router.get('/stats', authenticate, authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers, totalClients, totalManufacturers,
      totalOrders, activeOrders, completedOrders,
      totalBids,
      payments,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'manufacturer' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['confirmed', 'manufacturing', 'shipped'] } }),
      Order.countDocuments({ status: 'completed' }),
      Bid.countDocuments(),
      Payment.find(),
      Order.find().sort({ createdAt: -1 }).limit(8)
        .populate('clientId', 'fullName companyName'),
      User.find().sort({ createdAt: -1 }).limit(8)
        .select('fullName email role createdAt'),
    ])

    const totalRevenue = payments.filter(p => p.escrowStatus === 'released').reduce((s, p) => s + p.amount, 0)
    const pendingPayments = payments.filter(p => p.escrowStatus === 'escrowed').reduce((s, p) => s + p.amount, 0)

    sendSuccess(res, {
      totalUsers, totalClients, totalManufacturers,
      totalOrders, activeOrders, completedOrders,
      totalBids, totalRevenue, pendingPayments,
      recentOrders, recentUsers,
    })
  } catch (e) { next(e) }
})

// ── GET /admin/users ──────────────────────────────────────────────
router.get('/users', authenticate, authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password -refreshToken')
    sendSuccess(res, { users })
  } catch (e) { next(e) }
})

// ── GET /admin/users/:id — full user detail with history ──────────
router.get('/users/:id', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }

    // Fetch their orders and bids in parallel
    const [orders, bids, payments] = await Promise.all([
      Order.find(
        user.role === 'client'
          ? { clientId: user._id }
          : { acceptedManufacturerId: user._id }
      ).sort({ createdAt: -1 }).limit(10).select('title orderNumber status createdAt escrowAmount'),
      user.role === 'manufacturer'
        ? Bid.find({ manufacturerId: user._id }).sort({ createdAt: -1 }).limit(10)
            .populate('orderId', 'title orderNumber')
            .select('proposedPrice status createdAt orderId')
        : Promise.resolve([]),
      Payment.find(
        user.role === 'client' ? { clientId: user._id } : { manufacturerId: user._id }
      ).sort({ createdAt: -1 }).limit(10).select('amount status escrowStatus createdAt'),
    ])

    const stats = {
      totalOrders: orders.length,
      totalBids: bids.length,
      totalPayments: payments.reduce((s: number, p: any) => s + (p.amount || 0), 0),
    }

    sendSuccess(res, { user, orders, bids, payments, stats })
  } catch (e) { next(e) }
})

// ── PATCH /admin/users/:id/toggle-active ─────────────────────────
router.patch('/users/:id/toggle-active', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) { res.status(404).json({ message: 'User not found' }); return }
    user.isActive = !user.isActive
    await user.save()
    sendSuccess(res, { user }, `User ${user.isActive ? 'restored' : 'suspended'}`)
  } catch (e) { next(e) }
})

// ── GET /admin/orders ─────────────────────────────────────────────
router.get('/orders', authenticate, authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('clientId', 'fullName companyName')
      .populate('acceptedManufacturerId', 'fullName businessName')
    sendSuccess(res, { orders })
  } catch (e) { next(e) }
})

// ── GET /admin/bids ───────────────────────────────────────────────
router.get('/bids', authenticate, authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bids = await Bid.find()
      .sort({ createdAt: -1 })
      .populate('orderId', 'title orderNumber status')
      .populate('manufacturerId', 'fullName businessName')
    sendSuccess(res, { bids })
  } catch (e) { next(e) }
})

// ── GET /admin/payments ───────────────────────────────────────────
router.get('/payments', authenticate, authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('orderId', 'title orderNumber')
      .populate('clientId', 'fullName')
      .populate('manufacturerId', 'fullName')
    sendSuccess(res, { payments })
  } catch (e) { next(e) }
})

// ── GET /admin/orders/:id — single order detail ──────────────────
router.get('/orders/:id', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('clientId', 'fullName email companyName phone')
      .populate('acceptedManufacturerId', 'fullName email businessName phone')
      .populate('acceptedBidId')
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    sendSuccess(res, { order })
  } catch (e) { next(e) }
})

// ── PATCH /admin/orders/:id/status — override order status ────────
router.patch('/orders/:id/status', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validStatuses = ['posted', 'bidding', 'confirmed', 'manufacturing', 'shipped', 'delivered', 'completed', 'cancelled']
    const { status, note } = req.body
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' }); return
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, $push: { adminNotes: { note, status, changedAt: new Date(), changedBy: req.user?.userId } } },
      { new: true }
    ).populate('clientId', 'fullName email').populate('acceptedManufacturerId', 'fullName email')
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    sendSuccess(res, { order }, 'Order status updated')
  } catch (e) { next(e) }
})

// ── GET /admin/bids/:id — single bid detail ───────────────────────
router.get('/bids/:id', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Bid } = await import('../bids/bid.model')
    const bid = await Bid.findById(req.params.id)
      .populate('manufacturerId', 'fullName email businessName')
      .populate('orderId', 'title orderNumber status')
    if (!bid) { res.status(404).json({ success: false, message: 'Bid not found' }); return }
    sendSuccess(res, { bid })
  } catch (e) { next(e) }
})

// ── POST /admin/seed — one-time admin creation (no auth required) ─
// Disabled automatically once an admin exists
router.post('/seed', async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const existing = await User.findOne({ role: 'admin' })
    if (existing) {
      res.json({ success: false, message: 'Admin already exists. Use login.' }); return
    }
    const password = req.body.password || 'Admin@123456'
    const hashed = await bcrypt.hash(password, 12)
    const admin = await User.create({
      fullName: 'NexaBid Admin',
      email: req.body.email || 'admin@nexabid.com',
      phone: '9999999999',
      password: hashed,
      role: 'admin',
      isVerified: true,
      isActive: true,
    })
    res.json({ success: true, message: 'Admin created!', email: admin.email, password })
  } catch (e) { next(e) }
})

// ── PATCH /admin/users/:id/kyc — approve or reject KYC ──────────
router.patch('/users/:id/kyc', authenticate, authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, reason } = req.body
    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ success: false, message: 'status must be approved or rejected' }); return
    }
    const User = (await import('../auth/auth.model')).default
    const user = await User.findByIdAndUpdate(req.params.id, {
      kycStatus: status,
      ...(status === 'rejected' && reason ? { kycRejectionReason: reason } : {}),
    }, { new: true }).select('fullName email kycStatus kycRejectionReason')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    res.json({ success: true, data: { user }, message: `KYC ${status}` })
  } catch (e) { next(e) }
})

export default router

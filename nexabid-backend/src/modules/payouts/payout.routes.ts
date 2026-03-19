import { Router, Response, NextFunction } from 'express'
import { authenticate, authorizeRoles, AuthRequest } from '../../middleware/auth'
import { Payout } from './payout.model'
import { Payment } from '../payments/payment.model'
import { User } from '../auth/auth.model'
import { sendSuccess } from '../../shared/utils/response'
import { createError } from '../../middleware/errorHandler'

const router = Router()
router.use(authenticate)

// ── GET /payouts — manufacturer: their payout history ─────────────
router.get('/', authorizeRoles('manufacturer'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payouts = await Payout.find({ manufacturerId: req.user!.userId }).sort({ createdAt: -1 })
    // Also compute available balance: sum of released payments - sum of paid/pending payouts
    const released = await Payment.find({ manufacturerId: req.user!.userId, escrowStatus: 'released' })
    const totalReleased = released.reduce((s, p) => s + ((p as any).manufacturerPayout ?? p.amount), 0)
    const totalPaidOut = (await Payout.find({ manufacturerId: req.user!.userId, status: { $in: ['paid', 'pending', 'processing'] } }))
      .reduce((s, p) => s + p.amount, 0)
    const availableBalance = Math.max(0, totalReleased - totalPaidOut)
    sendSuccess(res, { payouts, availableBalance, totalReleased })
  } catch (e) { next(e) }
})

// ── POST /payouts/request — manufacturer requests payout ──────────
router.post('/request', authorizeRoles('manufacturer'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, method } = req.body
    if (!amount || amount < 100) throw createError('Minimum payout amount is ₹100', 400)
    if (!['bank', 'upi'].includes(method)) throw createError('Invalid payout method', 400)

    const user = await User.findById(req.user!.userId)
    if (!user) throw createError('User not found', 404)

    // Validate bank details exist
    if (method === 'bank') {
      if (!user.bankAccountNumber || !user.bankIfsc || !user.bankAccountName)
        throw createError('Please add your bank account details in Settings before requesting a payout', 400)
    }
    if (method === 'upi') {
      if (!user.upiId) throw createError('Please add your UPI ID in Settings before requesting a payout', 400)
    }

    // Check available balance
    const released = await Payment.find({ manufacturerId: req.user!.userId, escrowStatus: 'released' })
    const totalReleased = released.reduce((s, p) => s + ((p as any).manufacturerPayout ?? p.amount), 0)
    const totalPaidOut = (await Payout.find({ manufacturerId: req.user!.userId, status: { $in: ['paid', 'pending', 'processing'] } }))
      .reduce((s, p) => s + p.amount, 0)
    const available = Math.max(0, totalReleased - totalPaidOut)

    if (amount > available) throw createError(`Insufficient balance. Available: ₹${available.toLocaleString('en-IN')}`, 400)

    const payout = await Payout.create({
      manufacturerId: req.user!.userId,
      amount,
      method,
      status: 'pending',
      bankAccountName: user.bankAccountName,
      bankAccountNumber: user.bankAccountNumber,
      bankIfsc: user.bankIfsc,
      bankName: user.bankName,
      upiId: user.upiId,
    })

    sendSuccess(res, { payout }, 'Payout request submitted — admin will process within 2 business days', 201)
  } catch (e) { next(e) }
})

// ── PUT /payouts/bank-details — save bank details ─────────────────
router.put('/bank-details', authorizeRoles('manufacturer'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bankAccountName, bankAccountNumber, bankIfsc, bankName, upiId } = req.body
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { bankAccountName, bankAccountNumber, bankIfsc, bankName, upiId },
      { new: true }
    ).select('-password -refreshToken')
    sendSuccess(res, { user }, 'Bank details saved')
  } catch (e) { next(e) }
})

// ── GET /payouts/all — admin: all payout requests ─────────────────
router.get('/all', authorizeRoles('admin'), async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payouts = await Payout.find()
      .populate('manufacturerId', 'fullName email businessName')
      .sort({ createdAt: -1 })
    sendSuccess(res, { payouts })
  } catch (e) { next(e) }
})

// ── PATCH /payouts/:id/process — admin marks as processing/paid/rejected ──
router.patch('/:id/process', authorizeRoles('admin'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, adminNote, rejectionReason } = req.body
    if (!['processing', 'paid', 'rejected'].includes(status)) throw createError('Invalid status', 400)

    const update: Record<string, unknown> = { status, adminNote }
    if (status === 'paid') update.processedAt = new Date()
    if (status === 'rejected') { update.rejectedAt = new Date(); update.rejectionReason = rejectionReason }

    const payout = await Payout.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('manufacturerId', 'fullName email')
    if (!payout) throw createError('Payout not found', 404)

    sendSuccess(res, { payout }, `Payout marked as ${status}`)
  } catch (e) { next(e) }
})

export default router

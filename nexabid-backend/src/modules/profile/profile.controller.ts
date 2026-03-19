import { Response, NextFunction } from 'express'
import { User } from '../auth/auth.model'
import { Order } from '../orders/order.model'
import { Bid } from '../bids/bid.model'
import { createError } from '../../middleware/errorHandler'
import { hashPassword, comparePassword } from '../../shared/utils/hash'
import { sendSuccess } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'
import mongoose from 'mongoose'

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId)
    if (!user) throw createError('User not found', 404)
    sendSuccess(res, { user }, 'Profile fetched')
  } catch (e) { next(e) }
}

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
<<<<<<< HEAD
    const allowed = [
      'fullName', 'phone', 'companyName', 'gstNumber', 'businessName',
      'category', 'bio', 'address', 'city', 'state', 'website', 'linkedin',
      'bankAccountName', 'bankAccountNumber', 'bankIfsc', 'bankName',
    ]
=======
    const allowed = ['fullName', 'phone', 'companyName', 'gstNumber', 'businessName', 'category', 'bio', 'address', 'website', 'linkedin']
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c
    const updates: Record<string, string> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: updates },
      { new: true, runValidators: true }
    )
    if (!user) throw createError('User not found', 404)
    sendSuccess(res, { user }, 'Profile updated')
  } catch (e) { next(e) }
}

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user!.userId).select('+password')
    if (!user) throw createError('User not found', 404)

    const valid = await comparePassword(currentPassword, user.password)
    if (!valid) throw createError('Current password is incorrect', 400)

    user.password = await hashPassword(newPassword)
    await user.save()
    sendSuccess(res, null, 'Password changed successfully')
  } catch (e) { next(e) }
}

export const getProfileStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId)
    const role = req.user!.role

    if (role === 'client') {
      const [total, active, completed, cancelled] = await Promise.all([
        Order.countDocuments({ clientId: userId }),
        Order.countDocuments({ clientId: userId, status: { $in: ['posted', 'bidding', 'confirmed', 'manufacturing', 'shipped'] } }),
        Order.countDocuments({ clientId: userId, status: 'completed' }),
        Order.countDocuments({ clientId: userId, status: 'cancelled' }),
      ])
      sendSuccess(res, { totalOrders: total, activeOrders: active, completedOrders: completed, cancelledOrders: cancelled }, 'Stats fetched')
    } else {
      const [totalBids, acceptedBids, pendingBids] = await Promise.all([
        Bid.countDocuments({ manufacturerId: userId }),
        Bid.countDocuments({ manufacturerId: userId, status: 'accepted' }),
        Bid.countDocuments({ manufacturerId: userId, status: 'pending' }),
      ])
      const acceptanceRate = totalBids > 0 ? Math.round((acceptedBids / totalBids) * 100) : 0
      sendSuccess(res, { totalBids, acceptedBids, pendingBids, acceptanceRate }, 'Stats fetched')
    }
  } catch (e) { next(e) }
}
<<<<<<< HEAD

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { User } = await import('../auth/auth.model')
    await User.findByIdAndUpdate(req.user!.userId, {
      isActive: false,
      email: `deleted_${req.user!.userId}@nexabid.deleted`,
      refreshToken: null,
    })
    sendSuccess(res, {}, 'Account deleted successfully')
  } catch (e) { next(e) }
}
=======
>>>>>>> 99847c2f93ab33309d0edd61e4867843e09a039c

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
    const allowed = [
      'fullName', 'phone', 'companyName', 'gstNumber', 'businessName',
      'category', 'bio', 'address', 'city', 'state', 'website', 'linkedin',
      'bankAccountName', 'bankAccountNumber', 'bankIfsc', 'bankName',
    ]
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

// ── Avatar upload (base64, max 2MB) ─────────────────────────────
export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { avatar } = req.body
    if (!avatar || typeof avatar !== 'string') {
      res.status(400).json({ success: false, message: 'No avatar data provided' }); return
    }
    // Validate base64 image
    const matches = avatar.match(/^data:(image\/[a-z]+);base64,(.+)$/)
    if (!matches) {
      res.status(400).json({ success: false, message: 'Invalid image format' }); return
    }
    const mimeType = matches[1]
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(mimeType)) {
      res.status(400).json({ success: false, message: 'Only JPG, PNG, WebP or GIF allowed' }); return
    }
    // Check size (~2MB limit after base64 encoding)
    const sizeBytes = Buffer.byteLength(matches[2], 'base64')
    if (sizeBytes > 2 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'Image must be under 2MB' }); return
    }
    const User = (await import('../auth/auth.model')).default
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { avatar },
      { new: true, select: '-password' }
    )
    sendSuccess(res, { avatar: user?.avatar }, 'Avatar updated')
  } catch (e) { next(e) }
}

// ── Upload KYC document ─────────────────────────────────────────
export const uploadKYCDocument = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { type, label, data } = req.body
    if (!type || !label || !data) {
      res.status(400).json({ success: false, message: 'type, label and data are required' }); return
    }
    const validTypes = ['gst', 'pan', 'aadhaar', 'other']
    if (!validTypes.includes(type)) {
      res.status(400).json({ success: false, message: 'Invalid document type' }); return
    }
    // Validate base64
    const matches = data.match(/^data:(application\/pdf|image\/[a-z]+);base64,/)
    if (!matches) {
      res.status(400).json({ success: false, message: 'Invalid file format. PDF or image required.' }); return
    }
    const sizeBytes = Buffer.byteLength(data.split(',')[1], 'base64')
    if (sizeBytes > 5 * 1024 * 1024) {
      res.status(400).json({ success: false, message: 'File must be under 5MB' }); return
    }

    const User = (await import('../auth/auth.model')).default
    const user = await User.findById(req.user!.userId)
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }

    // Replace existing doc of same type or add new
    const existing = user.kycDocuments.findIndex((d: any) => d.type === type)
    if (existing >= 0) {
      user.kycDocuments[existing] = { type, label, data, uploadedAt: new Date() }
    } else {
      user.kycDocuments.push({ type, label, data, uploadedAt: new Date() })
    }
    user.kycStatus = 'pending'
    await user.save()

    sendSuccess(res, {
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments.map((d: any) => ({ type: d.type, label: d.label, uploadedAt: d.uploadedAt })),
    }, 'Document uploaded successfully')
  } catch (e) { next(e) }
}

// ── Get KYC status ──────────────────────────────────────────────
export const getKYCStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const User = (await import('../auth/auth.model')).default
    const user = await User.findById(req.user!.userId).select('kycStatus kycDocuments kycRejectionReason')
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return }
    sendSuccess(res, {
      kycStatus: user.kycStatus,
      kycRejectionReason: user.kycRejectionReason,
      kycDocuments: user.kycDocuments.map((d: any) => ({ type: d.type, label: d.label, uploadedAt: d.uploadedAt })),
    })
  } catch (e) { next(e) }
}

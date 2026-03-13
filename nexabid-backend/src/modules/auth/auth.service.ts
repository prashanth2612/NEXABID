import { User } from './auth.model'
import { hashPassword, comparePassword } from '../../shared/utils/hash'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt'
import { generateOTP, saveOTP, verifyOTP, deleteOTP } from '../../shared/utils/otp'
import { sendOTPEmail, sendWelcomeEmail } from '../../shared/utils/email'
import { createError } from '../../middleware/errorHandler'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  VerifyOTPInput,
  ResetPasswordInput,
} from './auth.schema'

export const registerUser = async (data: RegisterInput) => {
  // Check if email already exists
  const existing = await User.findOne({ email: data.email })
  if (existing) {
    throw createError('An account with this email already exists', 409)
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password)

  // Create user
  const user = await User.create({
    ...data,
    password: hashedPassword,
  })

  // Generate tokens
  const payload = { userId: user._id.toString(), email: user.email, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  // Save refresh token
  user.refreshToken = refreshToken
  await user.save()

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user.email, user.fullName, user.role).catch(() => {})

  return {
    user,
    accessToken,
    refreshToken,
  }
}

export const loginUser = async (data: LoginInput) => {
  // Find user with password
  const user = await User.findOne({ email: data.email }).select('+password')

  if (!user) {
    throw createError('Invalid email or password', 401)
  }

  if (!user.isActive) {
    throw createError('Your account has been suspended. Please contact support.', 403)
  }

  // Verify password
  const isPasswordValid = await comparePassword(data.password, user.password)
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401)
  }

  // Generate tokens
  const payload = { userId: user._id.toString(), email: user.email, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  // Save refresh token
  user.refreshToken = refreshToken
  await user.save()

  return {
    user,
    accessToken,
    refreshToken,
  }
}

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null })
}

export const getMe = async (userId: string) => {
  const user = await User.findById(userId)
  if (!user) {
    throw createError('User not found', 404)
  }
  return user
}

export const refreshTokens = async (refreshToken: string) => {
  try {
    const decoded = verifyRefreshToken(refreshToken)
    const user = await User.findById(decoded.userId).select('+refreshToken')

    if (!user || user.refreshToken !== refreshToken) {
      throw createError('Invalid refresh token', 401)
    }

    const payload = { userId: user._id.toString(), email: user.email, role: user.role }
    const newAccessToken = signAccessToken(payload)
    const newRefreshToken = signRefreshToken(payload)

    user.refreshToken = newRefreshToken
    await user.save()

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  } catch {
    throw createError('Invalid or expired refresh token', 401)
  }
}

export const forgotPassword = async (data: ForgotPasswordInput) => {
  const user = await User.findOne({ email: data.email })

  // Always return success even if email not found (security)
  if (!user) return

  const otp = generateOTP()
  await saveOTP(data.email, otp)
  await sendOTPEmail(data.email, otp, user.fullName)
}

export const verifyPasswordOTP = async (data: VerifyOTPInput) => {
  const isValid = await verifyOTP(data.email, data.otp)
  if (!isValid) {
    throw createError('Invalid or expired OTP', 400)
  }
  return true
}

export const resetPassword = async (data: ResetPasswordInput) => {
  // Verify OTP first
  const isValid = await verifyOTP(data.email, data.otp)
  if (!isValid) {
    throw createError('Invalid or expired OTP', 400)
  }

  const user = await User.findOne({ email: data.email })
  if (!user) {
    throw createError('User not found', 404)
  }

  // Update password
  user.password = await hashPassword(data.password)
  user.refreshToken = undefined
  await user.save()

  // Delete OTP
  await deleteOTP(data.email)
}

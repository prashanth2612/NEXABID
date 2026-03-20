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

  // If not verified, still allow login but include flag in response
  // so frontend can prompt verification if needed

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

// ── Send email verification OTP ─────────────────────────────────
export const sendVerificationOTP = async (email: string) => {
  const user = await User.findOne({ email })
  if (!user) throw createError('User not found', 404)
  if (user.isVerified) throw createError('Email already verified', 400)

  const otp = generateOTP()
  await saveOTP(`verify:${email}`, otp)
  await (await import('../../shared/utils/email')).sendVerificationEmail(email, user.fullName, otp)
}

// ── Verify email with OTP ────────────────────────────────────────
export const verifyEmail = async (email: string, otp: string) => {
  const valid = await verifyOTP(`verify:${email}`, otp)
  if (!valid) throw createError('Invalid or expired OTP', 400)

  const user = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true }
  )
  if (!user) throw createError('User not found', 404)

  const payload = { userId: user._id.toString(), email: user.email, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  user.refreshToken = refreshToken
  await user.save()

  return { user, accessToken, refreshToken }
}

// ── Google OAuth — verify token and login/register ──────────────
export const googleAuth = async (idToken: string, role: 'client' | 'manufacturer') => {
  // Verify with Google tokeninfo endpoint (no extra packages needed)
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`)
  if (!res.ok) throw createError('Invalid Google token', 401)
  const payload = await res.json() as {
    sub: string; email: string; name: string; picture?: string;
    email_verified: string; aud: string;
  }

  if (!payload.email || payload.email_verified !== 'true') {
    throw createError('Google email not verified', 401)
  }

  // Validate audience if GOOGLE_CLIENT_ID is set
  const { env } = await import('../../config/env')
  if (env.GOOGLE_CLIENT_ID && payload.aud !== env.GOOGLE_CLIENT_ID) {
    throw createError('Token audience mismatch', 401)
  }

  // Find or create user
  let user = await User.findOne({ email: payload.email })

  if (!user) {
    // New user — register via Google
    user = await User.create({
      fullName: payload.name,
      email: payload.email,
      phone: '',
      password: await (await import('../../shared/utils/hash')).hashPassword(
        Math.random().toString(36) + Date.now().toString(36)
      ),
      role,
      avatar: payload.picture,
      isVerified: true,  // Google already verified the email
      googleId: payload.sub,
    })
  } else {
    // Existing user — update avatar/googleId if missing
    if (!user.isVerified) { user.isVerified = true }
    if (!user.avatar && payload.picture) { user.avatar = payload.picture }
    if (!(user as any).googleId) { (user as any).googleId = payload.sub }
    await user.save()
  }

  if (!user.isActive) throw createError('Your account has been suspended.', 403)

  const jwtPayload = { userId: user._id.toString(), email: user.email, role: user.role }
  const accessToken = signAccessToken(jwtPayload)
  const refreshToken = signRefreshToken(jwtPayload)
  user.refreshToken = refreshToken
  await user.save()

  return { user, accessToken, refreshToken }
}

import crypto from 'crypto'
import { setCache, getCache, deleteCache } from '../../config/redis'
import { env } from '../../config/env'

const OTP_PREFIX = 'otp:'
const TTL = parseInt(env.OTP_EXPIRES_MINUTES) * 60

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString()
}

export const saveOTP = async (email: string, otp: string): Promise<void> => {
  await setCache(`${OTP_PREFIX}${email}`, otp, TTL)
}

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const stored = await getCache(`${OTP_PREFIX}${email}`)
  if (!stored) return false
  return stored === otp
}

export const deleteOTP = async (email: string): Promise<void> => {
  await deleteCache(`${OTP_PREFIX}${email}`)
}

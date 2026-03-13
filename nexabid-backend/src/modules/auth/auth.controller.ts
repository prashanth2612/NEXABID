import { Request, Response, NextFunction } from 'express'
import * as authService from './auth.service'
import { sendSuccess, sendError } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body)
    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Account created successfully',
      201
    )
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body)
    sendSuccess(
      res,
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Logged in successfully'
    )
  } catch (error) {
    next(error)
  }
}

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.logoutUser(req.user!.userId)
    sendSuccess(res, null, 'Logged out successfully')
  } catch (error) {
    next(error)
  }
}

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getMe(req.user!.userId)
    sendSuccess(res, { user }, 'User fetched successfully')
  } catch (error) {
    next(error)
  }
}

export const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400)
      return
    }
    const tokens = await authService.refreshTokens(refreshToken)
    sendSuccess(res, tokens, 'Tokens refreshed successfully')
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.forgotPassword(req.body)
    sendSuccess(res, null, 'If this email exists, an OTP has been sent')
  } catch (error) {
    next(error)
  }
}

export const verifyOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.verifyPasswordOTP(req.body)
    sendSuccess(res, null, 'OTP verified successfully')
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.resetPassword(req.body)
    sendSuccess(res, null, 'Password reset successfully')
  } catch (error) {
    next(error)
  }
}

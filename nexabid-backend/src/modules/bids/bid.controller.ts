import { Response, NextFunction } from 'express'
import * as bidService from './bid.service'
import { sendSuccess } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'

export const submitBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await bidService.submitBid(req.user!.userId, req.body)
    sendSuccess(res, { bid }, 'Bid submitted successfully', 201)
  } catch (e) { next(e) }
}

export const getBidsForOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bids = await bidService.getBidsForOrder(req.params.orderId, req.user!.userId)
    sendSuccess(res, { bids }, 'Bids fetched successfully')
  } catch (e) { next(e) }
}

export const getBidById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await bidService.getBidById(req.params.id)
    sendSuccess(res, { bid }, 'Bid fetched successfully')
  } catch (e) { next(e) }
}

export const acceptBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await bidService.acceptBid(req.params.id, req.user!.userId)
    sendSuccess(res, result, 'Bid accepted — order confirmed')
  } catch (e) { next(e) }
}

export const rejectBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await bidService.rejectBid(req.params.id, req.user!.userId, req.body)
    sendSuccess(res, { bid }, 'Bid rejected')
  } catch (e) { next(e) }
}

export const getAISuggestion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestion = await bidService.getAISuggestion(req.params.orderId)
    sendSuccess(res, suggestion, 'AI suggestion generated')
  } catch (e) { next(e) }
}

export const getMyBids = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bids = await bidService.getMyBids(req.user!.userId)
    sendSuccess(res, { bids }, 'Bids fetched successfully')
  } catch (e) { next(e) }
}

export const withdrawBid = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const bid = await (await import('./bid.service')).withdrawBid(req.params.id, req.user!.userId)
    sendSuccess(res, { bid }, 'Bid withdrawn successfully')
  } catch (e) { next(e) }
}

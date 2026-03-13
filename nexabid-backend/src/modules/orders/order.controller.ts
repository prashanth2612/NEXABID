import { Response, NextFunction } from 'express'
import * as orderService from './order.service'
import { sendSuccess, sendError } from '../../shared/utils/response'
import type { AuthRequest } from '../../middleware/auth'

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.createOrder(req.user!.userId, req.body)
    sendSuccess(res, { order }, 'Order created successfully', 201)
  } catch (e) { next(e) }
}

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page, limit } = req.query
    const result = await orderService.getMyOrders(
      req.user!.userId,
      status as string,
      Number(page) || 1,
      Number(limit) || 20
    )
    sendSuccess(res, result, 'Orders fetched successfully')
  } catch (e) { next(e) }
}

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.userId, req.user!.role)
    sendSuccess(res, { order }, 'Order fetched successfully')
  } catch (e) { next(e) }
}

export const updateOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.user!.userId, req.body)
    sendSuccess(res, { order }, 'Order updated successfully')
  } catch (e) { next(e) }
}

export const deleteOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await orderService.deleteOrder(req.params.id, req.user!.userId)
    sendSuccess(res, null, 'Order deleted successfully')
  } catch (e) { next(e) }
}

export const getSwipeStack = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = req.query.categories
      ? (req.query.categories as string).split(',').map((c) => c.trim())
      : []
    const orders = await orderService.getSwipeStack(req.user!.userId, categories)
    sendSuccess(res, { orders }, 'Swipe stack fetched successfully')
  } catch (e) { next(e) }
}

export const processSwipe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orderService.processSwipe(req.params.id, req.user!.userId, req.body)
    sendSuccess(res, result, `Order ${result?.action}`)
  } catch (e) { next(e) }
}

export const markManufacturingComplete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.markManufacturingComplete(req.params.id, req.user!.userId)
    sendSuccess(res, { order }, 'Manufacturing marked complete — logistics notified')
  } catch (e) { next(e) }
}

export const confirmOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await orderService.confirmOrder(req.params.id, req.user!.userId)
    sendSuccess(res, { order }, 'Order confirmed')
  } catch (e) { next(e) }
}

export const getOrderStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { getOrderStats: statsService } = await import('./order.service')
    const stats = await statsService(req.user!.userId)
    sendSuccess(res, stats, 'Stats fetched')
  } catch (e) { next(e) }
}

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

export const shipOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { Order } = await import('./order.model')
    const order = await Order.findById(req.params.id).populate('clientId', 'fullName email phone address city state')
    if (!order) { res.status(404).json({ success: false, message: 'Order not found' }); return }
    if (order.acceptedManufacturerId?.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'Access denied' }); return
    }
    if (!['manufacturing', 'shipped'].includes(order.status)) {
      res.status(400).json({ success: false, message: 'Order must be in manufacturing status to ship' }); return
    }

    // Auto-generate a shipment reference — in production this would call a logistics API
    const shipRef = `NB-${Date.now().toString(36).toUpperCase()}`
    const client = order.clientId as any

    order.status = 'shipped'
    order.trackingNumber = shipRef
    order.courierName = 'NexaBid Logistics'
    order.trackingUrl = ''
    order.shippedAt = new Date()
    // Estimated delivery = today + deliveryDays from order
    const estDelivery = new Date()
    estDelivery.setDate(estDelivery.getDate() + 3) // default 3 days transit
    order.estimatedDelivery = estDelivery
    await order.save()

    // Notify client with their delivery address
    const { createNotification } = await import('../../shared/utils/notify')
    const { sendEmail } = await import('../../shared/utils/email')

    const deliveryAddress = [client?.address, client?.city, client?.state].filter(Boolean).join(', ') || order.deliveryLocation

    createNotification(
      order.clientId.toString(), 'order_update' as any,
      '📦 Order Shipped!',
      `Your order "${order.title}" has been shipped. Reference: ${shipRef}`,
      `/orders/${order.id}`
    ).catch(() => {})

    if (client?.email) {
      sendEmail({
        to: client.email,
        subject: `NexaBid — Your order has been shipped! 📦`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2 style="color:#0A0A0A">Your Order Has Been Shipped!</h2>
            <p>Hi ${client.fullName}, your order <strong>${order.title}</strong> is on its way.</p>
            <div style="background:#f7f7f7;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:4px 0;font-size:14px">Shipment Reference: <strong>${shipRef}</strong></p>
              <p style="margin:4px 0;font-size:14px">Delivery Address: <strong>${deliveryAddress}</strong></p>
              <p style="margin:4px 0;font-size:14px">Est. Delivery: <strong>${estDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>
            </div>
            <p style="color:#6b7280;font-size:13px">Once you receive the delivery, use the OTP to confirm and release payment to the manufacturer.</p>
          </div>`,
      }).catch(() => {})
    }

    const { sendSuccess } = await import('../../shared/utils/response')
    sendSuccess(res, { order, deliveryAddress, shipRef }, 'Order marked as shipped — client notified')
  } catch (e) { next(e) }
}

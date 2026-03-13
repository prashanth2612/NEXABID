import mongoose from 'mongoose'
import { Order } from './order.model'
import { createError } from '../../middleware/errorHandler'
import type { CreateOrderInput, UpdateOrderInput, SwipeOrderInput } from './order.schema'

export const createOrder = async (clientId: string, data: CreateOrderInput) => {
  const order = await Order.create({
    clientId: new mongoose.Types.ObjectId(clientId),
    title: data.title,
    description: data.description,
    category: data.category,
    quantity: data.quantity,
    unit: data.unit,
    isFixedPrice: data.isFixedPrice,
    fixedPrice: data.fixedPrice,
    budgetMin: data.budgetMin,
    budgetMax: data.budgetMax,
    deliveryDate: new Date(data.deliveryDate),
    deliveryLocation: data.deliveryLocation,
    specialNotes: data.specialNotes,
    status: data.saveDraft ? 'draft' : 'posted',
  })
  return order
}

export const getMyOrders = async (clientId: string, status?: string, page = 1, limit = 20) => {
  const query: Record<string, unknown> = { clientId: new mongoose.Types.ObjectId(clientId) }
  if (status) query.status = status
  const skip = (page - 1) * limit
  const [orders, total] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(query),
  ])
  return { orders, total, page, pages: Math.ceil(total / limit) }
}

export const getOrderById = async (orderId: string, requesterId: string, requesterRole: string) => {
  const order = await Order.findById(orderId)
    .populate('clientId', 'fullName email phone companyName rating')
    .populate('acceptedManufacturerId', 'fullName businessName rating')

  if (!order) throw createError('Order not found', 404)
  if (requesterRole === 'client' && order.clientId._id.toString() !== requesterId) {
    throw createError('Access denied', 403)
  }
  return order
}

export const updateOrder = async (orderId: string, clientId: string, data: UpdateOrderInput) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (order.status !== 'draft') throw createError('Only draft orders can be edited', 400)
  Object.assign(order, data)
  if (data.deliveryDate) order.deliveryDate = new Date(data.deliveryDate)
  await order.save()
  return order
}

export const deleteOrder = async (orderId: string, clientId: string) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (order.status !== 'draft') throw createError('Only draft orders can be deleted', 400)
  await order.deleteOne()
}

export const getSwipeStack = async (manufacturerId: string, categories?: string[], limit = 10) => {
  const mfrId = new mongoose.Types.ObjectId(manufacturerId)
  const query: Record<string, unknown> = {
    status: { $in: ['posted', 'bidding'] },   // show posted AND orders with bids
    rejectedBy: { $ne: mfrId },
    clientId: { $ne: mfrId },
  }
  if (categories && categories.length > 0) {
    query.category = { $in: categories }
  }
  const orders = await Order.find(query)
    .populate('clientId', 'fullName companyName rating isVerified')
    .sort({ isUrgent: -1, createdAt: -1 })
    .limit(limit)
  return orders
}

export const processSwipe = async (orderId: string, manufacturerId: string, data: SwipeOrderInput) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (!['posted', 'bidding'].includes(order.status)) throw createError('Order is no longer available', 400)

  const mfrId = new mongoose.Types.ObjectId(manufacturerId)

  if (data.action === 'reject') {
    await Order.findByIdAndUpdate(orderId, { $addToSet: { rejectedBy: mfrId } })
    return { action: 'rejected' }
  }

  if (data.action === 'accept') {
    // Just track interest — don't change order status
    // Status only changes when a bid is submitted
    await Order.findByIdAndUpdate(orderId, { $addToSet: { acceptedBy: mfrId } })
    return { action: 'accepted', orderId }
  }
}

export const markManufacturingComplete = async (orderId: string, manufacturerId: string) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.acceptedManufacturerId?.toString() !== manufacturerId) throw createError('Access denied', 403)
  if (order.status !== 'manufacturing') throw createError('Order must be in manufacturing status', 400)
  order.status = 'shipped'
  await order.save()
  return order
}

export const confirmOrder = async (orderId: string, clientId: string) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (order.status !== 'confirmed') throw createError('Order must be confirmed first', 400)
  order.status = 'manufacturing'
  await order.save()
  return order
}

export const getOrderStats = async (clientId: string) => {
  const cId = new mongoose.Types.ObjectId(clientId)
  const [total, active, completed, escrow] = await Promise.all([
    Order.countDocuments({ clientId: cId }),
    Order.countDocuments({ clientId: cId, status: { $in: ['posted', 'bidding', 'confirmed', 'manufacturing', 'shipped'] } }),
    Order.countDocuments({ clientId: cId, status: 'completed' }),
    Order.aggregate([
      { $match: { clientId: cId, escrowStatus: 'escrowed' } },
      { $group: { _id: null, total: { $sum: '$escrowAmount' } } },
    ]),
  ])
  return { totalOrders: total, activeOrders: active, completedOrders: completed, inEscrow: escrow[0]?.total || 0 }
}

import mongoose from 'mongoose'
import { Bid } from './bid.model'
import { Order } from '../orders/order.model'
import { createError } from '../../middleware/errorHandler'
import type { CreateBidInput, RejectBidInput } from './bid.schema'
import { notifyBidReceived, notifyBidAccepted, notifyBidRejected } from '../../shared/utils/notify'

export const submitBid = async (manufacturerId: string, data: CreateBidInput) => {
  const order = await Order.findById(data.orderId)
  if (!order) throw createError('Order not found', 404)
  if (!['posted', 'bidding'].includes(order.status)) {
    throw createError('Order is not accepting bids', 400)
  }
  if (order.isFixedPrice) throw createError('This is a fixed price order — no bidding allowed', 400)

  const existing = await Bid.findOne({ orderId: data.orderId, manufacturerId })
  if (existing) throw createError('You have already submitted a bid for this order', 409)

  // AI confidence score based on budget
  let aiConfidenceScore: number | undefined
  if (order.budgetMax) {
    const ratio = data.proposedPrice / order.budgetMax
    if (ratio <= 0.85)      aiConfidenceScore = 90
    else if (ratio <= 0.95) aiConfidenceScore = 78
    else if (ratio <= 1.0)  aiConfidenceScore = 65
    else                    aiConfidenceScore = 40
  }

  const bid = await Bid.create({
    orderId: new mongoose.Types.ObjectId(data.orderId),
    manufacturerId: new mongoose.Types.ObjectId(manufacturerId),
    proposedPrice: data.proposedPrice,
    deliveryDays: data.deliveryDays,
    message: data.message,
    aiConfidenceScore,
  })

  // Move order to "bidding" status and track this manufacturer
  await Order.findByIdAndUpdate(data.orderId, {
    $inc: { totalBids: 1 },
    $addToSet: { acceptedBy: new mongoose.Types.ObjectId(manufacturerId) },
    status: 'bidding',
  })

  return bid
}

export const getBidsForOrder = async (orderId: string, clientId: string) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)

  const bids = await Bid.find({ orderId })
    .populate('manufacturerId', 'fullName businessName category rating totalOrders avatar')
    .sort({ aiConfidenceScore: -1, createdAt: 1 })

  return bids
}

export const getBidById = async (bidId: string) => {
  const bid = await Bid.findById(bidId)
    .populate('manufacturerId', 'fullName businessName rating')
    .populate('orderId')
  if (!bid) throw createError('Bid not found', 404)
  return bid
}

export const acceptBid = async (bidId: string, clientId: string) => {
  const bid = await Bid.findById(bidId)
  if (!bid) throw createError('Bid not found', 404)
  if (bid.status !== 'pending') throw createError('Bid is no longer pending', 400)

  const order = await Order.findById(bid.orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)
  if (!['posted', 'bidding'].includes(order.status)) {
    throw createError('Order cannot accept bids at this stage', 400)
  }

  // Accept this bid
  bid.status = 'accepted'
  await bid.save()

  // Reject all other bids for the same order
  await Bid.updateMany(
    { orderId: bid.orderId, _id: { $ne: bid._id } },
    { status: 'rejected' }
  )

  // Confirm order with winning manufacturer
  order.status = 'confirmed'
  order.acceptedBidId = bid._id
  order.acceptedManufacturerId = bid.manufacturerId as mongoose.Types.ObjectId
  order.escrowAmount = bid.proposedPrice
  await order.save()

  return { bid, order }
}

export const rejectBid = async (bidId: string, clientId: string, data: RejectBidInput) => {
  const bid = await Bid.findById(bidId)
  if (!bid) throw createError('Bid not found', 404)
  const order = await Order.findById(bid.orderId)
  if (!order) throw createError('Order not found', 404)
  if (order.clientId.toString() !== clientId) throw createError('Access denied', 403)

  bid.status = 'rejected'
  if (data.clientNote) bid.clientNote = data.clientNote
  await bid.save()
  notifyBidRejected(bid.manufacturerId.toString(), bid.orderId.toString(), order.title).catch(() => {})

  await Order.findByIdAndUpdate(bid.orderId, { $inc: { totalBids: -1 } })

  return bid
}

export const getAISuggestion = async (orderId: string) => {
  const order = await Order.findById(orderId)
  if (!order) throw createError('Order not found', 404)
  const budget = order.isFixedPrice ? order.fixedPrice! : order.budgetMax!
  const suggested = Math.floor(budget * 0.88)
  const existingBids = await Bid.find({ orderId, status: 'pending' })
  const avgBid = existingBids.length > 0
    ? Math.floor(existingBids.reduce((s, b) => s + b.proposedPrice, 0) / existingBids.length)
    : null
  return {
    suggestedPrice: suggested,
    reasoning: `Based on client budget of ₹${budget.toLocaleString('en-IN')} and market rates`,
    confidenceScore: 85,
    marketAverage: avgBid,
    competitorCount: existingBids.length,
    winProbability: suggested <= budget * 0.9 ? 78 : 55,
  }
}

export const getMyBids = async (manufacturerId: string) => {
  const bids = await Bid.find({ manufacturerId })
    .populate('orderId', 'title orderNumber status category deliveryDate clientId')
    .sort({ createdAt: -1 })
  return bids
}

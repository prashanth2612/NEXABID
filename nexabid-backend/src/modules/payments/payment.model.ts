import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  clientId: mongoose.Types.ObjectId
  manufacturerId?: mongoose.Types.ObjectId
  amount: number
  currency: string
  // Razorpay fields
  razorpayOrderId: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  // Escrow state
  status: 'created' | 'paid' | 'escrowed' | 'released' | 'refunded' | 'failed' | 'disputed'
  // OTP for delivery verification
  deliveryOtp?: string
  otpSentAt?: Date
  otpVerifiedAt?: Date
  otpAttempts: number
  // Release / refund
  releasedAt?: Date
  platformFee?: number
  manufacturerPayout?: number
  refundedAt?: Date
  refundReason?: string
  // Dispute
  disputedAt?: Date
  disputeReason?: string
  disputeResolvedAt?: Date
  disputeResolution?: string
  createdAt: Date
  updatedAt: Date
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId:            { type: Schema.Types.ObjectId, ref: 'Order',    required: true },
    clientId:           { type: Schema.Types.ObjectId, ref: 'User',     required: true },
    manufacturerId:     { type: Schema.Types.ObjectId, ref: 'User' },
    amount:             { type: Number, required: true, min: 1 },
    currency:           { type: String, default: 'INR' },
    razorpayOrderId:    { type: String, required: true, unique: true },
    razorpayPaymentId:  { type: String },
    razorpaySignature:  { type: String },
    status: {
      type: String,
      enum: ['created', 'paid', 'escrowed', 'released', 'refunded', 'failed', 'disputed'],
      default: 'created',
    },
    deliveryOtp:        { type: String, select: false },
    otpSentAt:          { type: Date },
    otpVerifiedAt:      { type: Date },
    otpAttempts:        { type: Number, default: 0 },
    releasedAt:         { type: Date },
    platformFee:        { type: Number },
    manufacturerPayout: { type: Number },
    refundedAt:         { type: Date },
    refundReason:       { type: String },
    disputedAt:         { type: Date },
    disputeReason:      { type: String },
    disputeResolvedAt:  { type: Date },
    disputeResolution:  { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.deliveryOtp
        return ret
      },
    },
  }
)

paymentSchema.index({ orderId: 1 })
paymentSchema.index({ clientId: 1, status: 1 })
paymentSchema.index({ manufacturerId: 1, escrowStatus: 1 })
paymentSchema.index({ escrowStatus: 1 })
paymentSchema.index({ razorpayOrderId: 1 }, { sparse: true })

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema)

import mongoose, { Document, Schema } from 'mongoose'

export interface IBid extends Document {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  manufacturerId: mongoose.Types.ObjectId
  proposedPrice: number
  deliveryDays: number
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  aiConfidenceScore?: number
  clientNote?: string   // client's reply during negotiation
  createdAt: Date
  updatedAt: Date
}

const bidSchema = new Schema<IBid>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    manufacturerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposedPrice: { type: Number, required: true, min: 1 },
    deliveryDays: { type: Number, required: true, min: 1 },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    aiConfidenceScore: { type: Number, min: 0, max: 100 },
    clientNote: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        ret._id = undefined
        ret.__v = undefined
        return ret
      },
    },
  }
)

bidSchema.index({ orderId: 1, status: 1 })
bidSchema.index({ manufacturerId: 1, status: 1 })
// One bid per manufacturer per order
bidSchema.index({ orderId: 1, manufacturerId: 1 }, { unique: true })

export const Bid = mongoose.model<IBid>('Bid', bidSchema)

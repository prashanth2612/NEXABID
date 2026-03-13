import mongoose, { Document, Schema } from 'mongoose'

export interface IRating extends Document {
  orderId: mongoose.Types.ObjectId
  fromUserId: mongoose.Types.ObjectId
  toUserId: mongoose.Types.ObjectId
  fromRole: 'client' | 'manufacturer'
  rating: number
  review: string
  createdAt: Date
}

const ratingSchema = new Schema<IRating>({
  orderId:    { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User',  required: true },
  toUserId:   { type: Schema.Types.ObjectId, ref: 'User',  required: true },
  fromRole:   { type: String, enum: ['client', 'manufacturer'], required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  review:     { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
}, { timestamps: true })

// One rating per order per direction
ratingSchema.index({ orderId: 1, fromUserId: 1 }, { unique: true })

ratingSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id; delete ret._id; delete ret.__v
    return ret
  }
})

export const Rating = mongoose.model<IRating>('Rating', ratingSchema)

import mongoose, { Document, Schema } from 'mongoose'

export type NotificationType =
  | 'bid_received'
  | 'bid_accepted'
  | 'bid_rejected'
  | 'order_confirmed'
  | 'order_shipped'
  | 'order_completed'
  | 'payment_escrowed'
  | 'payment_released'
  | 'new_message'
  | 'otp_sent'
  | 'system'

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: NotificationType
  title: string
  body: string
  link?: string
  isRead: boolean
  meta?: Record<string, unknown>
  createdAt: Date
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type:   { type: String, required: true },
    title:  { type: String, required: true },
    body:   { type: String, required: true },
    link:   { type: String },
    isRead: { type: Boolean, default: false },
    meta:   { type: Schema.Types.Mixed },
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

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema)

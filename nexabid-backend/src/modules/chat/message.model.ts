import mongoose, { Document, Schema } from 'mongoose'

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  senderId: mongoose.Types.ObjectId
  senderRole: 'client' | 'manufacturer'
  content: string
  type: 'text' | 'system'
  readBy: mongoose.Types.ObjectId[]
  createdAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    orderId:    { type: Schema.Types.ObjectId, ref: 'Order',   required: true },
    senderId:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
    senderRole: { type: String, enum: ['client', 'manufacturer'], required: true },
    content:    { type: String, required: true, trim: true, maxlength: 2000 },
    type:       { type: String, enum: ['text', 'system'], default: 'text' },
    readBy:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

messageSchema.index({ orderId: 1, createdAt: 1 })

export const Message = mongoose.model<IMessage>('Message', messageSchema)

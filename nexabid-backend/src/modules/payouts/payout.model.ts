import mongoose, { Document, Schema } from 'mongoose'

export interface IPayout extends Document {
  _id: mongoose.Types.ObjectId
  manufacturerId: mongoose.Types.ObjectId
  amount: number
  status: 'pending' | 'processing' | 'paid' | 'rejected'
  method: 'bank' | 'upi'
  // Bank details snapshot at time of request
  bankAccountName?: string
  bankAccountNumber?: string
  bankIfsc?: string
  bankName?: string
  upiId?: string
  // Admin
  adminNote?: string
  processedAt?: Date
  processedBy?: string
  rejectedAt?: Date
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}

const payoutSchema = new Schema<IPayout>(
  {
    manufacturerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount:            { type: Number, required: true, min: 1 },
    status:            { type: String, enum: ['pending', 'processing', 'paid', 'rejected'], default: 'pending' },
    method:            { type: String, enum: ['bank', 'upi'], required: true },
    bankAccountName:   { type: String },
    bankAccountNumber: { type: String },
    bankIfsc:          { type: String },
    bankName:          { type: String },
    upiId:             { type: String },
    adminNote:         { type: String },
    processedAt:       { type: Date },
    processedBy:       { type: String },
    rejectedAt:        { type: Date },
    rejectionReason:   { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id.toString()
        ret._id = undefined
        ret.__v = undefined
      },
    },
  }
)

export const Payout = mongoose.model<IPayout>('Payout', payoutSchema)

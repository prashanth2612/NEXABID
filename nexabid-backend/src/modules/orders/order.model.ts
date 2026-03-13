import mongoose, { Document, Schema } from 'mongoose'

export type OrderStatus =
  | 'draft'
  | 'posted'
  | 'bidding'
  | 'confirmed'
  | 'manufacturing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'

export type OrderCategory =
  | 'Textiles & Garments'
  | 'Electronics & Components'
  | 'Hardware & Metals'
  | 'Plastics & Polymers'
  | 'Furniture & Wood'
  | 'Chemicals & Pharma'
  | 'Food & Beverages'
  | 'Automotive Parts'
  | 'Paper & Packaging'
  | 'Other'

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  orderNumber: string
  clientId: mongoose.Types.ObjectId
  title: string
  description: string
  category: OrderCategory
  quantity: number
  unit: string
  isFixedPrice: boolean
  fixedPrice?: number
  budgetMin?: number
  budgetMax?: number
  deliveryDate: Date
  deliveryLocation: string
  specialNotes?: string
  attachments: string[]
  status: OrderStatus
  acceptedManufacturerId?: mongoose.Types.ObjectId
  acceptedBidId?: mongoose.Types.ObjectId
  escrowStatus?: 'pending' | 'escrowed' | 'released' | 'refunded'
  escrowAmount?: number
  totalBids: number
  isUrgent: boolean
  isBulk: boolean
  rejectedBy: mongoose.Types.ObjectId[]   // manufacturers who swiped left
  acceptedBy: mongoose.Types.ObjectId[]   // manufacturers who swiped right
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const counterSchema = new Schema({ _id: String, seq: Number })
const Counter = mongoose.model('Counter', counterSchema)

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Textiles & Garments', 'Electronics & Components', 'Hardware & Metals',
        'Plastics & Polymers', 'Furniture & Wood', 'Chemicals & Pharma',
        'Food & Beverages', 'Automotive Parts', 'Paper & Packaging', 'Other',
      ],
    },
    quantity: { type: Number, required: true, min: 1 },
    unit: { type: String, required: true },
    isFixedPrice: { type: Boolean, required: true, default: false },
    fixedPrice: { type: Number },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    deliveryDate: { type: Date, required: true },
    deliveryLocation: { type: String, required: true, trim: true },
    specialNotes: { type: String, trim: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'posted', 'bidding', 'confirmed', 'manufacturing', 'shipped', 'delivered', 'completed', 'cancelled'],
      default: 'draft',
    },
    acceptedManufacturerId: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedBidId: { type: Schema.Types.ObjectId, ref: 'Bid' },
    escrowStatus: { type: String, enum: ['pending', 'escrowed', 'released', 'refunded'] },
    escrowAmount: { type: Number },
    totalBids: { type: Number, default: 0 },
    isUrgent: { type: Boolean, default: false },
    isBulk: { type: Boolean, default: false },
    rejectedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    acceptedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.rejectedBy
        return ret
      },
    },
  }
)

// Auto-generate order number before save
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    )
    const year = new Date().getFullYear()
    this.orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, '0')}`
  }
  next()
})

// Auto-set isUrgent and isBulk
orderSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('deliveryDate')) {
    const daysUntilDelivery = Math.floor(
      (this.deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    this.isUrgent = daysUntilDelivery <= 14
  }
  if (this.isNew || this.isModified('quantity')) {
    this.isBulk = this.quantity >= 500
  }
  next()
})

orderSchema.index({ clientId: 1, status: 1 })
orderSchema.index({ category: 1, status: 1 })
orderSchema.index({ status: 1, createdAt: -1 })

export const Order = mongoose.model<IOrder>('Order', orderSchema)

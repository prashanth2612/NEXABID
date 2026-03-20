import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  fullName: string
  email: string
  phone: string
  password: string
  role: 'client' | 'manufacturer' | 'admin'
  // Client fields
  companyName?: string
  gstNumber?: string
  // Manufacturer fields
  businessName?: string
  category?: string
  // Common
  avatar?: string
  isVerified: boolean
  isActive: boolean
  rating: number
  totalOrders: number
  bio?: string
  address?: string
  website?: string
  linkedin?: string
  // KYC
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected'
  kycDocuments: Array<{ type: string; label: string; data: string; uploadedAt: Date }>
  kycRejectionReason?: string
  // OAuth
  googleId?: string
  // Bank / payout details (manufacturer)
  bankAccountName?: string
  bankAccountNumber?: string
  bankIfsc?: string
  bankName?: string
  upiId?: string
  refreshToken?: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['client', 'manufacturer', 'admin'],
      required: [true, 'Role is required'],
    },
    companyName: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    businessName: { type: String, trim: true },
    category: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, trim: true, maxlength: 500 },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    isVerified: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    // KYC
    kycStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    kycDocuments: [{
      type: { type: String },   // 'gst', 'pan', 'aadhaar', 'other'
      label: { type: String },
      data: { type: String },   // base64
      uploadedAt: { type: Date, default: Date.now },
    }],
    kycRejectionReason: { type: String },
    googleId: { type: String },
    bankAccountName:   { type: String, trim: true },
    bankAccountNumber: { type: String, trim: true },
    bankIfsc:          { type: String, trim: true, uppercase: true },
    bankName:          { type: String, trim: true },
    upiId:             { type: String, trim: true },
    totalOrders: { type: Number, default: 0 },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.password
        delete ret.refreshToken
        delete ret.__v
        ret.id = ret._id
        delete ret._id
        return ret
      },
    },
  }
)

userSchema.index({ role: 1 })
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ role: 1, isActive: 1 })

export const User = mongoose.model<IUser>('User', userSchema)

/**
 * Run: npx ts-node src/scripts/createAdmin.ts
 * Or:  npm run create-admin
 *
 * Creates the default admin user:
 *   Email:    admin@nexabid.com
 *   Password: Admin@123456
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexabid'

const userSchema = new mongoose.Schema({
  fullName:   String,
  email:      { type: String, unique: true },
  phone:      String,
  password:   String,
  role:       { type: String, default: 'admin' },
  isVerified: { type: Boolean, default: true },
  isActive:   { type: Boolean, default: true },
  rating:     { type: Number, default: 0 },
  totalOrders:{ type: Number, default: 0 },
}, { timestamps: true })

const User = mongoose.model('User', userSchema)

async function main() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB:', MONGO_URI)

  const existing = await User.findOne({ email: 'admin@nexabid.com' })
  if (existing) {
    console.log('✓ Admin already exists: admin@nexabid.com')
    await mongoose.disconnect()
    return
  }

  const hashed = await bcrypt.hash('Admin@123456', 12)
  await User.create({
    fullName:   'NexaBid Admin',
    email:      'admin@nexabid.com',
    phone:      '9999999999',
    password:   hashed,
    role:       'admin',
    isVerified: true,
    isActive:   true,
  })

  console.log('✅ Admin user created!')
  console.log('   Email:    admin@nexabid.com')
  console.log('   Password: Admin@123456')
  console.log('   URL:      http://localhost:5175')
  await mongoose.disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

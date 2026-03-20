import mongoose from 'mongoose'
import { env } from './env'
import { logger } from '../shared/utils/logger'

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', false)

    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'nexabid',
    })

    logger.info('✅ MongoDB connected successfully')

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...')
    })

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected')
    })
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error)
    logger.warn('⚠️  Retrying MongoDB connection in 5 seconds...')
    setTimeout(() => connectDB(), 5000)
  }
}

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect()
  logger.info('MongoDB disconnected')
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck
import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'

import { env } from './config/env'
import { connectDB } from './config/db'
import { connectRedis } from './config/redis'
import { logger } from './shared/utils/logger'
import { errorHandler, notFound } from './middleware/errorHandler'
import { initSocket } from './socket'

import authRoutes from './modules/auth/auth.routes'
import orderRoutes from './modules/orders/order.routes'
import bidRoutes from './modules/bids/bid.routes'
import profileRoutes from './modules/profile/profile.routes'
import paymentRoutes from './modules/payments/payment.routes'
import chatRoutes from './modules/chat/chat.routes'
import adminRoutes from './modules/admin/admin.routes'
import ratingRoutes from './modules/ratings/rating.routes'

const app = express()
const httpServer = http.createServer(app)

app.use(helmet())
app.use(cors({
  origin: [env.CLIENT_URL, env.MANUFACTURER_URL, env.ADMIN_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/health', (_req, res) => {
  const mongoose = require('mongoose')
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    success: true, status: 'ok', version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    db: dbState[mongoose.connection.readyState] || 'unknown',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/bids', bidRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ratings', ratingRoutes)

app.use(notFound)
app.use(errorHandler)

const startServer = async () => {
  try {
    await connectDB()
    await connectRedis()
    initSocket(httpServer)
    httpServer.listen(env.PORT, () => {
      logger.info(`🚀 NexaBid Backend running on http://localhost:${env.PORT}`)
      logger.info(`🔌 Socket.io ready`)
      logger.info(`📌 Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
export default app

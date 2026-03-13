import { createClient } from 'redis'
import { env } from './env'
import { logger } from '../shared/utils/logger'

let redisClient: ReturnType<typeof createClient> | null = null
const memoryStore = new Map<string, { value: string; expiresAt: number }>()

export const connectRedis = async (): Promise<void> => {
  if (!env.REDIS_URL) {
    logger.warn('⚠️  REDIS_URL not set — using in-memory store for OTPs')
    return
  }

  try {
    redisClient = createClient({ url: env.REDIS_URL })

    redisClient.on('error', (err) => {
      logger.warn('Redis error (falling back to memory):', err.message)
      redisClient = null
    })

    await redisClient.connect()
    logger.info('✅ Redis connected successfully')
  } catch (error) {
    logger.warn('⚠️  Redis connection failed — using in-memory store for OTPs')
    redisClient = null
  }
}

export const setCache = async (key: string, value: string, ttlSeconds: number): Promise<void> => {
  if (redisClient) {
    await redisClient.setEx(key, ttlSeconds, value)
  } else {
    memoryStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }
}

export const getCache = async (key: string): Promise<string | null> => {
  if (redisClient) {
    return await redisClient.get(key)
  }
  const item = memoryStore.get(key)
  if (!item) return null
  if (Date.now() > item.expiresAt) {
    memoryStore.delete(key)
    return null
  }
  return item.value
}

export const deleteCache = async (key: string): Promise<void> => {
  if (redisClient) {
    await redisClient.del(key)
  } else {
    memoryStore.delete(key)
  }
}

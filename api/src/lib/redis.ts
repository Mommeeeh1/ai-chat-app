import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

/**
 * Redis Client Singleton
 * 
 * Why Redis?
 * - Fast in-memory data store
 * - Persistent across server restarts
 * - Works with multiple servers (load balancing)
 * - Industry standard for rate limiting, caching, sessions
 * 
 * Use Cases:
 * 1. Rate limiting (current use)
 * 2. Session storage (future)
 * 3. Caching (future)
 * 4. Real-time features (future)
 */

let redisClient: Redis | null = null;

/**
 * Get or create Redis client
 * 
 * Lazy initialization - only connects when first accessed
 * Singleton pattern - reuses same connection
 * 
 * Graceful fallback: If Redis is unavailable, logs warning but doesn't crash
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    logger.info('Initializing Redis client...');
    logger.info(`Redis URL: ${config.redis.url}`);
    
    try {
      redisClient = new Redis(config.redis.url, {
        // Retry strategy: exponential backoff
        retryStrategy(times) {
          // Only retry 3 times in development
          if (times > 3) {
            logger.warn('⚠️  Redis connection failed after 3 attempts. Using in-memory fallback.');
            return null; // Stop retrying
          }
          const delay = Math.min(times * 50, 2000);
          logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
          return delay;
        },
        
        // Max retry attempts
        maxRetriesPerRequest: 3,
        
        // Enable offline queue (queue commands when disconnected)
        enableOfflineQueue: false, // Fail fast if Redis is down
        
        // Connection timeout
        connectTimeout: 5000, // 5 seconds
        
        // Lazy connect (don't connect immediately)
        lazyConnect: true, // Changed to true - won't connect until first command
      });

      // Connection events
      redisClient.on('connect', () => {
        logger.info('✅ Redis connected successfully');
      });

      redisClient.on('ready', () => {
        logger.info('✅ Redis ready to accept commands');
        logger.info('🔒 Rate limiting is now persistent and distributed');
      });

      redisClient.on('error', (error) => {
        // Don't log full error in production (security)
        if (config.server.isDevelopment) {
          logger.warn('⚠️  Redis connection error:', error.message);
          logger.warn('💡 Tip: Start Redis with: docker run -d -p 6379:6379 redis:alpine');
          logger.warn('📖 See REDIS_SETUP.md for detailed instructions');
        } else {
          logger.error('❌ Redis error in production:', error.message);
        }
      });

      redisClient.on('close', () => {
        logger.warn('⚠️  Redis connection closed');
        if (config.server.isDevelopment) {
          logger.info('💡 Rate limiting will fall back to in-memory storage');
        }
      });

      redisClient.on('reconnecting', () => {
        logger.info('🔄 Redis reconnecting...');
      });
    } catch (error) {
      logger.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }

  return redisClient;
}

/**
 * Close Redis connection
 * 
 * Call this during graceful shutdown
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    logger.info('Closing Redis connection...');
    await redisClient.quit();
    redisClient = null;
    logger.info('✅ Redis connection closed');
  }
}

/**
 * Check if Redis is connected
 */
export function isRedisConnected(): boolean {
  return redisClient?.status === 'ready';
}

/**
 * Graceful Shutdown Handler
 * 
 * Ensures Redis connection is closed properly
 */
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing Redis connection...');
  await closeRedis();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing Redis connection...');
  await closeRedis();
  process.exit(0);
});


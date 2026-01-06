import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import RedisStore from 'rate-limit-redis';
import { getRedisClient } from '../lib/redis';
import { config } from '../config';

/**
 * Rate Limiting Middleware
 * 
 * What is rate limiting?
 * - Limits the number of requests a client can make in a time window
 * - Protects your API from abuse and attacks
 * 
 * Why do we need it?
 * 1. Security: Prevents brute force attacks (trying many passwords)
 * 2. Availability: Prevents DDoS (overwhelming the server)
 * 3. Fair Usage: Ensures all users get fair access
 * 4. Cost Control: Prevents excessive API usage
 * 
 * How it works:
 * - Tracks requests by IP address
 * - Counts requests in a time window (e.g., 15 minutes)
 * - Blocks requests after limit is reached
 * - Resets counter after time window expires
 */

/**
 * Custom error message for rate limit exceeded
 * 
 * This function is called when a user hits the rate limit
 */
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: req.rateLimit?.resetTime
      ? Math.ceil((req.rateLimit.resetTime.getTime() - Date.now()) / 1000)
      : undefined,
  });
};

/**
 * Create Redis Store for Rate Limiting
 * 
 * Uses Redis for persistent, distributed rate limiting
 * Works across multiple servers and survives restarts
 */
function createRedisStore(prefix: string) {
  // Only use Redis in production or if explicitly enabled
  if (config.server.isProduction || config.redis.url !== 'redis://localhost:6379') {
    try {
      return new RedisStore({
        // @ts-expect-error - rate-limit-redis types are outdated
        sendCommand: (...args: string[]) => getRedisClient().call(...args),
        prefix: `rl:${prefix}:`, // Prefix keys: rl:api:, rl:login:, etc.
      });
    } catch (error) {
      console.error('Failed to create Redis store, falling back to memory:', error);
      return undefined; // Fallback to memory store
    }
  }
  return undefined; // Use memory store in development
}

/**
 * General API Rate Limiter
 * 
 * Applied to all API routes for basic protection
 * 
 * Limits:
 * - 100 requests per 15 minutes per IP
 * 
 * Storage:
 * - Production: Redis (persistent, distributed)
 * - Development: Memory (simple, resets on restart)
 * 
 * Use case: Prevents general API abuse
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: rateLimitHandler,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: createRedisStore('api'), // Redis in production, memory in dev
});

/**
 * Strict Auth Rate Limiter
 * 
 * Applied to authentication endpoints (signup/login)
 * 
 * Limits:
 * - 5 requests per 15 minutes per IP
 * 
 * Why stricter?
 * - Login/signup are common brute force targets
 * - Attackers try many passwords to break in
 * - 5 attempts is enough for legitimate users
 * 
 * Storage: Redis (persistent across restarts and servers)
 * 
 * Use case: Prevents credential stuffing and brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  store: createRedisStore('auth'), // Redis for persistence
});

/**
 * Login Specific Rate Limiter
 * 
 * Even stricter than general auth limiter
 * 
 * Limits:
 * - Development: 20 requests per 5 minutes (more lenient for testing)
 * - Production: 3 requests per 5 minutes per IP
 * 
 * Why so strict?
 * - Login is the #1 target for attacks
 * - 3 attempts is reasonable (users often mistype)
 * - Short window (5 min) allows retry quickly
 * 
 * Storage: Redis (critical for security)
 * 
 * Use case: Maximum protection against password guessing
 */
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: config.server.isDevelopment ? 20 : 3, // Lenient in dev, strict in prod
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
  store: createRedisStore('login'), // Redis for distributed protection
});

/**
 * Signup Rate Limiter
 * 
 * Prevents spam account creation
 * 
 * Limits:
 * - Development: 10 signups per hour (for testing)
 * - Production: 3 signups per hour per IP
 * 
 * Why?
 * - Prevents spam bots from creating fake accounts
 * - Legitimate users rarely need multiple accounts
 * - Longer window (1 hour) prevents rapid account creation
 * 
 * Storage: Redis (prevents signup spam across servers)
 * 
 * Use case: Prevents spam and fake accounts
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.server.isDevelopment ? 10 : 3, // Lenient in dev, strict in prod
  message: rateLimitHandler,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRedisStore('signup'), // Redis for spam prevention
});

/**
 * Rate Limit Information
 * 
 * When a client makes a request, they receive these headers:
 * 
 * RateLimit-Limit: 5          (max requests allowed)
 * RateLimit-Remaining: 3       (requests left in window)
 * RateLimit-Reset: 1609459200  (when counter resets, Unix timestamp)
 * 
 * When rate limited (429 response):
 * {
 *   "error": "Too many requests",
 *   "message": "You have exceeded the rate limit. Please try again later.",
 *   "retryAfter": 900  (seconds until can retry)
 * }
 */

/**
 * Production Note: Use Redis for Rate Limiting
 * 
 * Current setup uses in-memory storage (default)
 * - Works fine for single server
 * - Resets when server restarts
 * - Doesn't work with multiple servers (load balancing)
 * 
 * For production with multiple servers:
 * 
 * ```typescript
 * import RedisStore from 'rate-limit-redis';
 * import Redis from 'ioredis';
 * 
 * const redis = new Redis(process.env.REDIS_URL);
 * 
 * export const authLimiter = rateLimit({
 *   store: new RedisStore({
 *     client: redis,
 *     prefix: 'rl:auth:',
 *   }),
 *   // ... other options
 * });
 * ```
 */


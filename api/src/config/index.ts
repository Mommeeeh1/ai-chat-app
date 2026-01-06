import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Schema for validating environment variables
 * Zod ensures type safety and validates values at runtime
 */
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  HOST: z.string().default('localhost'),

  // Security
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters')
    .default('test-jwt-secret-for-testing-minimum-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().url().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),

  // Redis (for rate limiting and caching)
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Validate and parse environment variables
 * This will throw an error if any required variable is missing or invalid
 */
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Environment validation failed');
    }
    throw error;
  }
};

// Parse and validate environment variables
const env = parseEnv();

/**
 * Application configuration object
 * This is what you import in other files: import { config } from '@/config'
 */
export const config = {
  // Server settings
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
    isTest: env.NODE_ENV === 'test',
  },

  // Security settings
  security: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
  },

  // CORS settings
  cors: {
    origin: env.CORS_ORIGIN,
  },

  // Rate limiting settings
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // Redis settings
  redis: {
    url: env.REDIS_URL,
  },

  // Logging settings
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;

// Export type for TypeScript
export type Config = typeof config;

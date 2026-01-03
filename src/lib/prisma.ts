import { PrismaClient } from '../generated/prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Prisma Client Singleton
 * 
 * Why a singleton?
 * - In development, hot reload creates new instances
 * - We want ONE connection pool, not multiple
 * - Prevents "too many connections" errors
 */

// Declare global variable for Prisma Client
// This prevents creating multiple instances during hot reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Create or reuse Prisma Client instance
 * 
 * In development: Reuses existing instance if available
 * In production: Creates new instance
 */
export const prisma =
  global.prisma ??
  new PrismaClient({
    log: config.server.isDevelopment
      ? ['query', 'error', 'warn'] // Show all logs in development
      : ['error'], // Only errors in production
  });

// If we're in development, store it globally
// This prevents creating new instances on hot reload
if (config.server.isDevelopment) {
  global.prisma = prisma;
}

/**
 * Graceful shutdown
 * Disconnects from database when app closes
 */
prisma.$on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

// Log successful connection
if (config.server.isDevelopment) {
  logger.info('✅ Prisma Client connected to database');
}


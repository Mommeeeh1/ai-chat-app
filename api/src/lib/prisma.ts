import { PrismaClient } from '@prisma/client';

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
 * Get or create Prisma Client instance
 * Lazy initialization - only creates client when first accessed
 */
function getPrismaClient(): PrismaClient {
  if (!global.prisma) {
    console.log('Initializing Prisma Client...');
    
    // Prisma 7: datasource URL comes from prisma.config.ts via DATABASE_URL env var
    // Just create the client without extra config
    global.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    });
    
    console.log('✅ Prisma Client initialized');
  }
  return global.prisma;
}

/**
 * Export the prisma instance
 * Using a getter so it's only created when first accessed
 */
let _prisma: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!_prisma) {
      console.log('🔌 Connecting to database...');
      _prisma = getPrismaClient();
    }
    return (_prisma as any)[prop];
  }
});


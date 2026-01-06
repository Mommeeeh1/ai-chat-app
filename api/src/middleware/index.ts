/**
 * Middleware Index
 * 
 * Central export point for all middleware functions
 * Makes it easier to import: import { authenticate, validate, errorHandler } from '@/middleware'
 */

export { authenticate, type AuthenticatedRequest } from './auth.middleware';
export { validate, validateBody, validateQuery, validateParams } from './validation.middleware';
export { errorHandler, AppError, asyncHandler } from './error.middleware';
export { apiLimiter, authLimiter, loginLimiter, signupLimiter } from './rate-limit.middleware';


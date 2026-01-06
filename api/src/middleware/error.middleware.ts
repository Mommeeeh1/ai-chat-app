import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError, formatErrorResponse, isAppError } from '../utils/errors';

// Re-export for backward compatibility
export { AppError } from '../utils/errors';

/**
 * Global Error Handler Middleware
 *
 * What it does:
 * 1. Catches ALL errors thrown in routes/middleware
 * 2. Logs the error for debugging
 * 3. Returns appropriate HTTP status code
 * 4. Returns user-friendly error message
 * 5. In development: includes stack trace
 * 6. In production: hides sensitive error details
 *
 * Why it's important:
 * - Prevents server crashes from unhandled errors
 * - Provides consistent error response format
 * - Logs errors for monitoring/debugging
 * - Hides sensitive info in production
 *
 * Usage:
 * ```typescript
 * // In app.ts, add at the END of all middleware:
 * app.use(errorHandler);
 *
 * // In any route, you can throw errors:
 * router.get('/user/:id', (req, res, next) => {
 *   const user = findUser(req.params.id);
 *   if (!user) {
 *     throw new AppError('User not found', 404);
 *   }
 *   res.json(user);
 * });
 * ```
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction // Underscore prefix = intentionally unused
): void {
  // Step 1: Determine if it's our custom AppError
  const isCustomError = isAppError(err);
  const statusCode = isCustomError ? err.statusCode : 500;

  // Step 2: Log the error
  logger.error('Request error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
    errorCode: isCustomError ? err.errorCode : undefined,
    // Only log request body in development (might contain sensitive data)
    ...(config.server.isDevelopment && { body: req.body }),
  });

  // Step 3: Format error response
  // Use the new error formatter for AppError, fallback for unexpected errors
  const response = isCustomError
    ? formatErrorResponse(err, config.server.isDevelopment)
    : {
        error: 'Internal Server Error',
        message: config.server.isDevelopment ? err.message : 'An unexpected error occurred',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        ...(config.server.isDevelopment && { stack: err.stack }),
      };

  // Step 4: Send error response
  res.status(statusCode).json(response);
}

/**
 * Async Error Wrapper
 *
 * Wraps async route handlers to catch errors automatically
 *
 * Without this, you'd need try/catch in every async route:
 * ```typescript
 * router.get('/user', async (req, res, next) => {
 *   try {
 *     const user = await findUser();
 *     res.json(user);
 *   } catch (error) {
 *     next(error); // Pass to error handler
 *   }
 * });
 * ```
 *
 * With this wrapper:
 * ```typescript
 * router.get('/user', asyncHandler(async (req, res) => {
 *   const user = await findUser();
 *   res.json(user);
 *   // Errors automatically caught and passed to error handler!
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

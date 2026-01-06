import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { createChildLogger } from '../utils/logger';

const authLogger = createChildLogger({ module: 'middleware', service: 'AuthMiddleware' });

/**
 * Extended Express Request type
 * Adds 'user' property to request object after authentication
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

/**
 * Authentication Middleware
 * 
 * What it does:
 * 1. Extracts JWT token from httpOnly cookie OR Authorization header (fallback)
 * 2. Verifies the token is valid (not expired, correct signature)
 * 3. Extracts userId from token payload
 * 4. Adds user info to request object
 * 5. Calls next() to continue to the route handler
 * 
 * If token is missing or invalid:
 * - Returns 401 Unauthorized
 * - Does NOT call next() (stops request)
 * 
 * Usage:
 * ```typescript
 * router.get('/protected', authenticate, (req, res) => {
 *   // req.user.userId is available here
 *   res.json({ message: 'You are authenticated!' });
 * });
 * ```
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Step 1: Get token from httpOnly cookie (preferred) or Authorization header (fallback)
    let token: string | undefined;
    
    // Try to get token from httpOnly cookie first
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      authLogger.debug('Token found in httpOnly cookie');
    } 
    // Fallback to Authorization header for backwards compatibility
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const parts = authHeader.split(' ');

      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
        authLogger.debug('Token found in Authorization header');
      }
    }

    if (!token) {
      authLogger.warn('Authentication failed: No token provided');
      res.status(401).json({
        error: 'Authentication required',
        message: 'Please login to access this resource',
      });
      return; // Stop here, don't call next()
    }

    // Step 3: Verify the token
    // jwt.verify() will throw an error if:
    // - Token is expired
    // - Token signature is invalid
    // - Token is malformed
    const decoded = jwt.verify(token, config.security.jwtSecret) as jwt.JwtPayload & { userId: string };

    // Step 4: Add user info to request object
    // Now any route handler can access req.user.userId
    req.user = {
      userId: decoded.userId,
    };

    authLogger.debug(`User authenticated: ${decoded.userId}`);

    // Step 5: Continue to the next middleware/route handler
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      authLogger.warn('Authentication failed: Invalid token', { error: error.message });
      res.status(401).json({
        error: 'Invalid token',
        message: 'The provided token is invalid or expired',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      authLogger.warn('Authentication failed: Token expired');
      res.status(401).json({
        error: 'Token expired',
        message: 'Please login again to get a new token',
      });
      return;
    }

    // Unexpected error
    authLogger.error('Authentication error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication',
    });
  }
}


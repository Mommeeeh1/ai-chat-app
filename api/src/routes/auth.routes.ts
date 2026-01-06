import { Router, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { createChildLogger } from '../utils/logger';
import { validateBody, asyncHandler, signupLimiter, loginLimiter } from '../middleware';
import { signupSchema, loginSchema } from './auth.schemas';
import { HttpStatus, AUTH_MESSAGES } from '../constants';

// Create a router - this groups related routes together
const router = Router();

// LAZY INITIALIZATION: Create logger only when first needed
let routeLogger: ReturnType<typeof createChildLogger>;
function getLogger() {
  if (!routeLogger) {
    routeLogger = createChildLogger({ module: 'routes', service: 'AuthRoutes' });
  }
  return routeLogger;
}

router.post(
  '/signup',
  signupLimiter, // Rate limit: 3 signups per hour per IP
  validateBody(signupSchema), // Validate request body
  asyncHandler(async (req: Request, res: Response) => {
    // req.body is now validated and type-safe!
    const { email, password, name } = req.body;

    getLogger().info(`Signup request for: ${email}`);

    // Call service - returns AuthResponseDTO (safe, no password)
    const result = await authService.signup({
      email,
      password,
      name,
    });

    getLogger().info(`Signup successful for: ${result.user.email}`);

    // Set httpOnly cookie with JWT token
    // httpOnly: prevents JavaScript access (XSS protection)
    // secure: only send over HTTPS in production
    // sameSite: CSRF protection
    res.cookie('token', result.token, {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });

    // Return user data (no token in response body anymore)
    res.status(HttpStatus.CREATED).json({
      user: result.user,
      message: AUTH_MESSAGES.SIGNUP_SUCCESS,
    });
  })
);

router.post(
  '/login',
  loginLimiter,
  validateBody(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    getLogger().info(`Login request for: ${email}`);

    const result = await authService.login({
      email,
      password,
    });

    getLogger().info(`Login successful for: ${result.user.email}`);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(HttpStatus.OK).json({
      user: result.user,
      message: AUTH_MESSAGES.LOGIN_SUCCESS,
    });
  })
);

router.post(
  '/logout',
  asyncHandler(async (_req: Request, res: Response) => {
    getLogger().info('Logout request');

    // Clear the httpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(HttpStatus.OK).json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  })
);

export default router;

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';

/**
 * Create and configure Express application
 * 
 * This function sets up all middleware and routes
 * Returns the configured Express app
 */
export function createApp(): Express {
  // Create Express app instance
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================

  // Helmet: Sets various HTTP headers for security
  // Protects against common vulnerabilities
  app.use(helmet());

  // CORS: Allows frontend (Next.js) to make requests
  // Only allows requests from our frontend URL
  app.use(
    cors({
      origin: config.cors.origin, // http://localhost:3001 (Next.js)
      credentials: true, // Allow cookies/auth headers
    })
  );

  // ============================================
  // PARSING MIDDLEWARE
  // ============================================

  // Parse JSON request bodies
  // When frontend sends JSON, Express can read it
  app.use(express.json());

  // Parse URL-encoded data (form submissions)
  app.use(express.urlencoded({ extended: true }));

  // ============================================
  // REQUEST LOGGING MIDDLEWARE
  // ============================================

  // Log every incoming request
  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    next(); // Continue to next middleware
  });

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================

  // Simple endpoint to check if server is running
  // Useful for monitoring and deployment checks
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.server.env,
    });
  });

  // ============================================
  // API ROUTES
  // ============================================

  // TODO: Add routes here later
  // app.use('/api/auth', authRoutes);
  // app.use('/api/users', userRoutes);
  // app.use('/api/workouts', workoutRoutes);

  // ============================================
  // 404 HANDLER (Route not found)
  // ============================================

  // If no route matches, return 404
  app.use((req, res) => {
    logger.warn(`Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
      error: 'Route not found',
      path: req.path,
    });
  });

  // ============================================
  // ERROR HANDLING MIDDLEWARE
  // ============================================

  // Catches any errors thrown in routes
  // Must be last middleware (after all routes)
  app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });

    res.status(500).json({
      error: 'Internal server error',
      // Only show error details in development
      ...(config.server.isDevelopment && { message: err.message }),
    });
  });

  return app;
}


import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from './routes/chat.routes';
import progressRoutes from './routes/progress.routes';
import workoutRoutes from './routes/workout.routes';
import { errorHandler, apiLimiter } from './middleware';

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
      credentials: true, // Allow cookies to be sent
    })
  );

  // Cookie Parser: Parse cookies from requests
  // Required for reading httpOnly cookies
  app.use(cookieParser());

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
  // API DOCUMENTATION (Swagger)
  // ============================================

  // Swagger UI: Interactive API documentation
  // Access at: http://localhost:3000/api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AI Trainer API Docs',
  }));

  // Swagger JSON: Raw OpenAPI specification
  // Access at: http://localhost:3000/api-docs.json
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ============================================
  // RATE LIMITING
  // ============================================

  // Apply general rate limiting to all API routes
  // 100 requests per 15 minutes per IP
  app.use('/api', apiLimiter);

  // ============================================
  // API ROUTES
  // ============================================

  // Mount authentication routes at /api/auth
  app.use('/api/auth', authRoutes);

  // Mount profile routes at /api/profile (PROTECTED)
  app.use('/api/profile', profileRoutes);

  // Mount chat routes at /api/chat (PROTECTED)
  app.use('/api/chat', chatRoutes);

  // Mount progress routes at /api/progress (PROTECTED)
  app.use('/api/progress', progressRoutes);

  // Mount workout routes at /api/workouts (PROTECTED)
  app.use('/api/workouts', workoutRoutes);

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

  // This catches ALL errors thrown in routes/middleware
  // Must be last middleware (after all routes)
  app.use(errorHandler);

  return app;
}


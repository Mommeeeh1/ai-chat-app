import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

/**
 * Server Entry Point
 * 
 * This is where the application starts
 * Loads config, creates Express app, and starts listening
 */

async function startServer(): Promise<void> {
  try {
    // Log startup
    logger.info('🚀 Starting AI Personal Trainer server...');
    logger.info(`Environment: ${config.server.env}`);
    logger.info(`Port: ${config.server.port}`);
    logger.info(`Host: ${config.server.host}`);

    // Create Express app
    const app = createApp();

    // Start listening for requests
    app.listen(config.server.port, config.server.host, () => {
      logger.info(`✅ Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`📊 Health check: http://${config.server.host}:${config.server.port}/health`);
      
      if (config.server.isDevelopment) {
        logger.info('🔧 Development mode: Hot reload enabled');
      }
    });
  } catch (error) {
    // If something goes wrong during startup, log it and exit
    logger.error('❌ Failed to start server:', error);
    process.exit(1); // Exit with error code
  }
}

// Start the server
startServer();


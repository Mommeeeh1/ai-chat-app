import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

/**
 * Server Entry Point
 *
 * This is where the application starts
 * Loads config, creates Express app, and starts listening
 */

function startServer(): void {
  try {
    logger.info('🚀 Starting AI Personal Trainer server...');
    logger.info(`Environment: ${config.server.env}`);
    logger.info(`Port: ${config.server.port}`);
    logger.info(`Host: ${config.server.host}`);

    const app = createApp();

    app.listen(config.server.port, config.server.host, () => {
      logger.info(`✅ Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`📊 Health check: http://${config.server.host}:${config.server.port}/health`);

      if (config.server.isDevelopment) {
        logger.info('🔧 Development mode: Hot reload enabled');
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    if (error instanceof Error) {
      logger.error('Error message:', error.message);
      logger.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Start the server
startServer();

// Prevent tsx from printing "undefined" by having an export
export {};

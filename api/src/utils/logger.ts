import winston from 'winston';
import { config } from '../config';

/**
 * Custom log format for development
 * Makes logs easier to read with colors and formatting
 */
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Show full error stack traces
  winston.format.colorize(), // Add colors to log levels
  winston.format.printf(({ level, message, timestamp, stack }) => {
    // If there's a stack trace (error), show it
    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}`;
    }
    // Otherwise, just show the message
    return `${timestamp} [${level}]: ${message}`;
  })
);

/**
 * Production log format
 * More compact, no colors (since we'll save to files)
 */
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json() // JSON format for easy parsing
);

/**
 * Create the logger instance
 * Different settings for development vs production
 */
export const logger = winston.createLogger({
  // Set the minimum log level based on config
  level: config.logging.level,

  // Default format (will be overridden by transports)
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),

  // Where to send logs
  transports: [
    // Console output (always show logs in terminal)
    new winston.transports.Console({
      format: config.server.isDevelopment ? developmentFormat : productionFormat,
    }),

    // File logging (only in production)
    ...(config.server.isProduction
      ? [
          // Error logs go to error.log
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error', // Only log errors here
            format: productionFormat,
          }),
          // All logs go to combined.log
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: productionFormat,
          }),
        ]
      : []),
  ],

  // Handle exceptions that aren't caught
  exceptionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
  ],

  // Handle promise rejections that aren't caught
  rejectionHandlers: [
    new winston.transports.Console({
      format: developmentFormat,
    }),
  ],
});

/**
 * Helper function to create child loggers
 * Useful for adding context (like which module is logging)
 *
 * Example:
 * const moduleLogger = logger.child({ module: 'auth' });
 * moduleLogger.info('User logged in'); // Will show [auth] in the log
 */
export const createChildLogger = (context: Record<string, string>) => {
  return logger.child(context);
};

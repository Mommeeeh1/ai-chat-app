/**
 * Constants Index
 *
 * Central export point for all constants
 */

export * from './enums';
export * from './messages';

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Rate Limiting
 */
export const RATE_LIMITS = {
  // Auth
  SIGNUP_PER_HOUR: 3,
  LOGIN_PER_5_MIN: 20, // Development
  LOGIN_PER_5_MIN_PROD: 5, // Production

  // Chat
  CHAT_PER_HOUR: 10,

  // General API
  API_PER_15_MIN: 100,
} as const;

/**
 * JWT Configuration
 */
export const JWT = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
  ALGORITHM: 'HS256',
} as const;

/**
 * Cookie Configuration
 */
export const COOKIE_CONFIG = {
  HTTP_ONLY: true,
  SAME_SITE: 'lax' as const,
  MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  PATH: '/',
} as const;

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  MESSAGE_MAX_LENGTH: 1000,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  NOTES_MAX_LENGTH: 500,
} as const;

/**
 * AI Configuration
 */
export const AI_CONFIG = {
  MODEL: 'llama3.1',
  CONTEXT_MESSAGES: 10,
  TIMEOUT_MS: 30000,
} as const;

/**
 * Date/Time Formats
 */
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
} as const;

/**
 * File Upload Limits (if you add file uploads later)
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 5,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CACHE_TTL = {
  PROFILE: 300, // 5 minutes
  EXERCISES: 3600, // 1 hour
  TEMPLATES: 3600, // 1 hour
  STATS: 60, // 1 minute
} as const;




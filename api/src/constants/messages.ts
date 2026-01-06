/**
 * Application Messages
 * 
 * Centralized messages for consistency and easy i18n in the future
 */

export const AUTH_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  UNAUTHORIZED: 'Authentication required',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  TOKEN_INVALID: 'Invalid authentication token',
} as const;

export const PROFILE_MESSAGES = {
  CREATED: 'Profile created successfully',
  UPDATED: 'Profile updated successfully',
  DELETED: 'Profile deleted successfully',
  NOT_FOUND: 'Profile not found',
  FETCH_SUCCESS: 'Profile retrieved successfully',
} as const;

export const CHAT_MESSAGES = {
  HISTORY_DELETED: 'Chat history deleted successfully',
  AI_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later',
  MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 1000 characters',
  RATE_LIMIT: 'You can send up to 10 messages per hour. Please try again later',
} as const;

export const WORKOUT_MESSAGES = {
  CREATED: 'Workout created successfully',
  UPDATED: 'Workout updated successfully',
  DELETED: 'Workout deleted successfully',
  LOGGED: 'Workout logged successfully',
  NOT_FOUND: 'Workout not found',
  UNAUTHORIZED: 'You are not authorized to modify this workout',
  NAME_REQUIRED: 'Workout name is required',
} as const;

export const PROGRESS_MESSAGES = {
  CREATED: 'Progress entry created successfully',
  UPDATED: 'Progress entry updated successfully',
  DELETED: 'Progress entry deleted successfully',
  NOT_FOUND: 'Progress entry not found',
  DATE_RANGE_REQUIRED: 'Both startDate and endDate are required',
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please provide a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  NAME_REQUIRED: 'Name is required',
  NAME_MIN_LENGTH: 'Name must be at least 2 characters',
  FIELD_REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_VALUE: 'Invalid value',
} as const;

export const ERROR_MESSAGES = {
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again',
  BAD_REQUEST: 'Invalid request',
  NOT_FOUND: 'Resource not found',
  FORBIDDEN: 'You do not have permission to perform this action',
  RATE_LIMIT: 'Too many requests. Please slow down',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;

export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
  DATA_SAVED: 'Data saved successfully',
  DATA_DELETED: 'Data deleted successfully',
} as const;





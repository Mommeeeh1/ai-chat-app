/**
 * Custom Error Classes
 * 
 * Structured error handling with proper error codes and messages
 */

import { HttpStatus, ErrorCode } from '../constants';

/**
 * Base Application Error
 * 
 * All custom errors should extend this class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    
    // Set the prototype explicitly for instanceof checks to work
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Authentication Errors
 */
export class AuthenticationError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid email or password') {
    super(message, ErrorCode.INVALID_CREDENTIALS);
    Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
  }
}

export class TokenExpiredError extends AuthenticationError {
  constructor(message: string = 'Your session has expired. Please log in again') {
    super(message, ErrorCode.TOKEN_EXPIRED);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class TokenInvalidError extends AuthenticationError {
  constructor(message: string = 'Invalid authentication token') {
    super(message, ErrorCode.TOKEN_INVALID);
    Object.setPrototypeOf(this, TokenInvalidError.prototype);
  }
}

/**
 * Authorization Errors
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Validation Errors
 */
export class ValidationError extends AppError {
  public readonly errors?: any[];

  constructor(message: string, errors?: any[]) {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR);
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not Found Errors
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string,
    errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR
  ) {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, errorCode);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('User', ErrorCode.USER_NOT_FOUND);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class ProfileNotFoundError extends NotFoundError {
  constructor() {
    super('Profile', ErrorCode.PROFILE_NOT_FOUND);
    Object.setPrototypeOf(this, ProfileNotFoundError.prototype);
  }
}

export class WorkoutNotFoundError extends NotFoundError {
  constructor() {
    super('Workout', ErrorCode.WORKOUT_NOT_FOUND);
    Object.setPrototypeOf(this, WorkoutNotFoundError.prototype);
  }
}

export class ProgressNotFoundError extends NotFoundError {
  constructor() {
    super('Progress entry', ErrorCode.PROGRESS_NOT_FOUND);
    Object.setPrototypeOf(this, ProgressNotFoundError.prototype);
  }
}

/**
 * Conflict Errors
 */
export class ConflictError extends AppError {
  constructor(message: string, errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR) {
    super(message, HttpStatus.CONFLICT, errorCode);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(message: string = 'An account with this email already exists') {
    super(message, ErrorCode.USER_ALREADY_EXISTS);
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}

/**
 * Rate Limiting Errors
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, ErrorCode.RATE_LIMIT_EXCEEDED);
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * External Service Errors
 */
export class ServiceUnavailableError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `${service} is temporarily unavailable`,
      HttpStatus.SERVICE_UNAVAILABLE,
      ErrorCode.AI_SERVICE_UNAVAILABLE
    );
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Bad Request Errors
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request') {
    super(message, HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Error Response Formatter
 * 
 * Formats errors consistently for API responses
 */
export interface ErrorResponse {
  error: string;
  message: string;
  errorCode: ErrorCode;
  statusCode: number;
  timestamp: string;
  errors?: any[];
  retryAfter?: number;
  stack?: string;
}

export function formatErrorResponse(error: AppError, includeStack: boolean = false): ErrorResponse {
  const response: ErrorResponse = {
    error: error.constructor.name,
    message: error.message,
    errorCode: error.errorCode,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
  };

  // Add validation errors if present
  if (error instanceof ValidationError && error.errors) {
    response.errors = error.errors;
  }

  // Add retry-after for rate limit errors
  if (error instanceof RateLimitError && error.retryAfter) {
    response.retryAfter = error.retryAfter;
  }

  // Add stack trace in development
  if (includeStack) {
    response.stack = error.stack;
  }

  return response;
}

/**
 * Type Guards
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

export function isOperationalError(error: any): boolean {
  return isAppError(error) && error.isOperational;
}





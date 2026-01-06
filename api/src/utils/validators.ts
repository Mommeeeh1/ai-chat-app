/**
 * Validation Utilities
 *
 * Helper functions for common validation tasks
 */

import { VALIDATION_RULES } from '../constants';
import { ValidationError } from './errors';

/**
 * Email Validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): void {
  if (!email) {
    throw new ValidationError('Email is required');
  }
  if (!isValidEmail(email)) {
    throw new ValidationError('Please provide a valid email address');
  }
  if (email.length > VALIDATION_RULES.EMAIL_MAX_LENGTH) {
    throw new ValidationError(
      `Email must be less than ${VALIDATION_RULES.EMAIL_MAX_LENGTH} characters`
    );
  }
}

/**
 * Password Validation
 */
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
}

export function validatePassword(password: string): void {
  if (!password) {
    throw new ValidationError('Password is required');
  }
  if (!isValidPassword(password)) {
    throw new ValidationError(
      `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
    );
  }
}

/**
 * Name Validation
 */
export function validateName(name: string): void {
  if (!name) {
    throw new ValidationError('Name is required');
  }
  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    throw new ValidationError(
      `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters`
    );
  }
  if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    throw new ValidationError(
      `Name must be less than ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`
    );
  }
}

/**
 * UUID Validation
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateUUID(uuid: string, fieldName: string = 'ID'): void {
  if (!uuid) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (!isValidUUID(uuid)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
}

/**
 * Number Validation
 */
export function validatePositiveNumber(value: any, fieldName: string): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }
  if (value <= 0) {
    throw new ValidationError(`${fieldName} must be positive`);
  }
}

export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  validatePositiveNumber(value, fieldName);
  if (value < min || value > max) {
    throw new ValidationError(`${fieldName} must be between ${min} and ${max}`);
  }
}

/**
 * Date Validation
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateDate(date: any, fieldName: string = 'Date'): void {
  if (!date) {
    throw new ValidationError(`${fieldName} is required`);
  }
  const parsedDate = new Date(date);
  if (!isValidDate(parsedDate)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
}

export function validateDateRange(startDate: Date, endDate: Date): void {
  validateDate(startDate, 'Start date');
  validateDate(endDate, 'End date');

  if (startDate > endDate) {
    throw new ValidationError('Start date must be before end date');
  }
}

/**
 * String Length Validation
 */
export function validateStringLength(
  value: string,
  minLength: number,
  maxLength: number,
  fieldName: string
): void {
  if (!value) {
    throw new ValidationError(`${fieldName} is required`);
  }
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters`);
  }
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be less than ${maxLength} characters`);
  }
}

/**
 * Enum Validation
 */
export function validateEnum<T extends Record<string, string>>(
  value: string,
  enumObject: T,
  fieldName: string
): void {
  const validValues = Object.values(enumObject);
  if (!validValues.includes(value)) {
    throw new ValidationError(`Invalid ${fieldName}. Must be one of: ${validValues.join(', ')}`);
  }
}

/**
 * Array Validation
 */
export function validateArray(value: any, fieldName: string, minLength: number = 0): void {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }
  if (minLength > 0 && value.length < minLength) {
    throw new ValidationError(`${fieldName} must contain at least ${minLength} item(s)`);
  }
}

/**
 * Sanitization Utilities
 */
export function sanitizeString(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Object Validation
 */
export function validateRequiredFields(obj: Record<string, any>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter((field) => !obj[field]);

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      missingFields.map((field) => ({ field, message: 'This field is required' }))
    );
  }
}

/**
 * Pagination Validation
 */
export function validatePagination(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validatedLimit = limit && !isNaN(limit) && limit > 0 ? Math.min(limit, 100) : 20;
  const validatedOffset = offset && !isNaN(offset) && offset >= 0 ? offset : 0;

  return { limit: validatedLimit, offset: validatedOffset };
}

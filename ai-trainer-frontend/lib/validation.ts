/**
 * Client-Side Validation Utilities
 * 
 * Reusable validation functions for forms
 */

/**
 * Validation Result Type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email Validation
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 255) {
    return { isValid: false, error: 'Email is too long' };
  }

  return { isValid: true };
}

/**
 * Password Validation
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' };
  }

  return { isValid: true };
}

/**
 * Name Validation
 */
export function validateName(name: string): ValidationResult {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }

  return { isValid: true };
}

/**
 * Required Field Validation
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
}

/**
 * Number Validation
 */
export function validateNumber(
  value: any,
  fieldName: string,
  options?: { min?: number; max?: number; required?: boolean }
): ValidationResult {
  if (options?.required && (value === null || value === undefined || value === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (value !== null && value !== undefined && value !== '') {
    const num = Number(value);

    if (isNaN(num)) {
      return { isValid: false, error: `${fieldName} must be a valid number` };
    }

    if (options?.min !== undefined && num < options.min) {
      return { isValid: false, error: `${fieldName} must be at least ${options.min}` };
    }

    if (options?.max !== undefined && num > options.max) {
      return { isValid: false, error: `${fieldName} must be at most ${options.max}` };
    }
  }

  return { isValid: true };
}

/**
 * String Length Validation
 */
export function validateLength(
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): ValidationResult {
  if (min !== undefined && value.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }

  if (max !== undefined && value.length > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max} characters` };
  }

  return { isValid: true };
}

/**
 * Array Validation
 */
export function validateArray(
  value: any[],
  fieldName: string,
  minLength?: number
): ValidationResult {
  if (!Array.isArray(value)) {
    return { isValid: false, error: `${fieldName} must be a list` };
  }

  if (minLength !== undefined && value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must contain at least ${minLength} item(s)`,
    };
  }

  return { isValid: true };
}

/**
 * Form Validation Helper
 */
export interface FormErrors {
  [key: string]: string;
}

export function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function getFirstError(errors: FormErrors): string | null {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
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

export function sanitizeNumber(value: string | number): number | null {
  const num = Number(value);
  return isNaN(num) ? null : num;
}





import { z } from 'zod';

/**
 * Auth Request Validation Schemas
 *
 * These schemas define what valid requests should look like.
 * Zod validates the data AND provides TypeScript types automatically.
 */

/**
 * Signup Request Schema
 *
 * Validates:
 * - email: Must be valid email format
 * - password: Must be at least 6 characters
 * - name: Optional string
 */
export const signupSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .toLowerCase() // Normalize email to lowercase
    .trim(), // Remove whitespace

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),

  name: z
    .string()
    .trim()
    .optional() // Name is optional
    .nullable(), // Allow null values
});

/**
 * Login Request Schema
 *
 * Validates:
 * - email: Must be valid email format
 * - password: Required string
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(1, 'Password cannot be empty'), // Just check it's not empty
});

/**
 * TypeScript Types
 *
 * Zod automatically infers TypeScript types from schemas!
 * These are the validated, type-safe data structures.
 */
export type SignupRequest = z.infer<typeof signupSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

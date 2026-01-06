import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { createChildLogger } from '../utils/logger';

const validationLogger = createChildLogger({ module: 'middleware', service: 'ValidationMiddleware' });

/**
 * Validation Middleware Factory
 * 
 * What it does:
 * 1. Takes a Zod schema (validation rules)
 * 2. Validates request data against the schema
 * 3. If valid: adds validated data to request and continues
 * 4. If invalid: returns 400 with detailed error messages
 * 
 * Why use Zod?
 * - Type-safe validation (TypeScript knows the shape of validated data)
 * - Clear error messages
 * - Can validate nested objects, arrays, dates, etc.
 * - One schema = validation + TypeScript types
 * 
 * Usage:
 * ```typescript
 * import { z } from 'zod';
 * import { validate } from '../middleware';
 * 
 * const signupSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6),
 *   name: z.string().optional(),
 * });
 * 
 * router.post('/signup', validate(signupSchema), (req, res) => {
 *   // req.body is now validated and type-safe!
 *   const { email, password, name } = req.body; // TypeScript knows these types
 * });
 * ```
 */

/**
 * Where to validate data from
 */
type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Create validation middleware for a specific target (body, query, or params)
 * 
 * @param schema - Zod schema to validate against
 * @param target - Where to get data from (default: 'body')
 * @returns Express middleware function
 */
export function validate(
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Step 1: Get data from the specified target
      const dataToValidate = req[target];

      // Step 2: Validate data against schema
      // parse() throws ZodError if validation fails
      const validatedData = schema.parse(dataToValidate);

      // Step 3: Replace original data with validated data
      // This ensures type safety in route handlers
      req[target] = validatedData;

      validationLogger.debug(`Validation passed for ${target}`);

      // Step 4: Continue to next middleware/route handler
      next();
    } catch (error) {
      // Step 5: Handle validation errors
      if (error instanceof ZodError) {
        // Format Zod errors into user-friendly messages
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'), // e.g., "email" or "user.name"
          message: err.message, // e.g., "Invalid email"
        }));

        validationLogger.warn(`Validation failed for ${target}:`, errors);

        res.status(400).json({
          error: 'Validation failed',
          message: 'Please check your input and try again',
          errors, // Detailed field-level errors
        });
        return; // Stop here, don't call next()
      }

      // Unexpected error
      validationLogger.error('Validation error:', error);
      res.status(500).json({
        error: 'Validation error',
        message: 'An error occurred during validation',
      });
    }
  };
}

/**
 * Convenience function for validating request body
 * Most common use case
 */
export function validateBody(schema: ZodSchema) {
  return validate(schema, 'body');
}

/**
 * Convenience function for validating query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return validate(schema, 'query');
}

/**
 * Convenience function for validating route parameters
 */
export function validateParams(schema: ZodSchema) {
  return validate(schema, 'params');
}



import { z } from 'zod';

/**
 * User Response DTOs
 *
 * DTOs (Data Transfer Objects) define the shape of data sent to clients.
 *
 * Why use DTOs?
 * 1. Security: Explicitly define what data is exposed (prevents password leaks)
 * 2. Type Safety: TypeScript knows the exact response structure
 * 3. Consistency: All endpoints return the same user structure
 * 4. Decoupling: API responses independent of database schema
 *
 * Pattern:
 * Database Model → DTO → API Response
 * (has password)   (no password)   (safe)
 */

/**
 * User Response DTO Schema
 *
 * This is what clients receive - NO sensitive data like password
 */
export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.date(),
});

/**
 * TypeScript type for User Response
 * Automatically inferred from Zod schema
 */
export type UserResponseDTO = z.infer<typeof userResponseSchema>;

/**
 * Auth Response DTO Schema
 *
 * Used for signup/login responses
 * Contains user data + JWT token
 */
export const authResponseSchema = z.object({
  message: z.string(),
  user: userResponseSchema,
  token: z.string(),
});

/**
 * TypeScript type for Auth Response
 */
export type AuthResponseDTO = z.infer<typeof authResponseSchema>;

/**
 * Transform Function: Database Model → DTO
 *
 * This is the KEY function that ensures security!
 * It takes a database user (with password) and returns only safe fields.
 *
 * @param user - User from database (includes password!)
 * @returns UserResponseDTO - Safe user object (NO password)
 *
 * Usage:
 * ```typescript
 * const dbUser = await prisma.user.findUnique(...);
 * const safeUser = toUserDTO(dbUser); // Password is removed
 * res.json({ user: safeUser });
 * ```
 */
export function toUserDTO(user: {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  password?: string; // password might exist in DB model
  updatedAt?: Date; // other fields we don't want to expose
  [key: string]: any; // any other fields
}): UserResponseDTO {
  // Explicitly select only the fields we want to expose
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
  // Notice: password is NOT included!
  // Even if user.password exists, it won't be in the response
}

/**
 * Transform Function: Create Auth Response
 *
 * Combines user DTO with JWT token and message
 *
 * @param user - User from database
 * @param token - JWT token
 * @param message - Success message
 * @returns AuthResponseDTO - Complete auth response
 */
export function toAuthResponseDTO(
  user: Parameters<typeof toUserDTO>[0],
  token: string,
  message: string
): AuthResponseDTO {
  return {
    message,
    user: toUserDTO(user), // Transform user to DTO first
    token,
  };
}

import { z } from 'zod';

/**
 * Profile DTOs
 *
 * Data Transfer Objects for user profile operations
 * Defines what data is exposed to clients and how it's validated
 */

/**
 * UserProfile type (matches Prisma schema)
 *
 * We define this manually to avoid Prisma client import issues
 */
interface UserProfile {
  id: string;
  userId: string;
  age: number | null;
  gender: string | null;
  height: number | null;
  currentWeight: number | null;
  targetWeight: number | null;
  primaryGoal: string | null;
  activityLevel: string | null;
  dietaryRestrictions: string[];
  availableEquipment: string[];
  workoutDaysPerWeek: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Zod Schema for Profile Response
 *
 * This is what clients receive when they request their profile
 */
export const profileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  age: z.number().int().positive().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable(),
  height: z.number().positive().nullable(), // in cm
  currentWeight: z.number().positive().nullable(), // in kg
  targetWeight: z.number().positive().nullable(), // in kg
  primaryGoal: z
    .enum(['lose_weight', 'gain_muscle', 'maintain', 'improve_endurance', 'general_fitness'])
    .nullable(),
  activityLevel: z
    .enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
    .nullable(),
  dietaryRestrictions: z.array(z.string()),
  availableEquipment: z.array(z.string()),
  workoutDaysPerWeek: z.number().int().min(0).max(7).nullable(),
  createdAt: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
  updatedAt: z.preprocess((arg) => {
    if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    return arg;
  }, z.date()),
});

/**
 * TypeScript type for Profile Response
 */
export type ProfileResponseDTO = z.infer<typeof profileResponseSchema>;

/**
 * Zod Schema for Profile Update Request
 *
 * Clients send this to update their profile
 * All fields are optional (partial update)
 */
export const updateProfileSchema = z
  .object({
    age: z.number().int().positive().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    height: z.number().positive().optional(), // in cm
    currentWeight: z.number().positive().optional(), // in kg
    targetWeight: z.number().positive().optional(), // in kg
    primaryGoal: z
      .enum(['lose_weight', 'gain_muscle', 'maintain', 'improve_endurance', 'general_fitness'])
      .optional(),
    activityLevel: z
      .enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'])
      .optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    availableEquipment: z.array(z.string()).optional(),
    workoutDaysPerWeek: z.number().int().min(0).max(7).optional(),
  })
  .strict(); // Reject unknown fields

/**
 * TypeScript type for Profile Update
 */
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

/**
 * Transform Prisma UserProfile to ProfileResponseDTO
 *
 * Ensures consistent response format
 *
 * @param profile - Prisma UserProfile model
 * @returns ProfileResponseDTO
 */
export function toProfileDTO(profile: UserProfile): ProfileResponseDTO {
  return profileResponseSchema.parse({
    id: profile.id,
    userId: profile.userId,
    age: profile.age,
    gender: profile.gender,
    height: profile.height,
    currentWeight: profile.currentWeight,
    targetWeight: profile.targetWeight,
    primaryGoal: profile.primaryGoal,
    activityLevel: profile.activityLevel,
    dietaryRestrictions: profile.dietaryRestrictions,
    availableEquipment: profile.availableEquipment,
    workoutDaysPerWeek: profile.workoutDaysPerWeek,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  });
}

/**
 * Example Profile Response:
 *
 * {
 *   "id": "123e4567-e89b-12d3-a456-426614174000",
 *   "userId": "123e4567-e89b-12d3-a456-426614174001",
 *   "age": 28,
 *   "gender": "male",
 *   "height": 180,
 *   "currentWeight": 85,
 *   "targetWeight": 80,
 *   "primaryGoal": "lose_weight",
 *   "activityLevel": "moderately_active",
 *   "dietaryRestrictions": ["vegetarian", "gluten_free"],
 *   "availableEquipment": ["dumbbells", "resistance_bands"],
 *   "workoutDaysPerWeek": 4,
 *   "createdAt": "2024-01-01T00:00:00.000Z",
 *   "updatedAt": "2024-01-01T00:00:00.000Z"
 * }
 */

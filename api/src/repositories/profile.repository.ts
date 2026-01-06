import { prisma } from '../lib/prisma';
import { createChildLogger } from '../utils/logger';

const repoLogger = createChildLogger({ module: 'repository', service: 'ProfileRepository' });

/**
 * Profile Repository
 * 
 * Handles all database operations for UserProfile model
 * Separates data access from business logic
 */

/**
 * Find a profile by user ID
 * 
 * @param userId - User's ID
 * @returns UserProfile or null if not found
 */
export async function findProfileByUserId(userId: string) {
  repoLogger.debug(`Finding profile for user: ${userId}`);
  return prisma.userProfile.findUnique({
    where: { userId },
  });
}

/**
 * Create a new profile for a user
 * 
 * @param userId - User's ID
 * @param data - Profile data
 * @returns Created UserProfile
 */
export async function createProfile(
  userId: string,
  data: {
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    primaryGoal?: string | null;
    activityLevel?: string | null;
    dietaryRestrictions?: string[];
    availableEquipment?: string[];
    workoutDaysPerWeek?: number | null;
  }
) {
  repoLogger.debug(`Creating profile for user: ${userId}`);
  return prisma.userProfile.create({
    data: {
      userId,
      age: data.age,
      gender: data.gender,
      height: data.height,
      currentWeight: data.currentWeight,
      targetWeight: data.targetWeight,
      primaryGoal: data.primaryGoal,
      activityLevel: data.activityLevel,
      dietaryRestrictions: data.dietaryRestrictions || [],
      availableEquipment: data.availableEquipment || [],
      workoutDaysPerWeek: data.workoutDaysPerWeek,
    },
  });
}

/**
 * Update a user's profile
 * 
 * @param userId - User's ID
 * @param data - Profile data to update
 * @returns Updated UserProfile
 */
export async function updateProfile(
  userId: string,
  data: {
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    primaryGoal?: string | null;
    activityLevel?: string | null;
    dietaryRestrictions?: string[];
    availableEquipment?: string[];
    workoutDaysPerWeek?: number | null;
  }
) {
  repoLogger.debug(`Updating profile for user: ${userId}`);
  return prisma.userProfile.update({
    where: { userId },
    data,
  });
}

/**
 * Delete a user's profile
 * 
 * @param userId - User's ID
 * @returns Deleted UserProfile
 */
export async function deleteProfile(userId: string) {
  repoLogger.debug(`Deleting profile for user: ${userId}`);
  return prisma.userProfile.delete({
    where: { userId },
  });
}

/**
 * Create or update a user's profile (upsert)
 * 
 * If profile exists, update it. If not, create it.
 * 
 * @param userId - User's ID
 * @param data - Profile data
 * @returns UserProfile (created or updated)
 */
export async function upsertProfile(
  userId: string,
  data: {
    age?: number | null;
    gender?: string | null;
    height?: number | null;
    currentWeight?: number | null;
    targetWeight?: number | null;
    primaryGoal?: string | null;
    activityLevel?: string | null;
    dietaryRestrictions?: string[];
    availableEquipment?: string[];
    workoutDaysPerWeek?: number | null;
  }
) {
  repoLogger.debug(`Upserting profile for user: ${userId}`);
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
      dietaryRestrictions: data.dietaryRestrictions || [],
      availableEquipment: data.availableEquipment || [],
    },
  });
}



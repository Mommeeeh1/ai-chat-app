import { createChildLogger } from '../utils/logger';
import * as profileRepository from '../repositories/profile.repository';
import { ProfileNotFoundError } from '../utils/errors';
import { validateNumberRange } from '../utils/validators';
import { ProfileResponseDTO, toProfileDTO, UpdateProfileDTO } from '../dtos/profile.dto';

const profileLogger = createChildLogger({ module: 'profile', service: 'ProfileService' });

/**
 * Profile Service
 * 
 * Business logic for user profile operations
 * - Get user profile
 * - Create/update profile
 * - Validate profile data
 */

/**
 * Get a user's profile
 * 
 * @param userId - User's ID
 * @returns ProfileResponseDTO
 * @throws AppError if profile not found
 */
export async function getProfile(userId: string): Promise<ProfileResponseDTO> {
  profileLogger.info(`Getting profile for user: ${userId}`);

  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    profileLogger.warn(`Profile not found for user: ${userId}`);
    throw new ProfileNotFoundError();
  }

  profileLogger.info(`Profile retrieved successfully for user: ${userId}`);
  return toProfileDTO(profile);
}

/**
 * Create or update a user's profile
 * 
 * Uses upsert - creates if doesn't exist, updates if exists
 * 
 * @param userId - User's ID
 * @param data - Profile data to create/update
 * @returns ProfileResponseDTO
 */
export async function upsertProfile(
  userId: string,
  data: UpdateProfileDTO
): Promise<ProfileResponseDTO> {
  profileLogger.info(`Upserting profile for user: ${userId}`);

  // Validate data (additional business logic)
  if (data.targetWeight && data.currentWeight) {
    if (data.targetWeight === data.currentWeight) {
      profileLogger.warn(`Target weight same as current weight for user: ${userId}`);
      // This is just a warning, not an error
    }
  }

  // Validate age
  if (data.age !== undefined && data.age !== null) {
    try {
      validateNumberRange(data.age, 13, 120, 'Age');
    } catch (error) {
      profileLogger.warn(`Invalid age for user: ${userId}`);
      throw error;
    }
  }

  // Validate height
  if (data.height !== undefined && data.height !== null) {
    try {
      validateNumberRange(data.height, 50, 300, 'Height');
    } catch (error) {
      profileLogger.warn(`Invalid height for user: ${userId}`);
      throw error;
    }
  }

  // Validate current weight
  if (data.currentWeight !== undefined && data.currentWeight !== null) {
    try {
      validateNumberRange(data.currentWeight, 20, 500, 'Current weight');
    } catch (error) {
      profileLogger.warn(`Invalid current weight for user: ${userId}`);
      throw error;
    }
  }

  // Validate target weight
  if (data.targetWeight !== undefined && data.targetWeight !== null) {
    try {
      validateNumberRange(data.targetWeight, 20, 500, 'Target weight');
    } catch (error) {
      profileLogger.warn(`Invalid target weight for user: ${userId}`);
      throw error;
    }
  }

  const profile = await profileRepository.upsertProfile(userId, data);

  profileLogger.info(`Profile upserted successfully for user: ${userId}`);
  return toProfileDTO(profile);
}

/**
 * Delete a user's profile
 * 
 * @param userId - User's ID
 */
export async function deleteProfile(userId: string): Promise<void> {
  profileLogger.info(`Deleting profile for user: ${userId}`);

  const profile = await profileRepository.findProfileByUserId(userId);

  if (!profile) {
    profileLogger.warn(`Profile not found for user: ${userId}`);
    throw new ProfileNotFoundError();
  }

  await profileRepository.deleteProfile(userId);

  profileLogger.info(`Profile deleted successfully for user: ${userId}`);
}

/**
 * Check if a user has a profile
 * 
 * @param userId - User's ID
 * @returns boolean
 */
export async function hasProfile(userId: string): Promise<boolean> {
  profileLogger.debug(`Checking if user has profile: ${userId}`);
  const profile = await profileRepository.findProfileByUserId(userId);
  return profile !== null;
}



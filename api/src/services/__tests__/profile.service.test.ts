/**
 * Profile Service Tests
 * 
 * Testing the profile service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getProfile, upsertProfile, deleteProfile, hasProfile } from '../profile.service';
import { ProfileNotFoundError, ValidationError } from '../../utils/errors';

// Mock the profile repository
jest.mock('../../repositories/profile.repository');
import * as profileRepository from '../../repositories/profile.repository';

/**
 * Testing Get Profile Function
 */
describe('ProfileService - Get Profile', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return profile successfully when profile exists', async () => {
    // Given: We have a userId
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    // And: The repository returns a profile
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440011',
      userId: userId,
      age: 28,
      gender: 'male',
      height: 180,
      currentWeight: 85,
      targetWeight: 80,
      primaryGoal: 'lose_weight',
      activityLevel: 'moderately_active',
      dietaryRestrictions: ['vegetarian'],
      availableEquipment: ['dumbbells'],
      workoutDaysPerWeek: 4,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
    
    // When: We get the profile
    const result = await getProfile(userId);
    
    // Then: The profile should be returned
    expect(result).toBeDefined();
    expect(result.age).toBe(28);
    expect(result.gender).toBe('male');
    expect(result.height).toBe(180);
    expect(result.currentWeight).toBe(85);
    expect(result.targetWeight).toBe(80);
    
    // And: The repository should have been called once
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
    expect(mockFindProfileByUserId).toHaveBeenCalledWith(userId);
  });
  
  it('should throw ProfileNotFoundError when profile does not exist', async () => {
    // Given: We have a userId
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    
    // And: The repository returns null (profile not found)
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue(null);
    
    // When/Then: Getting the profile should throw ProfileNotFoundError
    await expect(getProfile(userId)).rejects.toThrow(ProfileNotFoundError);
    
    // And: The repository should have been called
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
  });
});

/**
 * Testing Upsert Profile Function
 */
describe('ProfileService - Upsert Profile', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create/update profile with valid data', async () => {
    // Given: We have valid profile data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      gender: 'female' as const,
      height: 165,
      currentWeight: 60,
      targetWeight: 55,
      primaryGoal: 'lose_weight' as const,
      activityLevel: 'lightly_active' as const,
      dietaryRestrictions: ['gluten_free'],
      availableEquipment: ['resistance_bands'],
      workoutDaysPerWeek: 3,
    };
    
    // And: The repository returns the upserted profile
    const mockUpsertProfile = profileRepository.upsertProfile as jest.MockedFunction<typeof profileRepository.upsertProfile>;
    mockUpsertProfile.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440011',
      userId: userId,
      ...profileData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // When: We upsert the profile
    const result = await upsertProfile(userId, profileData);
    
    // Then: The profile should be returned
    expect(result).toBeDefined();
    expect(result.age).toBe(25);
    expect(result.gender).toBe('female');
    expect(result.height).toBe(165);
    
    // And: The repository should have been called
    expect(mockUpsertProfile).toHaveBeenCalledTimes(1);
    expect(mockUpsertProfile).toHaveBeenCalledWith(userId, profileData);
  });
  
  it('should throw ValidationError for invalid age (too young)', async () => {
    // Given: We have profile data with invalid age
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 10, // Too young (must be 13+)
      height: 165,
      currentWeight: 60,
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid age (too old)', async () => {
    // Given: We have profile data with invalid age
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 150, // Too old (max 120)
      height: 165,
      currentWeight: 60,
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid height (too short)', async () => {
    // Given: We have profile data with invalid height
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 40, // Too short (min 50cm)
      currentWeight: 60,
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid height (too tall)', async () => {
    // Given: We have profile data with invalid height
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 350, // Too tall (max 300cm)
      currentWeight: 60,
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid current weight (too low)', async () => {
    // Given: We have profile data with invalid weight
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 165,
      currentWeight: 15, // Too low (min 20kg)
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid current weight (too high)', async () => {
    // Given: We have profile data with invalid weight
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 165,
      currentWeight: 550, // Too high (max 500kg)
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should throw ValidationError for invalid target weight', async () => {
    // Given: We have profile data with invalid target weight
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 165,
      currentWeight: 60,
      targetWeight: 10, // Too low (min 20kg)
    };
    
    // When/Then: Upserting should throw ValidationError
    await expect(upsertProfile(userId, profileData)).rejects.toThrow(ValidationError);
  });
  
  it('should accept profile with same current and target weight', async () => {
    // Given: We have profile data where target equals current weight
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const profileData = {
      age: 25,
      height: 165,
      currentWeight: 60,
      targetWeight: 60, // Same as current - should be allowed
    };
    
    // And: The repository returns the profile
    const mockUpsertProfile = profileRepository.upsertProfile as jest.MockedFunction<typeof profileRepository.upsertProfile>;
    mockUpsertProfile.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440011',
      userId: userId,
      age: 25,
      gender: 'female',
      height: 165,
      currentWeight: 60,
      targetWeight: 60,
      primaryGoal: 'maintain',
      activityLevel: 'moderately_active',
      dietaryRestrictions: [],
      availableEquipment: [],
      workoutDaysPerWeek: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // When: We upsert the profile
    const result = await upsertProfile(userId, profileData);
    
    // Then: It should succeed (no error)
    expect(result).toBeDefined();
    expect(result.currentWeight).toBe(60);
    expect(result.targetWeight).toBe(60);
  });
});

/**
 * Testing Delete Profile Function
 */
describe('ProfileService - Delete Profile', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should delete profile successfully when profile exists', async () => {
    // Given: We have a userId with an existing profile
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    // And: The repository returns the profile
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440011',
      userId: userId,
      age: 28,
      gender: 'male',
      height: 180,
      currentWeight: 85,
      targetWeight: 80,
      primaryGoal: 'lose_weight',
      activityLevel: 'moderately_active',
      dietaryRestrictions: [],
      availableEquipment: [],
      workoutDaysPerWeek: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // And: The delete function is mocked
    const mockDeleteProfile = profileRepository.deleteProfile as jest.MockedFunction<typeof profileRepository.deleteProfile>;
    mockDeleteProfile.mockResolvedValue({} as any);
    
    // When: We delete the profile
    await deleteProfile(userId);
    
    // Then: Both functions should have been called
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
    expect(mockDeleteProfile).toHaveBeenCalledTimes(1);
    expect(mockDeleteProfile).toHaveBeenCalledWith(userId);
  });
  
  it('should throw ProfileNotFoundError when profile does not exist', async () => {
    // Given: We have a userId with no profile
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    
    // And: The repository returns null
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue(null);
    
    // When/Then: Deleting should throw ProfileNotFoundError
    await expect(deleteProfile(userId)).rejects.toThrow(ProfileNotFoundError);
    
    // And: The find function should have been called
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
    
    // And: The delete function should NOT have been called
    const mockDeleteProfile = profileRepository.deleteProfile as jest.MockedFunction<typeof profileRepository.deleteProfile>;
    expect(mockDeleteProfile).not.toHaveBeenCalled();
  });
});

/**
 * Testing Has Profile Function
 */
describe('ProfileService - Has Profile', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return true when profile exists', async () => {
    // Given: We have a userId with a profile
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    
    // And: The repository returns a profile
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440011',
      userId: userId,
      age: 28,
      gender: 'male',
      height: 180,
      currentWeight: 85,
      targetWeight: 80,
      primaryGoal: 'lose_weight',
      activityLevel: 'moderately_active',
      dietaryRestrictions: [],
      availableEquipment: [],
      workoutDaysPerWeek: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // When: We check if user has a profile
    const result = await hasProfile(userId);
    
    // Then: It should return true
    expect(result).toBe(true);
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
  });
  
  it('should return false when profile does not exist', async () => {
    // Given: We have a userId with no profile
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    
    // And: The repository returns null
    const mockFindProfileByUserId = profileRepository.findProfileByUserId as jest.MockedFunction<typeof profileRepository.findProfileByUserId>;
    mockFindProfileByUserId.mockResolvedValue(null);
    
    // When: We check if user has a profile
    const result = await hasProfile(userId);
    
    // Then: It should return false
    expect(result).toBe(false);
    expect(mockFindProfileByUserId).toHaveBeenCalledTimes(1);
  });
});


/**
 * Progress Service Tests
 *
 * Testing the progress tracking service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Prisma BEFORE importing the service
const mockCreate = jest.fn();
const mockFindMany = jest.fn();
const mockFindFirst = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

jest.mock('../../lib/prisma', () => ({
  prisma: {
    progress: {
      create: mockCreate,
      findMany: mockFindMany,
      findFirst: mockFindFirst,
      update: mockUpdate,
      delete: mockDelete,
    },
  },
}));

// NOW import the service (after mocking)
import { progressService } from '../progress.service';

/**
 * Testing Create Progress Entry
 */
describe('ProgressService - Create Progress Entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a progress entry with all fields', async () => {
    // Given: We have progress data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressData = {
      weight: 75.5,
      measurements: { chest: 95, waist: 80, hips: 95 },
      notes: 'Feeling great today!',
      mood: 'good',
      photoUrl: 'https://example.com/photo.jpg',
      date: new Date('2024-01-15'),
    };

    // And: Prisma creates the entry
    const mockProgress = {
      id: 'progress-1',
      userId: userId,
      weight: 75.5,
      measurements: JSON.stringify(progressData.measurements),
      notes: 'Feeling great today!',
      mood: 'good',
      photoUrl: 'https://example.com/photo.jpg',
      date: new Date('2024-01-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockCreate as any).mockResolvedValue(mockProgress);

    // When: We create the progress entry
    const result = await progressService.createProgress(userId, progressData);

    // Then: The entry should be created
    expect(result).toBeDefined();
    expect(result.weight).toBe(75.5);
    expect(result.mood).toBe('good');
    expect(result.notes).toBe('Feeling great today!');

    // And: Prisma create should have been called
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        userId: userId,
        weight: 75.5,
        measurements: JSON.stringify(progressData.measurements),
        notes: 'Feeling great today!',
        mood: 'good',
        photoUrl: 'https://example.com/photo.jpg',
        date: new Date('2024-01-15'),
      },
    });
  });

  it('should create progress entry with minimal fields', async () => {
    // Given: We have minimal progress data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressData = {
      weight: 80,
    };

    const mockProgress = {
      id: 'progress-2',
      userId: userId,
      weight: 80,
      measurements: null,
      notes: null,
      mood: null,
      photoUrl: null,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockCreate as any).mockResolvedValue(mockProgress);

    // When: We create the progress entry
    const result = await progressService.createProgress(userId, progressData);

    // Then: The entry should be created with defaults
    expect(result).toBeDefined();
    expect(result.weight).toBe(80);
    expect(result.measurements).toBeNull();
    expect(result.notes).toBeNull();
  });
});

/**
 * Testing Get User Progress
 */
describe('ProgressService - Get User Progress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all progress entries for user', async () => {
    // Given: We have a userId
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    // And: The user has progress entries
    const mockEntries = [
      {
        id: 'progress-1',
        userId: userId,
        weight: 75.5,
        measurements: JSON.stringify({ chest: 95, waist: 80 }),
        notes: 'Good progress',
        mood: 'good',
        photoUrl: null,
        date: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'progress-2',
        userId: userId,
        weight: 76,
        measurements: null,
        notes: null,
        mood: 'okay',
        photoUrl: null,
        date: new Date('2024-01-08'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockFindMany as any).mockResolvedValue(mockEntries);

    // When: We get user progress
    const result = await progressService.getUserProgress(userId);

    // Then: Entries should be returned with parsed measurements
    expect(result).toHaveLength(2);
    expect(result[0]!.weight).toBe(75.5);
    expect(result[0]!.measurements).toEqual({ chest: 95, waist: 80 });
    expect(result[1]!.measurements).toBeNull();

    // And: Prisma should be called
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { date: 'desc' },
      take: undefined,
    });
  });

  it('should limit progress entries when limit is provided', async () => {
    // Given: We want limited entries
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    (mockFindMany as any).mockResolvedValue([]);

    // When: We get user progress with limit
    await progressService.getUserProgress(userId, 10);

    // Then: Prisma should be called with limit
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });
  });
});

/**
 * Testing Get Progress By Date Range
 */
describe('ProgressService - Get Progress By Date Range', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return progress entries within date range', async () => {
    // Given: We have a date range
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');

    // And: We have entries in that range
    const mockEntries = [
      {
        id: 'progress-1',
        userId: userId,
        weight: 75.5,
        measurements: null,
        notes: 'Entry 1',
        mood: 'good',
        photoUrl: null,
        date: new Date('2024-01-15'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockFindMany as any).mockResolvedValue(mockEntries);

    // When: We get progress by date range
    const result = await progressService.getProgressByDateRange(userId, startDate, endDate);

    // Then: Entries should be returned
    expect(result).toHaveLength(1);
    expect(result[0]!.weight).toBe(75.5);

    // And: Prisma should be called with date range filter
    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  });
});

/**
 * Testing Get Progress Stats
 */
describe('ProgressService - Get Progress Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate progress statistics', async () => {
    // Given: We have a userId with progress entries
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    const mockEntries = [
      {
        id: 'progress-1',
        date: new Date('2024-01-01'),
        weight: 80,
        notes: 'Starting weight',
        mood: 'okay',
      },
      {
        id: 'progress-2',
        date: new Date('2024-01-15'),
        weight: 78,
        notes: 'Making progress',
        mood: 'good',
      },
      {
        id: 'progress-3',
        date: new Date('2024-01-30'),
        weight: 75.5,
        notes: 'Feeling great!',
        mood: 'great',
      },
    ];

    (mockFindMany as any).mockResolvedValue(mockEntries);

    // When: We get progress stats
    const result = await progressService.getProgressStats(userId);

    // Then: Stats should be calculated correctly
    expect(result.totalEntries).toBe(3);
    expect(result.startWeight).toBe(80);
    expect(result.currentWeight).toBe(75.5);
    expect(result.weightChange).toBe(-4.5); // Lost 4.5 kg
    expect(result.latestEntry.weight).toBe(75.5);
    expect(result.recentEntries).toHaveLength(3); // All 3 entries (less than 10)
  });

  it('should handle user with no progress entries', async () => {
    // Given: We have a userId with no entries
    const userId = '550e8400-e29b-41d4-a716-446655440002';

    (mockFindMany as any).mockResolvedValue([]);

    // When: We get progress stats
    const result = await progressService.getProgressStats(userId);

    // Then: Stats should show empty state
    expect(result.totalEntries).toBe(0);
    expect(result.startWeight).toBeNull();
    expect(result.currentWeight).toBeNull();
    expect(result.weightChange).toBeNull();
    expect(result.latestEntry).toBeNull();
    expect(result.recentEntries).toHaveLength(0);
  });

  it('should limit recent entries to last 10', async () => {
    // Given: We have more than 10 entries
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    const mockEntries = Array.from({ length: 15 }, (_, i) => ({
      id: `progress-${i + 1}`,
      date: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
      weight: 80 - i * 0.5,
      notes: `Entry ${i + 1}`,
      mood: 'good',
    }));

    (mockFindMany as any).mockResolvedValue(mockEntries);

    // When: We get progress stats
    const result = await progressService.getProgressStats(userId);

    // Then: Recent entries should be limited to 10
    expect(result.totalEntries).toBe(15);
    expect(result.recentEntries).toHaveLength(10);
    // Recent entries should be last 10, reversed (Entry 15 = 80 - 14*0.5 = 73)
    expect(result.recentEntries[0]!.weight).toBe(73); // Entry 15
  });
});

/**
 * Testing Update Progress Entry
 */
describe('ProgressService - Update Progress Entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update progress entry', async () => {
    // Given: We have a progress entry to update
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressId = 'progress-1';
    const updateData = {
      weight: 74,
      notes: 'Updated notes',
      mood: 'great',
    };

    // And: The entry exists and belongs to user
    (mockFindFirst as any).mockResolvedValue({
      id: progressId,
      userId: userId,
      weight: 75.5,
    });

    const mockUpdated = {
      id: progressId,
      userId: userId,
      weight: 74,
      measurements: null,
      notes: 'Updated notes',
      mood: 'great',
      photoUrl: null,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockUpdate as any).mockResolvedValue(mockUpdated);

    // When: We update the progress entry
    const result = await progressService.updateProgress(userId, progressId, updateData);

    // Then: The entry should be updated
    expect(result.weight).toBe(74);
    expect(result.notes).toBe('Updated notes');
    expect(result.mood).toBe('great');

    // And: Prisma update should have been called
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: progressId },
      data: {
        weight: 74,
        measurements: undefined,
        notes: 'Updated notes',
        mood: 'great',
        photoUrl: undefined,
      },
    });
  });

  it('should throw error when entry not found or unauthorized', async () => {
    // Given: We have a progress entry ID that doesn't exist or doesn't belong to user
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressId = 'non-existent-progress';

    (mockFindFirst as any).mockResolvedValue(null);

    // When/Then: Updating should throw error
    await expect(
      progressService.updateProgress(userId, progressId, { weight: 75 })
    ).rejects.toThrow('Progress entry not found');

    // And: Update should not have been called
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

/**
 * Testing Delete Progress Entry
 */
describe('ProgressService - Delete Progress Entry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete progress entry', async () => {
    // Given: We have a progress entry to delete
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressId = 'progress-to-delete';

    // And: The entry exists and belongs to user
    (mockFindFirst as any).mockResolvedValue({
      id: progressId,
      userId: userId,
    });

    (mockDelete as any).mockResolvedValue({});

    // When: We delete the progress entry
    await progressService.deleteProgress(userId, progressId);

    // Then: Prisma delete should have been called
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: progressId },
    });
  });

  it('should throw error when entry not found or unauthorized', async () => {
    // Given: We have a progress entry ID that doesn't exist or doesn't belong to user
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const progressId = 'non-existent-progress';

    (mockFindFirst as any).mockResolvedValue(null);

    // When/Then: Deleting should throw error
    await expect(progressService.deleteProgress(userId, progressId)).rejects.toThrow(
      'Progress entry not found'
    );

    // And: Delete should not have been called
    expect(mockDelete).not.toHaveBeenCalled();
  });
});

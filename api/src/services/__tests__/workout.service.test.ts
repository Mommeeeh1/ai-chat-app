/**
 * Workout Service Tests
 *
 * Testing the workout service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock Prisma BEFORE importing the service
const mockWorkoutFindMany = jest.fn();
const mockWorkoutFindUnique = jest.fn();
const mockWorkoutFindFirst = jest.fn();
const mockWorkoutCreate = jest.fn();
const mockWorkoutDelete = jest.fn();
const mockWorkoutExerciseCreate = jest.fn();
const mockExerciseFindMany = jest.fn();
const mockWorkoutLogCreate = jest.fn();
const mockWorkoutLogFindMany = jest.fn();

jest.mock('../../lib/prisma', () => ({
  prisma: {
    workout: {
      findMany: mockWorkoutFindMany,
      findUnique: mockWorkoutFindUnique,
      findFirst: mockWorkoutFindFirst,
      create: mockWorkoutCreate,
      delete: mockWorkoutDelete,
    },
    workoutExercise: {
      create: mockWorkoutExerciseCreate,
    },
    exercise: {
      findMany: mockExerciseFindMany,
    },
    workoutLog: {
      create: mockWorkoutLogCreate,
      findMany: mockWorkoutLogFindMany,
    },
  },
}));

// NOW import the service (after mocking)
import { workoutService } from '../workout.service';

/**
 * Testing Get Workout Templates
 */
describe('WorkoutService - Get Workout Templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all workout templates', async () => {
    // Given: We have workout templates in the database
    const mockWorkouts = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Beginner Full Body',
        description: 'Full body workout for beginners',
        difficulty: 'beginner',
        duration: 45,
        equipment: ['dumbbells'],
        isTemplate: true,
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        WorkoutExercise: [
          {
            id: 'we-1',
            workoutId: '550e8400-e29b-41d4-a716-446655440001',
            exerciseId: 'ex-1',
            order: 1,
            sets: 3,
            reps: '10-12',
            duration: null,
            rest: 60,
            notes: null,
            Exercise: {
              id: 'ex-1',
              name: 'Push-ups',
              description: 'Classic push-ups',
              muscleGroup: 'chest',
              difficulty: 'beginner',
              equipment: 'none',
              instructions: 'Do push-ups',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      },
    ];

    (mockWorkoutFindMany as any).mockResolvedValue(mockWorkouts);

    // When: We get workout templates
    const result = await workoutService.getWorkoutTemplates();

    // Then: Templates should be returned with exercises
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Beginner Full Body');
    expect(result[0]!.exercises).toHaveLength(1);
    expect(result[0]!.exercises[0]!.name).toBe('Push-ups');
    expect(result[0]!.exercises[0]!.sets).toBe(3);

    // And: Prisma should have been called with correct parameters
    expect(mockWorkoutFindMany).toHaveBeenCalledWith({
      where: { isTemplate: true },
      include: {
        WorkoutExercise: {
          include: {
            Exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  });

  it('should filter templates by difficulty', async () => {
    // Given: We have templates
    (mockWorkoutFindMany as any).mockResolvedValue([]);

    // When: We get templates filtered by difficulty
    await workoutService.getWorkoutTemplates('intermediate');

    // Then: Prisma should be called with difficulty filter
    expect(mockWorkoutFindMany).toHaveBeenCalledWith({
      where: { isTemplate: true, difficulty: 'intermediate' },
      include: {
        WorkoutExercise: {
          include: {
            Exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  });
});

/**
 * Testing Get Workout By ID
 */
describe('WorkoutService - Get Workout By ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return workout with exercises', async () => {
    // Given: We have a workout ID
    const workoutId = '550e8400-e29b-41d4-a716-446655440001';

    // And: The workout exists
    const mockWorkout = {
      id: workoutId,
      name: 'My Workout',
      description: 'Test workout',
      difficulty: 'intermediate',
      duration: 60,
      equipment: ['dumbbells', 'barbell'],
      isTemplate: false,
      createdBy: 'user-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      WorkoutExercise: [
        {
          id: 'we-1',
          workoutId: workoutId,
          exerciseId: 'ex-1',
          order: 1,
          sets: 4,
          reps: '8-10',
          duration: null,
          rest: 90,
          notes: 'Heavy weight',
          Exercise: {
            id: 'ex-1',
            name: 'Bench Press',
            description: 'Barbell bench press',
            muscleGroup: 'chest',
            difficulty: 'intermediate',
            equipment: 'barbell',
            instructions: 'Press the barbell',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    };

    (mockWorkoutFindUnique as any).mockResolvedValue(mockWorkout);

    // When: We get the workout by ID
    const result = await workoutService.getWorkoutById(workoutId);

    // Then: The workout should be returned with exercises
    expect(result).toBeDefined();
    expect(result.id).toBe(workoutId);
    expect(result.name).toBe('My Workout');
    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0]!.name).toBe('Bench Press');
    expect(result.exercises[0]!.sets).toBe(4);
    expect(result.exercises[0]!.notes).toBe('Heavy weight');
  });

  it('should throw error when workout not found', async () => {
    // Given: We have a workout ID that doesn't exist
    const workoutId = '550e8400-e29b-41d4-a716-446655440999';

    // And: Prisma returns null
    (mockWorkoutFindUnique as any).mockResolvedValue(null);

    // When/Then: Getting the workout should throw error
    await expect(workoutService.getWorkoutById(workoutId)).rejects.toThrow('Workout not found');
  });
});

/**
 * Testing Get User Workouts
 */
describe('WorkoutService - Get User Workouts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user's custom workouts", async () => {
    // Given: We have a userId
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    // And: The user has custom workouts
    const mockWorkouts = [
      {
        id: 'workout-1',
        name: 'My Custom Workout',
        description: 'Custom plan',
        difficulty: 'intermediate',
        duration: 45,
        equipment: ['dumbbells'],
        isTemplate: false,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        WorkoutExercise: [],
      },
    ];

    (mockWorkoutFindMany as any).mockResolvedValue(mockWorkouts);

    // When: We get user workouts
    const result = await workoutService.getUserWorkouts(userId);

    // Then: Workouts should be returned
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('My Custom Workout');

    // And: Prisma should be called with correct filters
    expect(mockWorkoutFindMany).toHaveBeenCalledWith({
      where: {
        createdBy: userId,
        isTemplate: false,
      },
      include: {
        WorkoutExercise: {
          include: {
            Exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});

/**
 * Testing Create Workout
 */
describe('WorkoutService - Create Workout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create workout with exercises', async () => {
    // Given: We have workout data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const workoutData = {
      name: 'New Workout',
      description: 'Test workout',
      difficulty: 'beginner',
      duration: 30,
      equipment: ['dumbbells'],
      exercises: [
        {
          exerciseId: 'ex-1',
          order: 1,
          sets: 3,
          reps: '12',
          rest: 60,
        },
      ],
    };

    // And: Prisma creates the workout
    const mockCreatedWorkout = {
      id: 'new-workout-id',
      name: workoutData.name,
      description: workoutData.description,
      difficulty: workoutData.difficulty,
      duration: workoutData.duration,
      equipment: workoutData.equipment,
      isTemplate: false,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (mockWorkoutCreate as any).mockResolvedValue(mockCreatedWorkout);
    (mockWorkoutExerciseCreate as any).mockResolvedValue({});

    // Mock getWorkoutById
    (mockWorkoutFindUnique as any).mockResolvedValue({
      ...mockCreatedWorkout,
      WorkoutExercise: [
        {
          id: 'we-1',
          workoutId: 'new-workout-id',
          exerciseId: 'ex-1',
          order: 1,
          sets: 3,
          reps: '12',
          duration: null,
          rest: 60,
          notes: null,
          Exercise: {
            id: 'ex-1',
            name: 'Squats',
            description: 'Bodyweight squats',
            muscleGroup: 'legs',
            difficulty: 'beginner',
            equipment: 'none',
            instructions: 'Do squats',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ],
    });

    // When: We create the workout
    const result = await workoutService.createWorkout(userId, workoutData);

    // Then: The workout should be created
    expect(result).toBeDefined();
    expect(result.name).toBe('New Workout');
    expect(result.exercises).toHaveLength(1);

    // And: Prisma create should have been called
    expect(mockWorkoutCreate).toHaveBeenCalledTimes(1);
    expect(mockWorkoutExerciseCreate).toHaveBeenCalledTimes(1);
  });
});

/**
 * Testing Delete Workout
 */
describe('WorkoutService - Delete Workout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete user's workout", async () => {
    // Given: We have a workout to delete
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const workoutId = 'workout-to-delete';

    // And: The workout exists and belongs to user
    (mockWorkoutFindFirst as any).mockResolvedValue({
      id: workoutId,
      name: 'Workout to delete',
      createdBy: userId,
      isTemplate: false,
    });

    (mockWorkoutDelete as any).mockResolvedValue({});

    // When: We delete the workout
    await workoutService.deleteWorkout(userId, workoutId);

    // Then: Prisma delete should have been called
    expect(mockWorkoutDelete).toHaveBeenCalledWith({
      where: { id: workoutId },
    });
  });

  it('should throw error when workout not found or unauthorized', async () => {
    // Given: We have a workout ID
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const workoutId = 'non-existent-workout';

    // And: The workout doesn't exist or doesn't belong to user
    (mockWorkoutFindFirst as any).mockResolvedValue(null);

    // When/Then: Deleting should throw error
    await expect(workoutService.deleteWorkout(userId, workoutId)).rejects.toThrow(
      'Workout not found or unauthorized'
    );

    // And: Delete should not have been called
    expect(mockWorkoutDelete).not.toHaveBeenCalled();
  });
});

/**
 * Testing Get Exercises
 */
describe('WorkoutService - Get Exercises', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all exercises', async () => {
    // Given: We have exercises in the database
    const mockExercises = [
      {
        id: 'ex-1',
        name: 'Push-ups',
        description: 'Classic push-ups',
        muscleGroup: 'chest',
        difficulty: 'beginner',
        equipment: 'none',
        instructions: 'Do push-ups',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (mockExerciseFindMany as any).mockResolvedValue(mockExercises);

    // When: We get exercises
    const result = await workoutService.getExercises();

    // Then: Exercises should be returned
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Push-ups');

    // And: Prisma should be called
    expect(mockExerciseFindMany).toHaveBeenCalled();
  });

  it('should filter exercises by muscle group and difficulty', async () => {
    // Given: We want filtered exercises
    (mockExerciseFindMany as any).mockResolvedValue([]);

    // When: We get exercises with filters
    await workoutService.getExercises('chest', 'beginner');

    // Then: Prisma should be called with filters
    expect(mockExerciseFindMany).toHaveBeenCalledWith({
      where: { muscleGroup: 'chest', difficulty: 'beginner' },
      orderBy: { name: 'asc' },
    });
  });
});

/**
 * Testing Log Workout
 */
describe('WorkoutService - Log Workout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log a completed workout', async () => {
    // Given: We have workout log data
    const userId = '550e8400-e29b-41d4-a716-446655440001';
    const logData = {
      workoutId: 'workout-1',
      name: 'Morning Workout',
      duration: 45,
      exercises: [{ name: 'Squats', sets: 3, reps: 10 }],
      notes: 'Felt great!',
    };

    // And: Prisma creates the log
    const mockLog = {
      id: 'log-1',
      userId: userId,
      workoutId: 'workout-1',
      name: 'Morning Workout',
      date: new Date(),
      duration: 45,
      exercises: JSON.stringify(logData.exercises),
      notes: 'Felt great!',
      completed: true,
      createdAt: new Date(),
    };

    (mockWorkoutLogCreate as any).mockResolvedValue(mockLog);

    // When: We log the workout
    const result = await workoutService.logWorkout(userId, logData);

    // Then: The log should be created
    expect(result).toBeDefined();
    expect(result.name).toBe('Morning Workout');
    expect(result.completed).toBe(true);

    // And: Prisma create should have been called
    expect(mockWorkoutLogCreate).toHaveBeenCalledTimes(1);
  });
});

/**
 * Testing Get Workout History
 */
describe('WorkoutService - Get Workout History', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return workout history for user', async () => {
    // Given: We have a userId
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    // And: The user has workout logs
    const mockLogs = [
      {
        id: 'log-1',
        userId: userId,
        workoutId: 'workout-1',
        name: 'Morning Workout',
        date: new Date(),
        duration: 45,
        exercises: JSON.stringify([{ name: 'Squats', sets: 3 }]),
        notes: 'Good session',
        completed: true,
        createdAt: new Date(),
        Workout: {
          name: 'Full Body',
          description: 'Full body workout',
          difficulty: 'intermediate',
        },
      },
    ];

    (mockWorkoutLogFindMany as any).mockResolvedValue(mockLogs);

    // When: We get workout history
    const result = await workoutService.getWorkoutHistory(userId);

    // Then: History should be returned with parsed exercises
    expect(result).toHaveLength(1);
    expect(result[0]!.name).toBe('Morning Workout');
    expect(result[0]!.exercises).toEqual([{ name: 'Squats', sets: 3 }]);

    // And: Prisma should be called
    expect(mockWorkoutLogFindMany).toHaveBeenCalled();
  });
});

/**
 * Testing Get Workout Stats
 */
describe('WorkoutService - Get Workout Stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate workout statistics', async () => {
    // Given: We have a userId with workout logs
    const userId = '550e8400-e29b-41d4-a716-446655440001';

    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const mockLogs = [
      {
        id: 'log-1',
        date: new Date(currentWeekStart.getTime() + 1000), // This week
        duration: 45,
      },
      {
        id: 'log-2',
        date: new Date(currentWeekStart.getTime() + 2000), // This week
        duration: 60,
      },
    ];

    (mockWorkoutLogFindMany as any).mockResolvedValue(mockLogs);

    // When: We get workout stats
    const result = await workoutService.getWorkoutStats(userId);

    // Then: Stats should be calculated
    expect(result.totalWorkouts).toBe(2);
    expect(result.totalMinutes).toBe(105);
    expect(result.totalHours).toBe(2);
    expect(result.currentWeekWorkouts).toBe(2);
  });
});

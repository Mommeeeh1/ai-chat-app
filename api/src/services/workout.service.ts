import { prisma } from '../lib/prisma';

export interface CreateWorkoutData {
  name: string;
  description?: string;
  difficulty: string;
  duration?: number;
  equipment: string[];
  exercises: {
    exerciseId: string;
    order: number;
    sets?: number;
    reps?: string;
    duration?: number;
    rest?: number;
    notes?: string;
  }[];
}

export interface LogWorkoutData {
  workoutId?: string;
  name: string;
  date?: Date;
  duration?: number;
  exercises: any[];
  notes?: string;
}

export const workoutService = {
  /**
   * Get all workout templates (system templates)
   */
  async getWorkoutTemplates(difficulty?: string) {
    const where: any = { isTemplate: true };
    if (difficulty) {
      where.difficulty = difficulty;
    }

    const workouts = await prisma.workout.findMany({
      where,
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

    return workouts.map((workout) => ({
      ...workout,
      exercises: workout.WorkoutExercise.map((we) => ({
        ...we.Exercise,
        sets: we.sets,
        reps: we.reps,
        duration: we.duration,
        rest: we.rest,
        notes: we.notes,
        order: we.order,
      })),
      WorkoutExercise: undefined,
    }));
  },

  /**
   * Get a specific workout by ID with exercises
   */
  async getWorkoutById(workoutId: string) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        WorkoutExercise: {
          include: {
            Exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workout) {
      throw new Error('Workout not found');
    }

    return {
      ...workout,
      exercises: workout.WorkoutExercise.map((we) => ({
        ...we.Exercise,
        sets: we.sets,
        reps: we.reps,
        duration: we.duration,
        rest: we.rest,
        notes: we.notes,
        order: we.order,
      })),
      WorkoutExercise: undefined,
    };
  },

  /**
   * Get user's custom workouts
   */
  async getUserWorkouts(userId: string) {
    const workouts = await prisma.workout.findMany({
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

    return workouts.map((workout) => ({
      ...workout,
      exercises: workout.WorkoutExercise.map((we) => ({
        ...we.Exercise,
        sets: we.sets,
        reps: we.reps,
        duration: we.duration,
        rest: we.rest,
        notes: we.notes,
        order: we.order,
      })),
      WorkoutExercise: undefined,
    }));
  },

  /**
   * Create a custom workout
   */
  async createWorkout(userId: string, data: CreateWorkoutData) {
    const workout = await prisma.workout.create({
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty,
        duration: data.duration,
        equipment: data.equipment,
        isTemplate: false,
        createdBy: userId,
      },
    });

    // Add exercises
    if (data.exercises && data.exercises.length > 0) {
      await Promise.all(
        data.exercises.map((exercise) =>
          prisma.workoutExercise.create({
            data: {
              workoutId: workout.id,
              exerciseId: exercise.exerciseId,
              order: exercise.order,
              sets: exercise.sets,
              reps: exercise.reps,
              duration: exercise.duration,
              rest: exercise.rest,
              notes: exercise.notes,
            },
          })
        )
      );
    }

    return this.getWorkoutById(workout.id);
  },

  /**
   * Delete a custom workout
   */
  async deleteWorkout(userId: string, workoutId: string) {
    // Verify ownership
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        createdBy: userId,
        isTemplate: false,
      },
    });

    if (!workout) {
      throw new Error('Workout not found or unauthorized');
    }

    return prisma.workout.delete({
      where: { id: workoutId },
    });
  },

  /**
   * Get all exercises
   */
  async getExercises(muscleGroup?: string, difficulty?: string) {
    const where: any = {};
    if (muscleGroup) where.muscleGroup = muscleGroup;
    if (difficulty) where.difficulty = difficulty;

    return prisma.exercise.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Log a completed workout
   */
  async logWorkout(userId: string, data: LogWorkoutData) {
    return prisma.workoutLog.create({
      data: {
        userId,
        workoutId: data.workoutId,
        name: data.name,
        date: data.date || new Date(),
        duration: data.duration,
        exercises: JSON.stringify(data.exercises),
        notes: data.notes,
        completed: true,
      },
    });
  },

  /**
   * Get workout history
   */
  async getWorkoutHistory(userId: string, limit?: number) {
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        Workout: {
          select: {
            name: true,
            description: true,
            difficulty: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      ...log,
      exercises: log.exercises ? JSON.parse(log.exercises) : [],
    }));
  },

  /**
   * Get workout statistics
   */
  async getWorkoutStats(userId: string) {
    const logs = await prisma.workoutLog.findMany({
      where: { userId },
      select: {
        id: true,
        date: true,
        duration: true,
      },
    });

    const totalWorkouts = logs.length;
    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration || 0), 0);

    // Calculate current week and last week
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(currentWeekStart);
    lastWeekStart.setDate(currentWeekStart.getDate() - 7);

    const currentWeekWorkouts = logs.filter((log) => log.date >= currentWeekStart).length;
    const lastWeekWorkouts = logs.filter(
      (log) => log.date >= lastWeekStart && log.date < currentWeekStart
    ).length;

    const firstLog = logs.length > 0 ? logs[logs.length - 1] : null;
    const firstLogDate = firstLog ? firstLog.date : now;
    const weeksSinceStart = Math.max(1, Math.ceil((now.getTime() - firstLogDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    
    return {
      totalWorkouts,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      currentWeekWorkouts,
      lastWeekWorkouts,
      averagePerWeek:
        totalWorkouts > 0
          ? Math.round((totalWorkouts / weeksSinceStart) * 10) / 10
          : 0,
    };
  },
};



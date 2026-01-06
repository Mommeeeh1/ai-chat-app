/**
 * TypeScript Type Definitions
 * 
 * Central location for all shared types across the application
 * Ensures type consistency and easy imports
 */

// ============================================
// USER & AUTH TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  name?: string;
}

// ============================================
// PROFILE TYPES
// ============================================

export type Gender = 'male' | 'female' | 'other';

export type FitnessGoal = 
  | 'lose_weight' 
  | 'gain_muscle' 
  | 'maintain' 
  | 'improve_endurance' 
  | 'general_fitness';

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extremely_active';

export interface Profile {
  id: string;
  userId: string;
  age?: number;
  gender?: Gender;
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  primaryGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietaryRestrictions?: string[];
  availableEquipment?: string[];
  workoutDaysPerWeek?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  age?: number;
  gender?: Gender;
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  primaryGoal?: FitnessGoal;
  activityLevel?: ActivityLevel;
  dietaryRestrictions?: string[];
  availableEquipment?: string[];
  workoutDaysPerWeek?: number;
}

// ============================================
// CHAT TYPES
// ============================================

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  userMessage: Message;
  aiMessage: Message;
  conversationLength: number;
}

// ============================================
// API ERROR TYPES
// ============================================

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ============================================
// PROGRESS TRACKING TYPES
// ============================================

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string;
  weight?: number;
  measurements?: Record<string, number>; // e.g., { chest: 100, waist: 80 }
  notes?: string;
  mood?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressStats {
  totalEntries: number;
  currentWeight: number | null;
  startWeight: number | null;
  weightChange: number | null;
  latestEntry: ProgressEntry | null;
  recentEntries: ProgressEntry[];
}

export interface CreateProgressData {
  weight?: number;
  measurements?: Record<string, number>;
  notes?: string;
  mood?: string;
  photoUrl?: string;
  date?: string;
}

// ============================================
// WORKOUT TYPES
// ============================================

export type WorkoutDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: MuscleGroup;
  equipment: string[];
  difficulty: WorkoutDifficulty;
  instructions: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExerciseDetail extends Exercise {
  sets?: number;
  reps?: string; // e.g., "8-12" or "10"
  duration?: number; // for time-based exercises (seconds)
  rest?: number; // rest time in seconds
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  difficulty: WorkoutDifficulty;
  duration?: number; // estimated duration in minutes
  equipment: string[];
  isTemplate: boolean;
  createdBy?: string;
  exercises: WorkoutExerciseDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkoutData {
  name: string;
  description?: string;
  difficulty: WorkoutDifficulty;
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

export interface WorkoutLog {
  id: string;
  userId: string;
  workoutId?: string;
  name: string;
  date: string;
  duration?: number;
  exercises: any[];
  notes?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  Workout?: {
    name: string;
    description?: string;
    difficulty: WorkoutDifficulty;
  };
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalHours: number;
  currentWeekWorkouts: number;
  lastWeekWorkouts: number;
  averagePerWeek: number;
}

export interface LogWorkoutData {
  workoutId?: string;
  name: string;
  date?: string;
  duration?: number;
  exercises: any[];
  notes?: string;
}


/**
 * Enumerations
 *
 * Centralized enums for the application
 */

/**
 * User Gender Options
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

/**
 * Fitness Goal Types
 */
export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
}

/**
 * Activity Level
 */
export enum ActivityLevel {
  SEDENTARY = 'sedentary', // Little or no exercise
  LIGHTLY_ACTIVE = 'lightly_active', // Exercise 1-3 days/week
  MODERATELY_ACTIVE = 'moderately_active', // Exercise 3-5 days/week
  VERY_ACTIVE = 'very_active', // Exercise 6-7 days/week
  EXTREMELY_ACTIVE = 'extremely_active', // Very intense exercise daily
}

/**
 * Workout Difficulty Levels
 */
export enum WorkoutDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Muscle Groups
 */
export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  CORE = 'core',
  GLUTES = 'glutes',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

/**
 * Exercise Types
 */
export enum ExerciseType {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  PLYOMETRIC = 'plyometric',
  COMPOUND = 'compound',
  ISOLATION = 'isolation',
}

/**
 * Workout Status
 */
export enum WorkoutStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

/**
 * Message Roles (for AI chat)
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * Progress Metric Types
 */
export enum ProgressMetric {
  WEIGHT = 'weight',
  BODY_FAT = 'body_fat',
  MUSCLE_MASS = 'muscle_mass',
  MEASUREMENTS = 'measurements',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
}

/**
 * Measurement Units
 */
export enum MeasurementUnit {
  METRIC = 'metric', // kg, cm
  IMPERIAL = 'imperial', // lbs, inches
}

/**
 * Time Units for Workout Duration
 */
export enum TimeUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
}

/**
 * Days of the Week
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Subscription Tiers (for future use)
 */
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Notification Types
 */
export enum NotificationType {
  WORKOUT_REMINDER = 'workout_reminder',
  PROGRESS_UPDATE = 'progress_update',
  ACHIEVEMENT = 'achievement',
  SYSTEM = 'system',
}

/**
 * Achievement Types
 */
export enum AchievementType {
  WORKOUT_STREAK = 'workout_streak',
  WEIGHT_MILESTONE = 'weight_milestone',
  STRENGTH_MILESTONE = 'strength_milestone',
  CONSISTENCY = 'consistency',
  PERSONAL_RECORD = 'personal_record',
}

/**
 * HTTP Status Codes (commonly used)
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Error Codes
 */
export enum ErrorCode {
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',

  // Resources
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  WORKOUT_NOT_FOUND = 'WORKOUT_NOT_FOUND',
  PROGRESS_NOT_FOUND = 'PROGRESS_NOT_FOUND',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // AI Service
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
}

/**
 * Environment Types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

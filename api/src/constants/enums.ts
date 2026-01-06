/**
 * Application-wide Enumerations
 * 
 * Centralized enums for type safety and consistency
 * Use these instead of magic strings throughout the app
 */

/**
 * User Gender Options
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/**
 * Fitness Goals
 */
export enum FitnessGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  MAINTENANCE = 'maintenance',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
}

/**
 * Activity Levels
 */
export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTRA_ACTIVE = 'extra_active',
}

/**
 * Workout Difficulty Levels
 */
export enum Difficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Mood Options for Progress Tracking
 */
export enum Mood {
  GREAT = 'great',
  GOOD = 'good',
  OKAY = 'okay',
  TIRED = 'tired',
  SORE = 'sore',
}

/**
 * Chat Message Roles
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
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
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
}

/**
 * Equipment Types
 */
export enum Equipment {
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  RESISTANCE_BANDS = 'resistance_bands',
  KETTLEBELL = 'kettlebell',
  PULL_UP_BAR = 'pull_up_bar',
  BENCH = 'bench',
  BODYWEIGHT = 'bodyweight',
  MACHINE = 'machine',
  CABLES = 'cables',
}

/**
 * Dietary Restrictions
 */
export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_ALLERGY = 'nut_allergy',
  PESCATARIAN = 'pescatarian',
  PALEO = 'paleo',
  KETO = 'keto',
}

/**
 * HTTP Status Codes
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
 * Error Codes for Custom Application Errors
 */
export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // User
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  
  // Profile
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  
  // Workout
  WORKOUT_NOT_FOUND = 'WORKOUT_NOT_FOUND',
  EXERCISE_NOT_FOUND = 'EXERCISE_NOT_FOUND',
  
  // Progress
  PROGRESS_NOT_FOUND = 'PROGRESS_NOT_FOUND',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // AI
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  
  // General
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
}

/**
 * Cookie Names
 */
export enum CookieName {
  AUTH_TOKEN = 'token',
  REFRESH_TOKEN = 'refresh_token',
}

/**
 * Environment Types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}





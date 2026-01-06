/**
 * Application Constants
 * 
 * Central location for all configuration values
 * Makes it easy to change URLs, limits, etc. in one place
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  },
  
  // Profile
  PROFILE: `${API_BASE_URL}/api/profile`,
  
  // Chat
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_HISTORY: `${API_BASE_URL}/api/chat/history`,
  
  // Progress
  PROGRESS: `${API_BASE_URL}/api/progress`,
  PROGRESS_STATS: `${API_BASE_URL}/api/progress/stats`,
  
  // Workouts
  WORKOUTS: `${API_BASE_URL}/api/workouts`,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
} as const;

// UI Constants
export const UI = {
  MAX_MESSAGE_LENGTH: 2000,
  CHAT_HISTORY_LIMIT: 50,
  SUCCESS_MESSAGE_DURATION: 3000, // ms
} as const;


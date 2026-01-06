/**
 * API Service Layer
 * 
 * Central location for all API calls
 * Handles authentication headers, error handling, and type safety
 */

import { API_ENDPOINTS } from './constants';
import type {
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  Profile,
  ProfileFormData,
  Message,
  ChatResponse,
  ProgressEntry,
  ProgressStats,
  CreateProgressData,
  Exercise,
  Workout,
  CreateWorkoutData,
  WorkoutLog,
  WorkoutStats,
  LogWorkoutData,
} from '@/types';

// ============================================
// API CLIENT CONFIGURATION
// ============================================

/**
 * Generic API request handler with error handling
 * Now uses httpOnly cookies for authentication instead of Authorization header
 */
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Important: send cookies with every request
    });
  } catch (error) {
    // Network error (no internet, server down, etc.)
    throw new Error('Unable to connect to the server. Please check your internet connection.');
  }

  // Try to parse response as JSON
  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    // Response is not JSON
    if (!response.ok) {
      throw new Error(getDefaultErrorMessage(response.status));
    }
    throw new Error('Invalid response from server');
  }

  // Check if response is an error
  if (!response.ok) {
    // Extract user-friendly error message from backend
    const errorMessage = data.error || data.message || getDefaultErrorMessage(response.status);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Get user-friendly error message based on HTTP status code
 */
function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Invalid email or password. Please try again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This resource already exists.';
    case 429:
      return 'Too many requests. Please try again in a few minutes.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  /**
   * Sign up a new user
   * Sets httpOnly cookie on success
   */
  signup: async (credentials: SignupCredentials): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Log in an existing user
   * Sets httpOnly cookie on success
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Log out current user
   * Clears httpOnly cookie
   */
  logout: async (): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  },
};

// ============================================
// PROFILE API
// ============================================

export const profileApi = {
  /**
   * Get user's profile
   * Cookie is automatically sent
   */
  get: async (): Promise<Profile> => {
    return apiRequest<Profile>(API_ENDPOINTS.PROFILE);
  },

  /**
   * Create or update user's profile
   * Cookie is automatically sent
   */
  update: async (data: ProfileFormData): Promise<Profile> => {
    return apiRequest<Profile>(API_ENDPOINTS.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete user's profile
   * Cookie is automatically sent
   */
  delete: async (): Promise<void> => {
    return apiRequest<void>(API_ENDPOINTS.PROFILE, {
      method: 'DELETE',
    });
  },
};

// ============================================
// CHAT API
// ============================================

export const chatApi = {
  /**
   * Send a message to the AI trainer
   * Cookie is automatically sent
   */
  sendMessage: async (message: string): Promise<ChatResponse> => {
    return apiRequest<ChatResponse>(API_ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  /**
   * Get chat history with pagination support
   * Cookie is automatically sent
   */
  getHistory: async (limit?: number, cursor?: string): Promise<{ messages: Message[]; nextCursor: string | null }> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (cursor) params.append('cursor', cursor);
    
    const url = params.toString()
      ? `${API_ENDPOINTS.CHAT_HISTORY}?${params.toString()}`
      : API_ENDPOINTS.CHAT_HISTORY;
    
    return apiRequest<{ messages: Message[]; nextCursor: string | null }>(url);
  },

  /**
   * Delete chat history
   * Cookie is automatically sent
   */
  deleteHistory: async (): Promise<{ message: string; deletedCount: number }> => {
    return apiRequest(API_ENDPOINTS.CHAT_HISTORY, {
      method: 'DELETE',
    });
  },
};

// ============================================
// PROGRESS API
// ============================================

export const progressApi = {
  /**
   * Create a new progress entry
   * Cookie is automatically sent
   */
  create: async (data: CreateProgressData): Promise<ProgressEntry> => {
    return apiRequest<ProgressEntry>(API_ENDPOINTS.PROGRESS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all progress entries
   * Cookie is automatically sent
   */
  getAll: async (limit?: number): Promise<ProgressEntry[]> => {
    const url = limit 
      ? `${API_ENDPOINTS.PROGRESS}?limit=${limit}`
      : API_ENDPOINTS.PROGRESS;
    
    return apiRequest<ProgressEntry[]>(url);
  },

  /**
   * Get progress statistics
   * Cookie is automatically sent
   */
  getStats: async (): Promise<ProgressStats> => {
    return apiRequest<ProgressStats>(API_ENDPOINTS.PROGRESS_STATS);
  },

  /**
   * Get progress by date range
   * Cookie is automatically sent
   */
  getByDateRange: async (
    startDate: string, 
    endDate: string
  ): Promise<ProgressEntry[]> => {
    const url = `${API_ENDPOINTS.PROGRESS}/range?startDate=${startDate}&endDate=${endDate}`;
    return apiRequest<ProgressEntry[]>(url);
  },

  /**
   * Update a progress entry
   * Cookie is automatically sent
   */
  update: async (
    id: string, 
    data: CreateProgressData
  ): Promise<ProgressEntry> => {
    return apiRequest<ProgressEntry>(`${API_ENDPOINTS.PROGRESS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a progress entry
   * Cookie is automatically sent
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${API_ENDPOINTS.PROGRESS}/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// WORKOUT API
// ============================================

export const workoutApi = {
  /**
   * Get all workout templates
   * Cookie is automatically sent
   */
  getTemplates: async (difficulty?: string): Promise<Workout[]> => {
    const url = difficulty
      ? `${API_ENDPOINTS.WORKOUTS}/templates?difficulty=${difficulty}`
      : `${API_ENDPOINTS.WORKOUTS}/templates`;
    
    return apiRequest<Workout[]>(url);
  },

  /**
   * Get user's custom workouts
   * Cookie is automatically sent
   */
  getMy: async (): Promise<Workout[]> => {
    return apiRequest<Workout[]>(`${API_ENDPOINTS.WORKOUTS}/my`);
  },

  /**
   * Get all exercises
   * Cookie is automatically sent
   */
  getExercises: async (
    muscleGroup?: string, 
    difficulty?: string
  ): Promise<Exercise[]> => {
    let url = `${API_ENDPOINTS.WORKOUTS}/exercises`;
    const params = new URLSearchParams();
    if (muscleGroup) params.append('muscleGroup', muscleGroup);
    if (difficulty) params.append('difficulty', difficulty);
    if (params.toString()) url += `?${params.toString()}`;
    
    return apiRequest<Exercise[]>(url);
  },

  /**
   * Get a specific workout by ID
   * Cookie is automatically sent
   */
  getById: async (id: string): Promise<Workout> => {
    return apiRequest<Workout>(`${API_ENDPOINTS.WORKOUTS}/${id}`);
  },

  /**
   * Create a custom workout
   * Cookie is automatically sent
   */
  create: async (data: CreateWorkoutData): Promise<Workout> => {
    return apiRequest<Workout>(API_ENDPOINTS.WORKOUTS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a custom workout
   * Cookie is automatically sent
   */
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`${API_ENDPOINTS.WORKOUTS}/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Log a completed workout
   * Cookie is automatically sent
   */
  logWorkout: async (data: LogWorkoutData): Promise<WorkoutLog> => {
    return apiRequest<WorkoutLog>(`${API_ENDPOINTS.WORKOUTS}/log`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get workout history
   * Cookie is automatically sent
   */
  getHistory: async (limit?: number): Promise<WorkoutLog[]> => {
    const url = limit
      ? `${API_ENDPOINTS.WORKOUTS}/history/all?limit=${limit}`
      : `${API_ENDPOINTS.WORKOUTS}/history/all`;
    
    return apiRequest<WorkoutLog[]>(url);
  },

  /**
   * Get workout statistics
   * Cookie is automatically sent
   */
  getStats: async (): Promise<WorkoutStats> => {
    return apiRequest<WorkoutStats>(`${API_ENDPOINTS.WORKOUTS}/stats/summary`);
  },
};


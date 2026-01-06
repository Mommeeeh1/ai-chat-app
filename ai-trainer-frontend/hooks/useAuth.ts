/**
 * useAuth Hook
 * 
 * Custom hook for authentication logic
 * Provides auth state and methods in a reusable way
 */

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Hook for checking if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user, isLoading } = useAuth();
  return !isLoading && !!user;
}

/**
 * Hook for requiring authentication
 * Throws error if not authenticated
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  
  if (!isLoading && !user) {
    throw new Error('Authentication required');
  }
  
  return { user, isLoading };
}




'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/constants';
import type { User } from '@/types';

const STORAGE_KEYS = {
  USER_DATA: 'user_data',
} as const;

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

// ============================================
// CONTEXT CREATION
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check if user is authenticated by verifying cookie
   * The httpOnly cookie is automatically sent with requests
   */
  const checkAuth = async () => {
    try {
      // Try to restore user from localStorage first (faster)
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoading(false);
        // Verify cookie is still valid in background
        verifyAuth();
      } else {
        // No stored user, verify auth with backend
        await verifyAuth();
      }
    } catch (error) {
      console.error('Failed to check auth:', error);
      setIsLoading(false);
    }
  };

  /**
   * Verify authentication with backend
   * The httpOnly cookie is automatically sent with this request
   */
  const verifyAuth = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        credentials: 'include', // Important: send cookies with request
      });

      if (response.ok) {
        const profile = await response.json();
        const userData: User = {
          id: profile.userId,
          email: profile.email || '',
          name: profile.name || '',
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      } else {
        // Not authenticated, clear stored data
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to verify auth:', error);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log in user
   * Token is now stored in httpOnly cookie by backend
   */
  const login = (userData: User) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    setUser(userData);
  };

  /**
   * Log out user
   * Calls backend to clear httpOnly cookie
   */
  const logout = async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include', // Important: send cookies with request
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}



'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

/**
 * PROTECTED ROUTE COMPONENT
 * 
 * Wraps pages that require authentication.
 * If user is not logged in, redirects to /login
 * 
 * Usage:
 * <ProtectedRoute>
 *   <YourPrivatePage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth check to complete
    if (!isLoading && !user) {
      // Not logged in - redirect to login
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // LOADING STATE - Show while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // NOT AUTHENTICATED - Don't render anything (redirecting)
  if (!user) {
    return null;
  }

  // AUTHENTICATED - Show the protected content
  return <>{children}</>;
}


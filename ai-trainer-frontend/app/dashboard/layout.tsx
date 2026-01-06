'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/contexts/auth-context';
import { chatApi, workoutApi, progressApi, profileApi } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Prefetch chat history when hovering over Chat link
  const prefetchChat = () => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ['chat-history'],
      queryFn: ({ pageParam }) => chatApi.getHistory(20, pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      pages: 1, // Only prefetch first page
    });
    
    queryClient.prefetchQuery({
      queryKey: ['user-profile'],
      queryFn: async () => {
        try {
          return await profileApi.get();
        } catch {
          return null;
        }
      },
    });
  };

  // Prefetch workouts when hovering over Workouts link
  const prefetchWorkouts = () => {
    queryClient.prefetchQuery({
      queryKey: ['workout-templates'],
      queryFn: () => workoutApi.getTemplates(),
    });
  };

  // Prefetch progress when hovering over Progress link
  const prefetchProgress = () => {
    queryClient.prefetchQuery({
      queryKey: ['progress-stats'],
      queryFn: () => progressApi.getStats(),
    });
    
    queryClient.prefetchQuery({
      queryKey: ['progress-entries'],
      queryFn: () => progressApi.getAll(30),
    });
  };

  // Prefetch profile when hovering over Profile link
  const prefetchProfile = () => {
    queryClient.prefetchQuery({
      queryKey: ['user-profile'],
      queryFn: async () => {
        try {
          return await profileApi.get();
        } catch {
          return null;
        }
      },
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Logo & Nav Links */}
              <div className="flex items-center space-x-8">
                <h2 className="text-xl font-bold text-gray-900">
                  AI Trainer
                </h2>
                
                <div className="hidden md:flex space-x-4">
                  <Link
                    href="/dashboard"
                    onMouseEnter={prefetchChat}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      pathname === '/dashboard'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    💬 Chat
                  </Link>
                  <Link
                    href="/dashboard/workouts"
                    onMouseEnter={prefetchWorkouts}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      pathname?.startsWith('/dashboard/workouts')
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    💪 Workouts
                  </Link>
                  <Link
                    href="/dashboard/progress"
                    onMouseEnter={prefetchProgress}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      pathname === '/dashboard/progress'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    📊 Progress
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onMouseEnter={prefetchProfile}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      pathname === '/dashboard/profile'
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    👤 Profile
                  </Link>
                </div>
              </div>

              {/* Right: User Info & Logout */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}


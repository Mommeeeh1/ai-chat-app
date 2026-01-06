'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '@/lib/api';
import type { Workout, WorkoutStats, WorkoutLog } from '@/types';

export default function WorkoutsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'templates' | 'my' | 'history'>('templates');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Prefetch workout details when hovering over a workout card
  const prefetchWorkoutDetails = (workoutId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['workout', workoutId],
      queryFn: () => workoutApi.getById(workoutId),
    });
  };

  // ✅ React Query: Fetch templates (only when templates tab is active)
  const { data: templates = [], isLoading: templatesLoading } = useQuery<Workout[]>({
    queryKey: ['workout-templates', difficultyFilter],
    queryFn: () => workoutApi.getTemplates(difficultyFilter || undefined),
    enabled: activeTab === 'templates', // Only fetch when tab is active!
  });

  // ✅ React Query: Fetch my workouts (only when my tab is active)
  const { data: myWorkouts = [], isLoading: myLoading } = useQuery<Workout[]>({
    queryKey: ['my-workouts'],
    queryFn: () => workoutApi.getMy(),
    enabled: activeTab === 'my', // Only fetch when tab is active!
  });

  // ✅ React Query: Fetch history (only when history tab is active)
  const { data: history = [], isLoading: historyLoading } = useQuery<WorkoutLog[]>({
    queryKey: ['workout-history'],
    queryFn: () => workoutApi.getHistory(20),
    enabled: activeTab === 'history', // Only fetch when tab is active!
  });

  // ✅ React Query: Fetch stats (only when history tab is active)
  const { data: stats } = useQuery<WorkoutStats>({
    queryKey: ['workout-stats'],
    queryFn: () => workoutApi.getStats(),
    enabled: activeTab === 'history', // Only fetch when tab is active!
  });

  // ✅ React Query: Mutation for logging workouts (with prefetching)
  const logWorkoutMutation = useMutation({
    mutationFn: (workout: Workout) =>
      workoutApi.logWorkout({
        workoutId: workout.id,
        name: workout.name,
        exercises: workout.exercises.map((e) => ({
          exerciseId: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        })),
      }),
    onSuccess: () => {
      // Invalidate history and stats to refetch latest data
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['workout-stats'] });
      
      // Prefetch progress data (user might want to check progress next)
      queryClient.prefetchQuery({
        queryKey: ['progress-stats'],
        queryFn: () => import('@/lib/api').then(m => m.progressApi.getStats()),
      });
      
      queryClient.prefetchQuery({
        queryKey: ['progress-entries'],
        queryFn: () => import('@/lib/api').then(m => m.progressApi.getAll(30)),
      });
      
      setSuccess('Workout logged successfully! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to log workout');
    },
  });

  const handleLogWorkout = (workout: Workout) => {
    setError('');
    setSuccess('');
    logWorkoutMutation.mutate(workout);
  };

  // Determine loading state based on active tab
  const isLoading =
    (activeTab === 'templates' && templatesLoading) ||
    (activeTab === 'my' && myLoading) ||
    (activeTab === 'history' && historyLoading);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
        <Link
          href="/dashboard/workouts/create"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Workout
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'templates'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Templates
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'my'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Workouts
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          History
        </button>
      </div>

      {/* Difficulty Filter (for templates) */}
      {activeTab === 'templates' && (
        <div className="mb-6">
          <label className="text-sm font-medium mr-2 text-gray-900">Filter by difficulty:</label>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 text-gray-900"
          >
            <option value="">All</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="text-xl text-gray-900">Loading...</div>
        </div>
      )}

      {/* Templates Tab */}
      {!isLoading && activeTab === 'templates' && (
        <>
          {templates.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              No templates found
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '24px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: '16px'
            }}>
              {templates.map((workout: Workout) => (
                <div key={workout.id} style={{ 
                  width: '350px',
                  minWidth: '350px',
                  flexShrink: 0
                }}>
                  <WorkoutCard
                    workout={workout}
                    onLog={() => handleLogWorkout(workout)}
                    onHover={() => prefetchWorkoutDetails(workout.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Workouts Tab */}
      {!isLoading && activeTab === 'my' && (
        <>
          {myWorkouts.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-500">
              No custom workouts yet. Create one to get started!
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row',
              gap: '24px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              paddingBottom: '16px'
            }}>
              {myWorkouts.map((workout: Workout) => (
                <div key={workout.id} style={{ 
                  width: '350px',
                  minWidth: '350px',
                  flexShrink: 0
                }}>
                  <WorkoutCard
                    workout={workout}
                    onLog={() => handleLogWorkout(workout)}
                    onHover={() => prefetchWorkoutDetails(workout.id)}
                    isCustom
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* History Tab */}
      {!isLoading && activeTab === 'history' && (
        <div>
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-700 mb-1">Total Workouts</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalWorkouts}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-700 mb-1">Total Hours</div>
                <div className="text-3xl font-bold text-gray-900">{stats.totalHours}h</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-700 mb-1">This Week</div>
                <div className="text-3xl font-bold text-gray-900">{stats.currentWeekWorkouts}</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-sm text-gray-700 mb-1">Avg / Week</div>
                <div className="text-3xl font-bold text-gray-900">{stats.averagePerWeek}</div>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Workout History</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No workout history yet. Complete your first workout!
              </p>
            ) : (
              <div className="space-y-4">
                {history.map((log: WorkoutLog) => (
                  <div key={log.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-lg text-gray-900">{log.name}</div>
                        <div className="text-sm text-gray-700">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      {log.duration && (
                        <div className="text-sm text-gray-700 font-medium">{log.duration} min</div>
                      )}
                    </div>
                    {log.notes && (
                      <div className="text-sm text-gray-800 mt-2">{log.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutCard({
  workout,
  onLog,
  onHover,
  isCustom = false,
}: {
  workout: Workout;
  onLog: () => void;
  onHover?: () => void;
  isCustom?: boolean;
}) {
  return (
    <div 
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }} 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
      onMouseEnter={onHover}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900">{workout.name}</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            workout.difficulty === 'beginner'
              ? 'bg-green-100 text-green-800'
              : workout.difficulty === 'intermediate'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {workout.difficulty}
        </span>
      </div>

      {workout.description && (
        <p className="text-gray-700 text-sm mb-4">{workout.description}</p>
      )}

      <div className="space-y-2 mb-4 text-sm text-gray-800">
        {workout.duration && (
          <div>⏱️ Duration: ~{workout.duration} min</div>
        )}
        <div>💪 Exercises: {workout.exercises.length}</div>
        {workout.equipment && workout.equipment.length > 0 && (
          <div>🏋️ Equipment: {workout.equipment.join(', ')}</div>
        )}
      </div>

      <div className="space-y-2">
        <Link
          href={`/dashboard/workouts/${workout.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          View Details
        </Link>
        <button
          onClick={onLog}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Log Workout
        </button>
      </div>
    </div>
  );
}



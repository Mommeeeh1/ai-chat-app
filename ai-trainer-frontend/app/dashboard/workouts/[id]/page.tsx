'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { workoutApi } from '@/lib/api';
import type { Workout } from '@/types';

export default function WorkoutDetailPage() {
  const { } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;
  
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logData, setLogData] = useState({
    duration: '',
    notes: '',
  });

  useEffect(() => {
    if (workoutId) {
      loadWorkout();
    }
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      setIsLoading(true);
      const data = await workoutApi.getById(workoutId);
      setWorkout(data);
    } catch (error: any) {
      console.error('Failed to load workout:', error);
      setError(error.message || 'Failed to load workout details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await workoutApi.logWorkout({
        workoutId: workout!.id,
        name: workout!.name,
        duration: logData.duration ? parseInt(logData.duration) : undefined,
        notes: logData.notes || undefined,
        exercises: workout!.exercises.map(e => ({
          exerciseId: e.id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
        })),
      });

      setSuccess('Workout logged successfully!');
      setLogData({ duration: '', notes: '' });
      setTimeout(() => {
        router.push('/dashboard/workouts?tab=history');
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to log workout');
    } finally {
      setIsLogging(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-900">Loading workout...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-900">Workout not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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

      <Link
        href="/dashboard/workouts"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Workouts
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-3xl font-bold text-gray-900">{workout.name}</h1>
            <span
              className={`text-sm px-3 py-1 rounded ${
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
            <p className="text-gray-700 mb-4">{workout.description}</p>
          )}

          <div className="flex gap-6 text-sm text-gray-800">
            {workout.duration && <div className="font-medium">⏱️ ~{workout.duration} min</div>}
            <div className="font-medium">💪 {workout.exercises.length} exercises</div>
            {workout.equipment && workout.equipment.length > 0 && (
              <div className="font-medium">🏋️ {workout.equipment.join(', ')}</div>
            )}
          </div>
        </div>

        {/* Exercises */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Exercises</h2>
          <div className="space-y-6">
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {index + 1}. {exercise.name}
                    </h3>
                    <span className="text-sm text-gray-700 capitalize">
                      {exercise.muscleGroup}
                    </span>
                  </div>
                  <span className="text-sm px-2 py-1 bg-gray-100 text-gray-800 rounded capitalize">
                    {exercise.difficulty}
                  </span>
                </div>

                {exercise.description && (
                  <p className="text-gray-800 text-sm mb-3">{exercise.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {exercise.sets && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">Sets:</span>{' '}
                      <span className="font-semibold text-gray-900">{exercise.sets}</span>
                    </div>
                  )}
                  {exercise.reps && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">Reps:</span>{' '}
                      <span className="font-semibold text-gray-900">{exercise.reps}</span>
                    </div>
                  )}
                  {exercise.duration && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">Duration:</span>{' '}
                      <span className="font-semibold text-gray-900">{exercise.duration}s</span>
                    </div>
                  )}
                  {exercise.rest && (
                    <div className="text-sm">
                      <span className="text-gray-700 font-medium">Rest:</span>{' '}
                      <span className="font-semibold text-gray-900">{exercise.rest}s</span>
                    </div>
                  )}
                </div>

                {exercise.equipment && exercise.equipment.length > 0 && (
                  <div className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Equipment:</span> {exercise.equipment.join(', ')}
                  </div>
                )}

                {exercise.instructions && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:underline font-medium">
                      ▼ View Instructions
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded whitespace-pre-line text-gray-800">
                      {exercise.instructions}
                    </div>
                  </details>
                )}

                {exercise.notes && (
                  <div className="text-sm text-gray-700 mt-2 italic">
                    <span className="font-medium">Note:</span> {exercise.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Log Workout Section */}
        {!isLogging ? (
          <button
            onClick={() => setIsLogging(true)}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            Complete & Log Workout
          </button>
        ) : (
          <form onSubmit={handleLogWorkout} className="space-y-4 border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-900">Log This Workout</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={logData.duration}
                onChange={(e) => setLogData({ ...logData, duration: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-900"
                placeholder="45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Notes (optional)</label>
              <textarea
                value={logData.notes}
                onChange={(e) => setLogData({ ...logData, notes: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-900"
                rows={3}
                placeholder="How did it go? Any observations?"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Log Workout
              </button>
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



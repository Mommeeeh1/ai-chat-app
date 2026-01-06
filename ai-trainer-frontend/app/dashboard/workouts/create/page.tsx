'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { workoutApi } from '@/lib/api';
import type { Exercise, WorkoutDifficulty } from '@/types';

export default function CreateWorkoutPage() {
  const { } = useAuth();
  const router = useRouter();
  
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<WorkoutDifficulty>('beginner');
  const [duration, setDuration] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Array<{
    exerciseId: string;
    exercise: Exercise;
    order: number;
    sets?: number;
    reps?: string;
    duration?: number;
    rest?: number;
    notes?: string;
  }>>([]);

  // Filters
  const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [muscleGroupFilter, difficultyFilter, allExercises]);

  const loadExercises = async () => {
    try {
      setIsLoadingExercises(true);
      const exercises = await workoutApi.getExercises();
      setAllExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error: any) {
      console.error('Failed to load exercises:', error);
      setError(error.message || 'Failed to load exercises');
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const filterExercises = () => {
    let filtered = [...allExercises];
    
    if (muscleGroupFilter) {
      filtered = filtered.filter(e => e.muscleGroup === muscleGroupFilter);
    }
    
    if (difficultyFilter) {
      filtered = filtered.filter(e => e.difficulty === difficultyFilter);
    }
    
    setFilteredExercises(filtered);
  };

  const addExercise = (exercise: Exercise) => {
    const order = selectedExercises.length + 1;
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: exercise.id,
        exercise,
        order,
        sets: 3,
        reps: '10',
        rest: 60,
      },
    ]);
  };

  const removeExercise = (index: number) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    // Reorder
    updated.forEach((e, i) => {
      e.order = i + 1;
    });
    setSelectedExercises(updated);
  };

  const updateExerciseDetail = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...selectedExercises];
    (updated[index] as any)[field] = value;
    setSelectedExercises(updated);
  };

  const moveExercise = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedExercises.length - 1)
    ) {
      return;
    }

    const updated = [...selectedExercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    // Update order
    updated.forEach((e, i) => {
      e.order = i + 1;
    });
    
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a workout name');
      return;
    }

    if (selectedExercises.length === 0) {
      setError('Please add at least one exercise');
      return;
    }
    
    setError('');
    setIsCreating(true);

    try {
      const equipment = Array.from(
        new Set(
          selectedExercises.flatMap(e => e.exercise.equipment)
        )
      );

      await workoutApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
        difficulty,
        duration: duration ? parseInt(duration) : undefined,
        equipment,
        exercises: selectedExercises.map(e => ({
          exerciseId: e.exerciseId,
          order: e.order,
          sets: e.sets,
          reps: e.reps,
          duration: e.duration,
          rest: e.rest,
          notes: e.notes,
        })),
      });

      router.push('/dashboard/workouts?tab=my');
    } catch (error: any) {
      setError(error.message || 'Failed to create workout');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link
        href="/dashboard/workouts"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Workouts
      </Link>

      <h1 className="text-3xl font-bold mb-4 text-gray-900">Create Custom Workout</h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Workout Details & Selected Exercises */}
        <div className="space-y-6">
          {/* Workout Details Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Workout Details</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-gray-900"
                  placeholder="My Custom Workout"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 text-gray-900"
                  rows={3}
                  placeholder="Brief description of the workout..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as WorkoutDifficulty)}
                    className="w-full border rounded-lg px-4 py-2 text-gray-900"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 text-gray-900"
                    placeholder="45"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Create Workout
              </button>
            </form>
          </div>

          {/* Selected Exercises */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Selected Exercises ({selectedExercises.length})
            </h2>
            
            {selectedExercises.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No exercises selected. Choose from the right panel.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedExercises.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {item.order}. {item.exercise.name}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {item.exercise.muscleGroup}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveExercise(index, 'up')}
                          disabled={index === 0}
                          className="text-gray-600 hover:text-blue-600 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveExercise(index, 'down')}
                          disabled={index === selectedExercises.length - 1}
                          className="text-gray-600 hover:text-blue-600 disabled:opacity-30"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <label className="text-gray-600 text-xs">Sets</label>
                        <input
                          type="number"
                          value={item.sets || ''}
                          onChange={(e) =>
                            updateExerciseDetail(index, 'sets', parseInt(e.target.value) || undefined)
                          }
                          className="w-full border rounded px-2 py-1 text-gray-900"
                          placeholder="3"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 text-xs">Reps</label>
                        <input
                          type="text"
                          value={item.reps || ''}
                          onChange={(e) =>
                            updateExerciseDetail(index, 'reps', e.target.value)
                          }
                          className="w-full border rounded px-2 py-1 text-gray-900"
                          placeholder="10-12"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 text-xs">Duration (s)</label>
                        <input
                          type="number"
                          value={item.duration || ''}
                          onChange={(e) =>
                            updateExerciseDetail(index, 'duration', parseInt(e.target.value) || undefined)
                          }
                          className="w-full border rounded px-2 py-1 text-gray-900"
                          placeholder="30"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 text-xs">Rest (s)</label>
                        <input
                          type="number"
                          value={item.rest || ''}
                          onChange={(e) =>
                            updateExerciseDetail(index, 'rest', parseInt(e.target.value) || undefined)
                          }
                          className="w-full border rounded px-2 py-1 text-gray-900"
                          placeholder="60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Exercise Library */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Exercise Library</h2>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Muscle Group</label>
              <select
                value={muscleGroupFilter}
                onChange={(e) => setMuscleGroupFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              >
                <option value="">All</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="legs">Legs</option>
                <option value="shoulders">Shoulders</option>
                <option value="arms">Arms</option>
                <option value="core">Core</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm text-gray-900"
              >
                <option value="">All</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Exercise List */}
          {isLoadingExercises ? (
            <div className="text-center py-8 text-gray-500">Loading exercises...</div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  e => e.exerciseId === exercise.id
                );
                
                return (
                  <div
                    key={exercise.id}
                    className={`border rounded-lg p-3 ${
                      isSelected ? 'bg-gray-100 border-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{exercise.name}</div>
                        <div className="text-xs text-gray-600 capitalize">
                          {exercise.muscleGroup} • {exercise.difficulty}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addExercise(exercise)}
                        disabled={isSelected}
                        className={`text-xs px-3 py-1 rounded ${
                          isSelected
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Add'}
                      </button>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



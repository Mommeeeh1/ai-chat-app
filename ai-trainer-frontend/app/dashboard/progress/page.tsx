'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '@/lib/api';
import type { ProgressEntry, ProgressStats } from '@/types';
import { useToggle } from '@/hooks';

export default function ProgressPage() {
  const queryClient = useQueryClient();
  const [showForm, toggleShowForm, setShowForm] = useToggle(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    weight: '',
    notes: '',
    mood: 'good',
  });

  // ✅ React Query: Fetch stats (automatic caching, refetching, loading states)
  const { data: stats } = useQuery<ProgressStats>({
    queryKey: ['progress-stats'],
    queryFn: () => progressApi.getStats(),
  });

  // ✅ React Query: Fetch entries (automatic caching, refetching, loading states)
  const { data: entries = [], isLoading } = useQuery<ProgressEntry[]>({
    queryKey: ['progress-entries'],
    queryFn: () => progressApi.getAll(30),
  });

  // ✅ React Query: Mutation for creating entries (automatic refetching + prefetching)
  const createEntryMutation = useMutation({
    mutationFn: (data: { weight?: number; notes?: string; mood?: string }) =>
      progressApi.create(data),
    onSuccess: () => {
      // Invalidate queries to trigger refetch (gets fresh data from server)
      queryClient.invalidateQueries({ queryKey: ['progress-stats'] });
      queryClient.invalidateQueries({ queryKey: ['progress-entries'] });
      
      // Prefetch workout data (user might want to check workouts next)
      queryClient.prefetchQuery({
        queryKey: ['workout-stats'],
        queryFn: () => import('@/lib/api').then(m => m.workoutApi.getStats()),
      });
      
      // Reset form and show success
      setFormData({ weight: '', notes: '', mood: 'good' });
      setShowForm(false);
      setSuccess('Progress entry added successfully! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create progress entry');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    createEntryMutation.mutate({
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      notes: formData.notes || undefined,
      mood: formData.mood || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading progress data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
               <button
                 onClick={toggleShowForm}
                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
               >
                 {showForm ? 'Cancel' : '+ Add Entry'}
               </button>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">New Progress Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-900"
                placeholder="75.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Mood</label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-900"
              >
                <option value="great">😊 Great</option>
                <option value="good">🙂 Good</option>
                <option value="okay">😐 Okay</option>
                <option value="tired">😴 Tired</option>
                <option value="sore">🤕 Sore</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-900">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 text-gray-900"
                rows={3}
                placeholder="How are you feeling? Any observations?"
              />
            </div>

            <button
              type="submit"
              disabled={createEntryMutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEntryMutation.isPending ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-700 mb-1">Total Entries</div>
          <div className="text-3xl font-bold text-gray-900">{stats?.totalEntries || 0}</div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-700 mb-1">Current Weight</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.currentWeight ? `${stats.currentWeight} kg` : '-'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-700 mb-1">Start Weight</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats?.startWeight ? `${stats.startWeight} kg` : '-'}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-sm text-gray-700 mb-1">Change</div>
          <div className={`text-3xl font-bold ${
            stats?.weightChange && stats.weightChange < 0 ? 'text-green-600' : 
            stats?.weightChange && stats.weightChange > 0 ? 'text-orange-600' : ''
          }`}>
            {stats?.weightChange 
              ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg`
              : '-'}
          </div>
        </div>
      </div>

      {/* Simple Weight Chart */}
      {entries.length > 0 && entries.some(e => e.weight) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Weight Progress</h2>
          <div className="relative h-64">
            <SimpleLineChart 
              data={entries.filter((e: ProgressEntry) => e.weight).reverse().map((e: ProgressEntry) => ({
                date: new Date(e.date).toLocaleDateString(),
                weight: e.weight!
              }))}
            />
          </div>
        </div>
      )}

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Recent Entries</h2>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No progress entries yet. Add your first entry to start tracking!
          </p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry: ProgressEntry) => (
              <div key={entry.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-700">
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {entry.weight && (
                    <div className="text-lg font-semibold text-gray-900">{entry.weight} kg</div>
                  )}
                </div>
                {entry.mood && (
                  <div className="text-sm mb-1 text-gray-800">
                    <span className="text-gray-700 font-medium">Mood:</span> <span className="capitalize">{entry.mood}</span>
                  </div>
                )}
                {entry.notes && (
                  <div className="text-sm text-gray-700 mt-2">{entry.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple line chart component without external library
function SimpleLineChart({ data }: { data: { date: string; weight: number }[] }) {
  if (data.length === 0) return null;

  const weights = data.map(d => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;
  
  // Calculate points for SVG path
  const width = 100; // percentage
  const height = 100; // percentage
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.weight - minWeight) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.2"/>
        <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.2"/>
        <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.2"/>
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        
        {/* Points */}
        {data.map((d: { date: string; weight: number }, i: number) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.weight - minWeight) / range) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1.5"
              fill="#3b82f6"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>{data[0].date}</span>
        <span>{data[data.length - 1].date}</span>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-600">
        <span>Min: {minWeight.toFixed(1)} kg</span>
        <span>Max: {maxWeight.toFixed(1)} kg</span>
      </div>
    </div>
  );
}



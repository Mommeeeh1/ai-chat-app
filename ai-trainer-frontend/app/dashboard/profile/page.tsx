'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { profileApi } from '@/lib/api';
import type { ProfileFormData } from '@/types';

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await profileApi.get();
      // Only extract form fields (exclude id, userId, createdAt, updatedAt)
      setFormData({
        age: profile.age ?? undefined,
        gender: profile.gender ?? undefined,
        height: profile.height ?? undefined,
        currentWeight: profile.currentWeight ?? undefined,
        targetWeight: profile.targetWeight ?? undefined,
        primaryGoal: profile.primaryGoal ?? undefined,
        activityLevel: profile.activityLevel ?? undefined,
        dietaryRestrictions: profile.dietaryRestrictions,
        availableEquipment: profile.availableEquipment,
        workoutDaysPerWeek: profile.workoutDaysPerWeek ?? undefined,
      });
    } catch (err) {
      console.log('No profile found yet');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof ProfileFormData, item: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    handleChange(field, newArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Filter out read-only fields (id, userId, createdAt, updatedAt)
      // Backend validation only accepts profile update fields
      const updateData: ProfileFormData = {
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        currentWeight: formData.currentWeight,
        targetWeight: formData.targetWeight,
        primaryGoal: formData.primaryGoal,
        activityLevel: formData.activityLevel,
        dietaryRestrictions: formData.dietaryRestrictions,
        availableEquipment: formData.availableEquipment,
        workoutDaysPerWeek: formData.workoutDaysPerWeek,
      };

      await profileApi.update(updateData);
      setSuccess('Profile saved successfully! 🎉');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Profile</h1>
        <p className="text-gray-600 mt-2">
          Tell us about yourself to get personalized fitness advice
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-xl shadow-lg p-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age || ''}
                onChange={(e) => handleChange('age', parseInt(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="25"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height || ''}
                onChange={(e) => handleChange('height', parseInt(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="175"
              />
            </div>

            {/* Current Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Weight (kg)
              </label>
              <input
                type="number"
                value={formData.currentWeight || ''}
                onChange={(e) => handleChange('currentWeight', parseFloat(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="70"
              />
            </div>

            {/* Target Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Weight (kg)
              </label>
              <input
                type="number"
                value={formData.targetWeight || ''}
                onChange={(e) => handleChange('targetWeight', parseFloat(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="65"
              />
            </div>

            {/* Workout Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workout Days per Week
              </label>
              <input
                type="number"
                min="0"
                max="7"
                value={formData.workoutDaysPerWeek || ''}
                onChange={(e) => handleChange('workoutDaysPerWeek', parseInt(e.target.value) || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="3"
              />
            </div>
          </div>
        </div>

        {/* Fitness Goals */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Fitness Goals</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Goal
            </label>
            <select
              value={formData.primaryGoal || ''}
              onChange={(e) => handleChange('primaryGoal', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select your primary goal</option>
              <option value="lose_weight">Lose Weight</option>
              <option value="gain_muscle">Gain Muscle</option>
              <option value="maintain">Maintain Current Fitness</option>
              <option value="improve_endurance">Improve Endurance</option>
              <option value="general_fitness">General Fitness</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Level
            </label>
            <select
              value={formData.activityLevel || ''}
              onChange={(e) => handleChange('activityLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select your activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="lightly_active">Lightly Active (1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (3-5 days/week)</option>
              <option value="very_active">Very Active (6-7 days/week)</option>
              <option value="extremely_active">Extremely Active (athlete)</option>
            </select>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Dietary Restrictions</h2>
          <p className="text-sm text-gray-600">Select all that apply</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free'].map(restriction => (
              <label key={restriction} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.dietaryRestrictions || []).includes(restriction)}
                  onChange={() => toggleArrayItem('dietaryRestrictions', restriction)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {restriction.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Available Equipment */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Available Equipment</h2>
          <p className="text-sm text-gray-600">Select what equipment you have access to</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['dumbbells', 'barbells', 'resistance_bands', 'pull_up_bar', 'bench', 'treadmill', 'stationary_bike', 'kettlebells', 'none'].map(equipment => (
              <label key={equipment} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.availableEquipment || []).includes(equipment)}
                  onChange={() => toggleArrayItem('availableEquipment', equipment)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {equipment.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}


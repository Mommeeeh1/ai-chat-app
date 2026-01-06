'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  // FORM STATE
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // UI STATE
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // VALIDATION STATE
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  // AUTH & ROUTER
  const router = useRouter();
  const { login } = useAuth();  // ← Get login function from context

  // VALIDATION FUNCTIONS
  const validateEmail = (emailValue: string): string | undefined => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (passwordValue: string): string | undefined => {
    if (!passwordValue) {
      return 'Password is required';
    }
    if (passwordValue.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  // VALIDATE FORM
  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FORM SUBMISSION HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate before submitting
    if (!validateForm()) {
      return; // Stop if validation fails
    }
    
    setIsLoading(true);

    try {
      // Use API service - httpOnly cookie is set automatically by backend
      const data = await authApi.login({ email, password });

      // Success! Use auth context to save user data
      // Token is now in httpOnly cookie (secure, not accessible to JavaScript)
      login(data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Log in to continue your fitness journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-lg">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(''); // Clear general error when user starts correcting
                // Clear error when user starts typing
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              onBlur={() => {
                // Validate on blur (when user leaves field)
                const emailError = validateEmail(email);
                setErrors(prev => ({ ...prev, email: emailError }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear general error when user starts correcting
                // Clear error when user starts typing
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              onBlur={() => {
                // Validate on blur
                const passwordError = validatePassword(password);
                setErrors(prev => ({ ...prev, password: passwordError }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Signup Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


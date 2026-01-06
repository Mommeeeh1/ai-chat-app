'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

export default function SignupPage() {
  // FORM STATE - Each input gets its own state variable
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // UI STATE - Track loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // VALIDATION STATE
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  
  // AUTH & ROUTER
  const router = useRouter();
  const { login } = useAuth();  // ← Get login function from context

  // VALIDATION FUNCTIONS
  const validateName = (nameValue: string): string | undefined => {
    if (!nameValue.trim()) {
      return 'Name is required';
    }
    if (nameValue.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return undefined;
  };

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
    if (passwordValue.length > 100) {
      return 'Password must be less than 100 characters';
    }
    return undefined;
  };

  // VALIDATE FORM
  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    const nameError = validateName(name);
    if (nameError) newErrors.name = nameError;
    
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
      const data = await authApi.signup({ email, password, name });

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
          <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">
            Start your fitness journey today
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

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(''); // Clear general error when user starts correcting
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              onBlur={() => {
                const nameError = validateName(name);
                setErrors(prev => ({ ...prev, name: nameError }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(''); // Clear general error when user starts correcting
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: undefined }));
                }
              }}
              onBlur={() => {
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
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(''); // Clear general error when user starts correcting
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              onBlur={() => {
                const passwordError = validatePassword(password);
                setErrors(prev => ({ ...prev, password: passwordError }));
              }}
              className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
              minLength={6}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                Must be at least 6 characters
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>

          {/* Login Link */}
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


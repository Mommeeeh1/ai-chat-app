/**
 * Signup Page Tests
 * 
 * Testing the signup form component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import SignupPage from '../page';
import { authApi } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api', () => ({
  authApi: {
    signup: jest.fn(),
  },
}));

// Mock the auth context
const mockLogin = jest.fn();
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isLoading: false,
  }),
}));

// Mock router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render signup form', () => {
    render(<SignupPage />);
    
    // Check for heading
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    
    // Check for form fields
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check for submit button
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    
    // Check for login link
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<SignupPage />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Click submit without filling fields
    fireEvent.click(submitButton);
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    
    // API should not be called
    expect(authApi.signup).not.toHaveBeenCalled();
  });

  it('should show validation error for short name', async () => {
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Enter short name
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email', async () => {
    render(<SignupPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short password', async () => {
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Enter valid name and email but short password
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    // Mock successful signup
    const mockUser = {
      id: 'user-1',
      email: 'newuser@example.com',
      name: 'New User',
    };
    
    (authApi.signup as jest.Mock).mockResolvedValue({
      user: mockUser,
      message: 'Account created successfully',
    });
    
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill in form
    fireEvent.change(nameInput, { target: { value: 'New User' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Should call API with correct data
    await waitFor(() => {
      expect(authApi.signup).toHaveBeenCalledWith({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      });
    });
    
    // Should call login from context
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });
    
    // Should redirect to dashboard
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should display error message on failed signup', async () => {
    // Mock failed signup
    (authApi.signup as jest.Mock).mockRejectedValue(
      new Error('User with this email already exists')
    );
    
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill in form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Should display error message
    await waitFor(() => {
      expect(screen.getByText('User with this email already exists')).toBeInTheDocument();
    });
    
    // Should not redirect
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should disable submit button while loading', async () => {
    // Mock slow API call
    (authApi.signup as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill in form
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('should validate name on blur', async () => {
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    
    // Enter short name and blur
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.blur(nameInput);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('should validate email on blur', async () => {
    render(<SignupPage />);
    
    const emailInput = screen.getByLabelText(/email/i);
    
    // Enter invalid email and blur
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate password on blur', async () => {
    render(<SignupPage />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    
    // Enter short password and blur
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  it('should clear error message when user starts typing', async () => {
    // Mock failed signup
    (authApi.signup as jest.Mock).mockRejectedValue(
      new Error('Email already exists')
    );
    
    render(<SignupPage />);
    
    const nameInput = screen.getByLabelText(/^name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Fill and submit to trigger error
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
    
    // Start typing in name field
    fireEvent.change(nameInput, { target: { value: 'Test User 2' } });
    
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Email already exists')).not.toBeInTheDocument();
    });
  });
});




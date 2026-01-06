/**
 * API Client Tests
 * 
 * Testing the API request functions and error handling
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { authApi } from '../api';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('API Client - Error Handling', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should handle network errors', async () => {
    // Given: Fetch throws a network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    // When/Then: API call should throw user-friendly error
    await expect(authApi.login({ email: 'test@example.com', password: 'password' }))
      .rejects
      .toThrow('Unable to connect to the server. Please check your internet connection.');
  });
  
  it('should handle non-JSON responses for errors', async () => {
    // Given: Server returns HTML error page instead of JSON
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });
    
    // When/Then: Should throw default error message for 500
    await expect(authApi.login({ email: 'test@example.com', password: 'password' }))
      .rejects
      .toThrow('Server error. Please try again later.');
  });
  
  it('should extract error message from backend response', async () => {
    // Given: Backend returns error with message
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({
        error: 'Invalid email or password',
      }),
    });
    
    // When/Then: Should throw backend's error message
    await expect(authApi.login({ email: 'test@example.com', password: 'wrong-password' }))
      .rejects
      .toThrow('Invalid email or password');
  });
  
  it('should handle 400 Bad Request with default message', async () => {
    // Given: Backend returns 400 without specific error message
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({}),
    });
    
    // When/Then: Should throw default 400 message
    await expect(authApi.login({ email: 'invalid', password: 'data' }))
      .rejects
      .toThrow('Invalid request. Please check your input.');
  });
  
  it('should handle 404 Not Found', async () => {
    // Given: Backend returns 404
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue({}),
    });
    
    // When/Then: Should throw 404 message
    await expect(authApi.login({ email: 'test@example.com', password: 'password' }))
      .rejects
      .toThrow('The requested resource was not found.');
  });
});

describe('API Client - Login Function', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should make login request with correct parameters', async () => {
    // Given: We have login credentials
    const email = 'test@example.com';
    const password = 'password123';
    
    // And: Backend returns success
    const mockResponse = {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      },
      message: 'Logged in successfully',
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    
    // When: We call login
    const result = await authApi.login({ email, password });
    
    // Then: Fetch should be called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      }
    );
    
    // And: Result should match response
    expect(result).toEqual(mockResponse);
  });
});

describe('API Client - Signup Function', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should make signup request with correct parameters', async () => {
    // Given: We have signup data
    const name = 'New User';
    const email = 'newuser@example.com';
    const password = 'securepassword';
    
    // And: Backend returns success
    const mockResponse = {
      user: {
        id: 'user-2',
        email: 'newuser@example.com',
        name: 'New User',
      },
      message: 'Account created successfully',
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    
    // When: We call signup
    const result = await authApi.signup({ name, email, password });
    
    // Then: Fetch should be called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      }
    );
    
    // And: Result should match response
    expect(result).toEqual(mockResponse);
  });
  
  it('should handle email already exists error', async () => {
    // Given: Backend returns conflict error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error: 'User with this email already exists',
      }),
    });
    
    // When/Then: Should throw the error
    await expect(authApi.signup({ name: 'Test', email: 'existing@example.com', password: 'password' }))
      .rejects
      .toThrow('User with this email already exists');
  });
});

describe('API Client - Logout Function', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should make logout request', async () => {
    // Given: Backend returns success
    const mockResponse = {
      message: 'Logged out successfully',
    };
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
    });
    
    // When: We call logout
    const result = await authApi.logout();
    
    // Then: Fetch should be called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/logout',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );
    
    // And: Result should match response
    expect(result).toEqual(mockResponse);
  });
});

describe('API Client - Cookie Handling', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should include credentials in all requests', async () => {
    // Given: Any API call
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    
    // When: We make an API call
    await authApi.login({ email: 'test@example.com', password: 'password' });
    
    // Then: Credentials should be included
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[1].credentials).toBe('include');
  });
});

describe('API Client - Content Type Headers', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should set Content-Type to application/json', async () => {
    // Given: Any API call
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
    
    // When: We make an API call
    await authApi.signup({ name: 'Test', email: 'test@example.com', password: 'password' });
    
    // Then: Content-Type should be set
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
  });
});


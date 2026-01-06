/**
 * Auth Service Tests
 *
 * Testing the authentication service functions
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { hashPassword, comparePassword, signup, login } from '../auth.service';

// Mock the user repository (we don't want to hit the real database)
jest.mock('../../repositories/user.repository');
import * as userRepository from '../../repositories/user.repository';

/**
 * Testing Password Hashing
 *
 * These tests verify that passwords are properly hashed using bcrypt
 */
describe('AuthService - Password Hashing', () => {
  it('should hash a password', async () => {
    // Given: We have a plain text password
    const plainPassword = 'mySecurePassword123';

    // When: We hash the password
    const hashedPassword = await hashPassword(plainPassword);

    // Then: The result should be defined (not null/undefined)
    expect(hashedPassword).toBeDefined();

    // And: It should be a string
    expect(typeof hashedPassword).toBe('string');

    // And: It should NOT be the same as the plain password
    expect(hashedPassword).not.toBe(plainPassword);
  });

  it('should create long hashed passwords', async () => {
    // Given: A plain password
    const plainPassword = 'test123';

    // When: We hash it
    const hashedPassword = await hashPassword(plainPassword);

    // Then: The hashed password should be much longer than the original
    // Bcrypt hashes are 60 characters long
    expect(hashedPassword.length).toBeGreaterThan(plainPassword.length);
    expect(hashedPassword.length).toBeGreaterThanOrEqual(60);
  });

  it('should create different hashes for the same password', async () => {
    // Given: The same password hashed twice
    const password = 'samePassword';

    // When: We hash it multiple times
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // Then: The hashes should be different (because bcrypt adds random salt)
    expect(hash1).not.toBe(hash2);

    // But: Both should still be able to verify against the original password
    const isValid1 = await comparePassword(password, hash1);
    const isValid2 = await comparePassword(password, hash2);
    expect(isValid1).toBe(true);
    expect(isValid2).toBe(true);
  });
});

/**
 * Testing Signup Function with Mocking
 *
 * These tests show how to mock database calls
 */
describe('AuthService - Signup Function (with Mocking)', () => {
  // Before each test, reset all mocks
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a new user', async () => {
    // Given: We have signup data
    const signupData = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
    };

    // And: The email is NOT already taken (mock returns null)
    const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
      typeof userRepository.findUserByEmail
    >;
    mockFindUserByEmail.mockResolvedValue(null);
    //                   ↑ When findUserByEmail is called, return null (user doesn't exist)

    // And: Creating the user succeeds (mock returns fake user)
    const mockCreateUser = userRepository.createUser as jest.MockedFunction<
      typeof userRepository.createUser
    >;
    mockCreateUser.mockResolvedValue({
      id: 'test-user-id-123',
      email: signupData.email,
      password: 'hashed-password-here', // This would be the hashed version
      name: signupData.name || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    //    ↑ When createUser is called, return this fake user

    // When: We call signup
    const result = await signup(signupData);

    // Then: It should return user data and token
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(signupData.email);
    expect(result.user.name).toBe(signupData.name);
    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');

    // And: The mocked functions should have been called
    expect(mockFindUserByEmail).toHaveBeenCalledWith(signupData.email);
    expect(mockCreateUser).toHaveBeenCalledTimes(1);
  });

  it('should throw error when email already exists', async () => {
    // Given: We have signup data
    const signupData = {
      email: 'existing@example.com',
      password: 'password123',
      name: 'Existing User',
    };

    // And: The email is ALREADY taken (mock returns existing user)
    const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
      typeof userRepository.findUserByEmail
    >;
    mockFindUserByEmail.mockResolvedValue({
      id: 'existing-user-id',
      email: signupData.email,
      password: 'some-hashed-password',
      name: 'Existing User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    //    ↑ User already exists!

    // When/Then: Calling signup should throw an error
    await expect(signup(signupData)).rejects.toThrow('An account with this email already exists');
    //    ↑ We expect this promise to be rejected with this error message

    // And: createUser should NOT have been called (we stopped before that)
    const mockCreateUser = userRepository.createUser as jest.MockedFunction<
      typeof userRepository.createUser
    >;
    expect(mockCreateUser).not.toHaveBeenCalled();
  });
});

/**
 * Testing Login Function with Error Cases
 *
 * Testing what happens when login fails
 */
describe('AuthService - Login Function (Error Cases)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error when user does not exist', async () => {
    // Given: We have login credentials
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    // And: The user does NOT exist (mock returns null)
    const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
      typeof userRepository.findUserByEmail
    >;
    mockFindUserByEmail.mockResolvedValue(null);
    //                                      ↑ User not found

    // When/Then: Login should throw an error
    await expect(login(loginData)).rejects.toThrow('Invalid email or password');
    //    ↑ Testing error handling for security (don't reveal if email exists)

    // And: findUserByEmail should have been called
    expect(mockFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });

  it('should throw error when password is wrong', async () => {
    // Given: We have login credentials with WRONG password
    const loginData = {
      email: 'user@example.com',
      password: 'wrongpassword',
    };

    // And: The user EXISTS in database
    const mockFindUserByEmail = userRepository.findUserByEmail as jest.MockedFunction<
      typeof userRepository.findUserByEmail
    >;
    mockFindUserByEmail.mockResolvedValue({
      id: 'user-id-123',
      email: loginData.email,
      password: await hashPassword('correctpassword'), // Real hashed password
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // When/Then: Login should throw an error (wrong password)
    await expect(login(loginData)).rejects.toThrow('Invalid email or password');
    //    ↑ Password doesn't match the hash

    // And: findUserByEmail should have been called
    expect(mockFindUserByEmail).toHaveBeenCalledWith(loginData.email);
  });
});

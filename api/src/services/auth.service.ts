import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { createChildLogger } from '../utils/logger';
import * as userRepository from '../repositories/user.repository';
import { UserAlreadyExistsError, InvalidCredentialsError } from '../utils/errors';
import { AUTH_MESSAGES } from '../constants';
import { toAuthResponseDTO, type AuthResponseDTO } from '../dtos/user.dto';

const authLogger = createChildLogger({ module: 'auth', service: 'AuthService' });

/**
 * Auth Service
 * 
 * Handles user authentication:
 * - Signup (create new user)
 * - Login (verify credentials)
 * - Password hashing
 * - JWT token generation
 */

interface SignupData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

/**
 * Hash a password using bcrypt
 * 
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // How many times to hash (higher = more secure, slower)
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 * 
 * @param password - Plain text password
 * @param hash - Hashed password from database
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 * 
 * @param userId - User's ID
 * @returns JWT token
 */
function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    config.security.jwtSecret,
    {
      expiresIn: config.security.jwtExpiresIn,
    } as jwt.SignOptions
  );
}

/**
 * Sign up a new user
 * 
 * @param data - User signup data (email, password, optional name)
 * @returns AuthResponseDTO - Safe user object (no password) and JWT token
 */
export async function signup(data: SignupData): Promise<AuthResponseDTO> {
  authLogger.info(`Signup attempt for email: ${data.email}`);

  // Check if user already exists
  const existingUser = await userRepository.findUserByEmail(data.email);

  if (existingUser) {
    authLogger.warn(`Signup failed: Email already exists - ${data.email}`);
    throw new UserAlreadyExistsError(AUTH_MESSAGES.EMAIL_ALREADY_EXISTS);
  }

  // Hash the password
  authLogger.debug('Hashing password...');
  const hashedPassword = await hashPassword(data.password);

  // Create the user
  authLogger.debug('Creating user in database...');
  const user = await userRepository.createUser({
    email: data.email,
    password: hashedPassword,
    name: data.name,
  });

  // Generate JWT token
  const token = generateToken(user.id);

  authLogger.info(`User created successfully: ${user.id}`);

  // Return DTO (automatically excludes password and other sensitive data)
  return toAuthResponseDTO(user, token, AUTH_MESSAGES.SIGNUP_SUCCESS);
}

/**
 * Log in an existing user
 * 
 * @param data - Login credentials (email, password)
 * @returns AuthResponseDTO - Safe user object (no password) and JWT token
 */
export async function login(data: LoginData): Promise<AuthResponseDTO> {
  authLogger.info(`Login attempt for email: ${data.email}`);

  // Find user by email
  const user = await userRepository.findUserByEmail(data.email);

  if (!user) {
    authLogger.warn(`Login failed: User not found - ${data.email}`);
    throw new InvalidCredentialsError(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  // Verify password
  authLogger.debug('Verifying password...');
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    authLogger.warn(`Login failed: Invalid password for - ${data.email}`);
    throw new InvalidCredentialsError(AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate JWT token
  const token = generateToken(user.id);

  authLogger.info(`User logged in successfully: ${user.id}`);

  // Return DTO (automatically excludes password and other sensitive data)
  return toAuthResponseDTO(user, token, AUTH_MESSAGES.LOGIN_SUCCESS);
}


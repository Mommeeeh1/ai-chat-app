import { prisma } from '../lib/prisma';
import { createChildLogger } from '../utils/logger';

const repoLogger = createChildLogger({ module: 'repository', service: 'UserRepository' });

/**
 * User Repository
 * 
 * Handles all database operations for User model
 * This separates data access from business logic
 */

/**
 * Find a user by email
 * 
 * @param email - User's email address
 * @returns User or null if not found
 */
export async function findUserByEmail(email: string) {
  repoLogger.debug(`Finding user by email: ${email}`);
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find a user by ID
 * 
 * @param id - User's ID
 * @returns User or null if not found
 */
export async function findUserById(id: string) {
  repoLogger.debug(`Finding user by ID: ${id}`);
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Create a new user
 * 
 * @param data - User data (email, password, optional name)
 * @returns Created user
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string | null;
}) {
  repoLogger.debug(`Creating user with email: ${data.email}`);
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
    },
  });
}

/**
 * Update a user
 * 
 * @param id - User's ID
 * @param data - Data to update
 * @returns Updated user
 */
export async function updateUser(
  id: string,
  data: {
    email?: string;
    password?: string;
    name?: string | null;
  }
) {
  repoLogger.debug(`Updating user: ${id}`);
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Delete a user
 * 
 * @param id - User's ID
 * @returns Deleted user
 */
export async function deleteUser(id: string) {
  repoLogger.debug(`Deleting user: ${id}`);
  return prisma.user.delete({
    where: { id },
  });
}


import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../../app';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ai_fitness_trainer_test',
    },
  },
});

export const testApp = createApp();

export const createTestUser = async (email: string = 'test@example.com') => {
  // Clean up existing user
  await prisma.user.deleteMany({
    where: { email },
  });

  // Create new test user
  const response = await request(testApp)
    .post('/api/v1/auth/register')
    .send({
      email,
      password: 'Test123456',
      name: 'Test User',
    });

  return {
    user: response.body.user,
    token: response.body.token,
    cookies: response.headers['set-cookie'],
  };
};

export const cleanDatabase = async () => {
  // Delete in correct order to respect foreign key constraints
  await prisma.chatMessage.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.workout.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
};

export const closeDatabase = async () => {
  await prisma.$disconnect();
};

// Mock Redis for tests
jest.mock('../../lib/redis', () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    setex: jest.fn(),
  },
  connectRedis: jest.fn(),
  disconnectRedis: jest.fn(),
}));

// Mock Ollama for tests
jest.mock('../../lib/ollama', () => ({
  generateResponse: jest.fn().mockResolvedValue({
    message: {
      content: 'This is a mock AI response for testing purposes.',
    },
  }),
}));


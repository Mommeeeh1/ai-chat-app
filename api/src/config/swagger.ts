import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

/**
 * Swagger/OpenAPI Configuration
 * 
 * Auto-generates API documentation from JSDoc comments
 * Access at: http://localhost:3000/api-docs
 */

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Personal Trainer API',
      version: '1.0.0',
      description: `
        A comprehensive fitness API that provides personalized workout plans, 
        nutrition advice, and AI-powered coaching.
        
        ## Features
        - 🤖 AI-powered chat with personalized fitness advice
        - 💪 Workout planning and tracking
        - 📊 Progress tracking (weight, mood, notes)
        - 👤 User profile management
        - 🔐 JWT-based authentication with httpOnly cookies
        
        ## Authentication
        Most endpoints require authentication via httpOnly cookies.
        After logging in, the cookie is automatically sent with each request.
      `,
      contact: {
        name: 'API Support',
        email: 'support@aitrainer.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: 'Development server',
      },
      {
        url: 'https://api.aitrainer.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in httpOnly cookie',
        },
      },
      schemas: {
        // User & Auth
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            message: { type: 'string' },
          },
        },
        
        // Profile
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            age: { type: 'number', nullable: true },
            gender: { type: 'string', enum: ['male', 'female', 'other'], nullable: true },
            height: { type: 'number', nullable: true, description: 'Height in cm' },
            currentWeight: { type: 'number', nullable: true, description: 'Weight in kg' },
            targetWeight: { type: 'number', nullable: true, description: 'Weight in kg' },
            primaryGoal: { 
              type: 'string', 
              enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'flexibility'],
              nullable: true 
            },
            activityLevel: { 
              type: 'string', 
              enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
              nullable: true 
            },
            dietaryRestrictions: { type: 'array', items: { type: 'string' } },
            availableEquipment: { type: 'array', items: { type: 'string' } },
            workoutDaysPerWeek: { type: 'number', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        
        // Chat
        ChatMessage: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            role: { type: 'string', enum: ['user', 'assistant'] },
            content: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            userMessage: { $ref: '#/components/schemas/ChatMessage' },
            aiMessage: { $ref: '#/components/schemas/ChatMessage' },
            conversationLength: { type: 'number' },
          },
        },
        
        // Progress
        ProgressEntry: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            date: { type: 'string', format: 'date-time' },
            weight: { type: 'number', nullable: true },
            mood: { type: 'string', enum: ['great', 'good', 'okay', 'tired', 'sore'], nullable: true },
            notes: { type: 'string', nullable: true },
          },
        },
        ProgressStats: {
          type: 'object',
          properties: {
            totalEntries: { type: 'number' },
            currentWeight: { type: 'number', nullable: true },
            startWeight: { type: 'number', nullable: true },
            weightChange: { type: 'number', nullable: true },
          },
        },
        
        // Workouts
        Exercise: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            muscleGroup: { type: 'string' },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            sets: { type: 'number', nullable: true },
            reps: { type: 'string', nullable: true },
            duration: { type: 'number', nullable: true },
            rest: { type: 'number', nullable: true },
            equipment: { type: 'array', items: { type: 'string' } },
            instructions: { type: 'string', nullable: true },
          },
        },
        Workout: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
            duration: { type: 'number', nullable: true },
            exercises: { type: 'array', items: { $ref: '#/components/schemas/Exercise' } },
            equipment: { type: 'array', items: { type: 'string' } },
          },
        },
        
        // Error
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            stack: { type: 'string', description: 'Only in development mode' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Profile', description: 'User profile management' },
      { name: 'Chat', description: 'AI chat interactions' },
      { name: 'Progress', description: 'Progress tracking' },
      { name: 'Workouts', description: 'Workout management' },
    ],
  },
  // Path to API routes with JSDoc comments
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);


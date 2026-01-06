import request from 'supertest';
import { testApp, prisma, cleanDatabase, closeDatabase, createTestUser } from '../setup/test-server';

describe('Workout Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('GET /api/v1/workouts/templates', () => {
    it('should return workout templates', async () => {
      const { token } = await createTestUser('templates@example.com');

      const response = await request(testApp)
        .get('/api/v1/workouts/templates')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('difficulty');
    });

    it('should filter templates by difficulty', async () => {
      const { token } = await createTestUser('filter@example.com');

      const response = await request(testApp)
        .get('/api/v1/workouts/templates?difficulty=beginner')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((template: { difficulty: string }) => {
        expect(template.difficulty).toBe('beginner');
      });
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/workouts/templates').expect(401);
    });
  });

  describe('POST /api/v1/workouts', () => {
    it('should create a new workout', async () => {
      const { token, user } = await createTestUser('createworkout@example.com');

      const workoutData = {
        name: 'My Custom Workout',
        description: 'A personalized workout routine',
        difficulty: 'intermediate',
        duration: 45,
        exercises: [
          {
            name: 'Push-ups',
            sets: 3,
            reps: 15,
            restSeconds: 60,
          },
          {
            name: 'Squats',
            sets: 4,
            reps: 12,
            restSeconds: 90,
          },
        ],
      };

      const response = await request(testApp)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'My Custom Workout');
      expect(response.body).toHaveProperty('userId', user.id);
      expect(response.body).toHaveProperty('exercises');
      expect(response.body.exercises).toHaveLength(2);

      // Verify in database
      const dbWorkout = await prisma.workout.findUnique({
        where: { id: response.body.id },
        include: { exercises: true },
      });
      expect(dbWorkout).not.toBeNull();
      expect(dbWorkout?.exercises).toHaveLength(2);
    });

    it('should validate workout data', async () => {
      const { token } = await createTestUser('invalidworkout@example.com');

      const response = await request(testApp)
        .post('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          // Missing required fields
          description: 'Missing name',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      await request(testApp)
        .post('/api/v1/workouts')
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('GET /api/v1/workouts/:id', () => {
    it('should get workout by ID with exercises', async () => {
      const { token, user } = await createTestUser('getworkout@example.com');

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          name: 'Test Workout',
          description: 'Test Description',
          difficulty: 'beginner',
          duration: 30,
          isCustom: true,
          exercises: {
            create: [
              {
                name: 'Exercise 1',
                sets: 3,
                reps: 10,
                restSeconds: 60,
              },
            ],
          },
        },
      });

      const response = await request(testApp)
        .get(`/api/v1/workouts/${workout.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', workout.id);
      expect(response.body).toHaveProperty('name', 'Test Workout');
      expect(response.body).toHaveProperty('exercises');
      expect(response.body.exercises).toHaveLength(1);
    });

    it('should return 404 for non-existent workout', async () => {
      const { token } = await createTestUser('notfound@example.com');

      const response = await request(testApp)
        .get('/api/v1/workouts/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/workouts/1').expect(401);
    });
  });

  describe('GET /api/v1/workouts', () => {
    it('should get user workouts', async () => {
      const { token, user } = await createTestUser('listworkouts@example.com');

      // Create multiple workouts
      await prisma.workout.createMany({
        data: [
          {
            userId: user.id,
            name: 'Workout 1',
            difficulty: 'beginner',
            duration: 30,
            isCustom: true,
          },
          {
            userId: user.id,
            name: 'Workout 2',
            difficulty: 'intermediate',
            duration: 45,
            isCustom: true,
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
    });

    it('should return empty array if user has no workouts', async () => {
      const { token } = await createTestUser('noworkouts@example.com');

      const response = await request(testApp)
        .get('/api/v1/workouts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('DELETE /api/v1/workouts/:id', () => {
    it('should delete user workout', async () => {
      const { token, user } = await createTestUser('deleteworkout@example.com');

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          name: 'To Delete',
          difficulty: 'beginner',
          duration: 30,
          isCustom: true,
        },
      });

      await request(testApp)
        .delete(`/api/v1/workouts/${workout.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify deleted
      const dbWorkout = await prisma.workout.findUnique({
        where: { id: workout.id },
      });
      expect(dbWorkout).toBeNull();
    });

    it('should not delete another user workout', async () => {
      const { token: token1, user: user1 } = await createTestUser('user1@example.com');
      const { token: token2 } = await createTestUser('user2@example.com');

      // Create workout for user1
      const workout = await prisma.workout.create({
        data: {
          userId: user1.id,
          name: 'User1 Workout',
          difficulty: 'beginner',
          duration: 30,
          isCustom: true,
        },
      });

      // Try to delete with user2's token
      const response = await request(testApp)
        .delete(`/api/v1/workouts/${workout.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');

      // Verify not deleted
      const dbWorkout = await prisma.workout.findUnique({
        where: { id: workout.id },
      });
      expect(dbWorkout).not.toBeNull();
    });
  });

  describe('POST /api/v1/workouts/:id/log', () => {
    it('should log completed workout', async () => {
      const { token, user } = await createTestUser('logworkout@example.com');

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          name: 'Test Workout',
          difficulty: 'beginner',
          duration: 30,
          isCustom: true,
        },
      });

      const logData = {
        duration: 35,
        notes: 'Good workout',
      };

      const response = await request(testApp)
        .post(`/api/v1/workouts/${workout.id}/log`)
        .set('Authorization', `Bearer ${token}`)
        .send(logData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('workoutId', workout.id);
      expect(response.body).toHaveProperty('duration', 35);
      expect(response.body).toHaveProperty('notes', 'Good workout');

      // Verify in database
      const dbLog = await prisma.workoutLog.findFirst({
        where: { workoutId: workout.id },
      });
      expect(dbLog).not.toBeNull();
    });
  });

  describe('GET /api/v1/workouts/history', () => {
    it('should get workout history', async () => {
      const { token, user } = await createTestUser('history@example.com');

      // Create workout
      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          name: 'Test Workout',
          difficulty: 'beginner',
          duration: 30,
          isCustom: true,
        },
      });

      // Log workout
      await prisma.workoutLog.create({
        data: {
          userId: user.id,
          workoutId: workout.id,
          duration: 35,
        },
      });

      const response = await request(testApp)
        .get('/api/v1/workouts/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('workout');
    });
  });
});




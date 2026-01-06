import request from 'supertest';
import { testApp, prisma, cleanDatabase, closeDatabase, createTestUser } from '../setup/test-server';

describe('Progress Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/progress', () => {
    it('should create progress entry with all fields', async () => {
      const { token, user } = await createTestUser('progress@example.com');

      const progressData = {
        weight: 75.5,
        bodyFat: 18.5,
        muscleMass: 35.2,
        chest: 95,
        waist: 80,
        hips: 92,
        biceps: 32,
        thighs: 55,
        notes: 'Feeling stronger',
      };

      const response = await request(testApp)
        .post('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .send(progressData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', user.id);
      expect(response.body).toHaveProperty('weight', 75.5);
      expect(response.body).toHaveProperty('bodyFat', 18.5);
      expect(response.body).toHaveProperty('notes', 'Feeling stronger');

      // Verify in database
      const dbEntry = await prisma.progressEntry.findUnique({
        where: { id: response.body.id },
      });
      expect(dbEntry).not.toBeNull();
    });

    it('should create progress entry with minimal fields', async () => {
      const { token } = await createTestUser('minimal@example.com');

      const progressData = {
        weight: 70,
      };

      const response = await request(testApp)
        .post('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .send(progressData)
        .expect(201);

      expect(response.body).toHaveProperty('weight', 70);
      expect(response.body.bodyFat).toBeNull();
      expect(response.body.notes).toBeNull();
    });

    it('should validate progress data', async () => {
      const { token } = await createTestUser('invalid@example.com');

      const response = await request(testApp)
        .post('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .send({
          weight: -10, // Invalid negative weight
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      await request(testApp)
        .post('/api/v1/progress')
        .send({ weight: 75 })
        .expect(401);
    });
  });

  describe('GET /api/v1/progress', () => {
    it('should get all progress entries for user', async () => {
      const { token, user } = await createTestUser('getprogress@example.com');

      // Create multiple entries
      await prisma.progressEntry.createMany({
        data: [
          {
            userId: user.id,
            weight: 75,
            createdAt: new Date('2024-01-01'),
          },
          {
            userId: user.id,
            weight: 74,
            createdAt: new Date('2024-01-08'),
          },
          {
            userId: user.id,
            weight: 73,
            createdAt: new Date('2024-01-15'),
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      expect(response.body[0]).toHaveProperty('weight');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should support pagination with limit', async () => {
      const { token, user } = await createTestUser('limit@example.com');

      // Create multiple entries
      const entries = [];
      for (let i = 0; i < 15; i++) {
        entries.push({
          userId: user.id,
          weight: 75 - i * 0.5,
        });
      }
      await prisma.progressEntry.createMany({ data: entries });

      const response = await request(testApp)
        .get('/api/v1/progress?limit=10')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBe(10);
    });

    it('should return empty array for new user', async () => {
      const { token } = await createTestUser('newprogress@example.com');

      const response = await request(testApp)
        .get('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should order entries by date descending', async () => {
      const { token, user } = await createTestUser('order@example.com');

      await prisma.progressEntry.createMany({
        data: [
          {
            userId: user.id,
            weight: 75,
            createdAt: new Date('2024-01-01'),
          },
          {
            userId: user.id,
            weight: 74,
            createdAt: new Date('2024-01-15'),
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/progress')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const dates = response.body.map((entry: { createdAt: string }) => new Date(entry.createdAt));
      expect(dates[0] >= dates[1]).toBe(true); // Most recent first
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/progress').expect(401);
    });
  });

  describe('GET /api/v1/progress/stats', () => {
    it('should calculate progress statistics', async () => {
      const { token, user } = await createTestUser('stats@example.com');

      // Create entries showing progress
      await prisma.progressEntry.createMany({
        data: [
          {
            userId: user.id,
            weight: 80,
            bodyFat: 22,
            createdAt: new Date('2024-01-01'),
          },
          {
            userId: user.id,
            weight: 77,
            bodyFat: 20,
            createdAt: new Date('2024-01-15'),
          },
          {
            userId: user.id,
            weight: 75,
            bodyFat: 18,
            createdAt: new Date('2024-02-01'),
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/progress/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEntries', 3);
      expect(response.body).toHaveProperty('weightChange');
      expect(response.body.weightChange).toBeLessThan(0); // Lost weight
      expect(response.body).toHaveProperty('averageWeight');
      expect(response.body).toHaveProperty('latestEntry');
    });

    it('should handle user with no progress entries', async () => {
      const { token } = await createTestUser('nostats@example.com');

      const response = await request(testApp)
        .get('/api/v1/progress/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalEntries', 0);
      expect(response.body.weightChange).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/progress/stats').expect(401);
    });
  });

  describe('GET /api/v1/progress/range', () => {
    it('should get entries within date range', async () => {
      const { token, user } = await createTestUser('range@example.com');

      await prisma.progressEntry.createMany({
        data: [
          {
            userId: user.id,
            weight: 75,
            createdAt: new Date('2024-01-01'),
          },
          {
            userId: user.id,
            weight: 74,
            createdAt: new Date('2024-01-15'),
          },
          {
            userId: user.id,
            weight: 73,
            createdAt: new Date('2024-02-01'),
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/progress/range?startDate=2024-01-01&endDate=2024-01-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Only January entries
    });

    it('should validate date range', async () => {
      const { token } = await createTestUser('invalidrange@example.com');

      const response = await request(testApp)
        .get('/api/v1/progress/range?startDate=invalid&endDate=2024-01-31')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/progress/:id', () => {
    it('should update progress entry', async () => {
      const { token, user } = await createTestUser('update@example.com');

      // Create entry
      const entry = await prisma.progressEntry.create({
        data: {
          userId: user.id,
          weight: 75,
          bodyFat: 20,
        },
      });

      const updateData = {
        weight: 74.5,
        bodyFat: 19.5,
        notes: 'Updated entry',
      };

      const response = await request(testApp)
        .put(`/api/v1/progress/${entry.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('weight', 74.5);
      expect(response.body).toHaveProperty('bodyFat', 19.5);
      expect(response.body).toHaveProperty('notes', 'Updated entry');
    });

    it('should not update another user entry', async () => {
      const { user: user1 } = await createTestUser('user1@example.com');
      const { token: token2 } = await createTestUser('user2@example.com');

      // Create entry for user1
      const entry = await prisma.progressEntry.create({
        data: {
          userId: user1.id,
          weight: 75,
        },
      });

      // Try to update with user2's token
      const response = await request(testApp)
        .put(`/api/v1/progress/${entry.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .send({ weight: 80 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent entry', async () => {
      const { token } = await createTestUser('notfound@example.com');

      const response = await request(testApp)
        .put('/api/v1/progress/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ weight: 75 })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/v1/progress/:id', () => {
    it('should delete progress entry', async () => {
      const { token, user } = await createTestUser('delete@example.com');

      // Create entry
      const entry = await prisma.progressEntry.create({
        data: {
          userId: user.id,
          weight: 75,
        },
      });

      await request(testApp)
        .delete(`/api/v1/progress/${entry.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify deleted
      const dbEntry = await prisma.progressEntry.findUnique({
        where: { id: entry.id },
      });
      expect(dbEntry).toBeNull();
    });

    it('should not delete another user entry', async () => {
      const { user: user1 } = await createTestUser('deluser1@example.com');
      const { token: token2 } = await createTestUser('deluser2@example.com');

      // Create entry for user1
      const entry = await prisma.progressEntry.create({
        data: {
          userId: user1.id,
          weight: 75,
        },
      });

      // Try to delete with user2's token
      const response = await request(testApp)
        .delete(`/api/v1/progress/${entry.id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');

      // Verify not deleted
      const dbEntry = await prisma.progressEntry.findUnique({
        where: { id: entry.id },
      });
      expect(dbEntry).not.toBeNull();
    });
  });
});



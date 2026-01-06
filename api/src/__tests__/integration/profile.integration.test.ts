import request from 'supertest';
import { testApp, prisma, cleanDatabase, closeDatabase, createTestUser } from '../setup/test-server';

describe('Profile Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('GET /api/v1/profile', () => {
    it('should return user profile if exists', async () => {
      const { token, user } = await createTestUser('profile@example.com');

      // Create profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          age: 25,
          gender: 'male',
          height: 180,
          weight: 75,
          goal: 'Build muscle',
          activityLevel: 'moderate',
          dietaryPreferences: 'none',
        },
      });

      const response = await request(testApp)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', user.id);
      expect(response.body).toHaveProperty('age', 25);
      expect(response.body).toHaveProperty('gender', 'male');
      expect(response.body).toHaveProperty('height', 180);
      expect(response.body).toHaveProperty('weight', 75);
      expect(response.body).toHaveProperty('goal', 'Build muscle');
    });

    it('should return 404 if profile does not exist', async () => {
      const { token } = await createTestUser('noprofile@example.com');

      const response = await request(testApp)
        .get('/api/v1/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/profile').expect(401);
    });
  });

  describe('PUT /api/v1/profile', () => {
    it('should create new profile if not exists', async () => {
      const { token, user } = await createTestUser('newprofile@example.com');

      const profileData = {
        age: 30,
        gender: 'female',
        height: 165,
        weight: 60,
        goal: 'Lose weight',
        activityLevel: 'active',
        dietaryPreferences: 'vegetarian',
      };

      const response = await request(testApp)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData)
        .expect(200);

      expect(response.body).toHaveProperty('userId', user.id);
      expect(response.body).toHaveProperty('age', 30);
      expect(response.body).toHaveProperty('gender', 'female');
      expect(response.body).toHaveProperty('goal', 'Lose weight');

      // Verify in database
      const dbProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
      expect(dbProfile).not.toBeNull();
      expect(dbProfile?.age).toBe(30);
    });

    it('should update existing profile', async () => {
      const { token, user } = await createTestUser('updateprofile@example.com');

      // Create initial profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          age: 25,
          gender: 'male',
          height: 180,
          weight: 75,
          goal: 'Build muscle',
          activityLevel: 'moderate',
        },
      });

      // Update profile
      const updateData = {
        age: 26,
        weight: 77,
        goal: 'Maintain fitness',
      };

      const response = await request(testApp)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('age', 26);
      expect(response.body).toHaveProperty('weight', 77);
      expect(response.body).toHaveProperty('goal', 'Maintain fitness');
      // Should keep unchanged fields
      expect(response.body).toHaveProperty('height', 180);
      expect(response.body).toHaveProperty('gender', 'male');
    });

    it('should validate profile data', async () => {
      const { token } = await createTestUser('invalid@example.com');

      const response = await request(testApp)
        .put('/api/v1/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          age: -5, // Invalid age
          weight: 'invalid', // Invalid type
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 without authentication', async () => {
      await request(testApp)
        .put('/api/v1/profile')
        .send({ age: 25 })
        .expect(401);
    });
  });

  describe('Profile Data Integrity', () => {
    it('should handle concurrent profile updates correctly', async () => {
      const { token, user } = await createTestUser('concurrent@example.com');

      // Create initial profile
      await prisma.profile.create({
        data: {
          userId: user.id,
          age: 25,
          gender: 'male',
          height: 180,
          weight: 75,
          goal: 'Build muscle',
          activityLevel: 'moderate',
        },
      });

      // Simulate concurrent updates
      const updates = [
        request(testApp)
          .put('/api/v1/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({ weight: 76 }),
        request(testApp)
          .put('/api/v1/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({ weight: 77 }),
      ];

      await Promise.all(updates);

      // Verify final state is consistent
      const finalProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });

      expect(finalProfile).not.toBeNull();
      expect([76, 77]).toContain(finalProfile?.weight);
    });
  });
});



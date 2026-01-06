import request from 'supertest';
import { testApp, prisma, cleanDatabase, closeDatabase, createTestUser } from '../setup/test-server';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Wait for app to be ready
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'SecurePass123',
        name: 'New User',
      };

      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');

      // Verify user in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.email).toBe(userData.email);
    });

    it('should not register user with duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePass123',
        name: 'First User',
      };

      // First registration
      await request(testApp).post('/api/v1/auth/register').send(userData).expect(201);

      // Second registration with same email
      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          // missing password and name
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate email format', async () => {
      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should validate password length', async () => {
      const response = await request(testApp)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const userData = {
        email: 'login@example.com',
        password: 'SecurePass123',
        name: 'Login User',
      };

      // Register user first
      await request(testApp).post('/api/v1/auth/register').send(userData);

      // Login
      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');

      // Verify cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=');
    });

    it('should not login with incorrect password', async () => {
      const userData = {
        email: 'wrongpass@example.com',
        password: 'CorrectPass123',
        name: 'Test User',
      };

      // Register user first
      await request(testApp).post('/api/v1/auth/register').send(userData);

      // Try to login with wrong password
      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(testApp)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const { token, user } = await createTestUser('me@example.com');

      const response = await request(testApp)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await request(testApp).get('/api/v1/auth/me').expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(testApp)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const { token } = await createTestUser('logout@example.com');

      const response = await request(testApp)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verify cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('token=;');
    });
  });
});



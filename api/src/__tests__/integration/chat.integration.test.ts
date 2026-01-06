import request from 'supertest';
import { testApp, prisma, cleanDatabase, closeDatabase, createTestUser } from '../setup/test-server';

describe('Chat Integration Tests', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await closeDatabase();
  });

  describe('POST /api/v1/chat', () => {
    it('should send message and receive AI response', async () => {
      const { token, user } = await createTestUser('chat@example.com');

      const response = await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'What is a good workout for beginners?',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toBeTruthy();

      // Verify messages stored in database
      const messages = await prisma.chatMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
      });

      expect(messages).toHaveLength(2); // User message + AI response
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('What is a good workout for beginners?');
      expect(messages[1].role).toBe('assistant');
    });

    it('should validate message content', async () => {
      const { token } = await createTestUser('validate@example.com');

      const response = await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '', // Empty message
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should include profile context in AI request', async () => {
      const { token, user } = await createTestUser('context@example.com');

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
        },
      });

      const response = await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Create a workout plan for me',
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toBeTruthy();
    });

    it('should maintain conversation history', async () => {
      const { token, user } = await createTestUser('history@example.com');

      // First message
      await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I want to build muscle',
        })
        .expect(200);

      // Second message (referencing first)
      await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'What exercises should I do?',
        })
        .expect(200);

      // Verify both conversations stored
      const messages = await prisma.chatMessage.findMany({
        where: { userId: user.id },
      });

      expect(messages.length).toBeGreaterThanOrEqual(4); // 2 user messages + 2 AI responses
    });

    it('should return 401 without authentication', async () => {
      await request(testApp)
        .post('/api/v1/chat')
        .send({
          message: 'Hello',
        })
        .expect(401);
    });

    it('should handle long messages', async () => {
      const { token } = await createTestUser('longmsg@example.com');

      const longMessage = 'a'.repeat(1000);

      const response = await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: longMessage,
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
    });

    it('should handle special characters in message', async () => {
      const { token } = await createTestUser('special@example.com');

      const response = await request(testApp)
        .post('/api/v1/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'What about @#$% exercises?',
        })
        .expect(200);

      expect(response.body).toHaveProperty('response');
    });
  });

  describe('GET /api/v1/chat/history', () => {
    it('should retrieve chat history', async () => {
      const { token, user } = await createTestUser('gethistory@example.com');

      // Create some chat messages
      await prisma.chatMessage.createMany({
        data: [
          {
            userId: user.id,
            role: 'user',
            content: 'Hello',
          },
          {
            userId: user.id,
            role: 'assistant',
            content: 'Hi! How can I help you?',
          },
          {
            userId: user.id,
            role: 'user',
            content: 'What exercises should I do?',
          },
          {
            userId: user.id,
            role: 'assistant',
            content: 'Here are some exercises...',
          },
        ],
      });

      const response = await request(testApp)
        .get('/api/v1/chat/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);
      expect(response.body[0]).toHaveProperty('role');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('createdAt');
    });

    it('should support pagination', async () => {
      const { token, user } = await createTestUser('pagination@example.com');

      // Create multiple messages
      const messages = [];
      for (let i = 0; i < 25; i++) {
        messages.push({
          userId: user.id,
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i}`,
        });
      }
      await prisma.chatMessage.createMany({ data: messages });

      // Get first page
      const response = await request(testApp)
        .get('/api/v1/chat/history?limit=10&offset=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.length).toBe(10);
    });

    it('should return empty array for new user', async () => {
      const { token } = await createTestUser('newuser@example.com');

      const response = await request(testApp)
        .get('/api/v1/chat/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).get('/api/v1/chat/history').expect(401);
    });

    it('should order messages chronologically', async () => {
      const { token, user } = await createTestUser('order@example.com');

      // Create messages with different timestamps
      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          role: 'user',
          content: 'First message',
          createdAt: new Date('2024-01-01'),
        },
      });

      await prisma.chatMessage.create({
        data: {
          userId: user.id,
          role: 'user',
          content: 'Second message',
          createdAt: new Date('2024-01-02'),
        },
      });

      const response = await request(testApp)
        .get('/api/v1/chat/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body[0].content).toBe('First message');
      expect(response.body[1].content).toBe('Second message');
    });
  });

  describe('DELETE /api/v1/chat/history', () => {
    it('should clear chat history', async () => {
      const { token, user } = await createTestUser('clear@example.com');

      // Create messages
      await prisma.chatMessage.createMany({
        data: [
          {
            userId: user.id,
            role: 'user',
            content: 'Message 1',
          },
          {
            userId: user.id,
            role: 'assistant',
            content: 'Response 1',
          },
        ],
      });

      await request(testApp)
        .delete('/api/v1/chat/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify cleared
      const messages = await prisma.chatMessage.findMany({
        where: { userId: user.id },
      });

      expect(messages.length).toBe(0);
    });

    it('should return 401 without authentication', async () => {
      await request(testApp).delete('/api/v1/chat/history').expect(401);
    });
  });
});




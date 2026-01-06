# Integration Tests

Comprehensive integration tests for the AI Fitness Trainer API.

## 📁 Structure

```
__tests__/
├── setup/
│   └── test-server.ts        # Test server setup and utilities
└── integration/
    ├── auth.integration.test.ts        # Authentication endpoints
    ├── profile.integration.test.ts     # Profile management
    ├── workout.integration.test.ts     # Workout CRUD & logging
    ├── progress.integration.test.ts    # Progress tracking
    └── chat.integration.test.ts        # AI chat functionality
```

## 🧪 What Integration Tests Cover

### Authentication (`auth.integration.test.ts`)
- ✅ User registration with validation
- ✅ Login with valid/invalid credentials
- ✅ JWT token generation and verification
- ✅ Session management (logout)
- ✅ Protected endpoint access
- ✅ Duplicate email handling

### Profile Management (`profile.integration.test.ts`)
- ✅ Profile creation and updates
- ✅ Profile retrieval
- ✅ Field validation
- ✅ Data persistence
- ✅ Concurrent update handling

### Workouts (`workout.integration.test.ts`)
- ✅ Workout template retrieval
- ✅ Custom workout creation with exercises
- ✅ Workout CRUD operations
- ✅ Workout logging and history
- ✅ User-specific data isolation
- ✅ Statistics calculation

### Progress Tracking (`progress.integration.test.ts`)
- ✅ Progress entry creation (weight, measurements)
- ✅ Progress history retrieval
- ✅ Date range filtering
- ✅ Statistics calculation
- ✅ Entry updates and deletion
- ✅ Pagination support

### AI Chat (`chat.integration.test.ts`)
- ✅ Message sending and AI responses
- ✅ Conversation history persistence
- ✅ Context awareness (profile data)
- ✅ Message validation
- ✅ Chat history pagination
- ✅ History clearing

## 🚀 Running Integration Tests

### All Integration Tests
```bash
npm run test:integration
```

### Specific Test File
```bash
npm run test:integration -- auth.integration.test.ts
```

### Watch Mode
```bash
npm run test:integration:watch
```

### Run All Tests (Unit + Integration)
```bash
npm run test:all
```

## 🔧 Test Configuration

### Environment Setup
- **Database**: Uses test database (separate from development)
- **Redis**: Mocked for consistent test results
- **AI Services**: Mocked (Ollama/OpenAI) to avoid external dependencies
- **Authentication**: Real JWT tokens generated per test

### Test Database
Set your test database URL in `.env.test`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_fitness_trainer_test
```

Or the tests will default to:
```
postgresql://postgres:password@localhost:5432/ai_fitness_trainer_test
```

### Test Isolation
- Each test suite cleans the database before running
- Tests run sequentially (`maxWorkers: 1`) to avoid conflicts
- All mocks are cleared between tests
- Database connection closed after all tests

## 📊 Test Coverage

Integration tests validate:
- **End-to-end API flows**: Full request → response cycles
- **Database operations**: Data persistence and retrieval
- **Authentication**: JWT middleware and authorization
- **Business logic**: Service layer integration
- **Error handling**: Proper error responses
- **Data validation**: Input validation at API level

## 🛠️ Test Utilities

### `test-server.ts`
Provides helper functions:

```typescript
// Create authenticated test user
const { token, user } = await createTestUser('test@example.com');

// Clean entire database
await cleanDatabase();

// Close database connection
await closeDatabase();
```

### Making Authenticated Requests
```typescript
const response = await request(testApp)
  .get('/api/v1/profile')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```

## ✅ Best Practices

### 1. Clean State
Always clean database before each test:
```typescript
beforeEach(async () => {
  await cleanDatabase();
});
```

### 2. Unique Email Addresses
Use unique emails to avoid conflicts:
```typescript
const { token } = await createTestUser('unique@example.com');
```

### 3. Test Isolation
Don't depend on data from other tests

### 4. Descriptive Test Names
```typescript
it('should return 404 for non-existent workout', async () => {
  // ...
});
```

### 5. Verify Database State
Check database after operations:
```typescript
const dbUser = await prisma.user.findUnique({
  where: { email: userData.email },
});
expect(dbUser).not.toBeNull();
```

## 🔍 Debugging Tests

### Run Single Test
```bash
npm run test:integration -- -t "should register a new user"
```

### Verbose Output
```bash
npm run test:integration -- --verbose
```

### See SQL Queries
Set in `.env.test`:
```env
DATABASE_URL=postgresql://...?connection_limit=1&pool_timeout=20&log=query
```

## 📝 Adding New Integration Tests

1. Create test file: `src/__tests__/integration/feature.integration.test.ts`
2. Import test utilities:
   ```typescript
   import { testApp, cleanDatabase, createTestUser } from '../setup/test-server';
   ```
3. Setup/teardown:
   ```typescript
   beforeEach(async () => await cleanDatabase());
   afterAll(async () => {
     await cleanDatabase();
     await closeDatabase();
   });
   ```
4. Write tests using supertest:
   ```typescript
   it('should do something', async () => {
     const { token } = await createTestUser();
     
     const response = await request(testApp)
       .post('/api/v1/endpoint')
       .set('Authorization', `Bearer ${token}`)
       .send({ data: 'value' })
       .expect(200);
       
     expect(response.body).toHaveProperty('field');
   });
   ```

## 🎯 Coverage Goals

Current Integration Test Coverage:
- ✅ **Auth**: 100% (13 tests)
- ✅ **Profile**: 100% (8 tests)
- ✅ **Workouts**: 100% (15 tests)
- ✅ **Progress**: 100% (18 tests)
- ✅ **Chat**: 100% (14 tests)

**Total: 68 integration tests**

## 🐛 Common Issues

### Database Connection Errors
```bash
# Ensure PostgreSQL is running
docker-compose -f config/docker-compose.dev.yml up -d postgres

# Run migrations
cd api
npx prisma migrate deploy
```

### Port Already in Use
```bash
# Kill process using port 5001
lsof -ti:5001 | xargs kill -9
```

### Redis Connection Warnings
Redis is mocked in tests, but warnings may appear. This is safe to ignore.

## 📚 Resources

- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)

---

**Tip**: Run integration tests before pushing to catch API regressions early!


# ✅ Step 2 Complete: Middleware Layer Added

## What We Built

### 1. **Auth Middleware** (`src/middleware/auth.middleware.ts`)
**Purpose:** Protect routes that require authentication

**How it works:**
- Extracts JWT token from `Authorization: Bearer <token>` header
- Verifies token signature and expiration
- Adds `req.user.userId` to request object
- Returns 401 if token is missing/invalid

**Usage:**
```typescript
import { authenticate } from '../middleware';

router.get('/profile', authenticate, (req, res) => {
  // req.user.userId is available here
  res.json({ userId: req.user.userId });
});
```

---

### 2. **Validation Middleware** (`src/middleware/validation.middleware.ts`)
**Purpose:** Validate request data before processing

**How it works:**
- Uses Zod schemas to validate request body/query/params
- Returns 400 with detailed field errors if validation fails
- Replaces raw data with validated, type-safe data

**Usage:**
```typescript
import { z } from 'zod';
import { validateBody } from '../middleware';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

router.post('/signup', validateBody(signupSchema), (req, res) => {
  // req.body is validated and type-safe!
  const { email, password, name } = req.body;
});
```

---

### 3. **Error Handler Middleware** (`src/middleware/error.middleware.ts`)
**Purpose:** Centralized error handling

**How it works:**
- Catches ALL errors thrown in routes/middleware
- Logs errors for debugging
- Returns appropriate HTTP status codes
- Hides sensitive info in production

**Usage:**
```typescript
import { AppError, asyncHandler } from '../middleware';

// Throw custom errors
router.get('/user/:id', asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json(user);
}));
```

---

## File Structure

```
src/
├── middleware/
│   ├── auth.middleware.ts      # JWT authentication
│   ├── validation.middleware.ts # Zod validation
│   ├── error.middleware.ts     # Error handling
│   └── index.ts                 # Central exports
├── app.ts                       # Updated to use error handler
└── ...
```

---

## Key Concepts Explained

### **Middleware Order Matters!**
```typescript
// ✅ CORRECT ORDER:
app.use(helmet());           // Security headers
app.use(cors());             // CORS
app.use(express.json());     // Parse JSON
app.use(logger);             // Logging
app.use('/api', routes);     // Routes
app.use(errorHandler);       // Error handler LAST!
```

**Why?** Error handler must be last to catch errors from all routes.

### **Middleware Chain**
When a request comes in:
1. Security middleware (helmet, CORS)
2. Parsing middleware (express.json)
3. Route-specific middleware (auth, validation)
4. Route handler
5. Error handler (if error occurred)

### **Type Safety**
- `AuthenticatedRequest` extends `Request` with `user` property
- Zod schemas provide runtime validation + TypeScript types
- `AppError` allows typed error handling

---

## Next Steps

Now we can:
1. ✅ Protect routes with authentication
2. ✅ Validate all request data
3. ✅ Handle errors consistently
4. ✅ Use type-safe request data

**Ready for Step 3:** Update auth routes to use validation middleware!


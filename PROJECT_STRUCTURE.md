# AI Fitness Trainer - Project Structure

## 📁 Root Directory Structure

```
ai-trainer/
├── api/                          # Backend API (Express + TypeScript)
├── ai-trainer-frontend/          # Frontend (Next.js 15 + TypeScript)
├── config/                       # Docker compose and configuration files
│   ├── docker-compose.yml
│   └── docker-compose.dev.yml
├── docs/                         # Project documentation
│   ├── CLEAN_CODEBASE_AUDIT.md
│   ├── IMPROVEMENTS.md
│   ├── PROJECT_STRUCTURE.md
│   └── STEP_*.md                # Development step documentation
├── scripts/                      # Build and utility scripts
│   └── Makefile
├── .github/                      # GitHub Actions workflows
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline
└── README.md                     # Main project documentation

```

## 🔧 API Structure

```
api/
├── src/
│   ├── config/                   # Configuration files
│   │   ├── index.ts             # Environment config
│   │   └── swagger.ts           # API documentation config
│   ├── constants/                # Application constants
│   │   ├── enums.ts             # Enums (HttpStatus, ErrorCode, etc.)
│   │   ├── index.ts             # Constants export
│   │   └── messages.ts          # Standard messages
│   ├── dtos/                     # Data Transfer Objects
│   │   ├── chat.dto.ts
│   │   ├── profile.dto.ts
│   │   └── user.dto.ts
│   ├── lib/                      # External service integrations
│   │   ├── ollama.ts            # AI service (Ollama)
│   │   ├── openai.ts            # AI service (OpenAI)
│   │   ├── prisma.ts            # Database client
│   │   └── redis.ts             # Cache client
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── error.middleware.ts  # Error handling
│   │   ├── rate-limit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── repositories/             # Data access layer
│   │   ├── chat.repository.ts
│   │   ├── profile.repository.ts
│   │   └── user.repository.ts
│   ├── routes/                   # API routes
│   │   ├── auth.routes.ts
│   │   ├── auth.schemas.ts
│   │   ├── chat.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── progress.routes.ts
│   │   └── workout.routes.ts
│   ├── services/                 # Business logic
│   │   ├── __tests__/           # Service unit tests
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── profile.service.ts
│   │   ├── progress.service.ts
│   │   └── workout.service.ts
│   ├── utils/                    # Utility functions
│   │   ├── errors.ts            # Custom error classes
│   │   ├── logger.ts            # Winston logger
│   │   └── validators.ts        # Validation utilities
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
├── prisma/
│   ├── migrations/               # Database migrations
│   ├── schema.prisma            # Database schema
│   └── seed-workouts.ts         # Database seeding
├── Dockerfile                    # Production Docker image
├── jest.config.js               # Jest test configuration
├── package.json
├── tsconfig.json
└── README.md

```

## 🎨 Frontend Structure

```
ai-trainer-frontend/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Protected dashboard pages
│   │   ├── __tests__/          # Page tests
│   │   ├── layout.tsx          # Dashboard layout
│   │   ├── page.tsx            # Main dashboard (chat)
│   │   ├── profile/            # Profile management
│   │   ├── progress/           # Progress tracking
│   │   └── workouts/           # Workout management
│   ├── login/                   # Login page
│   │   ├── __tests__/
│   │   └── page.tsx
│   ├── signup/                  # Signup page
│   │   ├── __tests__/
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── globals.css             # Global styles
├── components/                   # Reusable components
│   ├── error-boundary.tsx
│   ├── protected-route.tsx
│   └── providers.tsx
├── contexts/                     # React contexts
│   └── auth-context.tsx        # Authentication state
├── hooks/                        # Custom React hooks
│   ├── index.ts
│   ├── useAuth.ts
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useToggle.ts
├── lib/                          # Core libraries
│   ├── __tests__/              # Library tests
│   ├── api.ts                  # API client
│   ├── constants.ts            # Frontend constants
│   ├── utils.ts                # Utility functions
│   └── validation.ts           # Form validation
├── types/                        # TypeScript types
│   └── index.ts
├── __tests__/                    # Test configuration
│   ├── config/
│   │   ├── jest.setup.ts       # Jest setup file
│   │   └── jest.d.ts           # Jest type definitions
│   └── utils/
│       └── test-utils.tsx      # Testing utilities
├── public/                       # Static assets
├── Dockerfile                    # Production Docker image
├── eslint.config.mjs            # ESLint configuration
├── jest.config.ts               # Jest configuration
├── next.config.ts               # Next.js configuration
├── package.json
├── postcss.config.mjs           # PostCSS configuration
├── tsconfig.json                # TypeScript configuration
└── README.md

```

## 🧪 Testing Structure

### API Tests
- Unit tests: `api/src/services/__tests__/`
- Test command: `cd api && npm test`
- Coverage: 52/52 tests passing

### Frontend Tests  
- Component tests: `app/**/__tests__/`
- Lib tests: `lib/__tests__/`
- Test utilities: `__tests__/utils/test-utils.tsx`
- Test config: `__tests__/config/`
- Test command: `cd ai-trainer-frontend && npm test`

## 🐳 Docker Setup

### Development
```bash
docker-compose -f config/docker-compose.dev.yml up
```

### Production
```bash
docker-compose -f config/docker-compose.yml up
```

## 🚀 Quick Start

### Using Make (Recommended)
```bash
cd scripts
make dev      # Start development environment
make test     # Run all tests
make build    # Build for production
make clean    # Clean up containers
```

### Manual Setup
```bash
# Backend
cd api
npm install
npm run dev

# Frontend
cd ai-trainer-frontend
npm install
npm run dev
```

## 📦 Key Technologies

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **AI**: Ollama (llama3.1)
- **Testing**: Jest
- **Auth**: JWT with httpOnly cookies

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 19 + TailwindCSS
- **State**: React Context + Hooks
- **Testing**: Jest + React Testing Library
- **API Client**: Fetch API
- **Validation**: Custom validators

## 📝 Environment Variables

See `.env.example` files in:
- `/api/.env.example`
- `/ai-trainer-frontend/.env.example`

## 🔄 CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

**Pipeline Steps:**
1. Code Quality (Lint & Type Check)
2. Backend Tests
3. Frontend Tests
4. Docker Build & Integration Tests
5. Security Scan
6. Build Verification

## 📚 Documentation

All documentation is centralized in the `/docs` folder:
- Architecture decisions
- Development steps
- Code improvements
- API documentation (via Swagger at `/api-docs`)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit with clear messages
6. Push and create PR

---

**Last Updated**: January 2026
**Project Status**: Active Development


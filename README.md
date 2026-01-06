# 🏋️ AI Personal Trainer

A full-stack AI-powered personal fitness trainer application that provides personalized workout plans, nutrition advice, and progress tracking through an intelligent chat interface.

## ✨ Features

- 🤖 **AI-Powered Chat**: Interactive fitness advice using Ollama (llama3.1)
- 💪 **Workout Management**: Pre-built templates and custom workout creation
- 📊 **Progress Tracking**: Monitor weight, measurements, and workout history
- 👤 **User Profiles**: Personalized fitness profiles with goals and preferences
- 🔒 **Secure Authentication**: JWT-based auth with httpOnly cookies
- 📱 **Responsive Design**: Modern, mobile-friendly interface

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Docker** & Docker Compose
- **PostgreSQL** 14+
- **Redis** 7+
- **Ollama** (for local AI)

### Option 1: Using Make (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-chat-app.git
cd ai-trainer

# Start development environment
cd scripts
make dev
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd api && npm install
cd ../ai-trainer-frontend && npm install

# Setup environment variables
cp api/.env.example api/.env
cp ai-trainer-frontend/.env.example ai-trainer-frontend/.env

# Setup database
cd api
npx prisma migrate dev
npx prisma db seed

# Start services
cd api && npm run dev        # API on :5001
cd ai-trainer-frontend && npm run dev  # Frontend on :3000
```

### Option 3: Docker Compose

```bash
# Development
docker-compose -f config/docker-compose.dev.yml up

# Production
docker-compose -f config/docker-compose.yml up
```

## 📁 Project Structure

```
ai-trainer/
├── api/                    # Backend API (Express + TypeScript)
├── ai-trainer-frontend/    # Frontend (Next.js 15 + React 19)
├── config/                 # Docker compose configurations
├── docs/                   # Project documentation
├── scripts/                # Build and automation scripts
└── .github/                # CI/CD workflows
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed structure.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **AI**: Ollama (llama3.1)
- **Auth**: JWT with httpOnly cookies
- **Testing**: Jest (52/52 tests passing)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Styling**: TailwindCSS
- **State Management**: React Context + Hooks
- **API Client**: Fetch API
- **Testing**: Jest + React Testing Library

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript (strict mode)

## 🧪 Testing

```bash
# Run all tests
make test

# Backend tests only
cd api && npm test

# Frontend tests only
cd ai-trainer-frontend && npm test

# With coverage
npm test -- --coverage
```

**Test Coverage:**
- ✅ API: 52/52 tests passing
- ⚠️ Frontend: Tests configured (fixing in progress)

## 📚 Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Detailed file organization
- [API Documentation](docs/) - Backend architecture and patterns
- [Scripts Guide](scripts/README.md) - Automation and build tools
- [Swagger Docs](http://localhost:5001/api-docs) - Interactive API docs (when running)

## 🔧 Configuration

### API Configuration
Edit `api/.env`:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGIN=http://localhost:3000
```

### Frontend Configuration
Edit `ai-trainer-frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
NEXT_PUBLIC_ENV=development
```

## 🔐 Environment Variables

See `.env.example` files:
- `api/.env.example` - Backend configuration
- `ai-trainer-frontend/.env.example` - Frontend configuration

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Profile
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update profile

### Chat
- `POST /api/v1/chat` - Send chat message
- `GET /api/v1/chat/history` - Get chat history

### Workouts
- `GET /api/v1/workouts` - Get workouts
- `POST /api/v1/workouts` - Create workout
- `GET /api/v1/workouts/:id` - Get workout details

### Progress
- `GET /api/v1/progress` - Get progress entries
- `POST /api/v1/progress` - Log progress

## 🚢 Deployment

### Docker Production Build

```bash
# Build images
docker-compose -f config/docker-compose.yml build

# Deploy
docker-compose -f config/docker-compose.yml up -d

# View logs
docker-compose -f config/docker-compose.yml logs -f
```

### Environment-Specific Deployment

1. Set production environment variables
2. Run database migrations: `npx prisma migrate deploy`
3. Build frontend: `npm run build`
4. Start services: `npm start`

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. ✅ Lint & Type Check
2. ✅ Backend Tests
3. ⚠️ Frontend Tests 
4. ✅ Docker Build
5. 🔒 Security Scan
6. 📦 Build Verification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Run linter before committing: `npm run lint`
- Use conventional commit messages
- Update documentation as needed

## 📝 Available Scripts

### Root Level
```bash
npm run dev          # Start all services
npm test            # Run all tests
npm run lint        # Lint all code
npm run format      # Format all code
```

### API
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm test           # Run tests
npm run lint       # Lint code
npm run migrate    # Run migrations
```

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm test          # Run tests
npm run lint      # Lint code
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5001  # API
lsof -i :3000  # Frontend

# Or restart with make
make docker-down
make clean
make dev
```

### Database Connection Issues
```bash
# Reset database
cd api
npx prisma migrate reset
npx prisma db seed
```

### Redis Connection Issues
```bash
# Restart Redis
docker-compose -f config/docker-compose.dev.yml restart redis
```

### Ollama Not Responding
```bash
# Check Ollama service
curl http://localhost:11434/api/tags

# Restart Ollama
docker-compose -f config/docker-compose.dev.yml restart ollama
```

## 📊 Project Status

- ✅ Backend API - Production Ready
- ✅ Database Schema - Complete
- ✅ Authentication - Secure
- ✅ AI Integration - Working
- ✅ Frontend UI - Functional
- ⚠️ Frontend Tests - In Progress
- 🚧 Mobile App - Planned

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Backend**: Express.js + Prisma + PostgreSQL
- **Frontend**: Next.js 15 + React 19 + TailwindCSS
- **AI**: Ollama (llama3.1)
- **DevOps**: Docker + GitHub Actions

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local AI inference
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

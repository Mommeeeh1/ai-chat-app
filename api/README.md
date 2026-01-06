# AI Chat App - Backend

Production-ready AI chat application backend built with Node.js, TypeScript, Express, and Socket.io.

## 🚀 Features

- ✅ TypeScript with strict mode
- ✅ Express.js REST API
- ✅ Socket.io for real-time chat
- ✅ PostgreSQL + Prisma ORM
- ✅ JWT Authentication
- ✅ Ollama AI Integration
- ✅ Input validation (Zod)
- ✅ Security middleware (Helmet, CORS)
- ✅ Structured logging (Winston)
- ✅ ESLint + Prettier
- ✅ Jest testing

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 14

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

## 🏃 Running the App

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🔍 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type check
npm run type-check
```

## 📁 Project Structure

```
src/
├── server.ts           # Entry point
├── app.ts              # Express app setup
├── config/             # Configuration files
├── routes/             # API routes
├── controllers/        # Route controllers
├── services/           # Business logic
├── middleware/         # Custom middleware
├── websocket/          # Socket.io handlers
├── types/              # TypeScript types
├── utils/              # Utility functions
└── validators/         # Zod schemas
```

## 🔐 Environment Variables

See `.env.example` for required variables.

## 📚 API Documentation

Coming soon...

## 🤝 Contributing

This is a learning project. Feel free to experiment!

## 📄 License

MIT


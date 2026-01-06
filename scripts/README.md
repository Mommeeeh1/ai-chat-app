# Scripts & Automation

This folder contains automation scripts and build tools for the AI Fitness Trainer project.

## 🔧 Makefile Commands

The `Makefile` provides convenient shortcuts for common development tasks.

### Development

```bash
# Start all services in development mode
make dev

# Start only the API
make dev-api

# Start only the frontend
make dev-frontend

# Start with logs
make dev-logs
```

### Testing

```bash
# Run all tests (API + Frontend)
make test

# Run only API tests
make test-api

# Run only frontend tests
make test-frontend

# Run tests with coverage
make test-coverage
```

### Building

```bash
# Build all services for production
make build

# Build only API
make build-api

# Build only frontend
make build-frontend
```

### Database

```bash
# Run database migrations
make migrate

# Reset database
make db-reset

# Seed database
make db-seed

# Open Prisma Studio
make db-studio
```

### Docker

```bash
# Build Docker images
make docker-build

# Start Docker containers
make docker-up

# Stop Docker containers
make docker-down

# View Docker logs
make docker-logs

# Clean Docker volumes
make docker-clean
```

### Linting & Formatting

```bash
# Run linters on all code
make lint

# Run linters and fix issues
make lint-fix

# Format code
make format
```

### Utilities

```bash
# Clean build artifacts and node_modules
make clean

# Install all dependencies
make install

# Check health of all services
make health

# View all available commands
make help
```

## 📝 Usage Examples

### Starting Development Environment

```bash
cd scripts
make dev
```

This will:
1. Start PostgreSQL database
2. Start Redis cache
3. Start API server on port 5001
4. Start Frontend on port 3000
5. Start Ollama AI service

### Running Tests Before Commit

```bash
make test
```

### Full Reset and Fresh Start

```bash
make clean
make install
make db-reset
make db-seed
make dev
```

### Building for Production

```bash
make build
make docker-build
```

## 🔍 Troubleshooting

### Port Already in Use
```bash
make docker-down
make clean
make dev
```

### Database Issues
```bash
make db-reset
make migrate
make db-seed
```

### Clean Install
```bash
make clean
rm -rf node_modules package-lock.json
make install
```

## 📦 Requirements

- **Make**: Install via package manager
  - Windows: `choco install make`
  - Mac: `brew install make`
  - Linux: `sudo apt install make`
- **Docker**: For containerized environment
- **Node.js**: v18+ for local development

## 🤝 Contributing

When adding new scripts:
1. Add them to the Makefile with clear names
2. Document them in this README
3. Include help text in the Makefile

---

For more information, see the main [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md)




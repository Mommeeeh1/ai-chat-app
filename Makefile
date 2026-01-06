# AI Trainer - Docker Management Makefile
# This file provides convenient commands for managing Docker services

.PHONY: help build up down restart logs clean test seed migrate

# Default target - show help
help:
	@echo "🚀 AI Trainer - Docker Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Available commands:"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make build       - Build/rebuild Docker images"
	@echo "  make logs        - View logs (all services)"
	@echo "  make logs-api    - View API logs only"
	@echo "  make logs-frontend - View Frontend logs only"
	@echo "  make clean       - Stop and remove all containers, volumes"
	@echo "  make test        - Run tests in API container"
	@echo "  make seed        - Seed database with sample data"
	@echo "  make migrate     - Run database migrations"
	@echo "  make shell-api   - Open shell in API container"
	@echo "  make shell-db    - Open PostgreSQL shell"
	@echo "  make ps          - Show running containers"
	@echo "  make dev         - Start only database and Redis for local development"
	@echo ""

# Start all services
up:
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ Services started! Frontend: http://localhost:3001, API: http://localhost:3000"

# Stop all services
down:
	@echo "🛑 Stopping all services..."
	docker-compose down

# Restart all services
restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart

# Build/rebuild images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

# Build without cache (clean build)
build-clean:
	@echo "🔨 Building Docker images (no cache)..."
	docker-compose build --no-cache

# View all logs
logs:
	docker-compose logs -f

# View API logs
logs-api:
	docker-compose logs -f api

# View Frontend logs
logs-frontend:
	docker-compose logs -f frontend

# View PostgreSQL logs
logs-db:
	docker-compose logs -f postgres

# Clean everything (removes volumes)
clean:
	@echo "🧹 Cleaning up (this will delete all data)..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"

# Run tests in API container
test:
	@echo "🧪 Running tests..."
	docker-compose exec api npm test

# Run tests with coverage
test-coverage:
	@echo "🧪 Running tests with coverage..."
	docker-compose exec api npm run test:coverage

# Seed database
seed:
	@echo "🌱 Seeding database..."
	docker-compose exec api npx prisma db seed

# Run migrations
migrate:
	@echo "📊 Running database migrations..."
	docker-compose exec api npx prisma migrate deploy

# Generate Prisma Client
generate:
	@echo "⚙️ Generating Prisma Client..."
	docker-compose exec api npx prisma generate

# Open shell in API container
shell-api:
	docker-compose exec api sh

# Open shell in Frontend container
shell-frontend:
	docker-compose exec frontend sh

# Open PostgreSQL shell
shell-db:
	docker-compose exec postgres psql -U aitrainer -d aitrainer

# Open Redis CLI
shell-redis:
	docker-compose exec redis redis-cli

# Show running containers
ps:
	docker-compose ps

# Show resource usage
stats:
	docker stats --no-stream

# Development mode (only database and Redis)
dev:
	@echo "🛠️ Starting development services (database and Redis only)..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo "✅ Development services started!"
	@echo "📝 Now run 'npm run dev' in both api/ and ai-trainer-frontend/ directories"

# Stop development services
dev-down:
	@echo "🛑 Stopping development services..."
	docker-compose -f docker-compose.dev.yml down

# Backup database
backup:
	@echo "💾 Creating database backup..."
	docker-compose exec postgres pg_dump -U aitrainer aitrainer > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created!"

# Restore database from backup (usage: make restore FILE=backup.sql)
restore:
	@echo "📥 Restoring database from $(FILE)..."
	docker-compose exec -T postgres psql -U aitrainer aitrainer < $(FILE)
	@echo "✅ Database restored!"

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:3000/health | jq . || echo "❌ API not responding"
	@curl -s http://localhost:3001 > /dev/null && echo "✅ Frontend is up" || echo "❌ Frontend not responding"



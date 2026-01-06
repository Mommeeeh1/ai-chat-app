# AI Trainer - Windows Development Startup Script
# This script starts all required services for development

Write-Host "🚀 Starting AI Trainer Development Environment" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Docker services (PostgreSQL and Redis)
Write-Host "📦 Step 1: Starting Docker services (PostgreSQL & Redis)..." -ForegroundColor Yellow
docker-compose -f config/docker-compose.dev.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services. Make sure Docker is running." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker services started!" -ForegroundColor Green
Write-Host "   Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 2: Check if .env files exist
Write-Host ""
Write-Host "📝 Step 2: Checking environment files..." -ForegroundColor Yellow

if (-not (Test-Path "api\.env")) {
    Write-Host "⚠️  api/.env not found. Creating from defaults..." -ForegroundColor Yellow
    @"
NODE_ENV=development
PORT=3000
HOST=localhost
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-security
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3001
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
DATABASE_URL=postgresql://aitrainer:aitrainer_dev_password@localhost:5432/aitrainer_dev
"@ | Out-File -FilePath "api\.env" -Encoding utf8
    Write-Host "✅ Created api/.env" -ForegroundColor Green
} else {
    Write-Host "✅ api/.env exists" -ForegroundColor Green
}

if (-not (Test-Path "ai-trainer-frontend\.env.local")) {
    Write-Host "⚠️  ai-trainer-frontend/.env.local not found. Creating from defaults..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:3000
"@ | Out-File -FilePath "ai-trainer-frontend\.env.local" -Encoding utf8
    Write-Host "✅ Created ai-trainer-frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "✅ ai-trainer-frontend/.env.local exists" -ForegroundColor Green
}

# Step 3: Install dependencies if needed
Write-Host ""
Write-Host "📦 Step 3: Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "api\node_modules")) {
    Write-Host "   Installing API dependencies..." -ForegroundColor Yellow
    Set-Location api
    npm install
    Set-Location ..
}

if (-not (Test-Path "ai-trainer-frontend\node_modules")) {
    Write-Host "   Installing Frontend dependencies..." -ForegroundColor Yellow
    Set-Location ai-trainer-frontend
    npm install
    Set-Location ..
}

Write-Host "✅ Dependencies ready" -ForegroundColor Green

# Step 4: Setup database
Write-Host ""
Write-Host "🗄️  Step 4: Setting up database..." -ForegroundColor Yellow
Set-Location api
Write-Host "   Running Prisma migrations..." -ForegroundColor Yellow
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "   Running Prisma migrations (dev mode)..." -ForegroundColor Yellow
    npx prisma migrate dev
}
Write-Host "   Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
Set-Location ..

Write-Host "✅ Database ready" -ForegroundColor Green

# Step 5: Start services
Write-Host ""
Write-Host "🎯 Step 5: Starting services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📌 To start the services, open TWO separate terminal windows:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Terminal 1 (API):" -ForegroundColor Yellow
Write-Host "   cd api" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   cd ai-trainer-frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Once started:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "   - API: http://localhost:3000" -ForegroundColor White
Write-Host "   - API Docs: http://localhost:3000/api-docs" -ForegroundColor White
Write-Host ""


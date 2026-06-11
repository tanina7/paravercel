# Docker Compose Startup Script for Windows

Write-Host "🐳 Iniciando Docker Compose..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
$dockerTest = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está corriendo. Por favor abre Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "1. Construyendo imágenes..." -ForegroundColor Yellow
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir imágenes" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Iniciando servicios..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Esperando a que MySQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "✅ ¡Listo!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Accede a: " -NoNewline
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Ver logs: " -NoNewline
Write-Host "docker-compose logs -f app" -ForegroundColor Yellow
Write-Host "Parar todo: " -NoNewline
Write-Host "docker-compose down" -ForegroundColor Yellow

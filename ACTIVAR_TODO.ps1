# VTC Capacitación — Script de Activación Automática
# Ejecutar: powershell -ExecutionPolicy Bypass -File ACTIVAR_TODO.ps1

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🚀 VTC Capacitación — Activación Automática" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# PASO 1: Verificaciones previas
Write-Host "⏳ Verificando requisitos..." -ForegroundColor Yellow

$nodeVersion = node --version 2>&1
if ($nodeVersion -like "v*") {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js no encontrado. Descarga desde: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

$pythonVersion = python --version 2>&1
if ($pythonVersion -like "*3.*") {
    Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Python no encontrado. Descarga desde: https://www.python.org/downloads/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Todos los requisitos están cumplidos" -ForegroundColor Green
Write-Host ""

# PASO 2: Instalar backend
Write-Host "⏳ Instalando dependencias backend..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando npm packages" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend instalado" -ForegroundColor Green
Write-Host ""

# PASO 3: Generar timelines
Write-Host "⏳ Generando timelines para todos los módulos..." -ForegroundColor Yellow
python generators/gen-timeline.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error generando timelines" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Timelines generados" -ForegroundColor Green
Write-Host ""

# PASO 4: Verificar que existen
Write-Host "⏳ Verificando archivos generados..." -ForegroundColor Yellow
$timelineCount = (Get-ChildItem data/modulos/timeline-*.json 2>/dev/null).Count
if ($timelineCount -ge 13) {
    Write-Host "✅ $timelineCount timelines creados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Solo $timelineCount timelines encontrados (esperados 13)" -ForegroundColor Yellow
}
Write-Host ""

# INFORMACIÓN FINAL
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✅ ACTIVACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  En ESTA terminal, inicia el backend:" -ForegroundColor White
Write-Host "    npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2️⃣  En OTRA terminal (nueva), inicia el frontend:" -ForegroundColor White
Write-Host "    cd C:\Users\inbou\vtc-capacitacion-deploy\frontend" -ForegroundColor Yellow
Write-Host "    npx http-server" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Abre tu navegador en:" -ForegroundColor White
Write-Host "    http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Login con:" -ForegroundColor White
Write-Host "    Nombre: Pablo Solar" -ForegroundColor Yellow
Write-Host "    Email: test@test.com" -ForegroundColor Yellow
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "¿Necesitas ayuda?" -ForegroundColor Cyan
Write-Host "Lee: ACTIVACION_MANUAL.md o INSTRUCCIONES_FINALES.txt" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan

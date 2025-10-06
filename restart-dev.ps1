# Script to restart both frontend and backend dev servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Restarting Create Kuji Development Servers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing node processes (be careful with this on production!)
Write-Host "Stopping existing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

Write-Host "✓ Node processes stopped" -ForegroundColor Green
Write-Host ""

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
$backendPath = Join-Path $PSScriptRoot "server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal

Write-Host "✓ Backend server started (check new window)" -ForegroundColor Green
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host "✓ Frontend server started (check new window)" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Both servers should now be starting!" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

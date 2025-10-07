# Make Demo Username Permanent Script
# This script updates the demo user to have a permanent username instead of temporary

Write-Host "🔧 Making Demo Username Permanent" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if we're in the server directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the server directory." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "❌ Error: node_modules not found. Please run 'npm install' first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found. Using .env.example defaults..." -ForegroundColor Yellow
}

Write-Host "🚀 Running demo username permanent script..." -ForegroundColor Green

try {
    # Run the TypeScript script
    npm run demo:permanent
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Script completed successfully!" -ForegroundColor Green
        Write-Host "🎉 Demo user now has a permanent username." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Script failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit $LASTEXITCODE
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running script: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Cyan
Write-Host "   - Demo user 'demo' now has a permanent username" -ForegroundColor White
Write-Host "   - Username cannot be changed anymore" -ForegroundColor White
Write-Host "   - Demo experience will be consistent for all users" -ForegroundColor White
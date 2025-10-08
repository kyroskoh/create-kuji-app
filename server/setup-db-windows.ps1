# PostgreSQL Database Setup Script for Windows
# This script helps set up the Create Kuji database with proper permissions

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Create Kuji Database Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator. Some operations may fail." -ForegroundColor Yellow
    Write-Host "Consider running PowerShell as Administrator for best results." -ForegroundColor Yellow
    Write-Host ""
}

# Get database configuration from user
Write-Host "Please provide your database configuration:" -ForegroundColor Green
Write-Host ""

$dbName = Read-Host "Database name (default: create_kuji_db)"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "create_kuji_db" }

$dbUser = Read-Host "Database username (default: create_kuji_user)"
if ([string]::IsNullOrWhiteSpace($dbUser)) { $dbUser = "create_kuji_user" }

$dbPassword = Read-Host "Database password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

if ([string]::IsNullOrWhiteSpace($dbPasswordPlain)) {
    Write-Host "ERROR: Password cannot be empty!" -ForegroundColor Red
    exit 1
}

$dbHost = Read-Host "Database host (default: localhost)"
if ([string]::IsNullOrWhiteSpace($dbHost)) { $dbHost = "localhost" }

$dbPort = Read-Host "Database port (default: 5432)"
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = "5432" }

Write-Host ""
Write-Host "Configuration Summary:" -ForegroundColor Cyan
Write-Host "  Database Name: $dbName"
Write-Host "  Username:      $dbUser"
Write-Host "  Host:          $dbHost"
Write-Host "  Port:          $dbPort"
Write-Host ""

$confirm = Read-Host "Proceed with setup? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Setup cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Green

# Create SQL commands
$sqlCommands = @"
-- Create user if not exists
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$dbUser') THEN
        CREATE USER $dbUser WITH PASSWORD '$dbPasswordPlain';
    END IF;
END
`$`$;

-- Grant CREATEDB permission
ALTER USER $dbUser CREATEDB;

-- Create database if not exists
SELECT 'CREATE DATABASE $dbName OWNER $dbUser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
"@

# Save SQL to temporary file
$tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlCommands | Out-File -FilePath $tempSqlFile -Encoding UTF8

try {
    Write-Host "Executing SQL commands..." -ForegroundColor Yellow
    
    # Try to execute with psql
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    
    if (-not $psqlPath) {
        Write-Host "ERROR: psql command not found!" -ForegroundColor Red
        Write-Host "Make sure PostgreSQL is installed and psql is in your PATH." -ForegroundColor Red
        Write-Host ""
        Write-Host "You can add PostgreSQL to PATH or run manually:" -ForegroundColor Yellow
        Write-Host "1. Open pgAdmin or connect to PostgreSQL" -ForegroundColor Yellow
        Write-Host "2. Run the following SQL commands as postgres user:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host $sqlCommands -ForegroundColor White
        exit 1
    }
    
    # Execute SQL
    $env:PGPASSWORD = "postgres"  # Default postgres password, adjust if needed
    & psql -U postgres -h $dbHost -p $dbPort -f $tempSqlFile 2>&1 | ForEach-Object {
        Write-Host $_ -ForegroundColor Gray
    }
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✓ Database setup completed successfully!" -ForegroundColor Green
        
        # Create .env file
        Write-Host ""
        $createEnv = Read-Host "Create/update .env file? (y/n)"
        
        if ($createEnv -eq 'y' -or $createEnv -eq 'Y') {
            $databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@${dbHost}:${dbPort}/${dbName}?schema=public"
            
            $envPath = Join-Path $PSScriptRoot ".env"
            $envExamplePath = Join-Path $PSScriptRoot ".env.example"
            
            if (Test-Path $envPath) {
                Write-Host "Updating existing .env file..." -ForegroundColor Yellow
                $envContent = Get-Content $envPath -Raw
                $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
                $envContent | Set-Content $envPath -NoNewline
            }
            elseif (Test-Path $envExamplePath) {
                Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
                $envContent = Get-Content $envExamplePath -Raw
                $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$databaseUrl`""
                $envContent | Set-Content $envPath -NoNewline
            }
            else {
                Write-Host "Creating new .env file..." -ForegroundColor Yellow
                "DATABASE_URL=`"$databaseUrl`"" | Set-Content $envPath
            }
            
            Write-Host "✓ .env file updated!" -ForegroundColor Green
        }
        
        # Run Prisma migrations
        Write-Host ""
        $runMigrations = Read-Host "Run Prisma migrations now? (y/n)"
        
        if ($runMigrations -eq 'y' -or $runMigrations -eq 'Y') {
            Write-Host ""
            Write-Host "Running migrations..." -ForegroundColor Yellow
            npm run db:setup
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✓ All done! Database is ready to use." -ForegroundColor Green
            }
            else {
                Write-Host ""
                Write-Host "Migration failed. You can run 'npm run db:setup' manually." -ForegroundColor Yellow
            }
        }
        else {
            Write-Host ""
            Write-Host "Remember to run 'npm run db:setup' to apply migrations!" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Connection String:" -ForegroundColor Cyan
        Write-Host $databaseUrl -ForegroundColor White
        
    }
    else {
        Write-Host ""
        Write-Host "ERROR: Database setup failed!" -ForegroundColor Red
        Write-Host "Check the errors above and try again." -ForegroundColor Red
        exit 1
    }
}
finally {
    # Clean up temp file
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile -Force
    }
}

Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green
Write-Host ""

#!/bin/bash
# PostgreSQL Database Setup Script for Linux and macOS
# This script helps set up the Create Kuji database with proper permissions

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}==================================${NC}"
echo -e "${CYAN}Create Kuji Database Setup Script${NC}"
echo -e "${CYAN}==================================${NC}"
echo ""

# Check if running with sudo
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}WARNING: Running as root. This is not recommended.${NC}"
    echo -e "${YELLOW}Consider running as a regular user.${NC}"
    echo ""
fi

# Detect OS
OS_TYPE="unknown"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
fi

echo -e "${GREEN}Detected OS: ${OS_TYPE}${NC}"
echo ""

# Get database configuration from user
echo -e "${GREEN}Please provide your database configuration:${NC}"
echo ""

read -p "Database name (default: create_kuji_db): " dbName
dbName=${dbName:-create_kuji_db}

read -p "Database username (default: create_kuji_user): " dbUser
dbUser=${dbUser:-create_kuji_user}

read -sp "Database password: " dbPassword
echo ""

if [ -z "$dbPassword" ]; then
    echo -e "${RED}ERROR: Password cannot be empty!${NC}"
    exit 1
fi

read -p "Database host (default: localhost): " dbHost
dbHost=${dbHost:-localhost}

read -p "Database port (default: 5432): " dbPort
dbPort=${dbPort:-5432}

read -p "PostgreSQL admin user (default: postgres): " pgAdmin
pgAdmin=${pgAdmin:-postgres}

echo ""
echo -e "${CYAN}Configuration Summary:${NC}"
echo "  Database Name: $dbName"
echo "  Username:      $dbUser"
echo "  Host:          $dbHost"
echo "  Port:          $dbPort"
echo "  Admin User:    $pgAdmin"
echo ""

read -p "Proceed with setup? (y/n): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Setup cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Setting up database...${NC}"

# Create SQL commands
sqlCommands="-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$dbUser') THEN
        CREATE USER $dbUser WITH PASSWORD '$dbPassword';
    END IF;
END
\$\$;

-- Grant CREATEDB permission
ALTER USER $dbUser CREATEDB;

-- Create database if not exists
SELECT 'CREATE DATABASE $dbName OWNER $dbUser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$dbName')\\gexec

-- Connect to new database and grant privileges
\\c $dbName
GRANT ALL PRIVILEGES ON DATABASE $dbName TO $dbUser;
GRANT ALL PRIVILEGES ON SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $dbUser;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $dbUser;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $dbUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $dbUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO $dbUser;"

# Save SQL to temporary file
tempSqlFile=$(mktemp /tmp/create_kuji_setup.XXXXXX.sql)
echo "$sqlCommands" > "$tempSqlFile"

# Function to clean up temp file
cleanup() {
    rm -f "$tempSqlFile"
}
trap cleanup EXIT

echo -e "${YELLOW}Executing SQL commands...${NC}"
echo ""

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}ERROR: psql command not found!${NC}"
    echo -e "${RED}Make sure PostgreSQL client is installed.${NC}"
    echo ""
    
    if [ "$OS_TYPE" == "linux" ]; then
        echo -e "${YELLOW}Install with:${NC}"
        echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
        echo "  CentOS/RHEL:   sudo yum install postgresql"
        echo "  Fedora:        sudo dnf install postgresql"
    elif [ "$OS_TYPE" == "macos" ]; then
        echo -e "${YELLOW}Install with:${NC}"
        echo "  Homebrew: brew install postgresql"
    fi
    
    echo ""
    echo -e "${YELLOW}Or run these SQL commands manually as $pgAdmin user:${NC}"
    echo ""
    echo "$sqlCommands"
    exit 1
fi

# Try to execute SQL
export PGPASSWORD=""
set +e  # Don't exit on error for SQL execution

# Try different authentication methods
echo -e "${YELLOW}Attempting to connect as $pgAdmin...${NC}"

# Method 1: Try with peer authentication (common on Linux)
if [ "$OS_TYPE" == "linux" ]; then
    echo "Trying peer authentication (sudo -u postgres)..."
    if sudo -u "$pgAdmin" psql -h "$dbHost" -p "$dbPort" -f "$tempSqlFile" 2>&1; then
        sqlSuccess=true
    fi
fi

# Method 2: Try with password prompt
if [ -z "$sqlSuccess" ]; then
    echo ""
    echo -e "${YELLOW}Please enter the password for PostgreSQL user '$pgAdmin':${NC}"
    if psql -U "$pgAdmin" -h "$dbHost" -p "$dbPort" -f "$tempSqlFile" 2>&1; then
        sqlSuccess=true
    fi
fi

# Method 3: Try without password (trust authentication)
if [ -z "$sqlSuccess" ]; then
    echo ""
    echo "Trying without password (trust authentication)..."
    export PGPASSWORD=""
    if psql -U "$pgAdmin" -h "$dbHost" -p "$dbPort" -f "$tempSqlFile" 2>&1; then
        sqlSuccess=true
    fi
fi

set -e  # Re-enable exit on error

if [ -n "$sqlSuccess" ]; then
    echo ""
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
    
    # Create/update .env file
    echo ""
    read -p "Create/update .env file? (y/n): " createEnv
    
    if [[ $createEnv =~ ^[Yy]$ ]]; then
        databaseUrl="postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public"
        
        scriptDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
        envPath="$scriptDir/.env"
        envExamplePath="$scriptDir/.env.example"
        
        if [ -f "$envPath" ]; then
            echo -e "${YELLOW}Updating existing .env file...${NC}"
            # Create backup
            cp "$envPath" "$envPath.backup"
            # Update DATABASE_URL
            sed -i.tmp "s|DATABASE_URL=\"[^\"]*\"|DATABASE_URL=\"$databaseUrl\"|g" "$envPath"
            rm -f "$envPath.tmp"
        elif [ -f "$envExamplePath" ]; then
            echo -e "${YELLOW}Creating .env from .env.example...${NC}"
            cp "$envExamplePath" "$envPath"
            sed -i.tmp "s|DATABASE_URL=\"[^\"]*\"|DATABASE_URL=\"$databaseUrl\"|g" "$envPath"
            rm -f "$envPath.tmp"
        else
            echo -e "${YELLOW}Creating new .env file...${NC}"
            echo "DATABASE_URL=\"$databaseUrl\"" > "$envPath"
        fi
        
        echo -e "${GREEN}✓ .env file updated!${NC}"
        
        # Set proper permissions on .env
        chmod 600 "$envPath"
        echo -e "${CYAN}Set .env file permissions to 600 (owner read/write only)${NC}"
    fi
    
    # Run Prisma migrations
    echo ""
    read -p "Run Prisma migrations now? (y/n): " runMigrations
    
    if [[ $runMigrations =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Running migrations...${NC}"
        
        if npm run db:setup; then
            echo ""
            echo -e "${GREEN}✓ All done! Database is ready to use.${NC}"
        else
            echo ""
            echo -e "${YELLOW}Migration failed. You can run 'npm run db:setup' manually.${NC}"
        fi
    else
        echo ""
        echo -e "${YELLOW}Remember to run 'npm run db:setup' to apply migrations!${NC}"
    fi
    
    echo ""
    echo -e "${CYAN}Connection String:${NC}"
    echo "$databaseUrl"
    
else
    echo ""
    echo -e "${RED}ERROR: Database setup failed!${NC}"
    echo -e "${RED}Please check the errors above.${NC}"
    echo ""
    
    echo -e "${YELLOW}Alternative setup methods:${NC}"
    echo ""
    echo "1. Run SQL commands manually:"
    echo "   psql -U $pgAdmin -h $dbHost -p $dbPort"
    echo ""
    echo "2. Use sudo (Linux only):"
    echo "   sudo -u postgres psql -f $tempSqlFile"
    echo ""
    echo "3. Check PostgreSQL authentication settings:"
    echo "   - Linux: /etc/postgresql/*/main/pg_hba.conf"
    echo "   - macOS: /usr/local/var/postgresql/pg_hba.conf"
    echo ""
    
    exit 1
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""

# Show helpful next steps
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Start your development server: npm run dev"
echo "  2. View database in browser: npm run prisma:studio"
echo "  3. Check server logs for any issues"
echo ""

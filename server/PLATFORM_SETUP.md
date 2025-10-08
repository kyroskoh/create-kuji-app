# Platform-Specific Database Setup

This guide provides platform-specific instructions for setting up the Create Kuji database.

---

## 🪟 Windows Setup

### Automated (Recommended)

```powershell
cd server
npm run db:setup-windows
```

### Features:
- ✅ Interactive PowerShell wizard
- ✅ Automatic user and database creation
- ✅ Proper permissions configuration
- ✅ Automatic `.env` file update
- ✅ Optional migration execution

### Requirements:
- PowerShell 5.1 or higher (built into Windows)
- PostgreSQL installed
- Administrator privileges (recommended)

### Manual Steps:
```powershell
# Open PowerShell as Administrator
# Connect to PostgreSQL
psql -U postgres

# Run these commands:
CREATE USER create_kuji_user WITH PASSWORD 'your_password';
ALTER USER create_kuji_user CREATEDB;
CREATE DATABASE create_kuji_db OWNER create_kuji_user;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO create_kuji_user;
\q

# Then in your project:
cd server
npm run db:setup
```

---

## 🐧 Linux Setup

### Automated (Recommended)

```bash
cd server
npm run db:setup-unix
```

### Features:
- ✅ Interactive bash wizard
- ✅ Automatic user and database creation
- ✅ Multiple authentication method attempts (peer, password, trust)
- ✅ Proper permissions and schema grants
- ✅ Automatic `.env` file update with secure permissions (600)
- ✅ Optional migration execution

### Requirements:
- Bash shell
- PostgreSQL installed
- `psql` command-line tool
- sudo access (for peer authentication)

### Installation (if needed):

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-client
```

**CentOS/RHEL:**
```bash
sudo yum install postgresql postgresql-server
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Fedora:**
```bash
sudo dnf install postgresql postgresql-server
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

**Arch Linux:**
```bash
sudo pacman -S postgresql
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### Manual Steps:
```bash
# Switch to postgres user
sudo -u postgres psql

# Run these commands:
CREATE USER create_kuji_user WITH PASSWORD 'your_password';
ALTER USER create_kuji_user CREATEDB;
CREATE DATABASE create_kuji_db OWNER create_kuji_user;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO create_kuji_user;
\q

# Connect to the new database and grant schema permissions
sudo -u postgres psql -d create_kuji_db
GRANT ALL PRIVILEGES ON SCHEMA public TO create_kuji_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO create_kuji_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO create_kuji_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO create_kuji_user;
\q

# Then in your project:
cd server
npm run db:setup
```

---

## 🍎 macOS Setup

### Automated (Recommended)

```bash
cd server
npm run db:setup-unix
```

### Features:
- ✅ Interactive bash wizard
- ✅ Automatic user and database creation
- ✅ Multiple authentication method attempts
- ✅ Proper permissions and schema grants
- ✅ Automatic `.env` file update with secure permissions (600)
- ✅ Optional migration execution

### Requirements:
- Bash shell (built into macOS)
- PostgreSQL installed
- Homebrew (recommended for installation)

### Installation (if needed):

**Using Homebrew (Recommended):**
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Add to PATH (if needed)
echo 'export PATH="/usr/local/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Using Postgres.app:**
1. Download from https://postgresapp.com/
2. Drag to Applications folder
3. Open Postgres.app
4. Click "Initialize" to create a new server

### Manual Steps:
```bash
# Connect to PostgreSQL (no password needed with Homebrew default)
psql postgres

# Run these commands:
CREATE USER create_kuji_user WITH PASSWORD 'your_password';
ALTER USER create_kuji_user CREATEDB;
CREATE DATABASE create_kuji_db OWNER create_kuji_user;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO create_kuji_user;
\q

# Connect to the new database and grant schema permissions
psql -d create_kuji_db
GRANT ALL PRIVILEGES ON SCHEMA public TO create_kuji_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO create_kuji_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO create_kuji_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO create_kuji_user;
\q

# Then in your project:
cd server
npm run db:setup
```

---

## 🐳 Docker Setup (All Platforms)

For a quick development setup using Docker:

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: create_kuji_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: create_kuji_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d

# Wait a few seconds for PostgreSQL to start
sleep 5

# Run migrations
cd server
npm run db:setup
```

**Connection String:**
```env
DATABASE_URL="postgresql://create_kuji_user:your_password@localhost:5432/create_kuji_db?schema=public"
```

---

## Troubleshooting by Platform

### Windows

**"psql: command not found"**
- Add PostgreSQL bin directory to PATH:
  - Default: `C:\Program Files\PostgreSQL\14\bin`
  - System Properties → Environment Variables → PATH → Add

**"password authentication failed"**
- Check PostgreSQL password in Services
- Use pgAdmin to verify/reset password

**Permission errors with PowerShell script**
```powershell
# Allow script execution
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Linux

**"peer authentication failed"**
Edit `/etc/postgresql/*/main/pg_hba.conf`:
```
# Change this line:
local   all             postgres                                peer

# To:
local   all             postgres                                trust
```
Then restart: `sudo systemctl restart postgresql`

**"socket connection failed"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start it if needed
sudo systemctl start postgresql
```

### macOS

**"connection refused"**
```bash
# If using Homebrew:
brew services restart postgresql@14

# If using Postgres.app:
# Make sure Postgres.app is running
```

**"role does not exist"**
```bash
# Create the postgres role
createuser -s postgres

# Or use your macOS username
psql -d postgres
```

---

## Quick Reference

| Platform | Command | Auth Method |
|----------|---------|-------------|
| Windows | `npm run db:setup-windows` | Password |
| Linux | `npm run db:setup-unix` | Peer/Password/Trust |
| macOS | `npm run db:setup-unix` | Trust/Password |
| All | `npm run db:setup` | Manual (requires pre-setup) |

---

## Security Notes

### Production Considerations:

1. **Strong Passwords**: Use strong, unique passwords
2. **Limited Permissions**: Don't use superuser accounts
3. **SSL Connections**: Enable SSL in production
4. **Firewall Rules**: Restrict database access
5. **Environment Variables**: Never commit `.env` to git

### Development Best Practices:

- ✅ Use different passwords for dev/prod
- ✅ Keep `.env` file permissions restrictive (600)
- ✅ Use local database for development
- ✅ Regular backups of development data
- ✅ Don't use production data in development

---

## Need More Help?

- 📖 [Detailed Setup Guide](./DATABASE_SETUP.md)
- 🚀 [Quick Start](./README_DATABASE.md)
- 🔍 [Prisma Documentation](https://www.prisma.io/docs)
- 💬 [PostgreSQL Documentation](https://www.postgresql.org/docs/)

# Database Setup Guide

This guide will help you set up your development database with Prisma.

## Prerequisites

1. PostgreSQL installed and running
2. Node.js and npm installed
3. `.env` file configured in the `server` directory

## Quick Start

### 1. Initial Database Setup

Run this command to create the database, run migrations, and seed initial data:

```bash
npm run db:setup
```

This will:
- Create migration files
- Apply migrations to your database
- Generate Prisma Client
- Seed the database with initial data

### 2. Reset Database (Fresh Start)

If you need to completely reset your database:

```bash
npm run db:reset
```

This will:
- Drop all tables
- Re-run all migrations
- Seed the database again

### 3. Development Migration

After making changes to `schema.prisma`:

```bash
npm run db:dev
```

This will:
- Create a new migration
- Apply it to your database
- Re-seed if needed

## Common Issues & Solutions

### Permission Denied Errors

If you get permission errors when creating the database:

#### PostgreSQL (Linux/Mac)
```bash
# Grant permissions to your database user
sudo -u postgres psql
CREATE USER your_username WITH PASSWORD 'your_password';
ALTER USER your_username CREATEDB;
CREATE DATABASE create_kuji_db OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO your_username;
\q
```

#### PostgreSQL (Windows)
```powershell
# Run as Administrator in PowerShell
# Connect to PostgreSQL
psql -U postgres

# Then run:
CREATE USER your_username WITH PASSWORD 'your_password';
ALTER USER your_username CREATEDB;
CREATE DATABASE create_kuji_db OWNER your_username;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO your_username;
\q
```

#### Automated Setup Scripts

**Windows:**
```bash
npm run db:setup-windows
```

**Linux/macOS:**
```bash
npm run db:setup-unix
```

These scripts will interactively guide you through the setup process and handle permissions automatically.

### Connection Issues

If you can't connect to the database:

1. Check your `.env` file has the correct `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/create_kuji_db?schema=public"
   ```

2. Verify PostgreSQL is running:
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Windows
   Get-Service postgresql*
   ```

3. Test connection manually:
   ```bash
   psql -U your_username -d create_kuji_db -h localhost
   ```

### Migration Conflicts

If migrations are out of sync:

```bash
# Option 1: Reset (WARNING: Deletes all data)
npm run db:reset

# Option 2: Mark as applied without running
npx prisma migrate resolve --applied "migration_name"

# Option 3: Deploy production migrations
npm run prisma:migrate:deploy
```

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run db:setup` | Initial setup: migrate + generate + seed |
| `npm run db:reset` | Reset database and re-seed |
| `npm run db:dev` | Create and apply new migration + seed |
| `npm run db:push` | Push schema changes without migration (dev only) |
| `npm run db:pull` | Pull schema from database |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Create and apply migration |
| `npm run prisma:migrate:deploy` | Apply pending migrations (production) |
| `npm run prisma:migrate:reset` | Reset database (deletes all data) |
| `npm run prisma:seed` | Run seed script only |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |

## Prisma Studio

To visually inspect and edit your database:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## Environment Variables

Make sure your `.env` file contains:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/create_kuji_db?schema=public"

# For SQLite (alternative for development)
# DATABASE_URL="file:./dev.db"

# JWT Secrets
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server Config
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Email Service
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT=587
EMAIL_USER="your-ethereal-user"
EMAIL_PASS="your-ethereal-password"
EMAIL_FROM="noreply@create-kuji.local"
```

## Production Deployment

For production, use:

```bash
# 1. Apply migrations (doesn't run seed)
npm run prisma:migrate:deploy

# 2. Generate client
npm run prisma:generate
```

## Troubleshooting

### "Role does not exist"
Create the PostgreSQL user:
```bash
sudo -u postgres createuser -s your_username
```

### "Database does not exist"
Create the database:
```bash
sudo -u postgres createdb create_kuji_db
```

### "Connection refused"
Check if PostgreSQL is running and listening on port 5432.

### Schema.prisma and Database Out of Sync
```bash
# Pull current schema from database
npm run db:pull

# Or force push schema to database (careful!)
npm run db:push
```

## Need Help?

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Check server logs for detailed error messages

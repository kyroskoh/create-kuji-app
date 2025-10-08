# Quick Database Setup

## TL;DR - Fast Setup

### Windows Users (Recommended)
```bash
cd server
npm run db:setup-windows
```

### Linux/macOS Users (Recommended)
```bash
cd server
npm run db:setup-unix
```

These interactive scripts will:
- Create PostgreSQL user and database
- Set proper permissions
- Update your `.env` file
- Run migrations and seed data

### Manual Setup (All Platforms)
```bash
cd server
npm run db:setup
```

---

## Available Commands

| Command | What It Does |
|---------|-------------|
| `npm run db:setup-windows` | **Windows only** - Interactive setup with PostgreSQL permissions |
| `npm run db:setup-unix` | **Linux/macOS only** - Interactive setup with PostgreSQL permissions |
| `npm run db:setup` | Initial database setup (create + migrate + seed) |
| `npm run db:reset` | Reset everything and start fresh |
| `npm run db:dev` | Create new migration after schema changes |
| `npm run prisma:studio` | Open database GUI at http://localhost:5555 |

---

## First Time Setup

### Step 1: Create `.env` file
```bash
# In the server directory
cp .env.example .env
```

### Step 2: Configure Database URL
Edit `.env` and set your database connection:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/create_kuji_db?schema=public"
```

### Step 3: Setup Database

**Option A - Automated Setup**

Windows:
```bash
npm run db:setup-windows
```

Linux/macOS:
```bash
npm run db:setup-unix
```

**Option B - Manual (All Platforms)**
```bash
# 1. Create database and user in PostgreSQL first:
psql -U postgres
CREATE USER create_kuji_user WITH PASSWORD 'your_password';
ALTER USER create_kuji_user CREATEDB;
CREATE DATABASE create_kuji_db OWNER create_kuji_user;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO create_kuji_user;
\q

# 2. Then run migrations:
npm run db:setup
```

---

## Common Issues

### ❌ "permission denied to create database"

**Fix (Automated):**

Windows:
```bash
npm run db:setup-windows
```

Linux/macOS:
```bash
npm run db:setup-unix
```

**Fix (Manual):**
```sql
-- Connect as postgres user
psql -U postgres
-- Grant permissions
ALTER USER your_username CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO your_username;
```

### ❌ "relation does not exist"

Your database schema is out of sync. Reset it:
```bash
npm run db:reset
```

### ❌ "Cannot connect to database"

Check if PostgreSQL is running:
```bash
# Windows
Get-Service postgresql*

# Mac/Linux
sudo systemctl status postgresql
```

---

## Schema Changes Workflow

When you modify `schema.prisma`:

```bash
# Create and apply migration
npm run db:dev

# Or just push changes without creating migration (dev only)
npm run db:push
```

---

## Need Help?

📖 See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed documentation

🔍 Common commands:
- `npm run prisma:studio` - Visual database browser
- `npm run db:reset` - Fresh start (deletes all data)
- `npm run prisma:generate` - Regenerate Prisma Client

---

## What Gets Created

The setup creates these tables:
- ✅ `users` - User accounts
- ✅ `emails` - Email addresses (with verification)
- ✅ `passwords` - Hashed passwords
- ✅ `sessions` - Login sessions with refresh tokens
- ✅ `provider_accounts` - OAuth provider accounts
- ✅ `tokens` - Verification and reset tokens
- ✅ `prizes` - Kuji prize pool
- ✅ `draw_sessions` - Draw session history
- ✅ `draw_results` - Individual draw results
- ✅ `user_settings` - User preferences and config
- ✅ `pricing_presets` - Draw pricing tiers
- ✅ `user_branding` - Custom branding settings

And seeds with:
- 🎭 Demo account (`demo` user)
- 🎁 Sample prizes
- 💰 Default pricing presets

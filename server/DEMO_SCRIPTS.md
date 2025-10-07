# Demo User Management Scripts

This directory contains scripts to manage the demo user account for the Create Kuji App.

## Available Scripts

### 1. Make Demo Username Permanent

**Purpose**: Updates the demo user to have a permanent username instead of a temporary one.

**Files**:
- `src/utils/make-demo-username-permanent.ts` - TypeScript script
- `make-demo-permanent.ps1` - PowerShell wrapper (Windows)

**Usage**:

```bash
# Using npm script
npm run demo:permanent

# Using PowerShell (Windows)
.\make-demo-permanent.ps1
```

**What it does**:
- ✅ Sets `usernameSetByUser` to `true` for the demo user
- ✅ Ensures demo user has a display name set
- ✅ Creates default user settings if missing (with Pro plan)
- ✅ Ensures stock page is published for public access
- ✅ Provides comprehensive status reporting

**Benefits**:
- Username "demo" becomes permanent and cannot be changed
- Demo user is protected from username conflicts
- Consistent demo experience for all users
- Demo user gets Pro plan features for showcase

### 2. Legacy Demo Fix (Existing)

**Purpose**: Basic username fix for demo user.

**Usage**:
```bash
npm run fix:demo
```

## Prerequisites

1. **Database Setup**: Make sure your database is set up and migrated
2. **Environment**: Ensure `.env` file exists with proper `DATABASE_URL`
3. **Dependencies**: Run `npm install` to install required packages
4. **Demo User**: Demo user should exist (run `npm run prisma:seed` if needed)

## Demo User Details

The demo user is created with these default characteristics:
- **Username**: `demo` (permanent after running the script)
- **Email**: `demo@createkuji.com`
- **Password**: `Demo123!`
- **Plan**: Pro (full features enabled)
- **Stock Page**: Public (visible to everyone)
- **Purpose**: Showcase application features to potential users

## Troubleshooting

### Demo User Not Found
```bash
# Create demo user by running the seed script
npm run prisma:seed
```

### Permission Errors
```bash
# Make sure you have the right permissions
chmod +x make-demo-permanent.ps1  # On Unix systems
```

### Database Connection Issues
- Check your `DATABASE_URL` in `.env` file
- Ensure database server is running
- Verify database credentials

## Related Scripts

- `npm run prisma:seed` - Creates initial demo user and data
- `npm run fix:demo-plan` - Ensures demo user has proper subscription plan
- `npm run fix:publish-demo-stock` - Makes demo stock page public

## Security Note

The demo user is intended for public demonstration only. It uses well-known credentials and should not contain sensitive data in production environments.
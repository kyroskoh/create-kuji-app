# Create Kuji Server

Backend API server for the Create Kuji gacha application with comprehensive user authentication and management.

## Features

- 🔐 **JWT Authentication** - Access tokens (15 min) + refresh tokens (30 days)
- 👥 **User Management** - Registration, login, email verification
- 🎭 **Username Generation** - Automatic unique username creation for email-only signups
- 🔑 **Password Management** - Secure reset flow with email tokens
- 🎫 **SSO Support** - Google, GitHub, Discord, Facebook, X (Twitter), LinkedIn
- 🛡️ **Security** - bcrypt hashing, hCaptcha verification, helmet headers
- 📧 **Email Service** - Beautiful HTML email templates with Nodemailer
- 👑 **Admin System** - Super admin capabilities with role-based access
- 🎲 **Kuji Management** - Prize pool, settings, and stock management with caching
- 🔄 **Data Sync** - Frontend-to-backend synchronization for prizes and settings
- 🗄️ **Database** - PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: SQLite with Prisma ORM (development), PostgreSQL-ready for production
- **Authentication**: Passport.js + JWT
- **Email**: Nodemailer (Ethereal for dev, SendGrid for prod)
- **Security**: Helmet, bcrypt, hCaptcha

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- No additional database setup needed (uses SQLite for development)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update values:

```bash
copy .env.example .env
```

Key variables to configure:
- `DATABASE_URL` - SQLite path (default: `file:./dev.db`)
- `JWT_ACCESS_SECRET` - Secret for access tokens (default values OK for dev)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (default values OK for dev)
- `HCAPTCHA_SECRET` - Optional in development
- `EMAIL_*` - Auto-generated in development
- OAuth provider credentials - Optional, only needed if using SSO

### 3. Database Setup

SQLite is used by default for development - no additional setup needed!

The database file (`dev.db`) will be created automatically when you run migrations.

### 4. Generate Prisma Client & Run Migrations

**IMPORTANT:** Generate Prisma client before starting the server:

```bash
npm run prisma:generate
npm run prisma:migrate
```

> **Note:** If you see `@prisma/client did not initialize yet` error, run `npm run prisma:generate`

### 5. Seed Database

Create the super admin account:

```bash
npm run prisma:seed
```

Default super admin:
- Username: `kyros`
- Email: `kyroskoh@example.com`
- Password: `Admin123!`

**⚠️ Change the password immediately after first login!**

## Development

Start the development server with hot reload:

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "hcaptchaToken": "token-from-frontend"
}
```

**Note:** Username is auto-generated from email. Users can set their own username later via the profile settings.

**Response:**
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "username": "username",
    "email": "user@example.com",
    "emailVerified": false,
    "isSuperAdmin": false
  },
  "tokens": {
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /api/auth/login
Login with email/username and password.

**Request:**
```json
{
  "emailOrUsername": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

#### POST /api/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

#### POST /api/auth/logout
Logout and revoke refresh token.

#### POST /api/auth/password-reset-request
Request password reset email.

#### POST /api/auth/password-reset
Reset password with token.

#### GET /api/auth/verify-email?token=xxx
Verify email address.

#### GET /api/auth/me
Get current user information (requires authentication).

### User Management Endpoints

#### PUT /api/user/username
Update username (one-time only, requires authentication).

**Request:**
```json
{
  "username": "newusername"
}
```

**Validation:**
- Must be 5-20 characters
- Only letters, numbers, underscores, and hyphens allowed
- **Reserved usernames** (cannot be used):
  - System: `admin`, `administrator`, `root`, `system`, `superuser`, `sudo`
  - Demo/Test: `demo`, `test`, `guest`, `anonymous`, `user`
  - Roles: `moderator`, `mod`, `support`, `help`, `staff`, `owner`
  - API/Endpoints: `api`, `www`, `mail`, `ftp`, `smtp`, `http`, `https`
  - App-specific: `createkuji`, `createmykuji`, `makekuji`, `makemykuji`, `kuji`, `kyros`, `kyroskoh`
  - Safety: `null`, `undefined`, `none`, `nil`, `void`, `bot`, `official`, `verified`, `account`
  - **Exception**: The demo user (with current username "demo") can set/keep "demo" as their username
- Can only be set once per account

**Response:**
```json
{
  "message": "Username updated successfully",
  "user": {
    "id": "uuid",
    "username": "newusername",
    "displayName": "newusername",
    "usernameSetByUser": true,
    "email": "user@example.com",
    "emailVerified": false,
    "isSuperAdmin": false
  }
}
```

**Error Responses:**
- `RESERVED_USERNAME` - Username is reserved and cannot be used
- `USERNAME_EXISTS` - Username already taken
- `USERNAME_ALREADY_SET` - Username has already been set (contact support to change)

#### GET /api/user/profile
Get user's complete profile information (requires authentication).

### User Kuji Endpoints

#### GET /api/users/:username/stock
Get public stock information for a user's prize pool.

**Response:**
```json
{
  "username": "demo",
  "tiers": [
    {
      "id": "S",
      "name": "S Tier",
      "color": "#A855F7",
      "totalStock": 10,
      "remainingStock": 8,
      "probability": 0.15,
      "description": "Prize 1, Prize 2"
    }
  ],
  "lastUpdated": "2025-10-05T22:00:00.000Z"
}
```

#### POST /api/users/:username/prizes/sync
Sync prize pool data from frontend to backend (requires authentication).

**Request:**
```json
{
  "prizes": [
    {
      "prizeName": "Grand Prize",
      "tier": "S",
      "quantity": 5,
      "weight": 1,
      "isDrawn": false
    }
  ]
}
```

#### POST /api/users/:username/settings/sync
Sync user settings from frontend to backend (requires authentication).

**Request:**
```json
{
  "settings": {
    "tierColors": {
      "S": "purple",
      "A": "emerald"
    },
    "weightMode": "advanced",
    "currency": "USD"
  }
}
```

### Health Check

#### GET /health
Check server status.

```json
{
  "status": "OK",
  "message": "Create Kuji Server is running",
  "timestamp": "2025-10-05T17:00:00.000Z",
  "environment": "development"
}
```

## Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build

### Database
- `npm run prisma:generate` - Generate Prisma client (required before first run and after schema changes)
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data

### Support Tools
- `npm run fix:demo` - Update demo user to have permanent username
- `npm run support:change-username <current> <new>` - Change username by current username
- `npm run support:change-username-email <email> <new>` - Change username by email address (useful for temp usernames)
  - See `SUPPORT_USERNAME_CHANGE.md` for detailed guide

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   └── passport.ts        # Passport strategies
│   ├── controllers/
│   │   ├── authController.ts  # Auth route handlers
│   │   ├── kujiController.ts  # Kuji/prize route handlers
│   │   ├── userController.ts  # User management handlers
│   │   └── userKujiController.ts # User-specific kuji handlers
│   ├── middleware/
│   │   └── auth.ts            # Auth middleware
│   ├── routes/
│   │   ├── authRoutes.ts      # Auth route definitions
│   │   ├── kujiRoutes.ts      # Kuji route definitions
│   │   ├── userRoutes.ts      # User route definitions
│   │   └── usersRoutes.ts     # User kuji route definitions
│   ├── services/
│   │   └── emailService.ts    # Email functionality
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── hcaptcha.ts        # hCaptcha verification
│   │   ├── usernameGenerator.ts # Auto username generation
│   │   └── seed.ts            # Database seeding
│   └── index.ts               # Main server file
├── .env                       # Environment variables
├── .env.example               # Environment template
├── docker-compose.yml         # Docker services
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## Security Considerations

1. **Passwords** - Hashed with bcrypt (12 rounds)
2. **Tokens** - Short-lived access tokens, secure refresh tokens
3. **Sessions** - Automatic cleanup of expired sessions
4. **CAPTCHA** - hCaptcha verification on signup
5. **Headers** - Helmet security headers
6. **CORS** - Configured for specific origins
7. **Email Enumeration** - Protected against in password reset

## Development Notes

- **Prisma Client**: Must run `npm run prisma:generate` before first server start or after any schema changes
- Email service uses Ethereal in development (check console for test URLs)
- hCaptcha is skipped in development if not configured
- SQLite database stored as `dev.db` in server directory
- Automatic session cleanup runs every hour

## Production Deployment

1. Set `NODE_ENV=production`
2. **Switch to PostgreSQL**: Update `schema.prisma` datasource to use `postgresql` provider
3. Configure production database URL in `.env`
4. Set up SendGrid or SMTP email service
5. Configure OAuth provider callbacks
6. Set strong JWT secrets (generate new ones, don't use defaults)
7. Enable hCaptcha
8. Configure CORS for production domain

## License

MIT License - see parent directory LICENSE file

---

Built with ❤️ by [Kyros Koh](https://github.com/kyroskoh)

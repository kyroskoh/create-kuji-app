# Create Kuji Server

Backend API server for the Create Kuji gacha application with comprehensive user authentication and management.

## Features

- 🔐 **JWT Authentication** - Access tokens (15 min) + refresh tokens (30 days)
- 👥 **User Management** - Registration, login, email verification
- 🔑 **Password Management** - Secure reset flow with email tokens
- 🎫 **SSO Support** - Google, GitHub, Discord, Facebook, X (Twitter), LinkedIn
- 🛡️ **Security** - bcrypt hashing, hCaptcha verification, helmet headers
- 📧 **Email Service** - Beautiful HTML email templates with Nodemailer
- 👑 **Admin System** - Super admin capabilities with role-based access
- 🗄️ **Database** - PostgreSQL with Prisma ORM

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: Passport.js + JWT
- **Email**: Nodemailer (Ethereal for dev, SendGrid for prod)
- **Security**: Helmet, bcrypt, hCaptcha

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 15+ (or Docker)

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
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `HCAPTCHA_SECRET` - hCaptcha secret key
- `EMAIL_*` - Email service configuration
- OAuth provider credentials (Google, GitHub, etc.)

### 3. Start PostgreSQL

Using Docker (recommended for development):

```bash
docker-compose up -d
```

Or install PostgreSQL locally and create a database.

### 4. Run Migrations

```bash
npm run prisma:migrate
```

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
  "username": "username",
  "password": "SecurePass123!",
  "hcaptchaToken": "token-from-frontend"
}
```

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

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with initial data

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── passport.ts        # Passport strategies
│   ├── controllers/
│   │   └── authController.ts  # Auth route handlers
│   ├── middleware/
│   │   └── auth.ts            # Auth middleware
│   ├── routes/
│   │   └── authRoutes.ts      # Route definitions
│   ├── services/
│   │   └── emailService.ts    # Email functionality
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── hcaptcha.ts        # hCaptcha verification
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

- Email service uses Ethereal in development (check console for test URLs)
- hCaptcha is skipped in development if not configured
- PostgreSQL with citext extension for case-insensitive searches
- Automatic session cleanup runs every hour

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up SendGrid or SMTP email service
4. Configure OAuth provider callbacks
5. Set strong JWT secrets
6. Enable hCaptcha
7. Configure CORS for production domain

## License

MIT License - see parent directory LICENSE file

---

Built with ❤️ by [Kyros Koh](https://github.com/kyroskoh)

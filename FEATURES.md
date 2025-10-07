# Create Kuji App - Features Documentation

> Complete feature reference for the Create Kuji App  
> Last Updated: 2025-10-07

---

## Table of Contents

- [Core Kuji System](#core-kuji-system)
- [Authentication & User Management](#authentication--user-management)
- [Sync Service](#sync-service)
- [Visual Features](#visual-features)
- [Admin Dashboard](#admin-dashboard)
- [Development Tools](#development-tools)
- [API Endpoints](#api-endpoints)

---

## Core Kuji System

### Prize Drawing System
- **Weighted Random Engine** - Configurable probability-based drawing
- **Tier Support** - Tier S through M and beyond with custom tier codes
- **Fan Metadata** - Track fan names, session numbers, and queue positions
- **Draw History** - Complete session history with searchable records

### Weight Modes
- **Basic Mode** - Weight-only probability calculation
  - Simple multiplication: `prize weight × 1`
  - Quantity only prevents exhausted prizes
- **Advanced Mode** - Complex probability system
  - Formula: `weight × remaining quantity × tier priority`
  - Keeps total probability near 100%
  - Auto-balancing suggestions

### Prize Pool Management
- **CSV Import/Export** - Bulk prize data management
- **Sample Data** - Built-in sample prizes for quick setup
- **SKU Tracking** - Optional SKU field for inventory management
- **Live Editing** - Real-time prize pool editing with validation
- **Probability Guidance** - Visual probability display in advanced mode
- **One-Click Weight Recommendations** - Auto-calculate optimal weights

### Tier Customization
- **30 Color Swatches Per Tier** - Extensive color palette
- **19 Color Palettes** - Amber, purple, emerald, and more
- **Light/Dark Variants** - Automatic palette conversion
- **Custom Tier Codes** - Add tiers beyond default S-M
- **Palette-to-Hex Conversion** - Consistent color display across app
- **Visual Consistency** - Colors reflected in chips, badges, and tables

### Pricing & Presets
- **Draw Bundles** - Configurable preset packages
- **Bonus Draws** - "+X bonus draws" promotional presets
- **Currency Formatting** - Locale-aware price display
- **Whole Dollar Tracking** - Integer-based pricing for simplicity
- **Active/Inactive Presets** - Toggle preset availability
- **CSV Import/Export** - Bulk pricing management

### Country & Currency Settings
- **10 Country Presets** - Malaysia, Singapore, US, UK, Japan, Australia, Indonesia, Philippines, Thailand, Vietnam
- **Emoji Flags** - Visual country indicators (🇲🇾 🇸🇬 🇺🇸 etc.)
- **Locale Auto-Fill** - Automatic locale detection per country
- **Custom Currency** - Override with 3-5 letter currency codes
- **Number Formatting** - Region-appropriate price display

### History & Analytics
- **Session Tracking** - Complete draw history with metadata
- **Search & Filter** - Find draws by fan, tier, prize, or queue
- **Per-Tier Tallies** - Statistics for each tier drawn
- **Printable Logs** - Open detailed history in new tab
- **Session Numbers** - Auto-incrementing session counter

### Data Management
- **JSON Export/Import** - Complete app state backup/restore
- **CSV Export** - Prizes and pricing data export
- **Session Reset** - Clear history with confirmation dialogs
- **Counter Reset** - Reset session numbering
- **Backup Reminders** - Prompts before destructive operations

---

## Authentication & User Management

### Registration & Login
- **Email/Username Signup** - Traditional registration flow
- **Automatic Username Generation** - Format: `{adjective}-{noun}-{4-digit}`
  - Example: `swift-falcon-4521`
  - Allows username change if auto-generated
  - Permanent once user-set
- **JWT Authentication** - Secure token-based auth
- **Session Management** - Automatic token refresh
- **Password Requirements** - Minimum 8 characters with validation

### Multi-Provider SSO
- **Google OAuth** - Blue branded button (#4285f4)
- **GitHub OAuth** - Dark gray branded button (#333)
- **Discord OAuth** - Blurple branded button (#5865f2)
- **Facebook OAuth** - Blue branded button (#1877f2)
- **X/Twitter OAuth** - Black branded button (#000)
- **LinkedIn OAuth** - Blue branded button (#0a66c2)

*Note: OAuth providers are UI placeholders - backend implementation required*

### User Profiles
- **Profile Management** - Display name, username, email management
- **Multiple Emails** - Add, remove, verify multiple email addresses
- **Primary Email** - Set preferred email for communications
- **Email Verification** - Secure verification flow with resend option
- **Password Changes** - Secure password update with current password validation
- **Account Information** - Creation date, last login tracking
- **Connected Accounts** - View linked SSO providers

### Navigation & UI
- **User Dropdown** - Modern dropdown menu with avatar
  - Profile link
  - Quick navigation (Manage, Draw, Stock)
  - Logout button
- **Protected Routes** - Role-based access control
- **Automatic Redirects** - Smart post-login routing
- **Username Display** - Prominent username with status badges

### Username System
- **Temporary Usernames** - Auto-generated for email-only signups
- **Permanent Usernames** - User-set usernames (5-20 characters)
- **Username Validation** - Letters, numbers, hyphens, underscores only
- **Username Availability Check** - Real-time availability validation
- **Username Change Lock** - Permanent once user-set (contact support to change)
- **Status Badges** - Visual indicators for temporary vs permanent

---

## Sync Service

### Bidirectional Sync
- **Pull from Server** - Fetch latest data from backend
- **Push to Server** - Upload local changes to backend
- **Conflict Resolution** - Server data takes precedence
- **Full Sync on Demand** - Manual sync trigger on Stock page
- **Automatic Sync on Login** - Checks sync status and syncs if needed

### Data Types Supported
- **Prizes** - Prize pool data
- **Settings** - Application settings and configurations
- **History** - Draw history records
- **Presets/Pricing** - Pricing presets for draws

### Offline Support
- **Network Detection** - Automatic online/offline detection
- **Queue Management** - Operations queued when offline
- **Persistent Queue** - Queue saved to LocalForage
- **Queue Restoration** - Restores on app initialization
- **Periodic Processing** - Checks queue every 30 seconds

### Retry & Reliability
- **Exponential Backoff** - Smart retry delays (1s → 2s → 4s)
- **Max Retries** - 3 attempts per operation
- **Error Logging** - Comprehensive console logging
- **Graceful Degradation** - Local saves always succeed
- **Queue Item Tracking** - Unique IDs and attempt counters

### Integration Points
- **PrizePoolManager** - Syncs after prize save
- **PricingManager** - Syncs after preset save
- **Settings** - Syncs after settings update
- **DrawScreen** - Syncs prizes, history, settings after draw
- **Stock Page** - Full bidirectional sync on refresh

### Monitoring & Debugging
- **Console Logging** - Emoji-enhanced logs for visibility
  - 🔄 Sync operations
  - ⬇️ Pull operations
  - ⬆️ Push operations
  - ✅ Success
  - ❌ Failures
  - 🔁 Retries
  - ⚠️ Warnings
  - 📦 Queue restore
  - ➕ Queue add
  - 🌐 Network events
- **LocalForage Inspection** - View queue in browser DevTools
- **Operation Tracking** - Track sync status per operation

---

## Visual Features

### Scratch Card System
- **Interactive Scratching** - Mouse/touch-based reveal animation
- **Auto-sizing** - Cards dynamically match content dimensions
- **Scratch Progress** - Real-time scratch percentage tracking
- **Complete Callbacks** - Trigger actions on full reveal
- **Toggle Mode** - Switch between scratch and instant reveal
- **Unrevealed Counter** - Shows how many cards remain to scratch

### Scratch Card Visuals
- **Fallback Background** - Gray background behind scratch surface
- **Prize Content Gradient** - Vibrant purple gradient for prize display
- **Text Visibility** - Enhanced contrast for readability
- **Responsive Layout** - Grid layout with smart breakpoints
- **Animation Effects** - Smooth reveal transitions
- **Canvas-based Scratching** - High-performance HTML5 canvas

### Result Display
- **Animated Results** - Framer Motion animations for prize reveals
- **Tier Badges** - Color-coded tier indicators
- **Search & Filter** - Find specific prizes in results
- **Sort Options** - Sort by recent, tier A-Z, or tier Z-A
- **Tier Count Summary** - Quick overview of drawn tiers
- **Draw Metadata** - Session number, fan name, timestamp display

### Stock Visualization
- **Tier Cards** - Visual display of each tier's stock
- **Progress Bars** - Show remaining stock percentage
- **Color Coding** - Tier colors applied to cards and bars
- **Statistics Overview** - Total draws, remaining, last updated
- **Bonus Prizes** - Separate section for bonus items
- **Empty States** - Helpful messages when no prizes configured
- **Refresh Button** - Manual data refresh with loading state

### Loading States & Feedback
- **Spinner Animations** - Loading indicators for async operations
- **Toast Notifications** - Real-time user feedback
- **Button Disabled States** - Clear visual feedback during operations
- **Progress Indicators** - Show operation progress
- **Empty States** - Helpful messages and call-to-actions

---

## Admin Dashboard

### User Management (Super Admin)
- **User Table** - Paginated list of all users
- **Search & Filter** - Find users by name, email, username
- **Sort Options** - Sort by creation date, last login, username
- **User Actions**
  - Toggle super admin status
  - Revoke all user sessions
  - Delete user account
- **User Statistics**
  - Total users
  - Active users (logged in last 30 days)
  - Verified users
  - Unverified users

### Data Visualization
- **D3.js User Growth Chart** - 12-month registration trend
  - Beautiful area chart with gradient
  - Interactive data points with hover tooltips
  - Time-based X-axis with month labels
  - User count Y-axis with gridlines
  - Responsive SVG rendering

### Admin Controls
- **Role Management** - Promote/demote super admin privileges
- **Session Management** - Force logout by revoking sessions
- **User Deletion** - Permanent user account removal
- **Statistics Dashboard** - Real-time user metrics
- **Protected Routes** - Super admin-only access

---

## Development Tools

### Docker Development Environment
- **Docker Compose** - One-command setup for full stack
- **Hot Reloading** - Live code updates for frontend and backend
- **PostgreSQL Container** - Isolated database for development
- **Volume Mounts** - Persistent data and node_modules caching
- **Network Isolation** - Separate network for services
- **Health Checks** - Automatic service health monitoring
- **Environment Variables** - Easy configuration via `.env`

### Docker Commands
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Rebuild after package changes
docker-compose -f docker-compose.dev.yml up --build

# Stop all services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec backend npm run prisma:migrate

# Access database
docker-compose -f docker-compose.dev.yml exec db psql -U kuji_user -d kuji_dev
```

### Development Features
- **TypeScript** - Type-safe backend code
- **Prisma ORM** - Modern database toolkit
- **Database Migrations** - Version-controlled schema changes
- **Database Seeding** - Sample data for testing
- **Hot Module Replacement** - Instant frontend updates
- **Nodemon** - Automatic backend restart on changes
- **Error Handling** - Comprehensive error logging
- **Debug Logging** - Detailed console output

---

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET  /api/kuji/stock              - Get stock information
GET  /api/users/:username/stock   - Get user-specific stock
```

### Authentication Endpoints
```
POST /api/auth/signup             - Register new account
POST /api/auth/login              - Login with credentials
POST /api/auth/logout             - Logout and revoke tokens
POST /api/auth/refresh            - Refresh access token
GET  /api/auth/me                 - Get current user info
POST /api/auth/password-reset-request  - Request password reset
POST /api/auth/password-reset     - Reset password with token
GET  /api/auth/verify-email       - Verify email address
```

### User Management Endpoints (Authenticated)
```
GET    /api/user/profile          - Get user profile
PATCH  /api/user/profile          - Update profile
PUT    /api/user/username         - Update username
POST   /api/user/change-password  - Change password
POST   /api/user/emails           - Add email address
DELETE /api/user/emails/:id       - Remove email
PATCH  /api/user/emails/:id/primary         - Set primary email
POST   /api/user/emails/:id/resend-verification  - Resend verification
```

### Sync Endpoints (Authenticated)
```
POST /api/users/:username/sync-prizes    - Sync prize data
POST /api/users/:username/sync-settings  - Sync settings
POST /api/users/:username/sync-history   - Sync draw history
POST /api/users/:username/sync-presets   - Sync pricing presets

GET  /api/users/:username/prizes         - Get prize data
GET  /api/users/:username/settings       - Get settings
GET  /api/users/:username/presets        - Get pricing presets
```

### Admin Endpoints (Super Admin Only)
```
GET    /api/admin/users           - List all users
GET    /api/admin/stats           - Get user statistics
GET    /api/admin/users/:id       - Get user details
PATCH  /api/admin/users/:id       - Update user
DELETE /api/admin/users/:id       - Delete user
POST   /api/admin/users/:id/revoke-sessions  - Revoke user sessions
```

---

## Configuration

### Environment Variables

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:3001/api
```

#### Backend `server/.env`
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/create_kuji_db"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="30d"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Email (Optional)
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT="587"
EMAIL_USER="your-ethereal-user"
EMAIL_PASS="your-ethereal-password"
EMAIL_FROM="noreply@create-kuji.local"

# hCaptcha (Optional)
HCAPTCHA_SECRET="your-hcaptcha-secret"
```

### Database Configuration
- **SQLite** - Default for development
- **PostgreSQL** - Recommended for production
- **Prisma Migrations** - Version-controlled schema
- **Database Seeding** - Initial data setup

---

## Technology Stack

### Frontend Technologies
- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Vite 5** - Fast build tool and dev server
- **Tailwind CSS 3** - Utility-first styling
- **Framer Motion** - Animation library
- **D3.js** - Data visualization
- **Three.js** - 3D graphics and animations
- **LocalForage** - Client-side storage
- **Axios** - HTTP client with interceptors
- **PapaParse** - CSV parsing

### Backend Technologies
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Modern database toolkit
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### DevOps & Tools
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **Git** - Version control
- **npm** - Package management

---

## Security Features

### Authentication Security
- **JWT Tokens** - Secure token-based auth
- **Token Refresh** - Automatic session extension
- **Password Hashing** - bcrypt with salt
- **Email Verification** - Secure account confirmation
- **Session Management** - Token revocation support
- **Protected Routes** - Client-side route guards

### API Security
- **CORS Protection** - Controlled cross-origin access
- **Security Headers** - Helmet middleware
- **Input Validation** - Request validation
- **SQL Injection Prevention** - Prisma parameterized queries
- **Rate Limiting** - API request throttling (recommended)
- **HTTPS Support** - SSL/TLS encryption (production)

### Data Security
- **Encrypted Passwords** - Never stored in plaintext
- **Secure Tokens** - Signed JWT tokens
- **Environment Variables** - Sensitive config in `.env`
- **LocalForage Encryption** - Client-side data protection
- **Session Timeout** - Automatic logout after expiration

---

## Future Enhancements

### Planned Features
- [ ] OAuth provider implementation (Google, GitHub, Discord, etc.)
- [ ] Real-time notifications with WebSockets
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support expansion
- [ ] Theme customization (dark/light modes)
- [ ] Export to PDF/Excel
- [ ] QR code generation for draws
- [ ] Prize image uploads
- [ ] Inventory integration
- [ ] Payment gateway integration
- [ ] Event scheduling
- [ ] Customer CRM features

### Sync Service Enhancements
- [ ] Conflict resolution UI
- [ ] Diff-based syncing
- [ ] Sync status indicator in UI
- [ ] Partial data syncing
- [ ] Manual sync button
- [ ] Sync logs/history
- [ ] Sync metrics

---

## Support & Documentation

### Documentation Files
- `README.md` - Project overview and setup
- `CHANGELOG.md` - Version history and changes
- `FEATURES.md` - This file - complete feature reference
- `SYNC_SERVICE.md` - Sync service technical documentation
- `QUICK_START.md` - Quick setup guide
- `server/DOCKER.md` - Docker setup guide
- `server/README.md` - Backend-specific documentation

### Getting Help
- Check documentation files for detailed guides
- Review console logs for debugging information
- Inspect browser DevTools for frontend issues
- Check backend logs for server issues
- Review Prisma Studio for database inspection

---

**Create Kuji App** - Built with ❤️ by [Kyros Koh](https://github.com/kyroskoh)  
*Last Updated: 2025-10-07*

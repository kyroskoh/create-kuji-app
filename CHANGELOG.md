# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-10-07

### Added

#### Sync Service Enhancements
- **Pricing/Presets Sync Support** - Extended sync service to handle pricing presets
  - Added `getUserPresets` endpoint to fetch pricing data from server
  - Updated `pullDataFromServer()` to sync pricing alongside prizes and settings
  - Added 'pricing' dataType support in sync queue processing
- **Bidirectional Sync Integration** - Stock page now performs full sync on refresh
  - Pulls latest server data before displaying stock
  - Pushes any local changes to server
  - Ensures data consistency across devices
- **Comprehensive Sync Documentation** - Added `SYNC_SERVICE.md`
  - Architecture and file structure overview
  - Integration points for all pages/components
  - Testing instructions for offline/online scenarios
  - Monitoring, debugging, and troubleshooting guides
  - Best practices and future enhancements

#### Visual Improvements
- **Auto-sizing Scratch Cards** - Cards now dynamically match wrapped content dimensions
  - Uses `getBoundingClientRect()` for accurate measurement
  - Eliminates layout shifts during scratching animation
  - Responsive to different prize card sizes
- **Enhanced Scratch Card Visuals**
  - Added fallback gray background behind scratch surface
  - Improved prize content gradient (light pastel → vibrant purple)
  - Better visibility and contrast for prize reveals
  - Responsive grid layout with improved breakpoints

#### Docker Development Environment
- **Docker Compose Setup** - Full development environment with hot-reloading
  - `Dockerfile.dev` with Node.js 18 Alpine
  - `docker-compose.dev.yml` with frontend, backend, and PostgreSQL
  - `.dockerignore` for optimized builds
  - Volume mounts for live code updates
  - Comprehensive documentation in `server/DOCKER.md`

### Fixed

#### Authentication & Navigation
- **Username Redirect Loop** - Fixed infinite redirects after setting permanent username
  - Updated backend `getCurrentUser` to include `emailVerified` boolean
  - Changed from `user.emailVerified` to `user.emails[0]?.verifiedAt !== null`
  - Fixed frontend loading state consistency (using `loading` instead of `isLoading`)
  - Navigation links now appear correctly after username setup
- **Navigation Links Missing** - Resolved issue where nav links didn't show after auth
  - Added debug logs to verify auth state loading
  - Fixed AuthContext initialization guards
  - Improved state synchronization between frontend and backend
  - Advised cache clearing and auth data reset for clean state

#### Visual Fixes
- **Scratch Card Display** - Fixed white/blank scratch card appearance
  - Added gray fallback background
  - Enhanced prize content background gradient
  - Improved text visibility with better color contrast
- **Stock Page NaN Bug** - Fixed "NaN% remaining" on public stock page
  - Added division guard: shows 0% when total stock is zero
  - Improved percentage calculation safety

#### Build & Configuration
- **GitIgnore Updates** - Comprehensive ignore patterns for build artifacts
  - Added dist/ and build/ folders to root `.gitignore`
  - Added server-specific patterns to `server/.gitignore`
  - Excluded logs, database files, and editor configs
  - Prevents accidental commits of generated files

### Enhanced

#### Sync Service Integration
- **PrizePoolManager** - Now syncs prizes to backend after save
  - Automatic sync with 500ms delay for UI updates
  - Graceful error handling without blocking user
- **PricingManager** - Now syncs presets to backend after save
  - Follows same pattern as PrizePoolManager
  - Queues sync operations for offline resilience
- **Settings Component** - Enhanced settings sync
  - Already syncing to backend (existing functionality)
  - Now part of bidirectional sync flow
- **DrawScreen** - Enhanced draw result syncing
  - Syncs prizes, history, and settings after each draw
  - Uses `Promise.allSettled()` for parallel operations
  - 1-second delay to let animations complete
- **Stock Page** - Bidirectional sync on manual refresh
  - Full sync before fetching updated stock
  - Ensures latest data from all sources

#### Offline Support
- **Queue Persistence** - Sync queue survives page reloads
  - Stored in LocalForage under `create::sync_queue`
  - Restored on app initialization
  - Processed automatically when connection restored
- **Exponential Backoff** - Smart retry for failed operations
  - 3 max attempts per operation
  - Delays: 1s → 2s → 4s
  - Operations removed after max retries
- **Network Detection** - Automatic online/offline handling
  - Queues operations when offline
  - Processes queue when connection restored
  - Periodic 30-second queue check

### Technical Improvements

#### Code Organization
- Enhanced `syncService.js` with pricing support
- Updated `kujiAPI` with `getUserPresets` endpoint
- Improved error handling across sync operations
- Better logging for sync monitoring and debugging

#### Developer Experience
- Docker development environment for easy setup
- Comprehensive sync service documentation
- Detailed testing instructions for offline scenarios
- Console logging with emojis for better readability

### Documentation

- Added `SYNC_SERVICE.md` - Complete sync service guide
- Added `server/DOCKER.md` - Docker development setup
- Added `SYNC_SERVICE_IMPROVEMENTS.md` - Sync enhancement details
- Added `FIX_SUMMARY_2025-10-07.md` - Recent bug fixes
- Added `SCRATCH_CARD_AUTO_SIZE.md` - Auto-sizing feature
- Added `SCRATCH_CARD_IMPROVEMENTS.md` - Visual enhancements
- Added `BUG_FIX_SUMMARY.md` - Authentication fixes
- Added `BUGFIX_USERNAME_REDIRECT.md` - Redirect loop fix
- Added `TROUBLESHOOTING_NAV_LINKS.md` - Navigation debugging
- Added `GITIGNORE_UPDATE.md` - Build artifact exclusions

---

## [2.1.0] - 2025-10-05

### Added

#### Username Generation System
- Automatic username generation for users who sign up with only email addresses
- `usernameSetByUser` field to track if username was user-chosen or auto-generated
- Username generator utility with format: `{adjective}-{noun}-{4-digit-number}` (e.g., "swift-falcon-4521")
- Database migration to add `usernameSetByUser` boolean field
- Username can be changed later if it was auto-generated

#### User Interface Components
- **UserDropdown Component** - Modern dropdown menu for user navigation
  - Profile link to account settings
  - Quick navigation to manage/draw/stock pages
  - Logout functionality
  - Avatar display with first letter of username
- **DemoStock Page** - Public demo stock page at `/demo/stock`
  - Displays actual demo user's prize inventory
  - No authentication required (public read access)
  - Empty state handling with call-to-action
  - Location-based automatic refresh

#### Navigation Enhancements
- **useUserNavigation Hook** - Custom hook for user-specific navigation
  - Centralized navigation logic for user routes
  - Handles authenticated user routing
- Enhanced MainLayout with integrated UserDropdown
- Improved navigation flow between manage/draw/stock pages

### Fixed

#### Tier Color Display
- **Backend Color Loading** - Fixed tier colors not displaying on stock pages
  - Backend now uses custom tier colors from user settings
  - Added palette ID to hex code conversion (e.g., "purple" → "#A855F7")
  - Supports 19 color palettes with light and dark variants
  - Proper fallback priority: custom → default → gray
- **Public Access** - Removed authentication requirement from stock endpoints
  - Stock pages now publicly accessible (read-only)
  - Demo stock page works without login
- **Cache Invalidation** - Settings sync now clears stock cache
  - Tier color changes visible immediately after save

#### Stock Synchronization
- **Real-time Data Updates** - Stock page now shows fresh data on every visit
  - Added `location.key` dependency to useEffect
  - Ensures data reloads when navigating to stock page
  - Manual refresh button with loading states
- **Demo Stock Data** - Fixed demo stock showing mock data instead of real prizes
  - Changed from public mock endpoint to user-specific endpoint
  - Now displays actual demo user's configured prizes
  - Shows all tiers (S through M) instead of just S-C

#### Authentication & Routing
- **Login Redirects** - Fixed post-login destination
  - Changed from `/{username}/stock` to `/{username}/manage`
  - Users now land on manage page after authentication
- **Page Refresh Persistence** - Fixed authentication state on page refresh
  - Improved initialization guards in AuthContext
  - Added comprehensive debug logging
  - Prevents redirect loops on refresh
- **Token Management** - Improved logout to preserve demo kuji data
  - Only clears authentication tokens
  - Retains LocalForage kuji data for offline mode

### Enhanced

#### Backend API
- **User Stock Endpoint** - `/api/users/:username/stock`
  - Now publicly accessible (removed auth requirement)
  - Returns user's prize tiers with custom colors
  - Includes palette-to-hex color conversion
  - 30-second cache with automatic invalidation on updates
- **Settings Sync** - Enhanced settings synchronization
  - Cache clearing after settings updates
  - Improved tier color persistence
- **Prize Sync** - Better prize data synchronization
  - 500ms delay for optimal UX
  - Automatic cache invalidation
  - Maintains data consistency between frontend and backend

#### User Experience
- **Better Navigation** - Streamlined user navigation flow
  - Consistent user dropdown across all pages
  - Quick access to common actions
  - Clear visual feedback for current page
- **Loading States** - Improved loading indicators
  - Disabled buttons during operations
  - "Refreshing..." text on refresh button
  - Toast notifications for user feedback
- **Empty States** - Better handling of missing data
  - Helpful messages when no prizes configured
  - Call-to-action links to guide users
  - Clear instructions for first-time users

### Technical Improvements

#### Database Schema
- Added `usernameSetByUser` field to User model
- Migration: `20251005221929_add_username_set_by_user_field`
- Maintains backward compatibility with existing users

#### Code Organization
- New utility: `server/src/utils/usernameGenerator.ts`
- New controller: `server/src/controllers/userKujiController.ts`
- New component: `src/components/UserDropdown.jsx`
- New page: `src/pages/DemoStock.jsx`
- New hook: `src/hooks/useUserNavigation.js`
- Enhanced routing structure in `src/components/UserRoutes.jsx`

#### Cache Management
- Improved cache invalidation strategy
- Clear cache on both prize and settings sync
- 30-second TTL for stock data
- Manual refresh capability with user feedback

### Documentation

- Added `FIXES_SUMMARY.md` - Authentication and routing fixes
- Added `DEMO_STOCK_FIX.md` - Demo stock page real data display fix
- Added `STOCK_SYNC_FIX.md` - Stock update synchronization fix
- Added `TIER_COLOR_FIX.md` - Initial tier color display fix
- Added `TIER_COLOR_COMPLETE_FIX.md` - Complete tier color fix with palette conversion

### Breaking Changes

None. All changes are backward compatible with existing data and functionality.

## [2.0.0] - 2025-10-01

### Added

#### Authentication System
- JWT-based authentication with secure token refresh mechanism
- Multi-provider SSO support (Google, GitHub, Discord, Facebook, X/Twitter, LinkedIn)
- User registration and login with email/username
- Password reset and email verification flows
- Session management with automatic token refresh

#### Backend API Server
- Node.js/Express/TypeScript backend server
- Prisma ORM with SQLite database
- Comprehensive user management API endpoints
- Admin-only routes with role-based access control
- Email verification system with Nodemailer
- Secure password hashing with bcrypt

#### User Management
- Complete user profile management
- Email address management (add, remove, verify, set primary)
- Password change functionality
- Account creation date and last login tracking
- Super admin privileges and controls

#### Admin Dashboard
- Super admin user management interface
- User statistics and analytics
- User search, filtering, and pagination
- Administrative actions (promote/demote admin, revoke sessions, delete users)
- D3.js integration for data visualization (ready for charts)

#### Demo System
- Interactive demo page with sample credentials
- Demo user with full application access
- App features showcase and tech stack display
- Easy testing environment for new users

#### Authentication Pages
- Modern login page with SSO provider integration
- User registration page with validation
- Account management page with profile settings
- Protected route system with role-based access
- Toast notification system for user feedback

### Enhanced

#### Application Structure
- Upgraded from single-page to full-stack application
- Added React Router DOM for navigation
- Implemented protected routes and authentication guards
- Added global state management with React Context
- Integrated toast notification system

#### UI/UX Improvements
- Responsive design optimized for all screen sizes
- Modern authentication flow with intuitive interfaces
- Real-time notifications and feedback
- Clean admin dashboard with data tables
- Professional demo page layout

#### Security Features
- JWT token-based authentication
- Secure password storage with bcrypt hashing
- CORS protection and security headers
- Email verification for account security
- Session management and revocation

### Changed

#### Database Migration
- Migrated from LocalForage-only to full database persistence
- Added proper user/session management
- Implemented relational data structure with Prisma
- Added database seeding for initial setup

#### Application Scope
- Evolved from demo kuji app to production-ready user management system
- Added comprehensive authentication and authorization
- Implemented full CRUD operations for user management
- Added admin controls and user analytics

### Security

#### Authentication
- Implemented secure JWT authentication
- Added password hashing and validation
- Email verification for account security
- Session management and token refresh
- Protected API endpoints with proper authorization

#### Database Security
- Prepared statements through Prisma ORM
- Input validation and sanitization
- Secure environment variable management
- Database migration and seeding scripts

### Technical Improvements

#### Code Organization
- Modular component structure with separation of concerns
- Utility functions for API communication
- Context providers for global state management
- Custom hooks for data management
- TypeScript implementation on backend

#### Performance
- Optimized database queries with Prisma
- Efficient state management with React Context
- Automatic token refresh for seamless UX
- Cached authentication state

#### Developer Experience
- Comprehensive setup documentation
- Database seeding with sample data
- Development-friendly error handling
- Hot reload support for both frontend and backend

## [1.0.0] - Previous Release (2025-09-29)

### Initial Release
- Basic kuji drawing functionality
- Prize pool management
- Tier-based drawing system
- LocalForage persistence
- Admin interface for prize configuration
- Export/import functionality
- Multilingual support

---

For more details about the implementation, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) and [QUICK_START.md](./QUICK_START.md).

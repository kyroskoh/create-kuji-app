# 🚀 Quick Start Guide - Create Kuji App

## Prerequisites
- Node.js 18+
- PostgreSQL (optional - can postpone setup)
- npm or yarn

## Setup & Run

### 1. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 2. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Backend running on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running on: http://localhost:5173

## 🎯 Access the App

### Public Pages (No Login Required)
- **Home**: http://localhost:5173/
- **Stock Page**: http://localhost:5173/stock
- **Login**: http://localhost:5173/login
- **Signup**: http://localhost:5173/signup

### Protected Pages (Login Required)
- **Draw Page**: http://localhost:5173/draw
- **Account Settings**: http://localhost:5173/account

### Super Admin Pages (Super Admin Required)
- **User Management**: http://localhost:5173/admin/users
- **Kuji Admin**: http://localhost:5173/admin

**🚀 Development Mode:** Super admin authentication is automatically bypassed in development mode for easier testing. You can access admin pages directly without logging in when running `npm run dev`.

## 🔑 Test Accounts

### Super Admin (Seeded)
- **Username**: `kyroskoh`
- **Email**: `me@kyroskoh.com`
- **Password**: `Admin123!` (default)

### Create New Account
1. Go to http://localhost:5173/signup
2. Fill in:
   - Email address
   - Username (3+ chars, alphanumeric, hyphens, underscores)
   - Password (8+ chars)
   - Confirm password
3. Check "I agree to terms"
4. Click "Create Account"
5. You'll be logged in and redirected to `/account`

## 📱 Feature Tour

### After Signup/Login:

1. **Account Management** (`/account`)
   - View your username (read-only)
   - Add/remove/verify multiple emails
   - Change your password
   - See connected SSO providers
   - View account creation date and last login

2. **Draw Page** (`/draw`)
   - Access kuji drawing features
   - Scratch card animation
   - Prize reveal

3. **Stock Page** (`/stock`)
   - View prize tier availability
   - See remaining stock for S, A, B, C tiers
   - Check bonus prizes
   - Refresh stock data

### As Super Admin:

4. **User Management** (`/admin/users`)
   - View all users in table
   - Search users by name/email
   - Sort by creation date, last login, username
   - **D3.js User Growth Chart** (12-month visualization)
   - User actions:
     - Toggle super admin status
     - Revoke all sessions
     - Delete user
   - View stats: total, active, verified, unverified users

5. **Kuji Admin** (`/admin`)
   - Manage prize pools
   - Configure pricing
   - Adjust settings

## 🔧 API Endpoints

### Public
- `GET /api/kuji/stock` - Get stock information

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/me` - Get current user

### User Management (Authenticated)
- `GET /api/user/profile` - Get profile
- `PATCH /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `POST /api/user/emails` - Add email
- `DELETE /api/user/emails/:id` - Remove email
- `PATCH /api/user/emails/:id/primary` - Set primary email

### Admin (Super Admin Only)
- `GET /api/admin/users` - List users
- `GET /api/admin/stats` - Get statistics
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/revoke-sessions` - Revoke sessions

## 🎨 SSO Providers

The app includes buttons for 6 SSO providers:
- Google (Blue #4285f4)
- GitHub (Dark Gray #333)
- Discord (Blurple #5865f2)
- Facebook (Blue #1877f2)
- X/Twitter (Black #000)
- LinkedIn (Blue #0a66c2)

*Note: Currently placeholders. OAuth implementation needed.*

## 📊 D3.js Visualization

The User Growth Chart displays:
- 12 months of user registration data
- Beautiful area chart with gradient
- Interactive data points
- Time-based X-axis
- User count Y-axis

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running (if configured)
- Verify `.env` file exists with correct values
- Run `npm install` in `server/` directory

### Frontend won't start
- Run `npm install` in root directory
- Check port 5173 is available
- Clear browser cache

### Can't login
- Check backend is running on port 3001
- Check browser console for errors
- Verify credentials are correct

### Protected routes redirect to login
- Expected behavior if not authenticated
- Login first, then access protected routes

## 📝 Environment Variables

### Backend (`server/.env`)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/create_kuji_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="30d"
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"

# Email (Optional for now)
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT="587"
EMAIL_USER="your-ethereal-user"
EMAIL_PASS="your-ethereal-password"
EMAIL_FROM="noreply@create-kuji.local"

# hCaptcha (Optional)
HCAPTCHA_SECRET="your-hcaptcha-secret"
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access home page
- [ ] Can view stock page
- [ ] Can create new account
- [ ] Can login with new account
- [ ] Can access account settings
- [ ] Can add/remove emails
- [ ] Can change password
- [ ] Super admin can access `/admin/users`
- [ ] D3.js chart renders correctly
- [ ] Toast notifications appear
- [ ] Protected routes redirect to login when not authenticated

## 🎉 You're Ready!

Everything is set up and working! Start exploring the app and building amazing kuji experiences! 🎊

For detailed information, see `COMPLETED_FEATURES.md`.

---

*Quick Start Guide - Create Kuji App*
*Last Updated: 2025-10-05*

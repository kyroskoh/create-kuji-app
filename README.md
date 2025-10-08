# Create Kuji App

> **Created by [Kyros Koh](https://github.com/kyroskoh)**

A full-featured kuji drawing application with user authentication, admin dashboard, and comprehensive prize management built with React, Node.js, and modern web technologies.

## Features

### Core Kuji System
- **Prize Drawing System** – Weighted random engine with configurable tiers (Tier S and beyond) plus fan/session metadata.
- **Advanced Weight Modes** – Switch between basic (weight-only) and advanced (weight × quantity × tier priority) probability calculations.
- **Admin Probability Guidance** – The Prize Pool tab surfaces advanced suggestions and one-click weight recommendations when the advanced system is enabled.
- **Subscription-Based Tier Colors** – Plan-limited color palette access (Free: 1 color, Basic: 5 colors, Advanced: 10 colors, Pro: unlimited + custom hex picker).
- **Country & Currency Presets** – Region-aware settings with emoji flags, locale formatting, and custom currency overrides.
- **History Tracking** – Search, filter, and review draw sessions with fan names, queue numbers, and per-tier tallies.
- **Sample Data Import** – Built-in CSV samples for prizes and pricing to bootstrap offline events quickly.
- **Data Export/Import** – Export JSON snapshots or CSV backups before resetting sessions, then re-import to restore state.

### Authentication & User Management
- **Secure Authentication** – JWT-based login/signup system with session management
- **Automatic Username Generation** – Users can sign up with email only; system generates unique usernames
- **Multi-Provider SSO** – Support for Google, GitHub, Discord, Facebook, X (Twitter), and LinkedIn
- **User Profiles** – Complete account management with email verification and password changes
- **User Dropdown Navigation** – Modern dropdown menu with profile, manage, draw, and stock quick links
- **Super Admin Dashboard** – User management with D3.js analytics and administrative controls
- **Demo Mode** – Interactive demo with sample user credentials for easy testing
- **Public Demo Stock** – View demo user's prize inventory at `/demo/stock` without authentication

### Modern UI/UX
- **Responsive Design** – Tailwind-powered layout optimized for desktop, tablet, and mobile
- **Toast Notifications** – Real-time feedback with animated notifications
- **Protected Routes** – Role-based access control for admin and authenticated areas
- **Stock Display** – Public prize pool visualization with tier-based styling

### Development Tools
- **Minimizable Debug Panel** – Collapsible development panel showing API status, authentication state, and environment info
- **Pro Color Wheel** – Full-featured color picker with hex input, presets, and real-time preview for Pro plan users
- **Subscription Plan Management** – Feature gating based on user subscription level with clear upgrade prompts

## Technology Stack

### Frontend
- **Framework** – React 18 with React Router DOM
- **Build Tool** – Vite 5
- **Styling** – Tailwind CSS 3
- **State Management** – React Context API with hooks
- **Storage** – LocalForage for client-side persistence
- **Animation** – Framer Motion
- **Data Visualization** – D3.js for charts and analytics
- **3D Graphics** – Three.js for animations
- **HTTP Client** – Axios with automatic token refresh
- **CSV Handling** – PapaParse
- **Color Picker** – react-colorful for Pro plan custom color selection

### Backend
- **Runtime** – Node.js 18+ with Express.js
- **Language** – TypeScript
- **Database** – SQLite with Prisma ORM (development), PostgreSQL-ready for production
- **Authentication** – JWT tokens with Passport.js
- **Security** – bcrypt password hashing, CORS, Helmet
- **Email** – Nodemailer for verification emails

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Quick Start (Demo Mode)

For a quick demo without backend setup:

```bash
git clone https://github.com/kyroskoh/create-kuji-app.git
cd create-kuji-app
npm install
npm run dev
```

Then open http://localhost:5173/demo in your browser to explore the demo.

### Full Installation (Frontend + Backend)

1. **Clone and setup frontend:**
```bash
git clone https://github.com/kyroskoh/create-kuji-app.git
cd create-kuji-app
npm install
```

2. **Setup backend server:**
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

3. **Start both servers:**
```bash
# Terminal 1: Backend (from server/ directory)
npm run dev

# Terminal 2: Frontend (from root directory)
npm run dev
```

Then open http://localhost:5173 in your browser.

## Demo Routing Structure

The application provides several demo routes for easy exploration:

- **`/demo-page`** – Main demo landing page with features showcase, tech stack info, and demo login credentials
- **`/demo`** – Redirects to `/demo/stock` for backward compatibility
- **`/demo/stock`** – Demo user's public stock page (follows standard `/{username}/stock` pattern)
- **Home page "🎮 Try Live Demo" button** – Links to `/demo-page`
- **Navigation bar links** – "Try Demo 🎮" and "Demo Stock 📦" (visible when not logged in)

The demo stock page uses the same routing pattern as regular users (`/{username}/stock`) where "demo" is treated as a username, ensuring consistency across the application.

### Demo Credentials

- **Demo User**: username `demo`, password `Demo123!`
- **Super Admin**: Contact repository owner for credentials

### Production Build

```bash
npm run build
```

Artifacts land in the dist/ directory.

## Using the App

### Settings Overview

The Settings page is grouped into four cards:

1. **Region & Currency** – Search for a country (emoji flag included), auto-fill locale and currency, or override with a custom 3–5 letter code.
2. **Weight Engine** – Toggle between basic (weight only) and advanced (weight × quantity × tier priority). The active mode is displayed across the admin tabs.
3. **Tier Color Palette** – Select from plan-limited color swatches (Free: 1, Basic: 5, Advanced: 10, Pro: unlimited + custom hex picker). Pro users can access a full color wheel with hex input and preset colors.
4. **Maintenance** – Import & Export everything, reset session data, or reset the counter—confirmation dialogs remind you to back up first.

When advanced weighting is enabled, the **Prize Pool** tab displays probability guidance and offers one-click weight recommendations.

### Prize Pool Management

1. Navigate to **Admin > Prize Pool**.
2. Import the refreshed sample CSV (tiers S through M) or add entries manually; SKUs are optional.
3. Adjust tier, quantity, and weight—advanced mode factors tier priority and remaining quantity automatically.
4. Apply the suggested weights if you want to auto-balance weights and probabilities.
5. Save to persist in LocalForage.

### Pricing Presets

1. Go to **Admin > Pricing & Bonus (+)**.
2. Load the sample CSV or configure draw bundles in whole dollars.
3. The currency label auto-adapts to the region set in Settings.

### Running Draws

1. Open the **Draw** page.
2. Enter the fan name (required) and optional queue number.
3. Choose a preset or custom draw count and start the session.
4. Results animate in, with tier chips reflecting your palette and draw metadata pinned at the top.

### History & Exports

1. Click **History** to open the overlay and search by fan, tier, prize, or queue.
2. Review fan/session details and per-tier counts; use **Open** to view a printable log in a new tab.
3. Export data from the Admin tabs before resetting sessions (JSON export is available in Settings).

## Configuration Notes

- **CSV Format** – Pricing uses whole-dollar amounts (price column). Legacy price_minor columns are still parsed and converted.
- **Tier Ordering** – Tier S is preconfigured as the top tier; additional tiers follow the custom ordering helper.
- **Subscription Plans** – Four tiers available (Free, Basic $3, Advanced $5, Pro $10) with different feature limits:
  - Free: 3 tiers max, 1 color, 1-char tier names
  - Basic: 5 tiers max, 5 colors, 1-char tier names  
  - Advanced: 10 tiers max, 10 colors, 2-char tier names, tier sorting
  - Pro: Unlimited tiers/colors, 3-char tier names, custom hex picker, branding
- **Tier Colors** – Plan-limited access to color palettes with Pro users getting unlimited custom hex colors via color wheel picker.
- **Emoji Flags** – Flags are derived from ISO country codes to avoid mojibake (for example, MY → 🇲🇾, SG → 🇸🇬).
- **Username Generation** – Auto-generated usernames follow the format: `{adjective}-{noun}-{4-digit-number}` (e.g., "swift-falcon-4521").
- **Development Debug Panel** – In development mode, a collapsible debug panel shows API configuration and auth status (minimize with the button in the header).

## License

MIT License – see LICENSE for details.

## Acknowledgments

Built with ❤️ for the community.

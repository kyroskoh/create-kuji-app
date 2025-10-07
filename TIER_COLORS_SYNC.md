# Tier Color Bidirectional Sync System

## Overview
The tier color system ensures consistent color mapping between frontend and backend, with full support for online/offline bidirectional syncing.

## Default Tier Color Map
All users start with a consistent default tier color palette:

```javascript
{
  S: 'amber',    // Gold-like premium tier
  A: 'sky',      // Bright blue
  B: 'emerald',  // Green
  C: 'purple',   // Purple
  D: 'rose',     // Pink-red
  E: 'lime',     // Lime green
  F: 'teal',     // Teal blue
  G: 'cyan',     // Cyan
  H: 'violet',   // Violet
  I: 'fuchsia',  // Fuchsia pink
  J: 'indigo',   // Indigo
  K: 'orange',   // Orange
  L: 'yellow',   // Yellow
  M: 'green',    // Green
  N: 'blue',     // Blue
  O: 'red',      // Red
  P: 'pink',     // Pink
  Q: 'stone',    // Stone gray
  R: 'slate',    // Slate gray
  T: 'amber-dark',
  U: 'sky-dark',
  V: 'emerald-dark',
  W: 'purple-dark',
  X: 'rose-dark',
  Y: 'orange-dark',
  Z: 'blue-dark'
}
```

## Architecture

### Frontend (`src/utils/tierColors.js`)
- `DEFAULT_TIER_COLOR_MAP`: Palette ID mapping for each tier
- Color palette IDs (e.g., "amber", "sky") map to Tailwind CSS classes
- Functions: `tierBadgeClass()`, `tierInputClass()`, `tierChipClass()`

### Frontend (`src/utils/colorPalette.js`)
- Full color palette definitions with Tailwind classes
- Each palette has: id, label, badgeClass, inputClass, chipClass, swatchClass

### Backend (`server/src/utils/defaultSettings.ts`)
- `DEFAULT_TIER_COLOR_MAP`: Same mapping as frontend
- `getDefaultUserSettings()`: Returns complete default settings including tier colors

### Backend (`server/src/controllers/kujiController.ts`)
- `getUserStock()`: Converts palette IDs to hex codes for API responses
- Palette to hex mapping for visual display
- Falls back to default colors if user hasn't customized

## Data Flow

### 1. New User Registration
```
User signs up
  → authController.signup()
  → Creates User with userSettings
  → userSettings.tierColors = JSON.stringify(DEFAULT_TIER_COLOR_MAP)
  → Tier colors stored in database
```

### 2. User Modifies Tier Colors (Frontend)
```
User changes colors in Settings
  → Stored in LocalForage (local)
  → syncService queues sync
  → When online: POST /api/users/:username/sync-settings
  → Server updates userSettings.tierColors
  → Stock cache cleared for user
```

### 3. Loading Tier Colors (Frontend)
```
Page load
  → useLocalStorageDAO.getSettings()
  → Returns merged settings (defaults + custom)
  → Tier colors used for UI rendering
```

### 4. Syncing Settings (Bidirectional)
```
User logs in
  → syncService.onUserLogin()
  → Pull from server: GET /api/users/:username/settings
  → Merge with local changes
  → Push local changes: POST /api/users/:username/sync-settings
  → Both sides synchronized
```

### 5. Displaying Stock Page
```
GET /api/users/:username/stock
  → Loads user.userSettings.tierColors from DB
  → Parses JSON string to object
  → Maps palette IDs to hex codes
  → Returns tiers with proper colors
  → Frontend displays with correct colors
```

## Storage Format

### Database (SQLite)
```sql
-- In user_settings table
tierColors: STRING (JSON)
-- Example: '{"S":"amber","A":"sky","B":"emerald",...}'
```

### LocalForage (IndexedDB)
```javascript
// In settings object
{
  tierColors: {
    "S": "amber",
    "A": "sky",
    "B": "emerald",
    // ...
  }
}
```

### API Response
```json
{
  "tierColors": {
    "S": "amber",
    "A": "sky",
    "B": "emerald"
  }
}
```

## Offline Mode Support

### Queue System
- Changes made offline are queued in LocalForage
- Queue persisted: `create::sync_queue`
- When connection restored: automatic sync
- Retry logic with exponential backoff (max 3 attempts)

### Conflict Resolution
- Last-write-wins strategy
- Local changes always pushed on sync
- No merge conflicts (user settings are personal)

## Color Mapping

### Palette ID → Hex Code (Backend)
```typescript
const paletteToHex = {
  'amber': '#F59E0B',
  'sky': '#38BDF8',
  'emerald': '#10B981',
  'purple': '#A855F7',
  'rose': '#F43F5E',
  // ... (see kujiController.ts)
};
```

### Fallback Strategy
```
Custom tier color (palette ID) 
  → Convert to hex using paletteToHex
  → If not found, use default tier color
  → If tier not in defaults, use fallback gray (#6B7280)
```

## Key Files

### Frontend
- `src/utils/tierColors.js` - Tier logic and defaults
- `src/utils/colorPalette.js` - Color palette definitions
- `src/hooks/useLocalStorageDAO.js` - Local storage with defaults
- `src/services/syncService.js` - Bidirectional sync
- `src/components/Manage/Settings.jsx` - UI for color customization

### Backend
- `server/src/utils/defaultSettings.ts` - Default settings utility
- `server/src/controllers/authController.ts` - User creation with settings
- `server/src/controllers/userKujiController.ts` - Settings CRUD and sync
- `server/src/controllers/kujiController.ts` - Stock with colors
- `server/src/utils/seed.ts` - Database seeding

## Testing

### Verify Default Colors
1. Reset database: `npx prisma migrate reset --force`
2. Seed users: `npm run prisma:seed`
3. Login as demo user
4. Check stock page - colors should match palette

### Verify Sync
1. Modify tier colors in Settings
2. Go offline (DevTools → Network → Offline)
3. Modify more colors
4. Go back online
5. Refresh page - changes should persist

### Verify New User
1. Sign up new account
2. Check Settings - should have default tier colors
3. Visit stock page - should show proper colors

## API Endpoints

### GET /api/users/:username/settings
Returns user settings with parsed tierColors object

### POST /api/users/:username/sync-settings
Syncs settings from frontend, stores tierColors as JSON string

### GET /api/users/:username/stock
Returns stock data with tier colors converted to hex codes

## Notes

- Tier colors stored as JSON string in database for flexibility
- Frontend uses palette IDs, backend converts to hex for display
- All new users get DEFAULT_TIER_COLOR_MAP automatically
- Settings automatically created if missing (lazy initialization)
- Stock cache cleared when tier colors updated
- Fully supports offline-first architecture

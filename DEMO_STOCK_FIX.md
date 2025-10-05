# Demo Stock Page - Real Data Display Fix

## Problem
The public demo stock page at `/demo/stock` was showing static mock data (tiers S, A, B, C only) instead of the actual demo user's prizes (which included tiers S to M).

## Root Cause

The `DemoStock.jsx` component was calling the public stock endpoint:
```jsx
const response = await kujiAPI.getStock(); // Public endpoint with mock data
```

This public endpoint (`GET /api/kuji/stock`) returns hardcoded mock data from the backend:
- Tier S: 5 total, 3 remaining
- Tier A: 20 total, 15 remaining  
- Tier B: 50 total, 40 remaining
- Tier C: 100 total, 85 remaining

The actual demo user's prizes (managed via `/demo/manage`) were stored in:
1. LocalForage (browser storage) - immediately
2. Database (backend) - after sync (500ms delay)

But the `/demo/stock` page wasn't fetching the real demo user's data.

## Solution Implemented

### Changes to `src/pages/DemoStock.jsx`

#### 1. **Fetch Real Demo User Data**
Changed from public mock endpoint to user-specific endpoint:

```jsx
// Before:
const response = await kujiAPI.getStock();

// After:
const response = await kujiAPI.getUserStock('demo');
```

This now fetches the actual demo user's prizes from the database.

#### 2. **Added Location-Based Refresh**
Similar to Stock page improvements:

```jsx
import { useLocation } from 'react-router-dom';

const location = useLocation();

useEffect(() => {
  // ... load data
}, [location.key]); // Reload when navigating to this page
```

**Benefits:**
- Fresh data every time user visits the page
- Automatically shows updates after managing prizes

#### 3. **Added Empty State Handling**
Shows helpful message when demo user has no prizes:

```jsx
{stockData && stockData.tiers && stockData.tiers.length > 0 ? (
  // Show prize tiers
) : (
  <div>
    <p>No Prizes Available Yet</p>
    <p>The demo user hasn't set up any prizes yet. Try the demo login to manage prizes!</p>
    <Link to="/demo">Try Demo Login 🎮</Link>
  </div>
)}
```

**Benefits:**
- Clear indication when no data exists
- Guides users to set up prizes via demo login
- Better UX for first-time visitors

## Data Flow After Fix

```
1. User logs in as demo → Goes to /demo/manage
   └─> Sets up prizes (tiers S to M)
   └─> Saves to LocalForage (instant)
   └─> Syncs to backend database (500ms delay)
       └─> Backend clears cache

2. User (or public visitor) visits /demo/stock
   └─> DemoStock component loads
   └─> Fetches demo user's stock: GET /api/users/demo/stock
   └─> Backend returns real prize data from database
   └─> Shows tiers S to M with actual quantities ✅
```

## Testing Instructions

### Test 1: View Demo Stock (No Prizes Yet)
1. Ensure demo user has no prizes in database
2. Visit `/demo/stock`
3. **Expected**: See "No Prizes Available Yet" message with link to demo login

### Test 2: Set Up Prizes and View Stock
1. Visit `/demo` and click "Login as Demo User"
2. Navigate to `/demo/manage`
3. Add prizes for tiers S, A, B, C, D, E, F, etc.
4. Click "Save"
5. Wait 1 second (for sync to complete)
6. Navigate to `/demo/stock`
7. **Expected**: See all prize tiers you created (S to M or whatever tiers you used)

### Test 3: Update Prizes and Refresh
1. While logged in, update prizes on `/demo/manage`
2. Save changes
3. Open `/demo/stock` in a new tab (or navigate to it)
4. **Expected**: See updated prizes immediately

### Test 4: Public Access
1. Log out or open in incognito window
2. Visit `/demo/stock` directly
3. **Expected**: See the demo user's public prize stock (read-only view)

### Test 5: Cache Refresh
1. Visit `/demo/stock`
2. Click "Refresh Stock Data" button
3. **Expected**: 
   - Data reloads
   - Shows any recent updates

## Routes Summary

After this fix, here's how the routes work:

| Route | Component | Authentication | Data Source | Purpose |
|-------|-----------|----------------|-------------|---------|
| `/demo` | Demo.jsx | None | Static | Demo landing page with login buttons |
| `/demo/stock` | DemoStock.jsx | None | Database (demo user) | Public view of demo user's prizes |
| `/demo/manage` | *Redirected* | Required | - | Not a valid route (redirects) |
| `/demo/draw` | Draw.jsx (via UserRoutes) | Required | LocalForage | Authenticated drawing interface |
| `/demo/manage` | Manage.jsx (via UserRoutes) | Required (must be demo user) | LocalForage + Backend | Prize management |
| `/demo/stock` | Stock.jsx (via UserRoutes) | Required (must be demo user) | Backend | Authenticated stock view |

**Note:** `/demo/stock` matches **two routes**:
1. Public route (line 24 in App.jsx) → `DemoStock.jsx` - matches first
2. User route pattern `/:username/stock` → `Stock.jsx` - would match but never reached

The public route takes precedence, which is intentional for public demo visibility.

## Backend API Endpoints Used

### Before Fix:
- `GET /api/kuji/stock` - Returns mock data (still used for other purposes)

### After Fix:
- `GET /api/users/demo/stock` - Returns actual demo user's prize data from database
  - Includes cache with 30-second TTL
  - Cache cleared when prizes synced
  - Returns empty tiers array if user has no prizes

## Comparison: Before vs After

### Before:
```
Demo Stock Page (/demo/stock)
├─ Calls: GET /api/kuji/stock
├─ Returns: Mock data (hardcoded tiers S, A, B, C)
└─ Result: Always shows same static data ❌
```

### After:
```
Demo Stock Page (/demo/stock)
├─ Calls: GET /api/users/demo/stock
├─ Returns: Real demo user data from database
├─ Shows: Actual tiers configured by demo user
└─ Result: Dynamic, always up-to-date ✅
```

## Additional Notes

### Cache Behavior
- Backend caches user stock for 30 seconds
- Cache automatically cleared when prizes synced
- Manual refresh available via button
- Location-based refresh ensures fresh data on navigation

### Empty State
- If demo user has no prizes in database yet
- Shows helpful empty state with call-to-action
- Guides users to demo login to set up prizes

### Frontend Sync Delay
- LocalForage saves immediately (instant feedback)
- Backend sync happens after 500ms
- Most users won't notice delay when navigating
- Cache clearing ensures data consistency

## Future Improvements

### 1. **Loading Skeleton**
Instead of spinner, show prize tier skeleton loaders:
```jsx
<div className="animate-pulse space-y-4">
  <div className="h-24 bg-slate-700 rounded-lg"></div>
  <div className="h-24 bg-slate-700 rounded-lg"></div>
</div>
```

### 2. **Real-time Updates**
Add WebSocket or polling for live updates:
- Show when prizes are being updated
- Auto-refresh when changes detected
- Show "New data available" banner

### 3. **Sample Data Button**
Add button to load sample prizes for demo:
```jsx
<button onClick={loadSamplePrizes}>
  Load Sample Prizes
</button>
```

### 4. **QR Code for Sharing**
Generate QR code for easy sharing:
```jsx
<QRCode value="https://yourapp.com/demo/stock" />
```

## Files Modified

1. `src/pages/DemoStock.jsx`
   - Changed API call from `getStock()` to `getUserStock('demo')`
   - Added `useLocation` hook for navigation-based refresh
   - Added location.key to useEffect dependencies
   - Added empty state for when no prizes exist
   - Improved conditional rendering

## Related Fixes

- Stock page sync fix (STOCK_SYNC_FIX.md)
- Authentication persistence (FIXES_SUMMARY.md)
- Cache invalidation on prize sync (already implemented in backend)

## Breaking Changes

None. This is a transparent improvement that maintains backward compatibility while showing real data instead of mock data.

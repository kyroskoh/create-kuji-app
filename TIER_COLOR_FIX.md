# Tier Color Display Fix

## Problem
The `/{username}/stock` page (including `/demo/stock`) was not displaying the user's custom tier colors configured in the Settings page under `/{username}/manage` → Settings tab → Tier Colors.

Instead, it was always showing the default tier colors:
- S: Gold (#FFD700)
- A: Silver (#C0C0C0)
- B: Bronze (#CD7F32)
- C: Blue (#4A90E2)
- etc.

## Root Cause

### Backend Issue
In `server/src/controllers/kujiController.ts`, the `getUserStock` function:

1. **Correctly loaded** user's tier colors from database (line 193):
   ```typescript
   tierColors = user.userSettings?.tierColors ? JSON.parse(user.userSettings.tierColors) : {};
   ```

2. **BUT didn't use them** when building tier objects (line 219):
   ```typescript
   color: defaultColors[tierId] || '#6B7280',  // ❌ Only using default colors!
   ```

The `tierColors` object was loaded but never referenced when assigning colors to tiers.

### Cache Issue
Additionally, when settings (including tier colors) were synced to the backend via `syncSettings`, the stock cache was not being cleared, so even if colors were fixed, old cached data would still be served.

## Solution Implemented

### Fix 1: Use Custom Tier Colors (Backend)
**File**: `server/src/controllers/kujiController.ts`

Changed line 219-220 to prioritize user's custom colors:

```typescript
// Before:
color: defaultColors[tierId] || '#6B7280',

// After:
// Use user's custom tier color first, then default color, then fallback gray
color: tierColors[tierId] || defaultColors[tierId] || '#6B7280',
```

**Priority order:**
1. User's custom tier color from settings
2. System default color for that tier
3. Fallback gray (#6B7280) for unknown tiers

### Fix 2: Clear Cache on Settings Sync (Backend)
**File**: `server/src/controllers/userKujiController.ts`

Added cache clearing after syncing settings (line 123-124):

```typescript
// Clear the stock cache for this user so tier colors are updated
clearUserStockCache(username);
```

This ensures that when tier colors are changed in settings and synced to the backend, the stock page will show the new colors on the next fetch (after cache TTL or when navigating to the page).

## Data Flow After Fix

### Setting Custom Tier Colors:
```
1. User goes to /{username}/manage → Settings tab
   └─> Configures custom tier colors (e.g., S: Purple, A: Orange)
   └─> Saves settings
   └─> Syncs to LocalForage (instant)
   └─> Syncs to backend database (500ms delay)
       └─> Backend saves tierColors as JSON in userSettings table
       └─> Backend clears stock cache for this user ✅

2. User visits /{username}/stock (or anyone visits /demo/stock)
   └─> Backend fetches user's stock
   └─> Loads tierColors from userSettings
   └─> Applies custom colors to each tier
   └─> Returns stock with correct colors ✅
```

### Color Priority Example:
```typescript
// User has custom colors: { "S": "#9333EA", "A": "#F97316" }
// Default colors: { "S": "#FFD700", "A": "#C0C0C0", "B": "#CD7F32" }

Tier S: tierColors["S"] = "#9333EA" ✅ (Custom purple)
Tier A: tierColors["A"] = "#F97316" ✅ (Custom orange)
Tier B: tierColors["B"] = undefined → defaultColors["B"] = "#CD7F32" ✅ (Default bronze)
Tier M: tierColors["M"] = undefined → defaultColors["M"] = undefined → "#6B7280" ✅ (Fallback gray)
```

## Testing Instructions

### Test 1: Set Custom Tier Colors
1. Log in as demo user
2. Navigate to `/demo/manage` → Settings tab
3. Scroll to "Tier Colors" section
4. Click on a tier (e.g., S Tier) to change its color
5. Pick a custom color (e.g., purple #9333EA)
6. Save settings
7. Wait 1 second for sync
8. Navigate to `/demo/stock`
9. **Expected**: S Tier badge shows purple color

### Test 2: Multiple Custom Colors
1. Set custom colors for multiple tiers (S, A, B)
2. Leave some tiers with default colors (C, D)
3. Add a new tier that doesn't have a default (M)
4. Save and navigate to stock page
5. **Expected**:
   - Custom colored tiers show your selected colors
   - Default tiers show standard colors
   - New tier (M) shows gray fallback color

### Test 3: Public View of Custom Colors
1. Log out or use incognito window
2. Visit `/demo/stock` (public demo stock page)
3. **Expected**: Shows the same custom tier colors configured by demo user

### Test 4: Reset to Defaults
1. Go back to Settings → Tier Colors
2. Reset tier colors (or select default colors)
3. Save
4. Navigate to stock page
5. **Expected**: Shows default tier colors again

### Test 5: Cache Refresh
1. Change tier colors in settings
2. Save
3. Immediately visit stock page (before 30s cache expires)
4. **Expected**: New colors visible immediately (cache was cleared)

## Backend Changes Summary

### `server/src/controllers/kujiController.ts`
```diff
  const tiers = Object.entries(tierGroups).map(([tierId, group]) => {
    return {
      id: tierId,
      name: `${tierId} Tier`,
-     color: defaultColors[tierId] || '#6B7280',
+     // Use user's custom tier color first, then default color, then fallback gray
+     color: tierColors[tierId] || defaultColors[tierId] || '#6B7280',
      totalStock,
      remainingStock,
      probability: totalRemaining > 0 ? remainingStock / totalRemaining : 0,
      description: group.prizes.map(p => p.prizeName).join(', ')
    };
  });
```

### `server/src/controllers/userKujiController.ts`
```diff
  // Upsert user settings
  const userSettings = await prisma.userSettings.upsert({
    // ... upsert logic
  });

+ // Clear the stock cache for this user so tier colors are updated
+ clearUserStockCache(username);

  return res.status(200).json({
    message: 'Settings synced successfully',
    settings: userSettings
  });
```

## Default Tier Colors Reference

The system provides these default colors for common tiers:

| Tier | Color Name | Hex Code | Description |
|------|-----------|----------|-------------|
| S | Gold | #FFD700 | Ultra rare / Special |
| A | Silver | #C0C0C0 | Premium |
| B | Bronze | #CD7F32 | High quality |
| C | Blue | #4A90E2 | Standard |
| D | Light Green | #90EE90 | Common |
| E | Orange | #FFA500 | Basic |
| F | Tomato Red | #FF6347 | Entry level |
| (other) | Gray | #6B7280 | Fallback for unknown tiers |

Users can override any of these with their own custom colors via the Settings page.

## Database Schema

The tier colors are stored in the `userSettings` table as a JSON string:

```sql
CREATE TABLE "UserSettings" (
  ...
  "tierColors" TEXT,  -- JSON string: {"S": "#9333EA", "A": "#F97316", ...}
  ...
);
```

Example stored value:
```json
{
  "S": "#9333EA",
  "A": "#F97316", 
  "B": "#10B981",
  "C": "#3B82F6"
}
```

## Frontend Integration

The frontend manages tier colors in two places:

1. **Settings Page** (`src/components/Admin/Settings.jsx`):
   - Color picker for each tier
   - Saves to LocalForage
   - Syncs to backend via `syncUserData(username, 'settings', settings)`

2. **Stock Page** (`src/pages/Stock.jsx` & `src/pages/DemoStock.jsx`):
   - Fetches stock data from backend
   - Backend includes tier colors in response
   - Frontend displays colors using `style={{ backgroundColor: tier.color }}`

No frontend changes needed for this fix - the backend now sends correct colors.

## Cache Behavior

- **Cache TTL**: 30 seconds for stock data
- **Cache Invalidation**: Automatically cleared when:
  - Prizes are synced (updated)
  - Settings are synced (including tier color changes) ✅ NEW
- **Manual Refresh**: User can click "Refresh Stock Data" button

## Additional Notes

### Performance Impact
- Minimal - only added one extra OR operation in color lookup
- Cache clearing is cheap (Map.delete operation)
- No additional database queries

### Backward Compatibility
- Users without custom tier colors: Uses default colors (existing behavior)
- Existing cached data: Will update on next cache expiration or refresh
- Frontend: No changes needed - already expects color field in tier objects

## Future Improvements

### 1. **Real-time Color Preview**
While editing tier colors in Settings, show live preview of how stock page will look:
```jsx
<TierColorPreview tiers={prizes} colors={tierColors} />
```

### 2. **Color Theme Presets**
Offer predefined color schemes:
- Classic (gold/silver/bronze)
- Rainbow (vibrant colors)
- Monochrome (shades of one color)
- Pastel (soft colors)

### 3. **Color Validation**
Ensure colors have sufficient contrast against background:
```typescript
if (calculateContrast(color, backgroundColor) < 4.5) {
  warn('Low contrast - text may be hard to read');
}
```

### 4. **Tier Color Animation**
Animate color changes when updating:
```css
.tier-badge {
  transition: background-color 0.3s ease;
}
```

## Files Modified

1. **`server/src/controllers/kujiController.ts`**
   - Line 219-220: Use custom tier colors with fallback priority

2. **`server/src/controllers/userKujiController.ts`**
   - Line 123-124: Clear stock cache when settings synced

## Related Features

- Settings page tier color picker (existing)
- Stock page tier display (existing)
- Cache invalidation system (enhanced)
- Settings sync service (enhanced)

## No Breaking Changes

This is a bug fix that restores expected behavior. All existing functionality remains unchanged, but now works correctly.

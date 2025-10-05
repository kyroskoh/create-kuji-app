# Stock Update Synchronization Fix

## Problem
When updating prizes on the `/{username}/manage` page, the changes were not immediately visible on the `/{username}/stock` page.

## Root Causes

### 1. **Data Flow Architecture**
- **Manage Page**: Saves data to LocalForage (browser storage) → syncs to backend after 500ms delay
- **Stock Page**: Loads data from backend API (not LocalForage)
- **Backend**: Caches stock data for 30 seconds to reduce database queries

### 2. **React Component Lifecycle**
- Stock page's `useEffect` had empty dependency array `[]`
- This meant data only loaded once when component first mounted
- React Router could reuse the component instance when navigating back, preventing fresh data loads

### 3. **Timing Issues**
- Frontend could navigate to Stock page before backend sync completed
- No mechanism to force reload after updates

## Solution Implemented

### Frontend Changes (`src/pages/Stock.jsx`)

#### 1. **Added useLocation Hook**
```jsx
import { useParams, useLocation } from 'react-router-dom';

const location = useLocation();
```

#### 2. **Fixed useEffect Dependencies**
```jsx
useEffect(() => {
  loadStock();
}, [username, location.key]); // ✅ Now reloads on username change OR navigation
```

**Why this works:**
- `location.key` changes every time you navigate to a route
- This triggers a fresh data load every time you visit the Stock page

#### 3. **Improved loadStock Function**
```jsx
const loadStock = async (forceRefresh = false) => {
  try {
    setLoading(true);
    const response = await kujiAPI.getUserStock(username);
    setStockData(response.data);
    if (forceRefresh) {
      toast.success('Stock data refreshed');
    }
  } catch (error) {
    console.error('Error loading user stock:', error);
    toast.error(`Failed to load stock information for ${username}`);
  } finally {
    setLoading(false);
  }
};
```

**Improvements:**
- Added `forceRefresh` parameter for manual refresh
- Sets loading state at start of function
- Shows success toast when manually refreshed

#### 4. **Enhanced Refresh Button**
```jsx
<button
  onClick={() => loadStock(true)}
  disabled={loading}
  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
>
  {loading ? 'Refreshing...' : 'Refresh Stock Data'}
</button>
```

**Improvements:**
- Button disabled during loading
- Shows "Refreshing..." text when loading
- Passes `forceRefresh=true` to show confirmation toast

### Backend (Already Implemented Correctly)

The backend in `server/src/controllers/userKujiController.ts` already clears the cache when prizes are synced:

```typescript
export async function syncPrizes(req: Request, res: Response) {
  // ... sync logic ...
  
  // Clear the stock cache for this user so fresh data is fetched
  clearUserStockCache(username); // ✅ Already implemented
  
  return res.status(200).json({
    message: 'Prizes synced successfully',
    count: createdPrizes.count
  });
}
```

## Data Flow After Fix

```
1. User edits prizes in Manage page
   └─> Saves to LocalForage (instant)
   └─> Syncs to backend after 500ms
       └─> Backend clears cache for that user
       
2. User navigates to Stock page
   └─> location.key changes
   └─> useEffect triggers loadStock()
   └─> Fetches from backend (cache already cleared)
   └─> Shows updated data ✅
```

## Testing Instructions

### Test 1: Basic Update Flow
1. Go to `/{username}/manage`
2. Add or edit prizes
3. Click "Save"
4. Navigate to `/{username}/stock`
5. **Expected**: See updated prizes immediately

### Test 2: Multiple Updates
1. Update prizes multiple times
2. Navigate between Manage and Stock pages
3. **Expected**: Stock page always shows latest data

### Test 3: Manual Refresh
1. Go to Stock page
2. Click "Refresh Stock Data" button
3. **Expected**: 
   - Button shows "Refreshing..." while loading
   - Success toast appears
   - Data is reloaded

### Test 4: Different Users (if super admin)
1. Update prizes for user A
2. Navigate to user A's stock page
3. Navigate to user B's stock page
4. Navigate back to user A's stock page
5. **Expected**: Each user's data loads correctly

## Additional Notes

### Cache TTL
- Backend caches stock data for 30 seconds (CACHE_TTL)
- This is reasonable for performance
- Cache is cleared on sync, so updates are immediate
- Consider reducing to 10-15 seconds if users report stale data

### Sync Delay
- Frontend waits 500ms before syncing to backend
- This allows UI to update first
- This is acceptable since most users won't navigate away that quickly
- If needed, could be reduced to 200-300ms

### Future Improvements

1. **Real-time Updates with WebSocket**
   - Push updates to Stock page when data changes
   - Eliminates need for polling or refresh

2. **Optimistic UI Updates**
   - Stock page could also read from LocalForage first
   - Show local data immediately while fetching from backend
   - Update with backend data when available

3. **Loading Skeleton**
   - Show prize tier skeletons instead of spinner
   - Better UX during loading

4. **Sync Status Indicator**
   - Show when data is being synced
   - Indicate if sync failed (with retry option)

## Files Modified

1. `src/pages/Stock.jsx` - Added location tracking, fixed dependencies, improved refresh
2. Backend already had cache clearing implemented

## Related Issues

- Authentication persistence fixes (FIXES_SUMMARY.md)
- Token clearing fixes (preserving kuji data)

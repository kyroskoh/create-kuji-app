# Unsaved Changes Tracking System

## Problem
Previously, when users made local changes (like clearing prizes) and refreshed the page, the sync service would pull data from the server and overwrite their unsaved local changes. This was frustrating because:

1. User clears prizes locally
2. User refreshes page
3. Sync pulls from server (which has old data)
4. Local "cleared" state is overwritten
5. User loses their unsaved changes

## Solution
Implemented a "dirty state" tracking system that prevents server data from overwriting local unsaved changes.

## How It Works

### 1. Dirty State Flag
- Stored in LocalForage as `create::dirty_state`
- JSON object with flags for different data types:
  ```json
  {
    "prizes": true,     // Prizes have unsaved changes
    "pricing": false,   // Pricing is synced
    "settings": false   // Settings are synced
  }
  ```

### 2. Setting the Dirty Flag
When users modify data, the dirty flag is set to `true`:

**Prize Modifications:**
- Import CSV → `setDirtyFlag('prizes', true)`
- Load sample data → `setDirtyFlag('prizes', true)`
- Add row → `setDirtyFlag('prizes', true)`
- Change cell value → `setDirtyFlag('prizes', true)`
- Delete row → `setDirtyFlag('prizes', true)`
- Clear all → `setDirtyFlag('prizes', true)`
- Apply suggested weights → `setDirtyFlag('prizes', true)`

### 3. Clearing the Dirty Flag
The dirty flag is cleared only after successful save:
```javascript
handleSave = async () => {
  await setPrizes(prizes);           // Save to LocalForage
  await clearDirtyFlag('prizes');    // Clear dirty state
  setHasUnsavedChanges(false);       // Update UI
  
  // Then sync to backend...
}
```

### 4. Respecting Dirty State in Sync
The sync service checks the dirty flag before pulling data:

```javascript
// In syncService.pullDataFromServer()
const dirtyState = await localforage.getItem(STORE_KEYS.dirtyState) || {};
const hasDirtyPrizes = dirtyState.prizes === true;

// Only pull if not dirty (no unsaved changes)
const shouldPullPrizes = options.forcePrizes || !hasDirtyPrizes;

if (shouldPullPrizes) {
  await localforage.setItem(STORE_KEYS.prizes, serverPrizes);
} else {
  console.log('⚠️ Skipped pulling prizes - unsaved local changes detected');
}
```

## Visual Indicators

### Unsaved Changes Warning
When there are unsaved changes:
- Save button changes to amber color with asterisk: **Save ***
- Warning message displayed: "⚠️ Unsaved changes"

### After Saving
- Save button returns to normal appearance
- Warning message disappears
- Success message: "Prize pool saved to storage."

## User Flow

### Normal Flow (No Issues)
```
1. User modifies prizes
   → Dirty flag set to true
   → UI shows "Unsaved changes"
   
2. User clicks Save
   → Data saved to LocalForage
   → Dirty flag cleared
   → UI shows "Saved successfully"
   → Data synced to backend
```

### Refresh During Editing
```
1. User modifies prizes
   → Dirty flag set to true
   → UI shows "Unsaved changes"
   
2. User refreshes page (accidentally or intentionally)
   → Component loads
   → Checks dirty state
   → Restores local data from LocalForage
   → UI still shows "Unsaved changes"
   → Sync service skips pulling from server
   
3. User can continue editing or save
```

### Clear and Refresh
```
1. User clicks Clear
   → Prizes set to empty array []
   → Dirty flag set to true
   → UI shows empty table + "Unsaved changes"
   
2. User refreshes page
   → Dirty flag prevents server pull
   → Empty array remains
   → User can save (persist cleared state) or load new data
```

## API Integration

### LocalForage Keys
```javascript
const STORE_KEYS = {
  prizes: "create::prizes",
  pricing: "create::pricing",
  history: "create::history",
  settings: "create::settings",
  dirtyState: "create::dirty_state"  // NEW
};
```

### Hook Methods
```javascript
// From useLocalStorageDAO
const {
  getDirtyState,        // Get full dirty state object
  setDirtyFlag,         // Set dirty flag for a data type
  clearDirtyFlag        // Clear dirty flag for a data type
} = useLocalStorageDAO();

// Usage
await setDirtyFlag('prizes', true);    // Mark as dirty
await clearDirtyFlag('prizes');        // Mark as clean
const state = await getDirtyState();   // Get all flags
```

## File Changes

### Modified Files
1. `src/services/syncService.js`
   - Added `dirtyState` key
   - Updated `pullDataFromServer()` to check dirty flags for prizes and pricing
   
2. `src/hooks/useLocalStorageDAO.js`
   - Added `dirtyState` key
   - Added `getDirtyState()` method
   - Added `setDirtyFlag()` method
   - Added `clearDirtyFlag()` method
   - Updated `resetAll()` to clear dirty state

3. `src/components/Manage/PrizePoolManager.jsx`
   - Added `hasUnsavedChanges` state
   - Updated all modification handlers to set dirty flag
   - Updated `handleSave()` to clear dirty flag
   - Added visual indicators for unsaved changes
   - Fixed Clear button to set dirty flag

4. `src/components/Manage/PricingManager.jsx`
   - Added `hasUnsavedChanges` state
   - Updated all modification handlers to set dirty flag
   - Updated `handleSave()` to clear dirty flag
   - Added visual indicators for unsaved changes
   - Fixed Clear button to set dirty flag

5. `src/components/Manage/Settings.jsx`
   - **No changes needed** - Settings save immediately, no dirty tracking required

## Testing

### Test Scenario 1: Basic Edit and Save
1. Open PrizePoolManager
2. Make changes to prizes
3. Verify "⚠️ Unsaved changes" appears
4. Click Save
5. Verify warning disappears
6. Refresh page
7. Verify changes are still there

### Test Scenario 2: Clear and Refresh
1. Open PrizePoolManager with data
2. Click Clear button
3. Verify table is empty and "Unsaved changes" shows
4. Refresh page
5. Verify table is still empty (not pulled from server)
6. Can either:
   - Save to persist empty state
   - Load sample data to start fresh

### Test Scenario 3: Offline Editing
1. Make changes to prizes
2. Go offline (DevTools → Network → Offline)
3. Click Save (saves to LocalForage)
4. Refresh page
5. Verify changes persist
6. Go online
7. Data syncs to backend automatically

## Benefits

✅ **No Data Loss**: Local changes are never overwritten by server data  
✅ **User Control**: Users decide when to save or discard changes  
✅ **Visual Feedback**: Clear indicators show when changes need saving  
✅ **Offline Support**: Works seamlessly in offline mode  
✅ **Simple Mental Model**: Traditional "edit → save" workflow  

### Future Enhancements

### Potential Improvements
1. **Confirmation Dialog**: Ask before clearing if there are unsaved changes
2. **Auto-save**: Optional auto-save after X seconds of inactivity
3. **Undo/Redo**: Track change history for easy rollback
4. **Conflict Resolution**: Handle cases where server data changes while editing
5. **Per-Field Dirty Tracking**: Track which specific fields changed
6. **Dirty State for History**: Apply same pattern to draw history

## Notes

- Dirty state persists across browser sessions (stored in IndexedDB)
- Dirty flag is automatically cleared after successful sync
- Force pull options (`forcePrizes: true`, `forcePricing: true`) bypass dirty check if needed
- System is extensible to other data types

### Data Types with Dirty Tracking
✅ **Prizes** - Full dirty tracking with visual indicators  
✅ **Pricing Presets** - Full dirty tracking with visual indicators  
❌ **Settings** - No dirty tracking needed (saves immediately)  
❌ **History** - No dirty tracking (append-only, no editing)

# Sync Service Documentation

## Overview

The Sync Service provides robust bidirectional synchronization between local storage (LocalForage) and the backend server (Prisma database) with offline support, automatic retry, and queue persistence.

## Features

### ✅ Bidirectional Sync
- **Pull from Server**: Fetches latest data from backend and updates local storage
- **Push to Server**: Uploads local changes to backend
- **Conflict Resolution**: Server data takes precedence during pull operations

### ✅ Offline Support
- **Network Detection**: Automatically detects when the user goes online/offline
- **Queue Management**: Operations are queued when offline and processed when connection is restored
- **Persistent Queue**: Queue is saved to LocalForage and restored on page reload

### ✅ Automatic Retry with Exponential Backoff
- **Max Retries**: 3 attempts per operation
- **Exponential Backoff**: Delays increase exponentially (1s, 2s, 4s)
- **Error Handling**: Failed operations are logged and removed after max retries

### ✅ Data Types Supported
- **Prizes**: Prize pool data
- **Settings**: Application settings and configurations
- **History**: Draw history records
- **Presets/Pricing**: Pricing presets for draws

---

## Architecture

### File Structure

```
src/
├── services/
│   └── syncService.js       # Main sync service implementation
├── utils/
│   └── api.js               # API endpoints for sync operations
├── pages/
│   ├── Stock.jsx            # Uses bidirectional sync on refresh
│   ├── Draw.jsx             # Uses DrawScreen component
│   ├── Manage.jsx           # Contains PrizePoolManager, PricingManager, Settings
│   └── Account.jsx          # User account management
└── components/
    ├── Admin/
    │   ├── PrizePoolManager.jsx   # Syncs prizes after save
    │   ├── PricingManager.jsx     # Syncs presets after save
    │   └── Settings.jsx           # Syncs settings after save
    └── Draw/
        └── DrawScreen.jsx         # Syncs prizes, history, settings after draw
```

---

## How It Works

### 1. Automatic Sync on Login

When a user logs in, the sync service automatically checks if local data needs to be synced:

```javascript
// Triggered by AuthContext after login
await syncService.onUserLogin(username);
```

### 2. Manual Sync Operations

Components can trigger sync operations using the helper function:

```javascript
import { syncUserData } from '../services/syncService';

// Sync prizes after saving
await syncUserData(username, 'prizes', prizesData);

// Sync settings after updating
await syncUserData(username, 'settings', settingsData);

// Sync pricing presets after changes
await syncUserData(username, 'presets', presetsData);

// Sync history after draw
await syncUserData(username, 'history', historyData);
```

### 3. Bidirectional Sync (Full Sync)

The Stock page triggers bidirectional sync when the user clicks "Refresh":

```javascript
import syncService from '../services/syncService';

// Perform full bidirectional sync
await syncService.syncAllData(username);
```

This operation:
1. Pulls latest data from server → updates LocalForage
2. Pushes any local changes → updates server
3. Ensures both client and server are in sync

---

## Integration Points

### Manage Page Components

#### PrizePoolManager.jsx
- **When**: After saving prize pool changes
- **What**: Syncs `prizes` data type
- **How**: Calls `syncUserData(username, 'prizes', prizes)` after successful LocalForage save

#### PricingManager.jsx
- **When**: After saving pricing preset changes
- **What**: Syncs `presets` data type
- **How**: Calls `syncUserData(username, 'presets', presets)` after successful LocalForage save

#### Settings.jsx
- **When**: After updating settings
- **What**: Syncs `settings` data type
- **How**: Calls `syncUserData(username, 'settings', settings)` after successful LocalForage update

### Draw Page (DrawScreen.jsx)

- **When**: After completing a draw operation
- **What**: Syncs `prizes` (updated stock), `history` (new draw records), and `settings` (session counter)
- **How**: Calls multiple `syncUserData()` operations in parallel using `Promise.allSettled()`

### Stock Page (Stock.jsx)

- **When**: User clicks "Refresh Stock Data" button
- **What**: Performs full bidirectional sync for all data types
- **How**: Calls `syncService.syncAllData(username)` before fetching updated stock from server

### Account Page (Account.jsx)

- **When**: N/A (currently no kuji data changes on this page)
- **What**: N/A
- **Note**: Account operations use separate userAPI endpoints for profile, emails, password, etc.

---

## Offline Handling

### How Queue Works

1. **Operation Triggered**:
   ```javascript
   await syncUserData(username, 'prizes', prizesData);
   ```

2. **Added to Queue**:
   - Assigned unique ID: `${username}_${dataType}_${timestamp}`
   - Persisted to LocalForage under `create::sync_queue`
   - Attempt counter initialized to 0

3. **Processing**:
   - **If Online**: Immediately processes queue
   - **If Offline**: Waits until connection restored

4. **Retry on Failure**:
   - Increments attempt counter
   - Moves to end of queue
   - Waits with exponential backoff (1s → 2s → 4s)
   - Removes after 3 failed attempts

5. **Success**:
   - Operation removed from queue
   - Queue persisted without the completed item

### Periodic Processing

- Every 30 seconds, checks if:
  - User is online
  - No sync in progress
  - Queue has pending items
- If all conditions met, processes queue

---

## API Endpoints

The following endpoints are used by the sync service (defined in `src/utils/api.js`):

### Sync (Push to Server)
- `POST /users/:username/sync-prizes` - Upload prizes
- `POST /users/:username/sync-settings` - Upload settings
- `POST /users/:username/sync-history` - Upload history
- `POST /users/:username/sync-presets` - Upload pricing presets

### Fetch (Pull from Server)
- `GET /users/:username/prizes` - Download prizes
- `GET /users/:username/settings` - Download settings
- `GET /users/:username/presets` - Download pricing presets

### Stock (Public/Private)
- `GET /kuji/stock` - Public stock view (no auth)
- `GET /users/:username/stock` - User-specific stock with metadata

---

## Testing the Sync Service

### 1. Test Basic Sync

1. Log in to the application
2. Go to **Manage → Prizes** and make changes
3. Click **Save**
4. Check browser console for:
   ```
   ✅ Prizes synced to backend after save
   ```

### 2. Test Offline Queueing

1. Open browser DevTools → Network tab
2. Set throttling to "Offline"
3. Make changes in Manage → Prizes → Save
4. Check console for:
   ```
   📡 Connection lost - queueing syncs
   ➕ Added prizes sync to queue (1 items)
   ```
5. Restore connection (set throttling to "Online")
6. Check console for:
   ```
   🌐 Connection restored - processing pending syncs
   🔄 Processing 1 queued syncs...
   ✅ Synced prizes for [username]
   ✨ All syncs completed!
   ```

### 3. Test Bidirectional Sync

1. Make changes in two different browsers/tabs
2. In Browser 1: Make changes and save
3. In Browser 2: Go to Stock page and click "Refresh Stock Data"
4. Check console in Browser 2 for:
   ```
   🔄 Performing bidirectional sync before refreshing stock...
   ⬇️ Pulling latest data from server for [username]...
   ✅ Pulled [X] prizes from server
   ✅ Pulled settings from server
   ✅ Pulled [X] pricing presets from server
   ⬆️ Pushing local data to server for [username]...
   ✨ Bidirectional sync completed for user: [username]
   ✅ Sync completed, now fetching updated stock
   ```

### 4. Test Queue Persistence

1. Set network to "Offline"
2. Make multiple changes (prizes, pricing, settings)
3. Save each change
4. Check `create::sync_queue` in DevTools → Application → IndexedDB → create-kuji → caris_kuji_store
5. Refresh the page (while still offline)
6. Check console for:
   ```
   📦 Restored [X] queued syncs from storage
   ```
7. Restore connection
8. Watch queue process automatically

### 5. Test Retry with Exponential Backoff

1. Set network to "Slow 3G" or use throttling
2. Make changes and save
3. Watch console for retry attempts:
   ```
   🔄 Processing 1 queued syncs...
   ❌ Failed to sync prizes: [error]
   🔁 Retrying prizes in 1000ms (attempt 1/3)
   ```

---

## Monitoring and Debugging

### Console Logs

The sync service provides detailed console logs:

- 🔄 **Sync Operations**: When syncs start
- ⬇️ **Pull Operations**: When pulling from server
- ⬆️ **Push Operations**: When pushing to server
- ✅ **Success**: When operations complete
- ❌ **Failures**: When operations fail
- 🔁 **Retries**: When operations are retried
- ⚠️ **Warnings**: When max retries reached
- 📦 **Queue Restore**: When queue is loaded from storage
- ➕ **Queue Add**: When operations are added to queue
- 🌐 **Network Events**: When connection state changes

### LocalForage Inspection

To inspect the sync queue in browser DevTools:

1. Open DevTools → Application → IndexedDB
2. Navigate to: **create-kuji** → **caris_kuji_store**
3. Find key: `create::sync_queue`
4. Inspect the array of pending sync operations

Each queue item contains:
```javascript
{
  id: "username_dataType_timestamp",
  username: "user123",
  dataType: "prizes",
  data: [...],
  timestamp: 1234567890,
  attempts: 0
}
```

---

## Best Practices

### 1. Always Check User Authentication

```javascript
if (user?.username) {
  await syncUserData(user.username, 'prizes', prizes);
}
```

### 2. Handle Sync Failures Gracefully

```javascript
try {
  await syncUserData(user.username, 'prizes', prizes);
} catch (syncError) {
  console.warn('⚠️ Failed to sync:', syncError);
  // Don't show error to user if local save succeeded
}
```

### 3. Delay Sync After UI Operations

```javascript
setTimeout(async () => {
  await syncUserData(user.username, 'prizes', prizes);
}, 500); // Let UI update first
```

### 4. Use Promise.allSettled for Multiple Syncs

```javascript
await Promise.allSettled([
  syncUserData(username, 'prizes', prizes),
  syncUserData(username, 'history', history),
  syncUserData(username, 'settings', settings)
]);
```

---

## Troubleshooting

### Issue: Sync Not Happening

**Check:**
1. User is authenticated (`user?.username` is truthy)
2. Network is online (check browser DevTools → Network)
3. Queue is not blocked (check console for errors)
4. Backend endpoints are responding (check Network tab)

### Issue: Data Not Persisting

**Check:**
1. LocalForage save succeeded before sync
2. Sync operation completed successfully (check console)
3. Backend database has the data (query Prisma directly)

### Issue: Queue Growing Too Large

**Check:**
1. Network connection is stable
2. Backend endpoints are not returning errors
3. Queue items aren't exceeding max retries
4. Clear queue manually if needed:
   ```javascript
   import localforage from 'localforage';
   await localforage.removeItem('create::sync_queue');
   ```

---

## Future Enhancements

- [ ] Add conflict resolution UI when server data differs from local
- [ ] Implement diff-based syncing to reduce payload size
- [ ] Add sync status indicator in UI
- [ ] Support partial data syncing (only changed records)
- [ ] Add manual sync button in UI
- [ ] Implement sync logs/history for debugging
- [ ] Add sync metrics (success rate, latency, etc.)

---

## Summary

The Sync Service provides a robust, enterprise-grade synchronization solution for the Kuji app with:

- ✅ **Offline-first architecture** - works seamlessly with or without network
- ✅ **Automatic retry** - handles transient network failures gracefully
- ✅ **Queue persistence** - survives page reloads and browser restarts
- ✅ **Bidirectional sync** - keeps client and server in sync
- ✅ **Multiple data types** - prizes, settings, history, pricing presets
- ✅ **Comprehensive logging** - easy to monitor and debug

All major pages (Stock, Draw, Manage, Account) now leverage this service to ensure data consistency across devices and sessions!

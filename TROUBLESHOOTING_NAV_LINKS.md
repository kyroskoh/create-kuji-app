# Troubleshooting: Navigation Links Not Showing

## Issue
After fixing the redirect loop bug, the navigation links (Draw, Manage, Account, Admin) are not showing in the header.

## Quick Checklist

### 1. Restart Both Server AND Frontend

**IMPORTANT**: You need to restart BOTH the backend server AND the frontend dev server.

#### Backend (in `server/` directory):
```powershell
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

#### Frontend (in root directory):
```powershell
# Stop the frontend (Ctrl+C if running)
# Then restart
npm run dev
```

### 2. Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload" (or "Hard Refresh")

Alternatively:
- Chrome/Edge: Ctrl + Shift + Delete → Clear cache
- Firefox: Ctrl + Shift + Delete → Clear cache

### 3. Check Browser Console

Open DevTools (F12) and go to the Console tab. Look for:

#### Expected Debug Messages:
```
MainLayout - user: {id: "...", username: "...", ...}
MainLayout - user exists? true
MainLayout - username: your-username
```

#### If you see:
```
MainLayout - user: null
MainLayout - user exists? false
MainLayout - username: undefined
```

This means the user is not loaded. Proceed to step 4.

### 4. Check AuthContext Loading

In the console, look for these messages:

#### During Page Load:
```
🔄 Initializing auth...
📞 Fetching current user from API...
✓ Successfully restored authentication for: your-username
⚙️ Auth initialization complete, loading = false
```

#### After Setting Username:
```
🔄 refreshUser: Fetching user data...
✅ refreshUser: Got response: {id: "...", username: "...", emailVerified: true, ...}
```

### 5. Verify API Response

Check that the API is returning the correct data:

1. Open DevTools → Network tab
2. Filter by "me" or "auth"
3. Look for the request to `/api/auth/me`
4. Click on it and check the Response tab

#### Expected Response Structure:
```json
{
  "user": {
    "id": "...",
    "username": "your-username",
    "displayName": "...",
    "usernameSetByUser": true,
    "emailVerified": true,  // ← This field MUST be present
    "emails": [...],
    "providers": [],
    "isSuperAdmin": false,
    "createdAt": "...",
    "lastLogin": "..."
  }
}
```

### 6. Check for Errors

#### In Browser Console:
Look for any JavaScript errors (red text):
- Network errors (ERR_CONNECTION_REFUSED)
- CORS errors
- 401 Unauthorized errors
- Any React component errors

#### In Server Console:
Look for:
- Compilation errors
- Runtime errors
- Failed API requests

### 7. Verify LocalStorage/IndexedDB

1. Open DevTools → Application tab
2. Go to IndexedDB → localforage → keyvaluepairs
3. Check that `accessToken` and `refreshToken` exist
4. If they're missing, you need to log in again

### 8. Test Fresh Login

If navigation links still don't show:

1. **Logout completely**:
   - Open browser console
   - Run: `localStorage.clear(); indexedDB.deleteDatabase('localforage');`
   - Or use the UserDropdown → Logout button

2. **Log in again**

3. **Check if navigation appears**

## Common Causes & Solutions

### Cause 1: Server Not Restarted
**Solution**: Restart the backend server with `npm run dev` in the `server/` directory

### Cause 2: Frontend Not Restarted
**Solution**: Restart the frontend with `npm run dev` in the root directory

### Cause 3: Cached Files
**Solution**: Hard refresh (Ctrl + Shift + R) or clear browser cache

### Cause 4: TypeScript Compilation Errors
**Solution**: Check server console for compilation errors. If you see errors, they need to be fixed first.

### Cause 5: Invalid/Expired Tokens
**Solution**: 
1. Clear tokens: In browser console run `localStorage.clear(); indexedDB.deleteDatabase('localforage');`
2. Refresh page
3. Log in again

### Cause 6: API Request Failing
**Solution**: 
1. Check Network tab for failed requests
2. Verify server is running on port 3001
3. Check server logs for errors

### Cause 7: User State Not Updating
**Solution**:
1. Check console for "refreshUser" messages
2. Verify the `/api/auth/me` endpoint returns `emailVerified` field
3. Check that `setUser()` is being called with the response

## Backend Compilation Errors

If you see TypeScript errors when building the server, they need to be fixed. Common errors:

### Error: displayName type mismatch
```
Types of property 'displayName' are incompatible.
Type 'string | null' is not assignable to type 'string | undefined'.
```

This is a known issue with the passport configuration that doesn't affect the running server in dev mode.

## Still Not Working?

If navigation links still don't appear after trying all the above:

1. **Check if you're logged in**: Can you see the UserDropdown on the right?
   - If YES: The issue is with navigation rendering
   - If NO: The issue is with authentication state

2. **Verify user object structure**:
   ```javascript
   // In browser console:
   window.user = null;
   // Then check console logs
   ```

3. **Check React DevTools**:
   - Install React DevTools extension
   - Inspect the MainLayout component
   - Check the `user` prop value

4. **Create minimal test**:
   Add this to MainLayout temporarily:
   ```javascript
   console.log('DEBUG - Raw user:', JSON.stringify(user, null, 2));
   console.log('DEBUG - User truthy?', !!user);
   console.log('DEBUG - User type:', typeof user);
   ```

## Need More Help?

If you're still stuck, provide:
1. Browser console output
2. Network tab showing `/api/auth/me` response
3. Server console output
4. Screenshots of the issue

# Bug Fix: Redirect Loop After Setting Permanent Username

## Issue Description

After a user sets their permanent username in the Account page, attempting to navigate to `/manage`, `/draw`, or `/stock` routes would result in being stuck on the `/account` page, unable to access other protected routes.

## Root Cause

The issue was caused by a missing `emailVerified` field in the API response from the `GET /api/auth/me` endpoint:

1. **During signup/login**: The backend returns `emailVerified: user.emails[0]?.verifiedAt !== null` as part of the user object
2. **During getCurrentUser** (`/api/auth/me`): The backend was returning the full `emails` array but **NOT** the `emailVerified` boolean field
3. **In RequireSetup.jsx**: The frontend checks `if (!user.emailVerified)` to determine if email verification is needed

### The Flow That Caused the Bug

1. User sets permanent username in Account page
2. Account page calls `refreshUser()` which hits `/api/auth/me`
3. The response from `/api/auth/me` doesn't include `emailVerified`
4. User object now has `emailVerified: undefined`
5. User navigates to `/draw`, `/manage`, or `/stock`
6. `RequireSetup` component checks `if (!user.emailVerified)`
7. Since `undefined` is falsy, the check evaluates to `true`
8. User is redirected back to `/account` (infinite loop)

## Files Changed

### `server/src/controllers/authController.ts`

**Location**: Line 489-501 (getCurrentUser function)

**Change**: Added `emailVerified` field to the user response object

```typescript
return res.status(200).json({
  user: {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    usernameSetByUser: user.usernameSetByUser,
    emailVerified: user.emails[0]?.verifiedAt !== null, // ✅ ADDED THIS LINE
    emails: user.emails,
    providers: user.providerAccounts,
    isSuperAdmin: user.isSuperAdmin,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }
});
```

## Testing Instructions

### 1. Test the Fix Locally

```bash
# In the server directory
npm run dev
```

### 2. Test the User Flow

1. **Create a new account** or log in with an existing account that has a temporary username
2. **Set a permanent username** in the Account page
3. **Navigate to different routes**:
   - Click on "Draw" in the navigation
   - Click on "Manage" in the navigation
   - Click on "Stock" link (if available)
4. **Verify**: You should be able to access all these routes without being redirected back to `/account`

### 3. Verify API Response

You can verify the fix by checking the API response:

```bash
# Get access token from browser DevTools > Application > LocalForage > accessToken
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response should include:
```json
{
  "user": {
    "id": "...",
    "username": "...",
    "emailVerified": true,  // ✅ This field should be present
    "usernameSetByUser": true,
    "...": "..."
  }
}
```

## Additional Context

### Why This Wasn't Caught Earlier

- The bug only manifested after a user set their permanent username
- During initial signup/login, the `emailVerified` field was correctly included in the response
- The `getCurrentUser` endpoint (used by `refreshUser()`) was implemented separately and missed this field
- The issue was subtle because `undefined` evaluates to falsy in JavaScript, triggering the email verification check

### Related Components

- **Frontend**: `src/auth/RequireSetup.jsx` (checks for `user.emailVerified`)
- **Frontend**: `src/pages/Account.jsx` (calls `refreshUser()` after setting username)
- **Frontend**: `src/utils/AuthContext.jsx` (manages user state and calls `getCurrentUser`)
- **Backend**: `server/src/controllers/authController.ts` (getCurrentUser, login, signup endpoints)

## Prevention

To prevent similar issues in the future:

1. **API Contract Documentation**: Document the expected shape of the user object across all endpoints
2. **Shared TypeScript Types**: Consider creating shared types/interfaces for the user object
3. **Unit Tests**: Add tests that verify the structure of API responses
4. **Integration Tests**: Add E2E tests that cover the full user setup flow

## Status

✅ **Fixed** - The `emailVerified` field is now included in the `GET /api/auth/me` response, matching the structure returned by login/signup endpoints.

## Date

2025-10-06

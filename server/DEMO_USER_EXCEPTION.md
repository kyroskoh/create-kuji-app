# Demo User Exception Implementation

## Overview
Implemented special exception to allow the demo user to set/keep "demo" as their username, even though "demo" is a reserved username.

## Implementation

### Logic
The code now checks if the current user already has "demo" as their username before applying the reserved username validation.

```typescript
// Fetch current user first to check for exceptions
const currentUser = await prisma.user.findUnique({
  where: { id: userId },
});

// Allow demo user to keep 'demo' username
const isDemoUser = currentUser.username === 'demo';
const isSettingDemoUsername = lowerUsername === 'demo';

if (reservedUsernames.includes(lowerUsername) && !(isDemoUser && isSettingDemoUsername)) {
  return res.status(400).json({
    error: 'RESERVED_USERNAME',
    message: 'This username is reserved and cannot be used',
  });
}
```

### Key Points

1. **User Fetch Order**: Moved user fetch before reserved username check to enable exception logic
2. **Exception Condition**: `!(isDemoUser && isSettingDemoUsername)`
   - Allows the check to pass ONLY if:
     - Current user has username "demo" AND
     - They are trying to set username to "demo"
3. **Security**: Other users still cannot use "demo" - only the existing demo account

## Use Cases

### ✅ Allowed
- Demo user (current username = "demo") sets username to "demo"
- Demo user confirms their demo username

### ❌ Blocked
- New user tries to create username "demo"
- Existing user (username != "demo") tries to change to "demo"
- Any non-demo user attempting to use "demo"

## Code Changes

**File:** `server/src/controllers/userController.ts`

**Changes:**
1. Moved `currentUser` fetch to line 361 (before reserved check)
2. Added exception logic at lines 392-396
3. Removed duplicate user fetch (was at line 404)

## Testing

### Test 1: Demo user can set "demo"
```bash
# Login as demo user
# Then update username to "demo" - should succeed
curl -X PUT http://localhost:3001/api/user/username \
  -H "Authorization: Bearer DEMO_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo"}'
```

**Expected:** ✅ Success - Username updated

### Test 2: Other users cannot use "demo"  
```bash
# Login as any other user
# Then try to update username to "demo" - should fail
curl -X PUT http://localhost:3001/api/user/username \
  -H "Authorization: Bearer OTHER_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "demo"}'
```

**Expected:** ❌ Error - `RESERVED_USERNAME`

## Documentation Updated

✅ `server/RESERVED_USERNAMES.md` - Added detailed exception explanation  
✅ `server/README.md` - Added exception note to API docs  
✅ `WARP.md` - Added exception note to authentication section  
✅ `server/DEMO_USER_EXCEPTION.md` - This document (NEW)

## Security Implications

**Secure** ✅
- Only the existing demo user can keep "demo" username
- No way for new users to bypass the reserved username check
- Exception is based on current username, not user ID or other attributes
- If demo user changes username to something else, they cannot change back to "demo"

---

**Date:** 2025-10-06  
**Status:** ✅ Active (hot-reloaded)

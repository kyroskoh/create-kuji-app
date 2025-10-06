# Reserved Usernames Implementation

## Overview
Implemented validation to prevent users from choosing reserved system usernames when updating their username for the first time.

## Reserved Usernames
The following usernames are reserved and cannot be used by regular users:

### System Accounts (6)
- `admin`, `administrator`, `root`, `system`, `superuser`, `sudo`

### Demo and Test Accounts (5)
- `demo`, `test`, `guest`, `anonymous`, `user`

### Common Roles (6)
- `moderator`, `mod`, `support`, `help`, `staff`, `owner`

### API and System Endpoints (7)
- `api`, `www`, `mail`, `ftp`, `smtp`, `http`, `https`

### Application Specific (7)
- `createkuji`, `createmykuji`, `makekuji`, `makemykuji`, `kuji`, `kyros`, `kyroskoh`

### Reserved for Safety (5)
- `null`, `undefined`, `none`, `nil`, `void`

### Potentially Problematic (6)
- `bot`, `official`, `verified`, `account`

**Total:** 42 reserved usernames

## Implementation Details

### Location
`server/src/controllers/userController.ts` - `updateUsername()` function

### Validation Logic
```typescript
// Check for reserved usernames (system accounts, common roles, and protected names)
const reservedUsernames = [
  // System accounts
  'admin', 'administrator', 'system', 'root', 'superuser', 'sudo',
  // Demo and test accounts
  'demo', 'test', 'guest', 'anonymous', 'user',
  // Common roles
  'moderator', 'mod', 'support', 'help', 'staff', 'owner',
  // API and system endpoints
  'api', 'www', 'mail', 'ftp', 'smtp', 'http', 'https',
  // Application specific
  'createkuji', 'createmykuji', 'makekuji', 'makemykuji', 'kuji', 'kyros', 'kyroskoh',
  // Reserved for safety
  'null', 'undefined', 'none', 'nil', 'void',
  // Potentially offensive or problematic
  'bot', 'official', 'verified', 'account'
];
const lowerUsername = username.toLowerCase();
if (reservedUsernames.includes(lowerUsername)) {
  return res.status(400).json({
    error: 'RESERVED_USERNAME',
    message: 'This username is reserved and cannot be used',
  });
}
```

### Error Response
When a user attempts to use a reserved username:
```json
{
  "error": "RESERVED_USERNAME",
  "message": "This username is reserved and cannot be used"
}
```

## Demo User Exception
The `demo` user account is allowed to keep/set the username "demo":

1. **Special Exception**: If the current user already has "demo" as their username, they can set it again
2. **Implementation**: The code checks `currentUser.username === 'demo'` before applying reserved username validation
3. **Security**: Other users cannot choose "demo" - only the existing demo user can keep it

```typescript
// Allow demo user to keep 'demo' username
const isDemoUser = currentUser.username === 'demo';
const isSettingDemoUsername = lowerUsername === 'demo';

// Bypass 1: Reserved username check
if (reservedUsernames.includes(lowerUsername) && !(isDemoUser && isSettingDemoUsername)) {
  return res.status(400).json({
    error: 'RESERVED_USERNAME',
    message: 'This username is reserved and cannot be used',
  });
}

// Bypass 2: Username already set check
if (currentUser.usernameSetByUser && !(isDemoUser && isSettingDemoUsername)) {
  return res.status(403).json({
    error: 'USERNAME_ALREADY_SET',
    message: 'Username has already been set. Please contact support to change it.',
  });
}
```

## API Endpoint
**PUT** `/api/user/username`

### Requirements
- User must be authenticated
- Username must be 5-20 characters
- Only alphanumeric, underscores, and hyphens allowed
- Cannot be a reserved username
- Can only be set once per account

### Usage Example
```javascript
// Request
{
  "username": "mycoolusername"
}

// Success Response
{
  "message": "Username updated successfully",
  "user": {
    "id": "uuid",
    "username": "mycoolusername",
    "usernameSetByUser": true,
    ...
  }
}

// Error - Reserved Username
{
  "error": "RESERVED_USERNAME",
  "message": "This username is reserved and cannot be used"
}
```

## Testing
To test the reserved username validation:

1. Create a new account
2. Attempt to update username to "demo":
   ```bash
   curl -X PUT http://localhost:3001/api/user/username \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"username": "demo"}'
   ```
3. Should receive `RESERVED_USERNAME` error

## Documentation
Updated documentation in:
- `WARP.md` - Architecture section
- `server/README.md` - API Documentation section
- Added error codes and validation rules

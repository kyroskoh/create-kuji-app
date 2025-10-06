# Support Team Guide: Username Changes

## Overview
This guide explains how to change usernames for users who have already set their username (which is normally a one-time operation).

## Why This Script Is Needed

Users can only set their username **once** through the application. If they:
- Made a typo
- Want to rebrand
- Need to change for privacy reasons
- Have other legitimate reasons

The support team can use this script to bypass the one-time restriction and change their username.

## Script Command

```bash
npm run support:change-username <current-username> <new-username>
```

## Usage Examples

### Example 1: Simple Username Change
```bash
npm run support:change-username johndoe john_doe_official
```

### Example 2: Fixing a Typo
```bash
npm run support:change-username sarasmith sara_smith
```

### Example 3: Rebranding
```bash
npm run support:change-username oldname newbrandname
```

## Step-by-Step Process

### Step 1: Verify the Request
Before running the script, verify:
- ✅ User has a valid reason for the change
- ✅ User identity has been confirmed
- ✅ New username meets requirements (see below)

### Step 2: Check Username Requirements
New username must:
- Be 5-20 characters long
- Only contain letters, numbers, underscores (_), and hyphens (-)
- Not be a reserved username (see list below)
- Not already be taken by another user

### Step 3: Run the Script

Navigate to the server directory:
```bash
cd server
```

Run the command with current and new usernames:
```bash
npm run support:change-username <current> <new>
```

### Step 4: Verify the Change

The script will show:
```
🔧 Support Script: Change Username

📋 Request Details:
   Current Username: johndoe
   New Username: john_official

✅ Found user:
   ID: abc123
   Username: johndoe
   Display Name: John Doe
   Email: john@example.com
   Username Set By User: true
   Super Admin: false

✅ Successfully updated username!

📋 Updated User Details:
   ID: abc123
   Old Username: johndoe
   New Username: john_official ✨
   Display Name: john_official
   Email: john@example.com
   Username Set By User: true

🎉 Username change completed successfully!
```

## Reserved Usernames

The following usernames **CANNOT** be used:

### System Accounts (6)
`admin`, `administrator`, `root`, `system`, `superuser`, `sudo`

### Demo/Test Accounts (5)
`demo`, `test`, `guest`, `anonymous`, `user`

### Common Roles (6)
`moderator`, `mod`, `support`, `help`, `staff`, `owner`

### API/Endpoints (7)
`api`, `www`, `mail`, `ftp`, `smtp`, `http`, `https`

### Application Specific (7)
`createkuji`, `createmykuji`, `makekuji`, `makemykuji`, `kuji`, `kyros`, `kyroskoh`

### Reserved Keywords (5)
`null`, `undefined`, `none`, `nil`, `void`

### Problematic Terms (6)
`bot`, `official`, `verified`, `account`

**Total: 42 reserved usernames**

## Error Handling

### Error: User Not Found
```
❌ Error: User with username "johndoe" not found
```
**Solution:** Verify the current username is correct

### Error: Username Already Taken
```
❌ Error: Username "newname" is already taken by another user
   User ID: xyz789
```
**Solution:** Choose a different username

### Error: Reserved Username
```
❌ Error: "admin" is a reserved username and cannot be used
```
**Solution:** Choose a non-reserved username

### Error: Invalid Format
```
❌ Error: New username must be 5-20 characters and contain only letters, numbers, underscores, and hyphens
```
**Solution:** Fix the username format

## What Gets Updated

When you run this script, the following fields are updated:

| Field | Update |
|-------|--------|
| `username` | Changed to new username (lowercase) |
| `displayName` | Changed to new username |
| `usernameSetByUser` | Set to `true` |

**Note:** Email, password, and other data remain unchanged.

## Important Notes

1. ⚠️ **No Confirmation Prompt**: The script runs immediately - double-check before running
2. ⚠️ **Username is Lowercased**: All usernames are stored in lowercase
3. ⚠️ **Display Name Matches**: Display name is automatically set to match the new username
4. ✅ **Preserves Data**: All user data, prizes, settings, and history are preserved
5. ✅ **User Routes Updated**: Routes like `/{username}/draw` will automatically use the new username

## Security Considerations

- ✅ Script validates all inputs
- ✅ Checks for reserved usernames
- ✅ Prevents duplicate usernames
- ✅ Enforces format requirements
- ✅ Logs all changes for audit

## Logging for Audit

Keep a record of username changes:

**Template:**
```
Date: 2025-10-06
Ticket: #12345
Current Username: johndoe
New Username: john_official
Reason: User requested rebrand
Changed By: support@createkuji.com
```

## Rollback

To rollback a username change, simply run the script again with reversed arguments:

```bash
# Original change
npm run support:change-username johndoe john_official

# Rollback
npm run support:change-username john_official johndoe
```

## Testing

Before using in production, test with a test account:

```bash
# Create a test user first, then:
npm run support:change-username testuser1 testuser2

# Verify the change
# Then rollback
npm run support:change-username testuser2 testuser1
```

## Troubleshooting

### Script Won't Run
**Check:**
- Are you in the `server/` directory?
- Is the database running?
- Are environment variables set? (`.env` file)

### Database Connection Error
```bash
# Check if database is accessible
npm run prisma:generate
```

### TypeScript Errors
```bash
# Rebuild TypeScript
npm run build
```

## Quick Reference

```bash
# Navigate to server directory
cd server

# Method 1: Change by current username
npm run support:change-username <old> <new>

# Method 2: Change by email (for temp usernames)
npm run support:change-username-email <email> <new>

# Examples
npm run support:change-username johndoe john_official
npm run support:change-username-email user@example.com john_official

# Check if successful - look for:
# ✅ Successfully updated username!
# 🎉 Username change completed successfully!
```

## Support Checklist

Before running the script:
- [ ] User identity verified
- [ ] Valid reason for change
- [ ] New username meets requirements (5-20 chars, valid characters)
- [ ] New username is not reserved
- [ ] New username is not taken
- [ ] Logged in support ticket system
- [ ] Ready to run the command

---

**Script Location:** `server/src/utils/change-username.ts`  
**Command:** `npm run support:change-username`  
**Last Updated:** 2025-10-06

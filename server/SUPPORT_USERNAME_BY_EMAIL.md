# Support Guide: Change Username by Email Address

## Overview
This script allows the support team to change usernames using the user's email address as the identifier, instead of their current username. This is especially useful when users have temporary/auto-generated usernames.

## Why This Script Is Needed

### Common Scenarios

1. **Temporary Usernames**
   - User signed up and got auto-generated username (e.g., `johnsmith12`, `userxyz789`)
   - User doesn't know or remember this temporary username
   - Support can identify user by email instead

2. **User Doesn't Remember Username**
   - User only knows their email
   - Can't provide current username
   - Email lookup is easier

3. **Support Workflow Efficiency**
   - Email is often in the support ticket
   - No need to ask user for current username
   - Faster resolution

## Command

```bash
npm run support:change-username-email <email> <new-username>
```

## Usage Examples

### Example 1: User with Temporary Username
```bash
npm run support:change-username-email john.smith@example.com johnsmith_official
```

**Output:**
```
🔧 Support Script: Change Username by Email

📋 Request Details:
   Email: john.smith@example.com
   New Username: johnsmith_official

✅ Found user:
   ID: abc-123
   Current Username: johnsmith12
   Display Name: johnsmith12
   Email: john.smith@example.com
   Username Set By User: false
   Super Admin: false
   ℹ️  Note: Current username appears to be temporary/auto-generated

✅ Successfully updated username!

📋 Updated User Details:
   ID: abc-123
   Old Username: johnsmith12
   New Username: johnsmith_official ✨
   Display Name: johnsmith_official
   Email: john.smith@example.com
   Username Set By User: true

🎉 Username change completed successfully!

ℹ️  User can now login with email "john.smith@example.com" and username "johnsmith_official"
```

### Example 2: User Forgot Username
```bash
npm run support:change-username-email sara@example.com sara_official
```

### Example 3: Rebranding by Email
```bash
npm run support:change-username-email olduser@example.com newbrand
```

## Comparison with Username-Based Script

| Feature | By Username | By Email |
|---------|------------|----------|
| **Command** | `support:change-username` | `support:change-username-email` |
| **Identifier** | Current username | Email address |
| **Best For** | User knows username | Temp username / Unknown |
| **Detection** | Direct lookup | Email lookup |
| **Temp Username Alert** | ❌ No | ✅ Yes |

## When to Use Each Method

### Use Email Method When:
- ✅ User has temporary/auto-generated username
- ✅ User doesn't remember their current username
- ✅ You only have the user's email from the ticket
- ✅ Faster workflow (email is more common in tickets)

### Use Username Method When:
- ✅ User knows their current username
- ✅ Username is already in the ticket
- ✅ Need to change from one custom username to another

## Features

### Automatic Temporary Username Detection
The script automatically detects if a username appears to be temporary:

```
ℹ️  Note: Current username appears to be temporary/auto-generated
```

**Detection criteria:**
- Username is exactly 10 or 11 characters (auto-generated format)
- Username contains underscore `_` (common in temp usernames)
- `usernameSetByUser` is `false`

### Email Validation
- Validates email format before lookup
- Checks if email exists in database
- Shows error if email not found

### Same Security Checks
- ✅ Username format validation (5-20 chars)
- ✅ Reserved username blocking (all 42)
- ✅ Duplicate prevention
- ✅ Input sanitization

## Step-by-Step Process

### Step 1: Get User's Email
From the support ticket or communication with the user.

### Step 2: Verify Requirements
- User identity confirmed
- New username meets requirements
- Not a reserved username

### Step 3: Run the Script

```bash
cd server
npm run support:change-username-email <email> <new-username>
```

### Step 4: Confirm with User
Let the user know:
- Their new username
- They can login with either email OR username
- Their old temporary username no longer works

## Error Handling

### Error: Email Not Found
```
❌ Error: No user found with email "user@example.com"
```
**Solution:** Verify the email address is correct

### Error: Invalid Email Format
```
❌ Error: Invalid email format
```
**Solution:** Check email format (must have @ and domain)

### Error: Reserved Username
```
❌ Error: "admin" is a reserved username and cannot be used
```
**Solution:** Choose a non-reserved username

### Error: Username Taken
```
❌ Error: Username "johndoe" is already taken by another user
```
**Solution:** Choose a different username

## What Gets Updated

| Field | Before | After |
|-------|--------|-------|
| `username` | `johnsmith12` (temp) | `john_official` |
| `displayName` | `johnsmith12` | `john_official` |
| `usernameSetByUser` | `false` | `true` |
| `email` | (unchanged) | (unchanged) |

## Advantages Over Username Method

1. **No Need to Ask Current Username**
   - Email is usually known
   - Saves back-and-forth with user

2. **Works with Temporary Usernames**
   - Users with auto-generated usernames don't know them
   - Email is their primary identifier

3. **Clearer Detection**
   - Shows when username is temporary
   - Helps support understand the situation

4. **Better User Experience**
   - User only needs to provide email
   - Faster support resolution

## Example Support Conversation

**User:** "I signed up but I don't like my username"

**Support:** "What's your email address?"

**User:** "john@example.com"

**Support:** *(Runs script)*
```bash
npm run support:change-username-email john@example.com john_official
```

**Support:** "Done! Your new username is `john_official`. You can login with either your email or this username."

## Testing

Test with a user who has a temporary username:

```bash
# Create test user first (they'll get auto-generated username)
# Then run:
npm run support:change-username-email test@example.com testuser

# Verify output shows temp username detection
# Should see: ℹ️  Note: Current username appears to be temporary/auto-generated
```

## Rollback

To rollback, use either method:

```bash
# By email (easier)
npm run support:change-username-email user@example.com oldusername

# Or by new username
npm run support:change-username newusername oldusername
```

## Security Notes

- ✅ Validates email format
- ✅ Confirms user exists
- ✅ Same security as username method
- ✅ Shows all user details for verification
- ✅ Preserves all user data

## Quick Reference

```bash
# Navigate to server directory
cd server

# Change username by email
npm run support:change-username-email <email> <new>

# Example
npm run support:change-username-email user@example.com newusername

# Look for success message:
# ✅ Successfully updated username!
# 🎉 Username change completed successfully!
```

## Comparison Matrix

| Aspect | Username Method | Email Method |
|--------|----------------|--------------|
| **Input** | Current username | Email address |
| **Best Use** | Known username | Temp username |
| **Temp Detection** | ❌ No | ✅ Yes |
| **User Lookup** | Direct | Via email table |
| **Speed** | Fast | Fast |
| **User Friendly** | Medium | High |
| **Support Friendly** | Medium | Very High |

---

**Script Location:** `server/src/utils/change-username-by-email.ts`  
**Command:** `npm run support:change-username-email`  
**Last Updated:** 2025-10-06

**See Also:**
- `SUPPORT_USERNAME_CHANGE.md` - Main support guide (includes both methods)
- `SUPPORT_SCRIPT_SUMMARY.md` - Implementation summary

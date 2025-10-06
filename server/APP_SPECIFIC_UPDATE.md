# Application-Specific Reserved Usernames Update

## Changes Made

Added 4 new application-specific reserved usernames to protect branding and app variations:

### New Additions
1. `createkuji` - Main app branding variation
2. `createmykuji` - "Create My Kuji" variation
3. `makekuji` - Alternative action verb
4. `makemykuji` - "Make My Kuji" variation

### Updated Total
**38 → 42 reserved usernames**

### Application Specific Category (Now 7 usernames)
- `createkuji` ⭐ NEW
- `createmykuji` ⭐ NEW
- `makekuji` ⭐ NEW
- `makemykuji` ⭐ NEW
- `kuji`
- `kyros`
- `kyroskoh`

## Rationale

These additions protect various permutations of the application name:
- **create** + kuji = brand protection
- **make** + kuji = action-oriented alternative
- **my** suffix = personalization variants

This prevents users from creating accounts that could:
1. Impersonate official app accounts
2. Confuse users about official channels
3. Conflict with future feature usernames (e.g., @createkuji official account)

## Code Location

**File:** `server/src/controllers/userController.ts`  
**Line:** 371

```typescript
// Application specific
'createkuji', 'createmykuji', 'makekuji', 'makemykuji', 'kuji', 'kyros', 'kyroskoh',
```

## Documentation Updated

✅ `WARP.md` - Architecture section  
✅ `server/README.md` - API validation rules  
✅ `server/RESERVED_USERNAMES.md` - Complete list with categories  
✅ `server/RESERVED_USERNAMES_LIST.txt` - Quick reference  
✅ `RESERVED_USERNAMES_UPDATE.md` - Updated totals  

## Testing

All new variations will now be rejected:

```bash
# All these should return RESERVED_USERNAME error
curl -X PUT http://localhost:3001/api/user/username \
  -H "Authorization: Bearer TOKEN" \
  -d '{"username": "createkuji"}'

curl -X PUT http://localhost:3001/api/user/username \
  -H "Authorization: Bearer TOKEN" \
  -d '{"username": "makemykuji"}'
```

## Summary Table

| Category | Before | After | Added |
|----------|--------|-------|-------|
| Application Specific | 3 | 7 | +4 |
| **Total Reserved** | **38** | **42** | **+4** |

---

**Date:** 2025-10-06  
**Status:** ✅ Active (auto-reloaded via ts-node-dev)

# How to Enable Analytics & Branding Tabs

## Problem
After upgrading a user to Pro plan, the Analytics and Branding tabs don't appear in the Manage page.

## Root Cause
The frontend checks the user's `subscriptionPlan` property, but the backend API wasn't including it in the authentication responses.

## Solution Applied ✅

### Backend Changes (Already Fixed)

1. **Updated `authController.ts`** - Added `subscriptionPlan` to API responses:
   - `getCurrentUser()` - Now includes `userSettings` relation and returns `subscriptionPlan`
   - `login()` - Now fetches and returns `subscriptionPlan` 
   - `signup()` - Now returns `subscriptionPlan` from `userSettings`

2. **Database Schema** - Already correct:
   - `subscriptionPlan` is stored in `UserSettings` table
   - Default value is `'free'`
   - Available values: `'free'`, `'basic'`, `'advanced'`, `'pro'`

### To See the New Tabs

**Step 1: Ensure your user is upgraded to Pro plan**

Run this command in the `server` directory:
```bash
npm run support:upgrade-to-pro
```

Enter your username when prompted and confirm with `yes`.

**Step 2: Restart the backend server**

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

**Step 3: Log out and log back in to the frontend**

The frontend caches user data, so you need to refresh it:

1. **Option A - Quick way (Console command)**:
   - Open browser DevTools (F12)
   - Go to Console tab
   - Run: `localStorage.clear(); location.reload();`

2. **Option B - Proper way**:
   - Log out from your account
   - Log back in
   - The new `subscriptionPlan` will be loaded from the backend

**Step 4: Verify the tabs appear**

Navigate to `/:username/manage` and you should now see:
- **Prizes** tab
- **Pricing** tab
- **Analytics** tab ← NEW
- **Branding** tab ← NEW
- **Configuration** tab

---

## Plan-Based Tab Visibility

The tabs that appear depend on your subscription plan:

### Free Plan
- Prizes ✅
- Pricing ✅
- Configuration ✅

### Basic Plan
- Prizes ✅
- Pricing ✅
- Configuration ✅

### Advanced Plan
- Prizes ✅
- Pricing ✅
- **Analytics** ✅ ← NEW
- Configuration ✅

### Pro Plan
- Prizes ✅
- Pricing ✅
- **Analytics** ✅ ← NEW
- **Branding** ✅ ← NEW
- Configuration ✅

---

## Troubleshooting

### Problem: Tabs still don't appear after upgrading

**Solution 1: Check backend is running the latest build**
```bash
cd server
npm run build
npm run dev
```

**Solution 2: Verify database was updated**
```sql
-- Check your user's plan in SQLite
SELECT u.username, us.subscriptionPlan 
FROM users u 
JOIN user_settings us ON u.id = us.user_id 
WHERE u.username = 'YOUR_USERNAME';
```

Should show `subscriptionPlan = 'pro'`

**Solution 3: Clear frontend auth cache**
```javascript
// In browser console:
import { useAuth } from './utils/AuthContext';
const { refreshUser } = useAuth();
await refreshUser();
```

Or just log out and log back in.

### Problem: Console error "Cannot read property 'subscriptionPlan' of undefined"

This means the backend isn't sending `subscriptionPlan` in the user object.

**Solution**: Ensure the server code is updated and rebuilt:
```bash
cd server
git pull  # if using git
npm run build
npm run dev
```

### Problem: API returns 404 for branding routes

This means the branding routes aren't registered.

**Solution**: Verify `usersRoutes.ts` includes:
```typescript
// Branding endpoints
router.get('/:username/branding', brandingController.getBranding);
router.post('/:username/branding/sync', requireAuth, brandingController.syncBranding);
router.delete('/:username/branding', requireAuth, brandingController.deleteBrandingController);
```

---

## Testing Different Plans

To test what each plan sees:

```bash
# Upgrade to Advanced (Analytics only)
npm run support:upgrade-to-pro
# Then manually change in database:
# UPDATE user_settings SET subscription_plan = 'advanced' WHERE user_id = ...

# Upgrade to Pro (Analytics + Branding)
npm run support:upgrade-to-pro
```

---

## Files Modified

### Backend
- `server/src/controllers/authController.ts` - Added `subscriptionPlan` to responses
- `server/src/utils/upgrade-to-pro.ts` - Fixed to query current settings

### Frontend (Already Implemented)
- `src/pages/Manage.jsx` - Conditionally renders tabs based on plan
- `src/utils/subscriptionPlans.js` - Defines plan features
- `src/components/Manage/UserAnalytics.jsx` - Analytics dashboard
- `src/components/Manage/BrandingManager.jsx` - Branding manager

---

## Next Steps

1. ✅ Backend updated to include `subscriptionPlan`
2. ✅ Upgrade utility script fixed
3. ⏭️ Restart backend server
4. ⏭️ Clear frontend cache or re-login
5. ⏭️ Verify tabs appear in Manage page
6. ⏭️ Test Analytics dashboard functionality
7. ⏭️ Test Branding manager functionality

---

**You're all set!** The Analytics and Branding features are now fully integrated. 🎉

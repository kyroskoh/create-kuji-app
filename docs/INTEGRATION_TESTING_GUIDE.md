# Integration and Testing Guide: Analytics & Custom Branding

## Overview
This guide provides step-by-step instructions for testing the new **Analytics** and **Custom Branding** features in Create Kuji App. These features are subscription-tier gated and fully integrated with the existing offline-first architecture.

---

## Prerequisites

### Test Accounts Setup
You'll need test accounts with different subscription plans:

1. **Free Plan User** - No access to analytics or branding
2. **Basic Plan User** - No access to analytics or branding
3. **Advanced Plan User** - Analytics access only
4. **Pro Plan User** - Full analytics + custom branding access
5. **Super Admin User** - Full analytics access (including revenue/user stats)

### Database Setup
Ensure your database has the updated schema:

```bash
# Generate and apply Prisma migrations
npx prisma generate
npx prisma migrate dev --name add-analytics-branding

# Optional: Seed test data
npm run seed
```

---

## Feature Access Matrix

| Feature | Free | Basic | Advanced | Pro | Super Admin |
|---------|------|-------|----------|-----|-------------|
| Basic Analytics (Draw stats, User behavior, Stock analytics) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Revenue Analytics | ❌ | ❌ | ✅ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ❌ | ✅ | N/A |
| Global System Analytics | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Navigation Structure

The Manage page uses **route-based navigation**, not tabs. Each section is accessible via a dedicated URL:

- **Prizes**: `/:username/manage/prizes`
- **Pricing**: `/:username/manage/pricing`
- **Analytics**: `/:username/manage/analytics` (Advanced/Pro/Admin only)
- **Branding**: `/:username/manage/branding` (Pro only)
- **Settings**: `/:username/manage/settings`

Navigation buttons dynamically appear based on the user's subscription plan.

---

## Testing Analytics Features

### Test Case 1: Subscription Plan Access Control

**Objective**: Verify analytics access is correctly gated by subscription plan.

**Steps**:
1. Log in as a **Free Plan** user
2. Navigate to `/:username/manage`
3. **Expected**: Analytics button should NOT appear in navigation
4. Try manually navigating to `/:username/manage/analytics`
5. **Expected**: Should redirect or show "Upgrade Required" message

6. Log in as an **Advanced Plan** user
7. Navigate to `/:username/manage`
8. **Expected**: Analytics button SHOULD appear in navigation
9. Click the Analytics button
10. **Expected**: Should navigate to `/:username/manage/analytics` and display the analytics dashboard

**Validation**:
- ✅ Plan-based button visibility works
- ✅ URL protection prevents unauthorized access
- ✅ Upgrade prompts appear for insufficient plans

---

### Test Case 2: Analytics Data Accuracy

**Objective**: Verify analytics calculations are correct.

**Prerequisites**: Populate test data with:
- Multiple draw sessions with various outcomes
- Prize inventory with different stock levels
- Multiple price presets with usage history

**Steps**:
1. Log in as **Advanced or Pro Plan** user
2. Navigate to `/:username/manage/analytics`
3. **Verify Draw Statistics Section**:
   - Total draws count matches actual history
   - Winner/No-winner percentages add up to 100%
   - Average draws per session is mathematically correct
   - Most popular presets reflect actual usage

4. **Verify Stock Analytics Section**:
   - Total prizes count matches database
   - Available vs. Drawn counts are accurate
   - Prize distribution by tier shows correct percentages
   - Low stock alerts trigger for items < 5 remaining

5. **Verify Revenue Analytics Section** (Advanced/Pro only):
   - Total revenue matches sum of all draws
   - Revenue by date chart displays correctly
   - Revenue by preset breakdown is accurate
   - Average revenue per draw is correct

**Data Validation Query** (for reference):
```javascript
// In browser console:
import { countTotalDraws, calculateDrawStats } from '../utils/analyticsUtils';
const history = await localForageDAO.getHistory();
console.log('Expected draws:', history.length);
console.log('Analytics shows:', document.querySelector('[data-metric="total-draws"]').innerText);
```

---

### Test Case 3: Analytics Visualizations (D3.js Charts)

**Objective**: Verify all D3 charts render correctly and are interactive.

**Steps**:
1. Navigate to Analytics dashboard
2. **LineChart - Draws Over Time**:
   - Chart renders with X-axis (dates) and Y-axis (counts)
   - Tooltip appears on hover showing exact values
   - Line interpolation is smooth

3. **BarChart - Revenue by Preset**:
   - Bars render with heights proportional to values
   - Colors match tier-based theming
   - Clicking bars doesn't break UI

4. **PieChart - Prize Distribution**:
   - Slices render with correct proportions
   - Labels show percentages
   - Hover effects work smoothly

5. Test responsiveness:
   - Resize browser window
   - Charts should adapt to container width
   - No overflow or distortion

**Visual Validation**:
- ✅ No console errors related to D3
- ✅ Charts update when data changes
- ✅ Animations are smooth (no jank)

---

### Test Case 4: Offline-First Analytics

**Objective**: Verify analytics work offline and sync properly.

**Steps**:
1. Log in as Advanced/Pro user (online)
2. Navigate to Analytics page
3. Perform several draws to generate fresh data
4. **Go offline** (disconnect network or use DevTools offline mode)
5. Refresh the page
6. **Expected**: Analytics should still display with cached data
7. Perform more draws while offline
8. Navigate to Analytics
9. **Expected**: New draws should be reflected in analytics (computed from LocalForage)
10. **Go back online**
11. Trigger sync (e.g., navigate away and back)
12. **Expected**: Analytics data syncs to backend, server-side analytics match

**Validation**:
- ✅ Analytics render offline
- ✅ Offline draws update analytics immediately
- ✅ Sync completes without data loss

---

## Testing Custom Branding Features

### Test Case 5: Branding Access Control

**Objective**: Verify branding features are Pro-plan exclusive.

**Steps**:
1. Log in as **Free/Basic/Advanced Plan** user
2. Navigate to `/:username/manage`
3. **Expected**: Branding button should NOT appear
4. Try manually navigating to `/:username/manage/branding`
5. **Expected**: Should redirect or show "Pro Plan Required" message

6. Log in as **Pro Plan** user
7. Navigate to `/:username/manage`
8. **Expected**: Branding button SHOULD appear
9. Click Branding button
10. **Expected**: Branding manager interface loads

**Validation**:
- ✅ Only Pro users see branding options
- ✅ URL is protected against unauthorized access

---

### Test Case 6: Logo Upload and Display

**Objective**: Test logo upload, validation, and cross-page display.

**Steps**:
1. Log in as **Pro Plan** user
2. Navigate to `/:username/manage/branding`
3. Click "Upload Logo" button
4. **Test invalid file types**:
   - Upload a `.txt` file
   - **Expected**: Error message "Only PNG, JPG, WebP allowed"
5. **Test file size limit**:
   - Upload a 6MB image
   - **Expected**: Error message "File must be under 5MB"
6. **Upload valid logo**:
   - Upload a 2MB PNG with transparent background
   - **Expected**: Preview appears immediately
7. Click "Save Branding"
8. Navigate to other pages:
   - `/:username/draw`
   - `/:username/stock`
   - `/:username/account`
9. **Expected**: Logo appears in header/navigation on all pages

**Validation**:
- ✅ Logo validation works (type and size)
- ✅ Preview updates in real-time
- ✅ Logo persists across page navigations
- ✅ Logo syncs to backend and is retrievable

---

### Test Case 7: Color Scheme Customization

**Objective**: Test custom color application across the app.

**Steps**:
1. Navigate to `/:username/manage/branding`
2. **Primary Color**:
   - Set primary color to `#FF5733` (bright orange)
   - **Expected**: Live preview updates immediately
3. **Secondary Color**:
   - Set to `#33FF57` (bright green)
4. **Background Color**:
   - Set to `#1A1A2E` (dark navy)
5. **Text Color**:
   - Set to `#EAEAEA` (light gray)
6. Click "Save Branding"
7. Navigate to:
   - Draw page → Check buttons, backgrounds
   - Stock page → Check prize cards
   - Manage page → Check navigation buttons
8. **Expected**: All pages use the custom color scheme

**Contrast Validation**:
1. Try setting text color to `#888888` (low contrast)
2. Set background to `#777777` (similar tone)
3. **Expected**: Warning message appears: "Text contrast may be insufficient"

**Validation**:
- ✅ Colors apply globally via CSS custom properties
- ✅ Contrast warnings prevent poor accessibility
- ✅ Colors persist after refresh

---

### Test Case 8: Font Customization

**Objective**: Test custom font application and fallback handling.

**Steps**:
1. Navigate to `/:username/manage/branding`
2. **Primary Font Family**:
   - Enter `"Roboto", sans-serif`
   - Save branding
3. Navigate to Draw page
4. **Expected**: Text uses Roboto font (if available)
5. Open DevTools → Computed styles
6. Verify `font-family` CSS property
7. **Test invalid font**:
   - Enter `"NonExistentFont12345", cursive`
   - **Expected**: App falls back to system cursive font gracefully

**Validation**:
- ✅ Custom fonts load correctly
- ✅ Invalid fonts don't break rendering
- ✅ Fallback fonts work as expected

---

### Test Case 9: Background Image Upload

**Objective**: Test custom background image application.

**Steps**:
1. Navigate to `/:username/manage/branding`
2. Upload a background image (e.g., abstract pattern PNG)
3. Select "Repeat Mode": `repeat`
4. Save branding
5. Navigate to Draw page
6. **Expected**: Background pattern repeats across entire page
7. Return to branding manager
8. Select "Repeat Mode": `cover`
9. Save branding
10. Return to Draw page
11. **Expected**: Background image covers full viewport without repeating

**Validation**:
- ✅ Background images display correctly
- ✅ Repeat modes work as expected
- ✅ No performance degradation with large images

---

### Test Case 10: Footer Text Customization

**Objective**: Test custom footer text and link.

**Steps**:
1. Navigate to `/:username/manage/branding`
2. Enter footer text: `"© 2024 My Kuji Shop - All Rights Reserved"`
3. Enter footer link: `https://example.com/terms`
4. Save branding
5. Navigate to any page
6. Scroll to footer
7. **Expected**: Custom footer text appears
8. Click footer link
9. **Expected**: Opens `https://example.com/terms` in new tab

**Validation**:
- ✅ Footer text updates on all pages
- ✅ Links are clickable and functional

---

### Test Case 11: Branding in Printable History

**Objective**: Verify custom branding applies to printable history logs.

**Steps**:
1. Set up complete custom branding (logo, colors, fonts)
2. Navigate to Draw page
3. Perform several draws to generate history
4. Open "History" panel
5. Click "Print History" button
6. **Expected**: Print preview shows:
   - Custom logo in header
   - Custom color scheme
   - Custom fonts
   - Custom footer text

**Validation**:
- ✅ Print styles inherit branding
- ✅ Colors are print-friendly
- ✅ Logo renders at appropriate size

---

### Test Case 12: Branding Sync and Persistence

**Objective**: Test offline-first branding sync.

**Steps**:
1. **Online** - Set up custom branding as Pro user
2. Save branding
3. **Go offline**
4. Navigate to other pages
5. **Expected**: Branding still applies (loaded from LocalForage)
6. Change branding colors while offline
7. Save changes
8. **Expected**: Changes apply immediately (stored in LocalForage)
9. **Go back online**
10. Trigger sync
11. **Expected**: Backend receives updated branding
12. Log in from a different device
13. **Expected**: Branding syncs to new device

**Validation**:
- ✅ Branding works offline
- ✅ Bi-directional sync resolves conflicts
- ✅ No data loss during sync

---

### Test Case 13: Reset to Default Branding

**Objective**: Test branding reset functionality.

**Steps**:
1. Set up extensive custom branding
2. Save changes
3. Click "Reset to Default" button
4. Confirm reset
5. **Expected**:
   - All colors revert to default theme
   - Logo is removed
   - Fonts reset to default
   - Background images removed
   - Footer text clears
6. Navigate to other pages
7. **Expected**: Default branding applies everywhere

**Validation**:
- ✅ Reset clears all custom settings
- ✅ App remains functional after reset
- ✅ Backend sync reflects reset state

---

## Super Admin Global Analytics Testing

### Test Case 14: Super Admin Dashboard Access

**Objective**: Verify super admin has exclusive access to global analytics.

**Steps**:
1. Log in as **regular Pro user**
2. Navigate to `/:username/admin`
3. **Expected**: Redirect or "Unauthorized" message
4. Log in as **Super Admin**
5. Navigate to `/:username/admin`
6. **Expected**: Admin dashboard loads with global analytics

---

### Test Case 15: Global Analytics Data

**Objective**: Verify system-wide analytics are accurate.

**Steps**:
1. As Super Admin, navigate to Admin dashboard
2. **Verify Metrics**:
   - Total users count matches database
   - Active users (logged in last 30 days) is accurate
   - Total revenue sums all user transactions
   - Total draws aggregates all user histories
3. **Verify Charts**:
   - User growth over time (line chart)
   - Revenue by subscription plan (bar chart)
   - Active users by plan (pie chart)

**Data Validation**:
```sql
-- Run in database to verify:
SELECT COUNT(*) FROM "User"; -- Should match "Total Users"
SELECT SUM(revenue) FROM "DrawSession"; -- Should match "Total Revenue"
```

**Validation**:
- ✅ Global metrics are accurate
- ✅ Charts update when data changes
- ✅ No performance issues with large datasets

---

## Edge Cases and Error Handling

### Test Case 16: Concurrent Branding Updates

**Scenario**: User edits branding on two devices simultaneously.

**Steps**:
1. Log in as Pro user on Device A
2. Log in as same user on Device B
3. On Device A: Change primary color to red, save
4. On Device B: Change primary color to blue, save
5. Trigger sync on both devices
6. **Expected**: Last-write-wins strategy applies
7. Refresh both devices
8. **Expected**: Both show the same branding (blue)

---

### Test Case 17: Invalid Analytics Data Handling

**Scenario**: Corrupted data in LocalForage.

**Steps**:
1. Open browser DevTools → Application → IndexedDB
2. Manually corrupt a history entry (invalid JSON)
3. Navigate to Analytics
4. **Expected**: Error is caught gracefully
5. **Expected**: Analytics show partial data or fallback message

---

### Test Case 18: Image Upload Failures

**Scenario**: Network error during logo upload.

**Steps**:
1. Navigate to Branding manager
2. Upload a 4MB logo
3. **Disconnect network during upload**
4. **Expected**: Error message appears
5. **Expected**: LocalForage stores logo locally
6. Reconnect network
7. Trigger sync
8. **Expected**: Logo uploads on next sync

---

## Performance Testing

### Test Case 19: Large Dataset Analytics

**Objective**: Ensure analytics perform well with large datasets.

**Setup**: Generate 10,000 draw history entries (use seed script or manual script).

**Steps**:
1. Navigate to Analytics
2. Measure page load time (should be < 3 seconds)
3. Check browser memory usage (no leaks)
4. Scroll through charts (should remain responsive)

**Validation**:
- ✅ No UI freezing
- ✅ Charts render within acceptable time
- ✅ Memory usage is reasonable

---

### Test Case 20: Branding CSS Performance

**Objective**: Verify branding doesn't degrade page performance.

**Steps**:
1. Apply extensive branding (logo, background image, custom fonts)
2. Navigate between pages rapidly
3. **Expected**: No flickering or layout shifts
4. Measure First Contentful Paint (FCP)
5. **Expected**: FCP < 1.5s

**Tools**: Use Lighthouse or Chrome DevTools Performance tab.

---

## Regression Testing

### Test Case 21: Existing Features Unaffected

**Objective**: Ensure analytics/branding don't break existing functionality.

**Critical Paths to Test**:
1. ✅ Draw process (select preset, draw prizes)
2. ✅ Stock management (add/edit/delete prizes)
3. ✅ User authentication (login/logout)
4. ✅ Pricing presets (create/edit/delete)
5. ✅ Subscription plan management
6. ✅ Sync functionality (online/offline)

---

## Automated Testing Checklist

### Unit Tests
- ✅ `analyticsUtils.js` - All calculation functions
- ✅ `subscriptionPlans.js` - Access control helpers
- ✅ `BrandingContext.jsx` - Context state management
- ✅ `localForageDAO.js` - Branding CRUD methods

### Integration Tests
- ✅ `UserAnalytics.test.jsx` - Component rendering with various plans
- ✅ `BrandingManager.test.jsx` - Form interactions and validation
- ✅ `Manage.test.jsx` - Route-based navigation
- ✅ Chart components (LineChart, BarChart, PieChart) - D3 rendering

### E2E Tests (with Playwright/Cypress)
- ✅ Full user journey: Upgrade to Pro → Set branding → Verify across pages
- ✅ Analytics flow: Perform draws → View analytics → Data accuracy
- ✅ Offline sync: Apply branding offline → Sync online → Verify persistence

---

## Known Issues and Workarounds

### Issue 1: Chart Tooltips Overflow on Small Screens
**Workaround**: Charts are hidden on screens < 768px (mobile-first design).

### Issue 2: Large Background Images Slow Initial Load
**Workaround**: Recommend users compress images before upload.

### Issue 3: Font Loading Flash (FOUT)
**Workaround**: Use `font-display: swap` in CSS (already implemented).

---

## Support and Debugging

### Debug Mode
Enable detailed logging:
```javascript
localStorage.setItem('DEBUG_ANALYTICS', 'true');
localStorage.setItem('DEBUG_BRANDING', 'true');
```

### Useful Console Commands
```javascript
// Check current branding
import { useBranding } from './utils/BrandingContext';
console.log(useBranding());

// Check subscription plan
import { useAuth } from './utils/AuthContext';
console.log(useAuth().user?.subscriptionPlan);

// Check analytics data
import { countTotalDraws } from './utils/analyticsUtils';
import localForageDAO from './utils/localForageDAO';
const history = await localForageDAO.getHistory();
console.log(countTotalDraws(history));
```

---

## Final Checklist Before Production

- [ ] All test cases pass
- [ ] Automated tests cover critical paths
- [ ] Performance benchmarks meet targets
- [ ] Accessibility audit completed (WCAG AA)
- [ ] Database migrations applied
- [ ] Rollback plan documented
- [ ] User documentation updated
- [ ] Support team trained
- [ ] Monitoring/logging configured
- [ ] Feature flags enabled (if applicable)

---

## Conclusion

This guide covers comprehensive testing for the Analytics and Custom Branding features. All tests should be executed in a staging environment before production deployment.

For questions or issues, contact the development team or refer to:
- `IMPLEMENTATION_PROGRESS.md` - Technical implementation details
- `ANALYTICS_BRANDING_SPEC.md` - Original requirements
- `API_DOCUMENTATION.md` - Backend API endpoints

---

**Last Updated**: 2024
**Version**: 1.0
**Maintainer**: Create Kuji App Development Team

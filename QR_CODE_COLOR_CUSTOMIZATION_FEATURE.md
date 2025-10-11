# QR Code Color Customization Feature

## Overview
This feature allows paid subscription plan users to customize the color of QR codes generated for draw sessions. The custom color replaces the default brand primary color, giving users more control over their QR code appearance.

## Implementation Summary

### 1. Subscription Plan Access
- **Available Plans**: Basic, Advanced, and Pro (all paid plans)
- **Free Plan**: QR code color customization is locked, users see an upgrade prompt

### 2. Files Modified

#### `src/utils/subscriptionPlans.js`
- Added `canCustomizeQRCodeColor(planId)` helper function
- Returns `true` for all paid plans (basic, advanced, pro)
- Returns `false` for free plan

#### `src/components/Manage/Settings.jsx`
- Imported `canCustomizeQRCodeColor` helper
- Added `qrCodeColor` field to settings state (default: `null`)
- Added `canCustomizeQRColor` computed property to check user's plan access
- Added `handleQRCodeColorChange` handler to validate and save hex color
- Added "QR Code Customization" section in UI with:
  - Text input for hex color code
  - Color picker input
  - Live preview box showing selected color
  - Reset to default button
  - Upgrade prompt for free plan users

#### `src/components/Draw/DrawScreen.jsx`
- Updated both QR code generation locations to use custom color:
  1. Auto-generation after skip-reveal draw (line ~378)
  2. Manual QR code generation via share button (line ~485)
- Custom color fallback order: `settings.qrCodeColor` → `branding.primaryColor` → `#1e293b`
- Custom color applies to both branded QR codes (with logo) and standard QR codes

#### `src/components/Draw/HistoryPanel.jsx`
- Updated component to accept `settings` prop
- Modified `showQRCode` function to use custom QR code color from settings
- Same fallback order as DrawScreen

### 3. User Experience

#### For Paid Plan Users:
1. Navigate to `{username}/manage/settings`
2. Scroll to "QR Code Customization" section
3. Enter hex color code (e.g., `#3b82f6`) or use color picker
4. See live preview of selected color
5. Changes are saved automatically to local storage and synced to backend
6. Generated QR codes will use the custom color
7. Can reset to default by clicking "Reset to default" button

#### For Free Plan Users:
1. Navigate to `{username}/manage/settings`
2. See "QR Code Customization" section with locked state
3. See feature benefits and upgrade prompt
4. Click "Upgrade Now" button to visit subscription plan page

### 4. Technical Details

**Settings Schema:**
```javascript
{
  ...existingSettings,
  qrCodeColor: null | string // Hex color string or null for default
}
```

**Color Validation:**
- Hex format: `#RRGGBB` or `#RGB`
- Regex: `/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/`
- Invalid colors show error message and are not saved

**QR Code Generation Priority:**
1. Custom QR code color (`settings.qrCodeColor`)
2. Brand primary color (`branding.primaryColor`)
3. Default color (`#1e293b`)

### 5. Integration Points

**Settings Sync:**
- Changes are persisted to local storage immediately
- Background sync to backend database (for users with DB sync enabled)
- Settings propagate to DrawScreen via `sessionSettings` state

**QR Code Generation:**
- Standard QR codes use the color for the "dark" pixels
- Branded QR codes (with logo) use the color for the QR code base before logo embedding
- Both generation methods support the custom color

### 6. UI Components

**Color Input Section:**
- Hex text input (max 7 chars)
- HTML5 color picker
- Live preview square (64x64px)
- Current color label
- Reset button (conditional)

**Upgrade Prompt (Free Plan):**
- Feature description
- Three benefit bullet points
- "Upgrade Now" CTA button
- Amber/orange color scheme to indicate premium feature

### 7. Feature Benefits

- **Brand Consistency**: Match QR codes to brand colors
- **Visual Appeal**: Stand out with custom colors instead of defaults
- **Flexibility**: Easy to change and preview before generating
- **Simple UX**: Color picker + hex input for maximum flexibility

## Testing Checklist

- [x] Build compiles successfully
- [ ] QR code color picker appears for paid plans
- [ ] QR code color picker is locked for free plans
- [ ] Hex color validation works correctly
- [ ] Color picker updates both inputs
- [ ] Text input updates color picker
- [ ] Preview square shows correct color
- [ ] Settings save to local storage
- [ ] Settings sync to backend (for paid plans with DB sync)
- [ ] QR codes in DrawScreen use custom color
- [ ] QR codes in HistoryPanel use custom color
- [ ] Reset to default button works
- [ ] Fallback to brand primary color when qrCodeColor is null
- [ ] Branded QR codes (with logo) use custom color

## Future Enhancements

1. **Color Presets**: Add popular color presets for quick selection
2. **QR Code Style Options**: Beyond color, add pattern/style customization
3. **Gradient Support**: Allow gradient colors for QR codes
4. **Brand Color Sync**: Auto-suggest brand primary color as preset
5. **Preview QR Code**: Generate sample QR code with custom color in settings
6. **Export Options**: Allow downloading QR code with different colors directly from settings

## Related Files

- `src/utils/subscriptionPlans.js` - Subscription plan logic
- `src/components/Manage/Settings.jsx` - Settings UI and state management
- `src/components/Draw/DrawScreen.jsx` - QR code generation on draw screen
- `src/components/Draw/HistoryPanel.jsx` - QR code generation in history
- `src/services/syncService.js` - Backend synchronization
- `src/hooks/useLocalStorageDAO.js` - Local storage management

## Notes

- The feature integrates seamlessly with existing branding and subscription systems
- QR codes maintain high error correction level (H) for logo embedding
- Custom colors work with both PNG export and display in modals
- No breaking changes to existing QR code functionality
- Backward compatible (null = use default behavior)

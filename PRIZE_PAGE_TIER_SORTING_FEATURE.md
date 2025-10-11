# Prize Page Tier Sorting Feature

## Overview
Tier sorting/arrangement is now available on the Prize Pool Manager page, synchronized with the Settings page. Users with Advanced or Pro subscription plans can drag and drop tiers to reorder them, and the order will be consistent across both pages.

## Subscription Plan Access
- **Free Plan**: No tier sorting (alphabetical order)
- **Basic Plan**: No tier sorting (alphabetical order)
- **Advanced Plan**: ✅ Tier sorting enabled
- **Pro Plan**: ✅ Tier sorting enabled

## Implementation

### Synchronization Architecture
The tier order is stored in `settings.tierColors` as an object where **insertion order matters**. Both Prize and Settings pages read from and write to this same data source, ensuring perfect synchronization.

### Components Modified

#### `src/components/Manage/PrizePoolManager.jsx`

**1. Added State:**
```javascript
const [draggedTierIndex, setDraggedTierIndex] = useState(null);
```

**2. Added Handler:**
```javascript
const handleTierReorder = async (fromIndex, toIndex) => {
  // Reorders tierColors object
  // Updates settings
  // Dispatches 'settings-updated' event
  // Syncs to backend
}
```

**3. Updated Tier Chips Display:**
- Added drag-and-drop event handlers
- Visual indicators (drag icon, cursor-move)
- Opacity change while dragging
- "Drag" label for Advanced/Pro users

### How It Works

**Data Flow:**
1. User drags tier chip on Prize page
2. `handleTierReorder` updates `tierColors` object order
3. Settings are saved to localStorage
4. `settings-updated` event is dispatched
5. Settings page listens and updates automatically
6. Changes sync to backend (if authenticated)

**Visual Indicators:**
- **Drag Icon**: Arrow up/down icon on each tier chip
- **"Drag" Label**: Small green label next to tier chips
- **Cursor**: Changes to `cursor-move` on hover
- **Opacity**: Dragged chip becomes semi-transparent

## User Experience

### For Advanced/Pro Users

**Prize Page:**
```
[Export] [Add Row]  [Drag] [↕️ S:5] [↕️ A:3] [↕️ B:2]
                            ↑ draggable tier chips
```

**Actions:**
1. Hover over tier chip → cursor changes to move cursor
2. Click and drag tier chip → chip becomes semi-transparent
3. Drag to new position
4. Drop → tier order updates
5. Success message appears
6. Settings page updates automatically

**Settings Page:**
- Tier order updates in real-time
- No page refresh needed
- Same drag-and-drop functionality

### For Free/Basic Users

**Prize Page:**
```
[Export] [Add Row]  [S:5] [A:3] [B:2]
                     ↑ static tier chips (alphabetical order)
```

**Behavior:**
- Tiers displayed in alphabetical order
- No drag icons or indicators
- Not draggable
- Upgrade prompt in Settings to unlock feature

## Technical Details

### Event System
Uses CustomEvent API for cross-component communication:

```javascript
// Prize page dispatches
window.dispatchEvent(new CustomEvent('settings-updated', { 
  detail: { settings: updatedSettings } 
}));

// Settings page listens
window.addEventListener('settings-updated', handleSettingsUpdate);
```

### Order Preservation
JavaScript object insertion order is preserved (ES2015+):

```javascript
// Order matters!
const tierColors = {
  'S': 'amber',    // First
  'A': 'sky',      // Second
  'B': 'emerald'   // Third
};
```

### Drag and Drop API
Standard HTML5 Drag and Drop API:
- `draggable={true}` - Enables dragging
- `onDragStart` - Stores dragged index
- `onDragOver` - Allows drop
- `onDrop` - Performs reorder
- `onDragEnd` - Cleanup

### Backend Sync
Changes are synced to backend after a small delay (500ms):
- Prevents excessive API calls during multiple reorders
- Non-blocking (doesn't wait for backend response)
- Error handling with console warnings

## Features

### Two-Way Sync
- **Prize → Settings**: Changes in Prize page reflect in Settings
- **Settings → Prize**: Changes in Settings page reflect in Prize
- **Real-time**: No page refresh required

### Visual Feedback
- **Drag icon**: Shows on each chip for Advanced/Pro
- **Label**: "Drag" indicator next to chips
- **Hover effect**: Cursor changes to indicate draggability
- **Dragging state**: Semi-transparent while dragging
- **Success message**: Confirms tier order was updated

### Conditional Display
- Only shows drag UI for plans with tier sorting feature
- Free/Basic users see static alphabetical list
- Upgrade prompt in Settings page

### Persistence
- Saved to localStorage immediately
- Synced to backend (if authenticated)
- Persists across page reloads
- Consistent across all pages

## Code Changes Summary

### State Added
```javascript
const [draggedTierIndex, setDraggedTierIndex] = useState(null);
```

### Handler Added
```javascript
const handleTierReorder = async (fromIndex, toIndex) => {
  // 35 lines of reordering logic
}
```

### UI Changes
- Added conditional "Drag" label
- Added drag-and-drop event handlers to tier chips
- Added drag icon (arrows up/down) to each chip
- Added `cursor-move` CSS class
- Added opacity change during drag

## Benefits

1. **Consistency**: Same tier order across Prize and Settings pages
2. **Flexibility**: Easy to reorder tiers on either page
3. **Real-time**: Changes sync instantly without refresh
4. **Visual**: Clear indicators for draggable tiers
5. **Professional**: Matches Settings page functionality
6. **Performance**: Efficient event-based sync
7. **User Control**: Advanced/Pro users have full control

## Testing Checklist

- [x] Build compiles successfully
- [ ] Drag-and-drop works on Prize page (Advanced/Pro)
- [ ] Tier order updates immediately
- [ ] Settings page reflects changes in real-time
- [ ] Changes from Settings page sync to Prize page
- [ ] Free/Basic users don't see drag UI
- [ ] Drag icon shows on tier chips
- [ ] "Drag" label appears for Advanced/Pro
- [ ] Cursor changes on hover
- [ ] Opacity changes while dragging
- [ ] Success message appears after reorder
- [ ] Backend sync works (when authenticated)
- [ ] Order persists after page reload

## Future Enhancements

1. **Keyboard Support**: Arrow keys to reorder
2. **Touch Support**: Better mobile drag-and-drop
3. **Animation**: Smooth transition when reordering
4. **Undo/Redo**: Revert tier order changes
5. **Presets**: Save and load tier order presets
6. **Bulk Actions**: Reverse order, alphabetize, etc.
7. **Visual Preview**: Show preview before dropping

## Related Files

- `src/components/Manage/PrizePoolManager.jsx` - Prize page with drag-and-drop
- `src/components/Manage/Settings.jsx` - Settings page with tier management
- `src/utils/subscriptionPlans.js` - Plan feature checks
- `src/utils/tierColors.js` - Tier color utilities

## Usage Examples

### Reorder on Prize Page
1. Navigate to Prizes page
2. Look for tier chips at top right (e.g., S:5, A:3, B:2)
3. Drag a tier chip to new position
4. Drop to reorder
5. ✅ Order updated everywhere

### Verify Sync
1. Reorder tiers on Prize page
2. Navigate to Settings page
3. Check tier order matches
4. Reorder on Settings page
5. Navigate back to Prizes page
6. ✅ Order still matches

### Free/Basic User Experience
1. Navigate to Prizes page
2. See tier chips (no drag icon)
3. Try to drag → nothing happens
4. Go to Settings → see upgrade prompt
5. Upgrade to Advanced/Pro → drag-and-drop unlocked

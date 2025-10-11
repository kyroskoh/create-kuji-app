# History Spoiler Toggle Feature

## Overview
A spoiler toggle has been added to the Draw History panel, allowing users to hide/show prize information. This is useful when users want to show QR codes to fans without revealing what prizes they won.

## Use Case
When sharing a QR code with a fan, the user may want to:
1. Open the history panel
2. Hide the prize spoilers (default state)
3. Generate and show the QR code to the fan
4. The fan can scan the QR code to see their prizes themselves
5. User can toggle to show prizes when needed

## Implementation

### State Management
Added a new state variable in `HistoryPanel.jsx`:
```javascript
const [showSpoilers, setShowSpoilers] = useState(false);
```
- Default: `false` (prizes are hidden by default)
- User can toggle to show/hide prizes

### UI Components

#### Toggle Button (Top Right Corner)
Located in the header next to the "Close" button:

**When Spoilers Hidden (Default):**
- Gray button with eye icon
- Text: "Show Prizes"
- Click to reveal prizes

**When Spoilers Shown:**
- Amber/orange button with crossed-eye icon
- Text: "Hide Prizes"
- Click to hide prizes

#### Prize Display Area

**When Spoilers Shown:**
- Full list of prizes with tier badges
- Same as original display
- Shows tier color and prize name

**When Spoilers Hidden:**
- Shows a placeholder box with:
  - Crossed-eye icon
  - "Prizes Hidden" heading
  - "Click 'Show Prizes' above to reveal" instruction
  - Subtle styling to indicate hidden content

### Visual Design

**Toggle Button:**
```
[👁️ Show Prizes] - Gray, default state
[🚫👁️ Hide Prizes] - Amber, active state
```

**Hidden Prizes Box:**
```
┌─────────────────────────────────────┐
│ 🚫👁️  Prizes Hidden                 │
│     Click "Show Prizes" above to    │
│     reveal                          │
└─────────────────────────────────────┐
```

**Shown Prizes:**
```
[S] Badge Set (3 pcs)  [K] A4 Poster  [E] Lanyard
```

## User Flow

### Scenario 1: Showing QR Code to Fan
1. User opens Draw History
2. Prizes are hidden by default (safe to show screen)
3. User clicks "QR" button
4. User shows QR code to fan
5. Fan scans QR code to see their own prizes

### Scenario 2: Checking Past Draws
1. User opens Draw History
2. User clicks "Show Prizes" button
3. All prizes are revealed
4. User can review what was drawn

### Scenario 3: Quick Toggle
1. User can toggle between hidden/shown at any time
2. State persists while modal is open
3. Resets to hidden when modal is reopened

## Code Changes

### File Modified: `src/components/Draw/HistoryPanel.jsx`

#### 1. Added State
```javascript
const [showSpoilers, setShowSpoilers] = useState(false);
```

#### 2. Updated Header
- Changed header layout to flex container
- Added spoiler toggle button with icons
- Visual feedback for active state

#### 3. Conditional Prize Display
```javascript
{showSpoilers ? (
  // Show prize list
  <ul>...</ul>
) : (
  // Show "Prizes Hidden" placeholder
  <div>...</div>
)}
```

## Features

### Default Hidden State
- Prizes are hidden by default when opening history
- Safe to show screen to fans without spoiling prizes
- User must explicitly click to reveal

### Visual Indicators
- **Icons**: Eye (show) / Crossed-eye (hide)
- **Colors**: Gray (hidden) / Amber (shown)
- **Text**: Clear action labels

### Responsive Design
- Toggle button works on mobile and desktop
- Icons and text scale appropriately
- Placeholder box adapts to container width

### Accessibility
- Clear button labels
- Icon + text combination
- Tooltip on hover
- Semantic HTML structure

## Benefits

1. **Privacy**: Hide prizes when showing QR codes
2. **Flexibility**: Quick toggle for different scenarios
3. **User Control**: User decides when to reveal
4. **Better UX**: Clear visual feedback
5. **Professional**: More polished interaction flow

## Technical Details

### State Persistence
- State persists during modal session
- Resets to hidden on modal close/reopen
- No localStorage needed (session-only)

### Performance
- No additional API calls
- Conditional rendering only
- Minimal state updates

### Compatibility
- Works with existing QR code generation
- Compatible with scratch card mode
- No breaking changes

## Testing Checklist

- [x] Build compiles successfully
- [ ] Toggle button appears in history header
- [ ] Prizes hidden by default
- [ ] Click "Show Prizes" reveals prizes
- [ ] Click "Hide Prizes" hides prizes
- [ ] Button visual state changes correctly
- [ ] Icons display properly
- [ ] Placeholder text is readable
- [ ] Works with QR code generation
- [ ] Works on mobile devices
- [ ] Tooltip shows on hover

## Future Enhancements

1. **Remember Preference**: Save user's preference in localStorage
2. **Per-Session Toggle**: Individual show/hide per session entry
3. **Blur Effect**: Add blur filter instead of complete hide
4. **Animation**: Smooth transition when toggling
5. **Keyboard Shortcut**: Press 'H' to toggle hide/show
6. **Quick Peek**: Hold button to temporarily show, release to hide

## Related Files

- `src/components/Draw/HistoryPanel.jsx` - Main implementation
- `src/components/Draw/DrawScreen.jsx` - Parent component (passes data)

## User Documentation

### How to Use

**To Hide Prizes:**
1. Open Draw History
2. Prizes are hidden by default
3. Safe to show QR codes to fans

**To Show Prizes:**
1. Click the "Show Prizes" button (eye icon)
2. All prizes will be revealed
3. Click "Hide Prizes" to hide again

**Best Practice:**
- Keep prizes hidden when generating QR codes for fans
- Only show prizes when you need to review or verify draws
- Toggle as needed for your workflow

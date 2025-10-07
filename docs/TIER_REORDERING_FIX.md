# Tier Reordering Fix

## Problem

The tier drag-and-drop reordering was not working properly. Users could drag tiers, but they would snap back to their original alphabetical positions.

## Root Cause

The `tierList` was being computed using `compareTierLabels` sorting function, which always sorted tiers alphabetically. This meant that even after reordering the `tierColors` object, the `useMemo` would re-sort the keys alphabetically, losing the custom order.

```javascript
// BEFORE (Always sorted alphabetically)
const tierList = useMemo(() => {
  const keys = new Set(DEFAULT_TIER_SEQUENCE);
  Object.keys(tierColors).forEach((key) => keys.add(key));
  return Array.from(keys).sort(compareTierLabels); // ❌ Always alphabetical
}, [tierColors]);
```

## Solution

### 1. Preserve Custom Order for Sortable Plans

Modified `tierList` to respect the insertion order of the `tierColors` object when tier sorting is allowed:

```javascript
// AFTER (Respects custom order when sorting is allowed)
const tierList = useMemo(() => {
  const tierKeys = Object.keys(tierColors);
  if (tierKeys.length > 0 && tierSortingAllowed) {
    // Use the order from tierColors object ✅
    return tierKeys;
  }
  // Default: sort alphabetically for Free/Basic plans
  const keys = new Set(DEFAULT_TIER_SEQUENCE);
  Object.keys(tierColors).forEach((key) => keys.add(key));
  return Array.from(keys).sort(compareTierLabels);
}, [tierColors, tierSortingAllowed]);
```

### 2. Improved Drag-and-Drop Logic

**Added null check:**
```javascript
onDrop={(e) => {
  if (!tierSortingAllowed || draggedTier === null) return; // ✅ Check for null
  e.preventDefault();
  // ...
}}
```

**Added same-position check:**
```javascript
// Don't do anything if dropped on same position
if (draggedTier === index) {
  setDraggedTier(null);
  return;
}
```

**Added debug logging:**
```javascript
console.log('Reordering tiers:', tierList, '→', newList);
```

### 3. Enhanced Visual Feedback

**Improved drag events:**
```javascript
onDragStart={(e) => {
  if (!tierSortingAllowed) return;
  setDraggedTier(index);
  e.dataTransfer.effectAllowed = 'move'; // ✅ Better visual feedback
}}

onDragOver={(e) => {
  if (!tierSortingAllowed) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move'; // ✅ Show move cursor
}}
```

## How It Works Now

### For Free & Basic Plans (No Sorting)
```
Tiers are always displayed alphabetically:
A, B, C, S → Always shows as: A, B, C, S
(No drag-and-drop available)
```

### For Advanced & Pro Plans (Sorting Enabled)
```
Initial state (alphabetical):
tierColors = { S: "amber", A: "sky", B: "emerald" }
Display: S, A, B

After dragging B before S:
tierColors = { B: "emerald", S: "amber", A: "sky" }
Display: B, S, A ✅ (Custom order preserved!)
```

## Key Concepts

### JavaScript Object Key Order
- ES2015+ guarantees that object keys maintain insertion order
- When we create `reorderedColors` with the new order, that order is preserved
- `Object.keys(tierColors)` returns keys in insertion order

### Persistence
- Custom tier order is saved in `tierColors` object
- Order persists across page reloads
- Export/import maintains the custom order

## Testing Checklist

- [x] Free plan: Tiers stay alphabetically sorted (no drag-and-drop)
- [x] Basic plan: Tiers stay alphabetically sorted (no drag-and-drop)
- [x] Advanced plan: Can drag-and-drop to reorder tiers
- [x] Pro plan: Can drag-and-drop to reorder tiers
- [x] Custom order persists after page reload
- [x] Custom order maintained in export/import
- [x] Visual feedback during drag (move cursor)
- [x] No action when dropping on same position
- [x] Dragged tier shows with opacity-50

## Usage

### Advanced/Pro Users:

1. **Drag a tier:**
   - Click and hold on a tier chip
   - Cursor changes to "move"
   - Tier becomes semi-transparent

2. **Drop on target:**
   - Drag over the desired position
   - Release mouse button
   - Tier order updates immediately

3. **Verify:**
   - Check console for: `Reordering tiers: [old] → [new]`
   - Order is saved automatically
   - Reload page to verify persistence

## Example Scenarios

### Scenario 1: Reorder Standard Tiers
```
Before: S, A, B, C
Drag B before S
After:  B, S, A, C ✅
```

### Scenario 2: Multi-Character Tiers (Advanced/Pro)
```
Before: SS, SR, UR, S, A
Drag UR to first position
After:  UR, SS, SR, S, A ✅
```

### Scenario 3: Mixed Custom Tiers (Pro)
```
Before: SSR, UR+, LR, EX+, S
Drag S to first position
After:  S, SSR, UR+, LR, EX+ ✅
```

## Technical Details

### Files Modified:
- `src/components/Manage/Settings.jsx`

### Changes Made:
1. Modified `tierList` useMemo to respect custom order when sorting is allowed
2. Added `tierSortingAllowed` dependency to useMemo
3. Improved drag-and-drop event handlers
4. Added null and same-position checks
5. Enhanced visual feedback with dataTransfer properties
6. Added debug logging

### Dependencies:
- Plan-based feature: `isTierSortingAllowed(plan)`
- Object key order: ES2015+ guaranteed
- React state: `draggedTier` for drag state management

## Future Enhancements

1. **Visual Drop Zones:**
   - Show insertion indicator line between tiers
   - Highlight drop target tier

2. **Animation:**
   - Smooth transition when reordering
   - Fade in/out effects

3. **Touch Support:**
   - Mobile touch events for drag-and-drop
   - Alternative up/down buttons for mobile

4. **Undo/Redo:**
   - History of tier order changes
   - Quick undo last reorder

5. **Keyboard Support:**
   - Arrow keys to reorder
   - Accessibility improvements

## Troubleshooting

**Q: Tiers still snap back to alphabetical order**
- A: Check if you have Advanced or Pro plan (Free/Basic don't support sorting)
- A: Clear browser cache and reload

**Q: Drag cursor doesn't change**
- A: Check browser console for JavaScript errors
- A: Verify `tierSortingAllowed` is true

**Q: Order doesn't persist after reload**
- A: Check if settings are being saved (look for "Settings saved" message)
- A: Check browser localStorage for `create::settings`

**Q: Can't drag tiers at all**
- A: Verify you're on Advanced or Pro plan
- A: Check for "🔒 Upgrade to add more" message

## Summary

✅ **Fixed:** Tier reordering now works correctly for Advanced & Pro plans  
✅ **Preserved:** Alphabetical sorting for Free & Basic plans  
✅ **Enhanced:** Better visual feedback during drag operations  
✅ **Reliable:** Null checks and same-position detection  
✅ **Persistent:** Custom order saved and maintained across sessions  

The tier reordering feature now works as expected, providing Advanced and Pro users with full control over their tier display order! 🎯

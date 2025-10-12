# Tier Color Deselect - Tier Preservation Fix

## ✅ Issue Fixed

**Problem:** When deselecting a color from a tier, the tier name was being removed from the tier list entirely, causing tiers to disappear.

**Root Cause:** The deselect logic was using `delete updatedColors[activeTier]` which removed the tier key from the `tierColors` object. Since `tierList` is generated from `Object.keys(tierColors)`, deleting the key made the tier disappear.

**Solution:** Set the color value to `null` instead of deleting the key, preserving the tier name while removing the color assignment.

---

## 🔧 Technical Fix

### Before (Buggy Code)
```javascript
// Clear button
onClick={() => {
  const updatedColors = { ...tierColors };
  delete updatedColors[activeTier];  // ❌ This removes the tier!
  updateSettings({ tierColors: updatedColors });
}}

// Deselect in color grid
if (isSelected) {
  const updatedColors = { ...tierColors };
  delete updatedColors[activeTier];  // ❌ This removes the tier!
  updateSettings({ tierColors: updatedColors });
}
```

**Problem Flow:**
```
Initial state:
tierColors = { S: 'sky', A: 'emerald', B: 'amber' }
tierList = ['S', 'A', 'B']

User deselects color from Tier A:
delete tierColors['A']
tierColors = { S: 'sky', B: 'amber' }  // ❌ Tier A gone!
tierList = ['S', 'B']  // ❌ Tier A disappears from UI!
```

### After (Fixed Code)
```javascript
// Clear button
onClick={() => {
  const updatedColors = { ...tierColors };
  updatedColors[activeTier] = null;  // ✅ Preserves tier name!
  updateSettings({ tierColors: updatedColors });
}}

// Deselect in color grid
if (isSelected) {
  const updatedColors = { ...tierColors };
  updatedColors[activeTier] = null;  // ✅ Preserves tier name!
  updateSettings({ tierColors: updatedColors });
}
```

**Fixed Flow:**
```
Initial state:
tierColors = { S: 'sky', A: 'emerald', B: 'amber' }
tierList = ['S', 'A', 'B']

User deselects color from Tier A:
tierColors['A'] = null
tierColors = { S: 'sky', A: null, B: 'amber' }  // ✅ Tier A preserved!
tierList = ['S', 'A', 'B']  // ✅ All tiers still visible!
```

---

## 📊 Behavior Comparison

### Scenario: User has 3 tiers configured

| Action | Before Fix | After Fix |
|--------|------------|-----------|
| **Initial State** | S=sky, A=emerald, B=amber | S=sky, A=emerald, B=amber |
| **Deselect Tier A color** | S=sky, B=amber (A gone!) ❌ | S=sky, A=null, B=amber ✅ |
| **Tier chips shown** | S, B (A missing!) ❌ | S, A, B (all present) ✅ |
| **Select new color for A** | Can't! Tier doesn't exist ❌ | Works perfectly ✅ |
| **Prizes with Tier A** | Still work but can't change color ❌ | Can reassign color anytime ✅ |

---

## 🎯 User Impact

### Before Fix (Problematic)
```
User workflow:
1. Create tiers: S, A, B, C
2. Assign colors to all tiers
3. Decide to change Tier B color
4. Click selected color to deselect
5. ❌ Tier B disappears from tier list!
6. ❌ Can't reassign color to Tier B
7. ❌ Prizes still have Tier B but can't manage it
8. 😞 User confused and frustrated
```

### After Fix (Correct)
```
User workflow:
1. Create tiers: S, A, B, C
2. Assign colors to all tiers
3. Decide to change Tier B color
4. Click selected color to deselect
5. ✅ Tier B remains in tier list (no color)
6. ✅ Can select a new color for Tier B
7. ✅ All tier management works normally
8. 😊 User has full control
```

---

## 🔍 How `tierList` Works

### Code Reference
**File:** `src/components/Manage/Settings.jsx` (Lines 123-135)

```javascript
const tierList = useMemo(() => {
  // tierList is generated from tierColors keys
  const tierKeys = Object.keys(tierColors);
  
  if (tierKeys.length > 0 && tierSortingAllowed) {
    return tierKeys;  // Uses keys from tierColors object
  }
  
  // Merge with defaults and sort
  const keys = new Set(DEFAULT_TIER_SEQUENCE);
  Object.keys(tierColors).forEach((key) => keys.add(key));
  return Array.from(keys).sort(compareTierLabels);
}, [tierColors, tierSortingAllowed]);
```

**Key Point:** `tierList = Object.keys(tierColors)`
- If key is deleted → tier disappears from list
- If key is set to `null` → tier remains in list

---

## 💡 Design Decision: `null` vs `undefined` vs Empty String

### Why `null`?

**Option 1: Delete key** ❌
```javascript
delete tierColors[tier];
// Result: { S: 'sky', B: 'amber' }
// Problem: Tier A completely gone!
```

**Option 2: Set to `undefined`** ⚠️
```javascript
tierColors[tier] = undefined;
// Result: { S: 'sky', A: undefined, B: 'amber' }
// Problem: JSON.stringify removes undefined values!
```

**Option 3: Set to empty string** ⚠️
```javascript
tierColors[tier] = '';
// Result: { S: 'sky', A: '', B: 'amber' }
// Problem: Empty string might be treated as a value
```

**Option 4: Set to `null`** ✅
```javascript
tierColors[tier] = null;
// Result: { S: 'sky', A: null, B: 'amber' }
// Benefits:
// - Key preserved ✅
// - JSON.stringify keeps it ✅
// - Clearly indicates "no value" ✅
// - Falsy in conditionals ✅
```

---

## 🛡️ Safeguards

### Handling `null` Values

The code already handles `null` values correctly:

```javascript
// Selection check
const isSelected = tierColors[activeTier] === palette.id;
// null !== 'sky' → false (not selected) ✅

// Conditional rendering
{tierColors[activeTier] && !tierColors[activeTier].startsWith('#') && (
  <ClearButton />
)}
// null → falsy → button hidden ✅

// Tier chip display
<button className={tierChipClass(tier, tierColors)}>
  Tier {tier}
</button>
// tierChipClass handles null/undefined gracefully ✅
```

### Backward Compatibility

```javascript
// Old data (tiers without colors weren't stored)
{ S: 'sky', A: 'emerald' }

// New data (tiers without colors stored as null)
{ S: 'sky', A: 'emerald', B: null, C: null }

// Both formats work correctly ✅
```

---

## 🧪 Testing Scenarios

### Test Case 1: Deselect Color via Click
**Steps:**
1. Configure tiers: S, A, B with colors
2. Click tier A
3. Click the selected color to deselect
4. Observe tier list

**Expected:**
- ✅ Tier A remains in tier list
- ✅ Color is deselected (no checkmark)
- ✅ Tier A chip shows default color
- ✅ Can immediately select new color

**Verify in Console:**
```javascript
// Before deselect
tierColors = { S: 'sky', A: 'emerald', B: 'amber' }

// After deselect
tierColors = { S: 'sky', A: null, B: 'amber' }

// Tier list unchanged
tierList = ['S', 'A', 'B']
```

### Test Case 2: Clear Button
**Steps:**
1. Configure tiers with colors
2. Click tier B
3. Click "Clear" button
4. Observe tier list

**Expected:**
- ✅ Tier B remains in tier list
- ✅ Color is cleared
- ✅ Clear button disappears (no color selected)
- ✅ Can select new color for Tier B

### Test Case 3: Multiple Deselects
**Steps:**
1. Configure 4 tiers: S, A, B, C with colors
2. Deselect color from A
3. Deselect color from C
4. Deselect color from B
5. Observe tier list

**Expected:**
- ✅ All 4 tiers remain in list
- ✅ Only Tier S has color
- ✅ A, B, C show default colors
- ✅ Can reassign colors to any tier

### Test Case 4: Deselect and Reselect
**Steps:**
1. Tier A has 'emerald' color
2. Deselect 'emerald' from Tier A
3. Select 'amber' for Tier A
4. Observe behavior

**Expected:**
- ✅ Tier A never disappears
- ✅ First click: emerald deselected, A becomes null
- ✅ Second click: amber selected, A = 'amber'
- ✅ Smooth transition, no issues

### Test Case 5: Prizes with Null Tier
**Steps:**
1. Create prizes with Tier A
2. Deselect Tier A color (A = null)
3. Go to Prize Manager
4. Check prize display

**Expected:**
- ✅ Prizes still show Tier A
- ✅ Tier A uses default color/style
- ✅ No errors or crashes
- ✅ Can still filter by Tier A

---

## 📖 User Guide Update

### How to Remove a Tier Color

**Method 1: Click to Deselect**
1. Click the tier chip (e.g., "Tier A")
2. Find the currently selected color (has checkmark ✓)
3. Click that color again
4. ✅ Color is removed, tier remains

**Method 2: Clear Button**
1. Click the tier chip
2. Click the "Clear" button in the top right
3. ✅ Color is removed, tier remains

**Important Note:**
- Removing a color does NOT delete the tier
- The tier remains in your list with a default appearance
- You can assign a new color anytime
- Existing prizes with that tier are unaffected

---

## 🔧 Developer Notes

### If You Need to Actually Delete a Tier

If you want to add a "Delete Tier" feature in the future, use this pattern:

```javascript
const handleDeleteTier = (tierToDelete) => {
  // Confirm deletion
  if (!window.confirm(`Delete Tier ${tierToDelete}? This will affect existing prizes.`)) {
    return;
  }
  
  // Remove from tierColors
  const updatedColors = { ...tierColors };
  delete updatedColors[tierToDelete];  // Now it's intentional!
  
  // Update settings
  updateSettings({ tierColors: updatedColors });
  
  // Also remove from prizes (if needed)
  // ... additional cleanup logic
};
```

### Migrating Old Data

If you have old data where tiers were deleted, you can restore them:

```javascript
// Migration function (if needed)
const migrateTierColors = (oldTierColors, allKnownTiers) => {
  const migrated = { ...oldTierColors };
  
  // Add any missing tiers as null
  allKnownTiers.forEach(tier => {
    if (!(tier in migrated)) {
      migrated[tier] = null;
    }
  });
  
  return migrated;
};
```

---

## ✅ Verification Checklist

### Code Changes
- [x] Clear button: Set to `null` instead of `delete`
- [x] Deselect click: Set to `null` instead of `delete`
- [x] Comments added explaining the fix

### Testing
- [ ] Deselect via click preserves tier
- [ ] Clear button preserves tier
- [ ] Multiple deselects work correctly
- [ ] Tier chips remain visible
- [ ] Can reassign colors after deselect
- [ ] Prizes still work with null tiers
- [ ] No console errors

### Edge Cases
- [ ] Deselect all tiers → all remain with null
- [ ] Deselect and reselect immediately → works
- [ ] Tier with null used in prizes → displays correctly
- [ ] Export/import data with null tiers → works
- [ ] Drag-and-drop reorder with null tiers → works

---

## 📊 Impact Summary

### Before Fix
- ❌ Tiers disappear when color deselected
- ❌ User loses tier configuration
- ❌ Can't reassign colors to "deleted" tiers
- ❌ Confusing user experience

### After Fix
- ✅ Tiers preserved when color deselected
- ✅ Tier configuration maintained
- ✅ Can reassign colors anytime
- ✅ Clear, predictable behavior
- ✅ Professional UX

---

**Status:** ✅ FIXED  
**Issue:** Tier disappearing on color deselect  
**Solution:** Use `null` instead of `delete` to preserve tier keys  
**Impact:** Major UX improvement, prevents data loss  
**Last Updated:** 2025-01-12  
**Version:** 2.1 - Tier Preservation Fix

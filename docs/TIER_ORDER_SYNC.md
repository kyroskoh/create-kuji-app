# Tier Order Synchronization Across Pages

## Overview

The custom tier order configured in Settings now propagates to all pages that display tiers, including:
- **Prize Pool Manager** (Stock page)
- **Draw Screen**

This ensures a consistent user experience where the tier arrangement set in Settings is reflected everywhere.

---

## How It Works

### Settings Page (Tier Configuration)
Users with **Advanced** or **Pro** subscription plans can:
1. Drag and drop tier chips to reorder them
2. The custom order is saved in `settings.tierColors` object
3. JavaScript object key insertion order is preserved

### Prize Pool Manager (Stock Page)
The tier order from Settings is now applied to:
1. **Tier totals chips** (top right summary: `S:10 | A:5 | B:3`)
2. **Prize table rows** (prizes are grouped and sorted by tier)

### Draw Screen
The tier order from Settings is now applied to:
1. **Stock snapshot** (displays `S:10 | A:5 | B:3` in custom order)
2. **Tier counts** in draw results (summary of drawn prizes by tier)

---

## Technical Implementation

### 1. New Utility Functions

Added to `src/utils/tierColors.js`:

#### `getTierOrder(tierColors, allowCustomOrder)`
Returns the tier order based on settings and subscription plan.

```javascript
export function getTierOrder(tierColors, allowCustomOrder = false) {
  if (!tierColors || typeof tierColors !== 'object') {
    return DEFAULT_TIER_SEQUENCE;
  }
  
  const tierKeys = Object.keys(tierColors);
  
  if (allowCustomOrder && tierKeys.length > 0) {
    // Use insertion order from tierColors (for Advanced/Pro plans)
    return tierKeys;
  }
  
  // Alphabetical sorting (for Free/Basic plans or default)
  return tierKeys.sort(compareTierLabels);
}
```

#### `sortTierEntries(entries, tierColors, allowCustomOrder)`
Sorts an array of `[tier, value]` entries based on the tier order.

```javascript
export function sortTierEntries(entries, tierColors, allowCustomOrder = false) {
  const tierOrder = getTierOrder(tierColors, allowCustomOrder);
  const tierIndexMap = new Map(tierOrder.map((tier, index) => [tier.toUpperCase(), index]));
  
  return entries.sort(([tierA], [tierB]) => {
    const upperA = tierA.toUpperCase();
    const upperB = tierB.toUpperCase();
    
    const indexA = tierIndexMap.has(upperA) ? tierIndexMap.get(upperA) : Number.MAX_SAFE_INTEGER;
    const indexB = tierIndexMap.has(upperB) ? tierIndexMap.get(upperB) : Number.MAX_SAFE_INTEGER;
    
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // Fallback to alphabetical if not in the tier order
    return compareTierLabels(tierA, tierB);
  });
}
```

---

### 2. Prize Pool Manager Updates

**File:** `src/components/Manage/PrizePoolManager.jsx`

#### Changes:
1. Added state for `subscriptionPlan`
2. Load subscription plan from settings
3. Use `sortTierEntries` for tier totals
4. Sort prize table rows by tier order while preserving edit indices

#### Tier Totals (Line 68-77)
```javascript
const tierTotals = useMemo(() => {
  const totals = prizes.reduce((acc, prize) => {
    const tier = String(prize.tier || "?").trim().toUpperCase();
    acc[tier] = (acc[tier] || 0) + (Number(prize.quantity) || 0);
    return acc;
  }, {});
  // Sort tiers using custom order from settings if allowed
  const allowCustomOrder = isTierSortingAllowed(subscriptionPlan);
  return sortTierEntries(Object.entries(totals), tierColors, allowCustomOrder);
}, [prizes, tierColors, subscriptionPlan]);
```

#### Sorted Prize Table (Line 79-96)
```javascript
const sortedPrizesWithIndices = useMemo(() => {
  const tierOrder = tierTotals.map(([tier]) => tier);
  const tierIndexMap = new Map(tierOrder.map((tier, index) => [tier, index]));
  
  return prizes
    .map((prize, originalIndex) => ({ prize, originalIndex }))
    .sort((a, b) => {
      const tierA = String(a.prize.tier || "?").trim().toUpperCase();
      const tierB = String(b.prize.tier || "?").trim().toUpperCase();
      
      const indexA = tierIndexMap.has(tierA) ? tierIndexMap.get(tierA) : Number.MAX_SAFE_INTEGER;
      const indexB = tierIndexMap.has(tierB) ? tierIndexMap.get(tierB) : Number.MAX_SAFE_INTEGER;
      
      return indexA - indexB;
    });
}, [prizes, tierTotals]);
```

The table iterates over `sortedPrizesWithIndices` but uses `originalIndex` for all edit operations, ensuring that edits and deletions work correctly despite the visual reordering.

---

### 3. Draw Screen Updates

**File:** `src/components/Draw/DrawScreen.jsx`

#### Changes:
1. Import `sortTierEntries` and `isTierSortingAllowed`
2. Update stock snapshot to use custom tier order
3. Update tier counts to use custom tier order

#### Stock Snapshot (Line 102-116)
```javascript
const stockSnapshot = useMemo(() => {
  const grouped = prizes.reduce((acc, prize) => {
    if (!prize.tier) return acc;
    const tier = String(prize.tier).toUpperCase();
    acc[tier] = (acc[tier] || 0) + (Number(prize.quantity) || 0);
    return acc;
  }, {});
  // Sort tiers using custom order from settings if allowed
  const allowCustomOrder = isTierSortingAllowed(sessionSettings.subscriptionPlan || "free");
  const sortedEntries = sortTierEntries(Object.entries(grouped), sessionSettings.tierColors || {}, allowCustomOrder);
  return sortedEntries
    .map(([tier, qty]) => `${tier}:${qty}`)
    .join(" | ");
}, [prizes, sessionSettings.tierColors, sessionSettings.subscriptionPlan]);
```

#### Tier Counts (Line 239-247)
```javascript
const tierCounts = useMemo(() => {
  const counts = processedResults.reduce((acc, item) => {
    const tier = String(item.prize.tier || "?").toUpperCase();
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});
  // Sort tiers using custom order from settings if allowed
  const allowCustomOrder = isTierSortingAllowed(sessionSettings.subscriptionPlan || "free");
  return sortTierEntries(Object.entries(counts), sessionSettings.tierColors || {}, allowCustomOrder);
}, [processedResults, sessionSettings.tierColors, sessionSettings.subscriptionPlan]);
```

---

## Behavior by Subscription Plan

### Free & Basic Plans
- Tiers are **always alphabetically sorted**
- Cannot drag-and-drop to reorder in Settings
- All pages show tiers in alphabetical order

### Advanced & Pro Plans
- Tiers follow **custom drag-and-drop order** from Settings
- Can reorder tiers in Settings page
- Custom order is reflected in:
  - Prize Pool Manager tier totals
  - Prize Pool Manager table rows
  - Draw Screen stock snapshot
  - Draw Screen tier counts

---

## User Experience

### Before
- User drags tiers in Settings: `A → S → B`
- Prize Pool Manager still shows: `S | A | B` (alphabetical)
- Draw Screen still shows: `S:10 | A:5 | B:3` (alphabetical)
- **Inconsistent!** ❌

### After
- User drags tiers in Settings: `A → S → B`
- Prize Pool Manager now shows: `A | S | B` (custom order)
- Draw Screen now shows: `A:10 | S:5 | B:3` (custom order)
- **Consistent!** ✅

---

## Testing Checklist

### ✅ Settings Page
- [ ] Drag tiers to custom order (Pro plan)
- [ ] Verify order persists after save
- [ ] Verify order persists after page refresh

### ✅ Prize Pool Manager
- [ ] Tier totals chips display in custom order
- [ ] Prize table rows are grouped and sorted by custom tier order
- [ ] Editing prizes still works correctly
- [ ] Deleting prizes still works correctly

### ✅ Draw Screen
- [ ] Stock snapshot displays tiers in custom order
- [ ] After drawing, tier counts display in custom order
- [ ] Draw functionality still works correctly

### ✅ Plan Switching
- [ ] Switch to Free/Basic plan
- [ ] Verify tiers revert to alphabetical order everywhere
- [ ] Switch back to Pro plan
- [ ] Verify custom order is restored everywhere

---

## Files Modified

1. **`src/utils/tierColors.js`**
   - Added `getTierOrder()` function
   - Added `sortTierEntries()` function

2. **`src/components/Manage/PrizePoolManager.jsx`**
   - Added `subscriptionPlan` state
   - Updated `tierTotals` to use `sortTierEntries`
   - Added `sortedPrizesWithIndices` for table sorting
   - Updated table to iterate over sorted prizes

3. **`src/components/Draw/DrawScreen.jsx`**
   - Added imports for `sortTierEntries` and `isTierSortingAllowed`
   - Updated `stockSnapshot` to use `sortTierEntries`
   - Updated `tierCounts` to use `sortTierEntries`

---

## Summary

The tier order configured in Settings now propagates consistently across all pages. This provides a unified user experience where the visual arrangement of tiers matches the user's custom configuration, making it easier to manage and understand prize distribution at a glance.

For **Pro** and **Advanced** plans, custom tier ordering provides flexibility in how prizes are organized and displayed throughout the application. For **Free** and **Basic** plans, the traditional alphabetical sorting is maintained.

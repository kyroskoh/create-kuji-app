# Tier Management Features

## Overview
This document describes the tier name length limitations and tier sorting/arrangement features that are restricted based on subscription plans.

## Feature Summary

### Tier Name Length Limits

Different subscription plans allow different maximum character lengths for tier names:

| Plan | Max Tier Name Length | Example Tier Names |
|------|---------------------|-------------------|
| **Free** | 1 character | S, A, B, C, D |
| **Basic** | 1 character | S, A, B, C, D |
| **Advanced** | 2 characters | SS, S+, SR, UR, EX |
| **Pro** | 3 characters | SSR, UR+, EX+, LR+ |

### Tier Sorting/Arrangement

| Plan | Tier Sorting Enabled | Description |
|------|---------------------|-------------|
| **Free** | ❌ No | Fixed alphabetical ordering |
| **Basic** | ❌ No | Fixed alphabetical ordering |
| **Advanced** | ✅ Yes | Drag and drop to reorder tiers |
| **Pro** | ✅ Yes | Drag and drop to reorder tiers |

---

## Implementation Details

### 1. Subscription Plan Configuration

**File:** `src/utils/subscriptionPlans.js`

Each plan now includes:
```javascript
{
  maxTierNameLength: 1,  // Max characters for tier names
  tierSorting: false,    // Whether sorting is allowed
  features: {
    tierSorting: false   // Feature flag for UI display
  }
}
```

### 2. Helper Functions

**New Functions Added:**

#### `getMaxTierNameLength(planId)`
Returns the maximum tier name length for a given plan.
```javascript
const maxLength = getMaxTierNameLength('advanced'); // Returns 2
```

#### `isTierSortingAllowed(planId)`
Checks if tier sorting is enabled for a plan.
```javascript
const canSort = isTierSortingAllowed('pro'); // Returns true
```

#### `validateTierName(tierName, planId)`
Validates a tier name based on plan limits.
```javascript
const result = validateTierName('SSR', 'free');
// Returns: { valid: false, error: 'Tier name must be 1 character or less...' }

const result = validateTierName('SSR', 'pro');
// Returns: { valid: true, value: 'SSR' }
```

**Validation Rules:**
- Tier name cannot be empty
- Must be within the plan's character limit
- Can only contain letters and numbers (A-Z, 0-9)
- Automatically converted to uppercase

---

## User Interface Features

### Tier Name Input

**Location:** Settings > Tier Color Palette

#### Visual Elements:
1. **Character Limit Indicator**
   ```
   Add tier label (1 char max)
   Add tier label (2 chars max)
   Add tier label (3 chars max)
   ```

2. **Dynamic Placeholder**
   - Free/Basic: "S"
   - Advanced: "SS"
   - Pro: "SSR"

3. **maxLength Attribute**
   - Input field enforces character limit at HTML level
   - Cannot type more than allowed characters

4. **Error Messages**
   - Red border on input when validation fails
   - Error message displayed below input
   - Clear error on user input change

**Example Error Messages:**
```
"Tier name cannot be empty"
"Tier name must be 1 character or less (Your plan: Free)"
"Tier name can only contain letters and numbers"
"Tier "S" already exists"
```

### Tier Sorting UI

**Location:** Settings > Tier Color Palette

#### For Advanced & Pro Plans:

**Visual Indicators:**
1. **"Drag to reorder" Badge**
   ```
   ↕ Drag to reorder
   ```
   Displayed in emerald green in the top-right of tier section

2. **Drag Icon on Tier Chips**
   - Each tier chip shows a vertical arrows icon
   - Indicates the tier is draggable

3. **Cursor Changes**
   - `cursor-move` on hover over tier chips
   - Visual feedback that items can be moved

4. **Drag State**
   - Dragged tier becomes semi-transparent (50% opacity)
   - Clear visual indication of what's being moved

#### For Free & Basic Plans:

- No drag icons shown
- No "Drag to reorder" message
- Tiers displayed in fixed order (compareTierLabels sorting)
- Standard cursor on hover

---

## Drag and Drop Implementation

### How It Works

1. **Drag Start**
   ```javascript
   onDragStart={() => tierSortingAllowed && setDraggedTier(index)}
   ```
   - Stores the index of the dragged tier

2. **Drag Over**
   ```javascript
   onDragOver={(e) => {
     if (!tierSortingAllowed) return;
     e.preventDefault();
   }}
   ```
   - Prevents default behavior to allow drop
   - Only active if sorting is allowed

3. **Drop**
   ```javascript
   onDrop={(e) => {
     // Reorder the tier list
     const newList = [...tierList];
     const draggedItem = newList[draggedTier];
     newList.splice(draggedTier, 1);
     newList.splice(index, 0, draggedItem);
     
     // Update tier colors maintaining the new order
     const reorderedColors = {};
     newList.forEach(t => {
       reorderedColors[t] = tierColors[t];
     });
     updateSettings({ tierColors: reorderedColors });
   }}
   ```
   - Removes tier from old position
   - Inserts tier at new position
   - Updates settings with new order

4. **Drag End**
   ```javascript
   onDragEnd={() => setDraggedTier(null)}
   ```
   - Clears drag state

### Order Persistence

- Tier order is stored in the `tierColors` object key order
- When settings are saved, the order persists
- Reloading the page maintains the custom order
- Export/import preserves custom tier order

---

## User Experience Flow

### Creating a Tier (Free Plan)

```
1. User types "SS" in tier input
2. Input field prevents 2nd character (maxLength=1)
3. User types "S"
4. Clicks "Add tier"
5. Tier "S" created successfully
```

### Creating a Tier (Advanced Plan)

```
1. User types "SSR" in tier input
2. Input field allows "SS" but prevents "R" (maxLength=2)
3. User clicks "Add tier"
4. Tier "SS" created successfully
5. User sees tier appear in the list
```

### Trying to Exceed Limits

```
1. Free plan user tries to add "SR"
2. Input field only shows "S" (truncated by maxLength)
3. If they try to paste "SR", only "S" is accepted
4. Validation ensures only 1 character
```

### Reordering Tiers (Advanced Plan)

```
1. User sees "↕ Drag to reorder" indicator
2. Tiers show drag icons
3. User drags "B" tier over "S" tier
4. Tiers reorder: B, S, A, C
5. Order is saved immediately
6. Order persists after page reload
```

### Attempting to Reorder (Free Plan)

```
1. No drag indicator shown
2. No drag icons on tiers
3. Tiers maintain fixed alphabetical order
4. Cannot drag or reorder
5. Upgrade prompt if user hovers (optional feature)
```

---

## Settings Display

### Tier Section Header

Shows comprehensive tier information:

**Free/Basic Plans:**
```
Tiers: 3 / 5 | Max name length: 1 char
```

**Advanced Plan:**
```
Tiers: 5 / 10 | Max name length: 2 chars     ↕ Drag to reorder
```

**Pro Plan:**
```
Tiers: 8 / unlimited | Max name length: 3 chars     ↕ Drag to reorder
```

---

## Subscription Plan Cards

Each plan card now displays:

**Feature Comparison:**
```
Tiers: 3 / 5 / 10 / Unlimited
Tier Name: 1 char / 1 char / 2 chars / 3 chars
Colors: 5 / 10 / 19 / All
```

**Feature List:**
```
✅ Tier Sorting/Arrangement (Advanced & Pro only)
✅ Scratch Cards
✅ Analytics
```

---

## Validation Examples

### Valid Tier Names

**Free/Basic (1 char):**
- ✅ "S", "A", "B", "C", "D", "E", "F"
- ✅ "1", "2", "3"

**Advanced (2 chars):**
- ✅ "SS", "S+", "SR", "UR", "EX"
- ✅ "A1", "B2", "C3"

**Pro (3 chars):**
- ✅ "SSR", "SSS", "UR+", "EX+"
- ✅ "LR1", "UR2"

### Invalid Tier Names

**Free/Basic:**
- ❌ "SS" - Too long (2 > 1)
- ❌ "SSR" - Too long (3 > 1)

**Advanced:**
- ❌ "SSR" - Too long (3 > 2)
- ❌ "URR+" - Too long (4 > 2)

**Pro:**
- ❌ "SSRR" - Too long (4 > 3)
- ❌ "ULTRA" - Too long (5 > 3)

**All Plans:**
- ❌ "" - Empty
- ❌ "S+" - Contains special character (not A-Z0-9)
- ❌ "s" - Lowercase (auto-converted to "S", so OK)
- ❌ "S-" - Contains dash
- ❌ "S " - Contains space

---

## Code References

### Files Modified:
1. `src/utils/subscriptionPlans.js` - Plan configuration and helpers
2. `src/components/Manage/Settings.jsx` - UI implementation
3. `src/components/Manage/SubscriptionPlan.jsx` - Plan display

### Key Components:
- Tier name validation input with error handling
- Drag-and-drop tier reordering
- Character limit enforcement
- Plan-based feature gating

---

## Testing Checklist

- [ ] Free plan enforces 1-character tier names
- [ ] Basic plan enforces 1-character tier names
- [ ] Advanced plan allows 2-character tier names
- [ ] Pro plan allows 3-character tier names
- [ ] Input field maxLength prevents excess typing
- [ ] Validation error messages display correctly
- [ ] Drag-and-drop works for Advanced plan
- [ ] Drag-and-drop works for Pro plan
- [ ] Drag-and-drop disabled for Free plan
- [ ] Drag-and-drop disabled for Basic plan
- [ ] Tier order persists after save
- [ ] Tier order persists after page reload
- [ ] Export/import preserves tier order
- [ ] Special characters are rejected
- [ ] Empty tier names are rejected
- [ ] Duplicate tier names are rejected
- [ ] Plan upgrade unlocks longer names
- [ ] Plan upgrade enables sorting
- [ ] Downgrade maintains existing tier names
- [ ] "Drag to reorder" indicator shows correctly

---

## Future Enhancements

1. **Touch Device Support**
   - Add touch event handlers for mobile drag-and-drop
   - Alternative reorder UI for touch devices (up/down buttons)

2. **Bulk Tier Operations**
   - Import tier list from CSV/JSON
   - Reorder multiple tiers at once
   - Copy tier configuration between sessions

3. **Tier Name Presets**
   - Common tier name templates
   - Game-specific tier naming conventions
   - Quick select from preset list

4. **Tier Dependencies**
   - Lock certain tiers in position
   - Enforce tier hierarchy rules
   - Prevent tier deletion if prizes exist

5. **Visual Enhancements**
   - Animated tier reordering
   - Preview mode showing tier order impact
   - Color-coded tier priority

6. **Analytics**
   - Track most common tier names by plan
   - Usage statistics for sorting feature
   - A/B test different tier name limits

---

## Support & Troubleshooting

### Common Issues

**Q: I can't type more than 1 character for my tier name**
- A: Check your subscription plan. Free and Basic plans limit tier names to 1 character. Upgrade to Advanced (2 chars) or Pro (3 chars) for longer names.

**Q: Why can't I drag my tiers to reorder them?**
- A: Tier sorting is only available on Advanced and Pro plans. Free and Basic plans use fixed alphabetical ordering.

**Q: My tier name has special characters, why is it rejected?**
- A: Tier names can only contain letters (A-Z) and numbers (0-9) to ensure compatibility across all features.

**Q: What happens to my 2-character tier names if I downgrade from Advanced to Basic?**
- A: Existing tier names are preserved, but you won't be able to create new tiers with more than 1 character until you upgrade again.

---

## Related Documentation

- [SUBSCRIPTION_PLANS.md](./SUBSCRIPTION_PLANS.md) - Complete plan features
- [SUBSCRIPTION_PLAN_UI_INTEGRATION.md](./SUBSCRIPTION_PLAN_UI_INTEGRATION.md) - UI integration details

# Subscription Plans Feature

## Overview
The subscription plans feature provides a tiered pricing system that limits access to features based on the user's subscription level. This document describes the implementation and features of each plan.

## Implementation Files

### Core Files
- **`src/utils/subscriptionPlans.js`** - Plan definitions and helper functions
- **`src/components/Manage/SubscriptionPlan.jsx`** - Plan selection UI component
- **`src/utils/colorPalette.js`** - Color palette with hex codes
- **`src/components/Manage/Settings.jsx`** - Updated to integrate plan restrictions

## Subscription Plans

### Free Plan
- **Price:** $0
- **Max Tiers:** 3
- **Available Colors:** 5 basic colors (Amber, Sky, Emerald, Purple, Rose)
- **Weight Modes:** Basic only
- **Features:**
  - ❌ Scratch Cards
  - ❌ Analytics
  - ✅ Export Data
  - ✅ Import Data
  - ❌ Custom Currency
  - ❌ Advanced Weights

### Basic Plan
- **Price:** $9/month
- **Max Tiers:** 5
- **Available Colors:** 10 colors
- **Weight Modes:** Basic & Advanced
- **Features:**
  - ✅ Scratch Cards
  - ❌ Analytics
  - ✅ Export Data
  - ✅ Import Data
  - ✅ Custom Currency
  - ✅ Advanced Weights
- **Badge:** "Popular"

### Advanced Plan
- **Price:** $19/month
- **Max Tiers:** 10
- **Available Colors:** 19 colors
- **Weight Modes:** Basic & Advanced
- **Features:**
  - ✅ Scratch Cards
  - ✅ Analytics
  - ✅ Export Data
  - ✅ Import Data
  - ✅ Custom Currency
  - ✅ Advanced Weights
- **Badge:** "Recommended"

### Pro Plan
- **Price:** $39/month
- **Max Tiers:** Unlimited
- **Available Colors:** All colors (30+)
- **Weight Modes:** Basic & Advanced
- **Features:**
  - ✅ Scratch Cards
  - ✅ Analytics
  - ✅ Export Data
  - ✅ Import Data
  - ✅ Custom Currency
  - ✅ Advanced Weights
  - ✅ Priority Support
  - ✅ Custom Branding
  - ✅ API Access
- **Badge:** "Best Value"

## Helper Functions

### `isColorAllowedForPlan(colorId, planId)`
Checks if a specific color is available for the given plan.

```javascript
const canUseAmber = isColorAllowedForPlan('amber', 'free'); // true
const canUseOrange = isColorAllowedForPlan('orange', 'free'); // false
```

### `canCreateTier(currentTierCount, planId)`
Checks if the user can create more tiers based on their plan limits.

```javascript
const canAdd = canCreateTier(3, 'free'); // false (limit reached)
const canAdd = canCreateTier(2, 'free'); // true (can add 1 more)
```

### `isWeightModeAllowedForPlan(weightMode, planId)`
Checks if a weight mode is available for the given plan.

```javascript
const canUseAdvanced = isWeightModeAllowedForPlan('advanced', 'free'); // false
const canUseAdvanced = isWeightModeAllowedForPlan('advanced', 'basic'); // true
```

### `isFeatureAvailable(feature, planId)`
Checks if a specific feature is available for the given plan.

```javascript
const hasAnalytics = isFeatureAvailable('analytics', 'advanced'); // true
const hasScratchCards = isFeatureAvailable('scratchCards', 'free'); // false
```

### `getAvailableColorsForPlan(colorPalette, planId)`
Returns the filtered color palette based on the plan.

```javascript
const colors = getAvailableColorsForPlan(COLOR_PALETTE, 'free');
// Returns array of 5 color objects
```

### `getAvailableWeightModesForPlan(weightModes, planId)`
Returns the available weight modes based on the plan.

```javascript
const modes = getAvailableWeightModesForPlan(WEIGHT_MODES, 'basic');
// Returns array of 2 weight mode objects
```

## UI Components

### SubscriptionPlan Component
Displays all available plans in a responsive grid with:
- Plan name and description
- Pricing information
- Feature comparison
- Tier, color, and weight mode limits
- Upgrade/downgrade buttons
- Visual badges for recommended plans

### Settings Integration
The Settings component now:
- Displays current plan at the top
- Shows locked features with 🔒 icon
- Disables unavailable weight modes
- Disables unavailable colors with reduced opacity
- Shows tier count limit
- Prevents tier creation beyond plan limits
- Updates UI dynamically when plan changes

## Color Palette Enhancement

All colors in the palette now include hex codes displayed in the UI:
```javascript
{
  id: "amber",
  label: "Amber",
  hex: "#fbbf24",  // NEW: Hex code for reference
  badgeClass: "...",
  inputClass: "...",
  chipClass: "...",
  swatchClass: "..."
}
```

## Future Enhancements

1. **Payment Integration** - Connect to payment processor (Stripe, PayPal)
2. **Trial Periods** - Add 14-day trial for paid plans
3. **Usage Tracking** - Monitor feature usage and tier/color count
4. **Plan Recommendations** - Suggest upgrade when limits are reached
5. **Custom Enterprise Plans** - Allow custom limits for enterprise customers
6. **Feature Gates** - Implement feature gates throughout the app for scratch cards, analytics, etc.
7. **Billing History** - Add billing and invoice management
8. **Plan Comparison Tool** - Side-by-side plan comparison modal

## Development Notes

- All plan restrictions are enforced in the Settings component
- Plan data is stored in localStorage as `subscriptionPlan` field
- Default plan is "free" for new users
- Plan changes are synced to backend if user is authenticated
- UI provides clear visual feedback for locked features
- Upgrade prompts are contextual and non-intrusive

## Testing Checklist

- [ ] Free plan limits tier creation to 3
- [ ] Free plan shows only 5 colors
- [ ] Free plan locks advanced weight mode
- [ ] Basic plan allows 5 tiers and 10 colors
- [ ] Advanced plan allows 10 tiers and 19 colors
- [ ] Pro plan shows unlimited tiers and all colors
- [ ] Plan changes persist across page reloads
- [ ] Locked features show 🔒 icon
- [ ] Upgrade prompts appear when limits reached
- [ ] Color hex codes display correctly
- [ ] Plan badges display appropriately

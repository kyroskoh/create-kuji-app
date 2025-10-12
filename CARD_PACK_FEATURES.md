# Card Pack Animation Features

## Overview
The card pack animation system allows users to customize the reveal experience for prize draws with a trading card pack style animation.

## Features Implemented

### 1. Share Link Mode Parameter ✅
**Location:** `DrawScreen.jsx` (line 482-493)

Share links can include a `?mode=` query parameter to control reveal mode:
- `?mode=instant` - All prizes revealed immediately
- `?mode=scratch` - Scratch card reveal mode (Pro feature)
- `?mode=trading` - Trading card pack animation (Beta feature)
- No parameter or `?mode=default` - Uses plan-based default

**Example:**
```
https://yoursite.com/username/fan/draw/abc123?mode=trading
```

### 2. FanDrawSession Mode Detection ✅
**Location:** `FanDrawSession.jsx` (lines 32-131)

The fan draw session page automatically:
- Reads the `mode` parameter from URL
- Validates feature availability based on subscription plan
- Falls back to plan defaults if mode is unavailable or not specified
- Remembers if a session was already revealed (localStorage + database)

### 3. Card Pack Customization Settings ✅
**Location:** `Settings.jsx` (lines 48-53, 940-1064)

Available customization options:

#### a) **Special Effects Tier Count**
- **Setting:** `cardPackEffectTierCount`
- **Default:** 3
- **Range:** 1-10 tiers
- **Description:** Number of top tiers that receive special particle effects and glow animations

#### b) **Pack Background Gradient**
- **Settings:** 
  - `cardPackColor` (start color) - Default: `#9333ea` (purple)
  - `cardPackColorEnd` (end color) - Default: `#4f46e5` (indigo)
  - `cardPackGradientType` - Default: `linear` (options: `linear`, `radial`, `conic`)
  - `cardPackGradientAngle` - Default: `135` (0-360 degrees, for linear gradients only)
- **Type:** Dual hex color codes with gradient blending
- **Features:**
  - Two color picker widgets (start & end colors)
  - Manual hex input for both colors
  - Gradient type selector:
    - **Linear:** Directional gradient with customizable angle (0-360°)
    - **Radial:** Circular gradient from center outward
    - **Conic:** Conical gradient rotating around center
  - Angle slider with quick-access buttons (0°, 45°, 90°, 135°, 180°)
  - Large live preview showing the exact gradient
  - Reset all button to restore defaults
- **Usage:** Applied to card pack wrapper and card backs when no custom image is used

#### c) **Custom Pack Design Image**
- **Setting:** `cardPackCustomImage`
- **Type:** Data URL (base64 encoded image)
- **Accepted formats:** PNG, JPG, JPEG, WebP
- **Max size:** 2MB
- **Recommended dimensions:** 400x600px
- **Features:**
  - File upload interface
  - Preview thumbnail
  - Remove button
- **Usage:** Replaces color gradient on pack wrapper and card backs

#### d) **Show Logo on Cards**
- **Setting:** `cardPackShowLogo`
- **Type:** Boolean
- **Plan Required:** Pro (Custom Branding)
- **Usage:** Displays brand logo on card backs and pack wrapper

### 4. CardPackAnimation Component Enhancements ✅
**Location:** `CardPackAnimation.jsx`

#### New Props:
```javascript
{
  tierOrder: [],                      // Array of tier names in priority order
  effectTierCount: 3,                 // Number of top tiers for special effects
  customPackColor: null,              // Start hex color for gradient
  customPackColorEnd: null,           // End hex color for gradient
  customPackGradientType: 'linear',  // Gradient type: 'linear', 'radial', 'conic'
  customPackGradientAngle: 135,      // Gradient angle (degrees, for linear only)
  customPackImage: null,              // Custom image URL for pack design
}
```

#### Special Effects for Top Tiers:
When a prize is in the top N tiers (based on `tierOrder` and `effectTierCount`):
- **Particle Effects:** 20 animated floating particles with random colors and positions
- **Glow Animation:** Pulsing radial gradient glow effect
- **Duration:** Continuous while card is flipped

Standard prizes get basic sparkle effect only.

#### Color Support:
The `getTierColor()` function supports:
- **Hex colors:** Direct usage (e.g., `#FF5733`)
- **Tailwind color names:** Mapped to hex values (e.g., `amber` → `#f59e0b`)
- **Default fallback:** `#6366f1` (blue)

Supported Tailwind colors:
- amber, sky, emerald, purple, rose, lime, teal, cyan, violet, fuchsia

#### Custom Image Support:
- Pack wrapper shows custom image instead of gradient
- Card backs display custom image with optional logo overlay
- Completion screen uses custom image
- Automatically falls back to color gradient if image not provided

### 5. Animation Stages

#### Stage 1: Pack Display
- Shows unopened card pack with glow effect
- Displays card count badge (e.g., ×5)
- Shows logo or default icon
- "Tap to Open" button
- Shimmer animation effect

#### Stage 2: Card Reveals
- One card at a time, sequential reveal
- Card back shows "?" with custom color/image
- Click/tap to flip card
- Front shows prize with tier color
- Top-tier prizes get special effects
- Progress counter (e.g., "Card 2 of 5")

#### Stage 3: Completion
- Shows pack again with "All Cards Revealed!" message
- Auto-closes after 1 second
- Triggers `onComplete` callback

### 6. Integration Points

#### DrawScreen.jsx
```javascript
<CardPackAnimation
  prizes={cardPackPrizes}
  tierColors={tierColors}
  tierOrder={Object.keys(tierColors)}
  effectTierCount={sessionSettings.cardPackEffectTierCount || 3}
  showLogo={sessionSettings.cardPackShowLogo && hasCustomBranding(...)}
  logoUrl={branding?.logoUrl}
  customPackColor={sessionSettings.cardPackColor}
  customPackColorEnd={sessionSettings.cardPackColorEnd}
  customPackGradientType={sessionSettings.cardPackGradientType}
  customPackGradientAngle={sessionSettings.cardPackGradientAngle}
  customPackImage={sessionSettings.cardPackCustomImage}
  onComplete={...}
  onSkip={...}
/>
```

#### FanDrawSession.jsx
```javascript
<CardPackAnimation
  prizes={prizeObjects}
  tierColors={tierColors}
  tierOrder={Object.keys(tierColors)}
  effectTierCount={settings.cardPackEffectTierCount || 3}
  showLogo={hasCustomBranding(...) && branding?.logoUrl}
  logoUrl={branding?.logoUrl}
  customPackColor={settings.cardPackColor}
  customPackColorEnd={settings.cardPackColorEnd}
  customPackGradientType={settings.cardPackGradientType}
  customPackGradientAngle={settings.cardPackGradientAngle}
  customPackImage={settings.cardPackCustomImage}
  onComplete={...}
  onSkip={...}
/>
```

## User Flow

### Admin Side (DrawScreen)
1. Configure card pack settings in Settings page
2. Start a draw session
3. Choose reveal mode when generating share link:
   - Select from: Default, Instant, Scratch, Trading Pack
4. Share link with fan

### Fan Side (FanDrawSession)
1. Fan opens share link
2. System checks URL `?mode=` parameter
3. System validates feature availability
4. If trading mode:
   - Shows pack opening animation
   - One-by-one card reveals
   - Special effects for top-tier prizes
5. Results displayed after animation

## Gradient Examples

### Linear Gradients
```css
/* Default (135°) - Diagonal top-right to bottom-left */
linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)

/* Horizontal (0°) - Left to right */
linear-gradient(0deg, #ff6b6b 0%, #feca57 100%)

/* Vertical (90°) - Bottom to top */
linear-gradient(90deg, #48dbfb 0%, #0abde3 100%)

/* Diagonal (45°) - Bottom-left to top-right */
linear-gradient(45deg, #1dd1a1 0%, #10ac84 100%)
```

### Radial Gradients
```css
/* Center spotlight effect */
radial-gradient(circle at center, #ff6348 0%, #2d3436 100%)

/* Vibrant burst */
radial-gradient(circle at center, #feca57 0%, #ee5a6f 100%)
```

### Conic Gradients
```css
/* Rainbow wheel effect */
conic-gradient(from 0deg at center, #9333ea 0%, #4f46e5 50%, #9333ea 100%)

/* Color cycling */
conic-gradient(from 0deg at center, #ff6b6b 0%, #feca57 50%, #ff6b6b 100%)
```

### Popular Color Combinations
1. **Sunset:** `#FF512F` → `#F09819` (Linear 45°)
2. **Ocean:** `#2E3192` → `#1BFFFF` (Linear 135°)
3. **Forest:** `#134E5E` → `#71B280` (Radial)
4. **Fire:** `#F00000` → `#DC281E` (Conic)
5. **Purple Haze:** `#9333ea` → `#4f46e5` (Linear 135°, default)
6. **Gold Rush:** `#FFD700` → `#FF8C00` (Linear 90°)
7. **Neon Dreams:** `#FF00FF` → `#00FFFF` (Conic)
8. **Midnight:** `#232526` → `#414345` (Linear 180°)

## CSS Animations

### Shimmer Effect
```css
@keyframes shimmer {
  0%, 100% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
}
```

### Particle Float Effect
```css
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateY(-100px) translateX(20px) scale(1.2);
    opacity: 0.5;
  }
}
```

### Glow Effect
```css
@keyframes glow {
  0%, 100% {
    opacity: 0.4;
    filter: blur(20px);
  }
  50% {
    opacity: 0.7;
    filter: blur(30px);
  }
}
```

## Subscription Plan Requirements

| Feature | Free | Pro | Beta |
|---------|------|-----|------|
| Trading Card Animation | ❌ | ❌ | ✅ |
| Scratch Cards | ❌ | ✅ | ✅ |
| Custom Logo on Cards | ❌ | ✅ | ✅ |
| Custom Pack Image | ❌ | ✅ | ✅ |
| Custom Pack Color | ✅ | ✅ | ✅ |
| Special Effects Config | ✅ | ✅ | ✅ |

## Technical Notes

### Image Upload
- Files converted to base64 data URLs
- Stored in localStorage/database
- Max size: 2MB
- Validation for file type and size
- Automatic cleanup on remove

### Performance
- Particle effects limited to 20 per card
- Animations use CSS transforms (GPU accelerated)
- Images lazy-loaded
- Skip button available for users who want instant reveal

### Browser Compatibility
- Modern browsers with CSS3 support required
- Uses `backdrop-filter` for blur effects
- Fallback gradients if custom images fail to load

## Future Enhancements
- [ ] Multiple pack designs to choose from
- [ ] Animated pack opening (peel effect)
- [ ] Sound effects for card flips
- [ ] Custom particle colors per tier
- [ ] Pack rarity variants (holo, foil, etc.)
- [ ] Batch reveal option (show all cards at once after opening)

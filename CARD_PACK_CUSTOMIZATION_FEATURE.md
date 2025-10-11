# Card Pack Animation Customization Feature

## Overview
The Card Pack Animation feature provides a trading card pack style reveal experience for prize draws, complete with extensive customization options for Pro plan users. This feature includes pack peeling animations, card flipping reveals, and special effects for top-tier prizes.

**Feature Status:** ✅ Implemented (Beta)
**Last Updated:** 2025-10-11
**Plan Requirement:** Pro/Beta plan for animation; Pro plan for full customization

---

## Core Features

### 1. **Pack Animation Flow**
The animation consists of three stages:
- **Pack Stage**: Shows the sealed card pack with pack count badge
- **Peeling Stage**: Pack peels away with 3D rotation effect (1.5s)
- **Revealing Stage**: Cards flip one by one to reveal prizes (staggered by 200ms)

### 2. **Special Effects System**
Top-tier prizes receive enhanced visual effects:
- Particle burst animations (12 particles in circular pattern)
- Glow pulse effect around card borders
- Animated "⭐ RARE" badge
- Pulsing decorative elements at card bottom
- Custom glow colors based on tier color

### 3. **Customization Options** (Pro Plan)

#### A. Special Effect Tier Count
- **Location**: Settings → Card Pack Animation → Customization
- **Default**: Top 3 tiers
- **Range**: 1-10 tiers
- **Description**: Configure how many top tiers (based on tier sorting order) receive special particle effects and glow
- **Field**: `cardPackEffectTierCount` (integer)

#### B. Logo Display
- **Location**: Settings → Card Pack Animation → Customization
- **Default**: Disabled
- **Requirements**: Pro plan with custom branding enabled
- **Description**: Displays your brand logo on:
  - Card pack wrapper (center circle)
  - Card backs (center circle with gradient background)
  - Peeling animation (spinning logo)
- **Field**: `cardPackShowLogo` (boolean)

#### C. Custom Pack Design
- **Location**: Settings → Card Pack Animation → Customization
- **Default**: Gradient background (purple to blue to indigo)
- **Requirements**: Pro plan with custom branding enabled
- **File Types**: PNG, JPG, WebP
- **Size Limit**: 2MB maximum
- **Recommended Dimensions**: 400x600px (portrait orientation)
- **Description**: Upload a custom image to replace the default gradient pack wrapper
- **Field**: `cardPackCustomImage` (data URL string)

---

## Technical Implementation

### Settings Schema
```javascript
{
  useCardPackAnimation: false,         // Toggle animation on/off (Pro/Beta)
  cardPackEffectTierCount: 3,          // Number of top tiers with effects
  cardPackShowLogo: false,             // Display logo on cards/pack
  cardPackCustomImage: null            // Custom pack design (data URL)
}
```

### Component Structure
```
DrawScreen.jsx
  └─> CardPackAnimation.jsx (if enabled)
        ├─> Pack Stage (with custom image or logo)
        ├─> Peeling Stage (with custom image or logo)
        └─> Revealing Stage
              └─> FlipCard.jsx (×N cards)
                    ├─> Card Back (with optional logo)
                    └─> Card Front (with tier badge and prize info)
```

### Props Flow
**DrawScreen → CardPackAnimation:**
- `prizes`: Array of prize objects from draw
- `tierColors`: Tier color configuration
- `tierOrder`: Array of tier keys in custom order
- `effectTierCount`: Number from settings (default 3)
- `showLogo`: Boolean (settings.cardPackShowLogo && hasBrandingAccess)
- `customPackImage`: Data URL from settings
- `logoUrl`: Branding context logo URL
- `onComplete`: Callback to show results

**CardPackAnimation → FlipCard:**
- `prize`: Individual prize object
- `tierColors`: Tier color configuration
- `delay`: Staggered delay for flip (index × 200ms + 500ms)
- `isTopTier`: Boolean (based on effectTierCount)
- `showLogo`: Pass-through from settings
- `logoUrl`: Pass-through from branding
- `onFlipComplete`: Callback to track reveal progress

### File Upload Handler
```javascript
handlePackImageUpload(event) {
  const file = event.target.files?.[0];
  
  // Validation
  - File type: PNG, JPG, WebP only
  - File size: Maximum 2MB
  
  // Conversion
  - Uses FileReader.readAsDataURL()
  - Stores as base64 data URL in settings
  - Synced to backend via syncUserData
}
```

---

## User Experience

### Animation Timeline
1. **0ms**: Pack appears with scale-in animation (500ms)
2. **1000ms**: Auto-trigger pack opening
3. **1500ms**: Pack peeling completes, revealing stage begins
4. **2000ms**: First card starts flipping
5. **2200ms**: Second card starts flipping
6. **2400ms**: Third card starts flipping
7. **(N × 200 + 2000)ms**: Last card starts flipping
8. **Complete**: "Continue" button appears after all cards revealed

### Visual Design
- **Pack Wrapper**: 320px × 384px rounded card with shadow
- **Card Size**: Full width responsive within grid
- **Grid Layout**: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- **Scrolling**: Reveals section scrolls if > 70vh height
- **Background**: Semi-transparent dark overlay (bg-slate-950/95)

### Particle Effects (Top Tiers)
- **Count**: 12 particles per card
- **Pattern**: Circular burst (360° spread)
- **Colors**: Gradient from tier color to gold
- **Duration**: 1 second burst animation
- **Trigger**: On card flip completion

---

## Settings UI

### Main Toggle Section
```
📦 Card Pack Animation [BETA]
├─ Description text
├─ Enable/Disable toggle switch
└─ Features list (4 checkmarks)
```

### Customization Section (when enabled)
```
Customization:
├─ Special Effects for Top Tiers
│   ├─ Number input (1-10)
│   ├─ Helper text
│   └─ Description
│
├─ Show Logo on Cards (Pro only)
│   ├─ Label + description
│   └─ Toggle switch
│
└─ Custom Pack Design (Pro only)
    ├─ Label + description
    ├─ Upload button + Remove button
    ├─ Preview image (if uploaded)
    └─ File input (hidden)
```

### Upgrade Prompt (non-Pro users)
```
💎 Upgrade to Pro plan to unlock:
• Custom logo on card backs and packs
• Upload custom pack design images
• Full brand customization control
```

---

## CSS Animations

### Pack Stage Animations
```css
@keyframes float {
  0%, 100%: translateY(0px)
  50%: translateY(-10px)
  Duration: 3s infinite
}

@keyframes shine {
  0%: translate(-100%, -100%) rotate(45deg)
  100%: translate(100%, 100%) rotate(45deg)
  Duration: 3s infinite
}

@keyframes scale-in {
  0%: scale(0.8), opacity 0
  100%: scale(1), opacity 1
  Duration: 0.5s
}
```

### Peeling Animation
```css
@keyframes peel {
  0%: perspective(1000px) rotateX(0deg), opacity 1
  100%: perspective(1000px) rotateX(-90deg) translateY(-200px), opacity 0
  Duration: 1.2s
}
```

### Card Flip Animation
```css
@keyframes flip {
  Transform: rotateY(180deg)
  Duration: 600ms
  Preserve-3d: true
}
```

### Particle Burst Animation
```css
@keyframes particle-burst {
  0%: translate(-50%, -50%) translate(0, 0) scale(1), opacity 1
  100%: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(0), opacity 0
  Duration: 1s
}
```

---

## Plan Feature Matrix

| Feature | Free | Basic | Advanced | Pro |
|---------|------|-------|----------|-----|
| Card Pack Animation | ❌ | ❌ | ❌ | ✅ |
| Configurable Effect Tier Count | ❌ | ❌ | ❌ | ✅ |
| Logo on Cards/Pack | ❌ | ❌ | ❌ | ✅ |
| Custom Pack Design Upload | ❌ | ❌ | ❌ | ✅ |
| Default Gradient Pack | ✅ | ✅ | ✅ | ✅ |

---

## Integration Points

### Files Modified
1. **Settings.jsx**
   - Added toggle for card pack animation
   - Added customization controls (effect tier count, logo toggle, image upload)
   - Added file upload handler with validation
   - Added upgrade prompts for non-Pro users

2. **DrawScreen.jsx**
   - Added imports for CardPackAnimation and hasBetaAccess
   - Added state for `showCardPackAnimation` and `cardPackPrizes`
   - Modified draw result handling to conditionally trigger animation
   - Passes all customization settings to CardPackAnimation

3. **CardPackAnimation.jsx**
   - Added props for customization options
   - Modified pack rendering to use custom image or logo
   - Updated tier effect logic to use configurable count
   - Pass logo settings to FlipCard components

4. **FlipCard.jsx**
   - Added props for `showLogo` and `logoUrl`
   - Modified card back to optionally display logo
   - Maintained particle effects based on `isTopTier`

---

## Testing Checklist

### Basic Animation Flow
- [ ] Pack appears with scale-in animation
- [ ] Pack auto-opens after 1 second delay
- [ ] Pack peels away with 3D rotation
- [ ] Cards appear in staggered grid layout
- [ ] Cards flip one by one with delays
- [ ] "Continue" button appears after all cards revealed
- [ ] Clicking "Continue" shows results in main view

### Customization Options
- [ ] Effect tier count input accepts 1-10 range
- [ ] Effect tier count changes which cards show particles
- [ ] Logo toggle shows/hides logo on pack and cards
- [ ] Custom pack image upload validates file type (PNG/JPG/WebP)
- [ ] Custom pack image upload validates file size (max 2MB)
- [ ] Custom pack image displays in preview after upload
- [ ] Remove button clears custom pack image
- [ ] Settings persist across page refreshes
- [ ] Settings sync to backend for authenticated users

### Special Effects
- [ ] Top N tiers show particle burst on flip
- [ ] Top N tiers show glow pulse effect
- [ ] Top N tiers show "⭐ RARE" badge
- [ ] Top N tiers show pulsing decorative dots
- [ ] Particle colors match tier colors
- [ ] Glow colors match tier colors

### Plan Restrictions
- [ ] Animation toggle hidden for Free/Basic/Advanced plans
- [ ] Customization options hidden for non-Pro plans
- [ ] Upgrade prompts shown appropriately
- [ ] Logo features require Pro + custom branding enabled
- [ ] Settings disable gracefully if plan downgraded

### Edge Cases
- [ ] Single card pack works correctly
- [ ] Large pack counts (10+) scroll properly
- [ ] Custom image with incorrect dimensions still displays
- [ ] Missing logo URL doesn't break animation
- [ ] Invalid tier colors handled gracefully
- [ ] Empty tier order array doesn't crash

---

## Future Enhancements

### Potential Additions
1. **Audio Effects**
   - Pack opening sound
   - Card flip sound
   - Rare card reveal chime
   - Toggle in settings to enable/disable

2. **Animation Speed Control**
   - Adjustable flip delay (100ms, 200ms, 300ms)
   - Adjustable peel duration
   - "Skip" button to instantly reveal all

3. **Pack Themes**
   - Predefined pack designs (holographic, metallic, etc.)
   - Seasonal themes (holiday, event-specific)
   - Template gallery for easy selection

4. **Advanced Particle Options**
   - Configurable particle count
   - Different particle patterns (spiral, fountain, etc.)
   - Custom particle colors per tier

5. **Card Back Designs**
   - Multiple card back templates
   - Custom uploaded card back images
   - Animated card backs

6. **Rarity Animations**
   - Different animations for different tier levels
   - Screen shake for ultra-rare cards
   - Color wave effects

---

## Known Issues & Limitations

### Current Limitations
1. Pack image stored as data URL (base64) in settings
   - Increases settings payload size
   - Future: Consider separate file storage/CDN

2. Logo must be from branding context
   - Cannot use different logo specifically for cards
   - Future: Allow separate card logo upload

3. No animation preview in settings
   - Users must test on draw screen
   - Future: Add preview button in settings

4. Fixed animation timing
   - Cannot adjust without code changes
   - Future: Expose timing controls

### Browser Compatibility
- Requires CSS 3D transforms support
- Requires FileReader API (image upload)
- Tested on: Chrome, Firefox, Safari, Edge
- Mobile: Works on iOS Safari, Chrome Android

---

## Troubleshooting

### Animation Not Showing
1. Check user plan (requires Pro/Beta)
2. Verify `useCardPackAnimation` is true in settings
3. Check browser console for errors
4. Ensure prizes array is not empty

### Custom Image Not Displaying
1. Check file size (must be < 2MB)
2. Check file type (PNG, JPG, WebP only)
3. Verify image uploaded successfully (check preview)
4. Check browser console for FileReader errors

### Logo Not Showing
1. Verify Pro plan with custom branding
2. Check `cardPackShowLogo` is enabled
3. Ensure logo URL exists in branding context
4. Check image URL is valid and accessible

### Special Effects Missing
1. Verify `effectTierCount` is set correctly
2. Check tier order in settings
3. Ensure prize tiers match configured tiers
4. Verify `isTopTier` logic in component

---

## API Reference

### Settings Fields
```typescript
interface CardPackSettings {
  useCardPackAnimation: boolean;        // Enable/disable feature
  cardPackEffectTierCount: number;      // Top N tiers (1-10)
  cardPackShowLogo: boolean;            // Show logo on cards/pack
  cardPackCustomImage: string | null;   // Data URL or null
}
```

### Component Props
```typescript
interface CardPackAnimationProps {
  prizes: Prize[];                      // Array of prize objects
  tierColors: Record<string, string>;   // Tier color map
  tierOrder?: string[];                 // Custom tier order
  effectTierCount?: number;             // Top N for effects
  showLogo?: boolean;                   // Display logo flag
  customPackImage?: string | null;      // Custom pack image URL
  logoUrl?: string | null;              // Logo image URL
  onComplete: () => void;               // Completion callback
}

interface FlipCardProps {
  prize: Prize;                         // Prize data
  tierColors: Record<string, string>;   // Tier color map
  delay?: number;                       // Flip delay in ms
  isTopTier?: boolean;                  // Special effects flag
  showLogo?: boolean;                   // Display logo flag
  logoUrl?: string | null;              // Logo image URL
  onFlipComplete?: () => void;          // Flip callback
}
```

---

## Support & Feedback

For questions or issues with this feature:
1. Check this documentation thoroughly
2. Review testing checklist for edge cases
3. Check browser console for errors
4. Verify plan and feature access
5. Test in different browsers if issues persist

---

**Document Version:** 1.0
**Feature Version:** Beta
**Compatibility:** Vite 7.1.7, React 18+

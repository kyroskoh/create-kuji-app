# Card Pack Gradient Customization - Quick Guide

## 🎨 Overview
Create stunning visual effects for your card pack animations with dual-color gradients and multiple blending modes.

## ⚙️ Settings Location
Navigate to: **Settings Page → Trading Card Mode → Pack Background Gradient**

## 🎛️ Controls

### 1. Gradient Type Selector
Choose from three gradient styles:

| Type | Icon | Effect | Best For |
|------|------|--------|----------|
| **Linear** | 📐 | Directional color blend | Classic, sleek designs |
| **Radial** | ⭕ | Center-outward burst | Spotlight, dramatic reveal |
| **Conic** | 🌀 | Rotating color wheel | Dynamic, eye-catching |

### 2. Color Pickers

#### Start Color
- Default: `#9333ea` (Purple)
- Visual color picker widget
- Manual hex input field
- Example: `#FF512F`

#### End Color
- Default: `#4f46e5` (Indigo)
- Visual color picker widget
- Manual hex input field
- Example: `#F09819`

### 3. Angle Control (Linear Only)
- **Range:** 0° - 360°
- **Default:** 135°
- **Slider:** Smooth adjustment with 15° increments
- **Quick Buttons:**
  - 0° → (Right)
  - 45° ↗ (Top-right)
  - 90° ↑ (Top)
  - 135° ↖ (Top-left, default)
  - 180° ← (Left)

### 4. Live Preview
- Large preview box showing exact gradient
- Updates in real-time as you adjust settings
- See before you apply

### 5. Reset Button
Restore all settings to default purple gradient

## 📖 Examples

### Sunset Theme
```
Type: Linear
Angle: 45°
Start: #FF512F
End: #F09819
```

### Ocean Theme
```
Type: Linear
Angle: 135°
Start: #2E3192
End: #1BFFFF
```

### Spotlight Effect
```
Type: Radial
Start: #feca57
End: #ee5a6f
```

### Rainbow Wheel
```
Type: Conic
Start: #9333ea
End: #4f46e5
```

### Gold Rush
```
Type: Linear
Angle: 90°
Start: #FFD700
End: #FF8C00
```

### Neon Dreams
```
Type: Conic
Start: #FF00FF
End: #00FFFF
```

### Midnight
```
Type: Linear
Angle: 180°
Start: #232526
End: #414345
```

### Fire Burst
```
Type: Radial
Start: #F00000
End: #DC281E
```

## 💡 Pro Tips

### 1. Color Harmony
- Use complementary colors for vibrant contrast
- Use analogous colors for smooth, elegant blends
- Tools: Use online color palette generators

### 2. Angle Selection
- **0°-45°:** Modern, dynamic feel
- **90°:** Classic vertical gradient
- **135°:** Default, balanced diagonal
- **180°-270°:** Alternative perspectives

### 3. Gradient Type Selection
- **Linear:** Best for most use cases, clean and professional
- **Radial:** Use for special/rare card reveals to create impact
- **Conic:** Experimental, perfect for unique branding

### 4. Testing
- Always check the live preview before saving
- Consider how it looks with both light and dark content
- Test on different screen sizes if possible

## 🔧 Technical Details

### CSS Generated
```css
/* Linear */
background: linear-gradient(135deg, #9333ea 0%, #4f46e5 100%);

/* Radial */
background: radial-gradient(circle at center, #9333ea 0%, #4f46e5 100%);

/* Conic */
background: conic-gradient(from 0deg at center, #9333ea 0%, #4f46e5 50%, #9333ea 100%);
```

### Settings Stored
- `cardPackColor` - Start color
- `cardPackColorEnd` - End color
- `cardPackGradientType` - Gradient type
- `cardPackGradientAngle` - Angle (linear only)

### Where Applied
- Card pack wrapper (front and back)
- Card backs (when not flipped)
- Completion screen
- Only used when no custom image is uploaded

## 🎯 Common Use Cases

### Brand Matching
Match your pack colors to your brand identity:
1. Use your primary brand color as start
2. Use a complementary or darker shade as end
3. Choose linear at 135° for versatility

### Seasonal Themes
- **Spring:** `#56ab2f` → `#a8e063` (Green gradient)
- **Summer:** `#FF6B6B` → `#FFD93D` (Warm sunset)
- **Autumn:** `#E65C00` → `#F9D423` (Orange/gold)
- **Winter:** `#00C9FF` → `#92FE9D` (Cool ice)

### Rarity Indicators
Use different gradients for different pack rarities:
- **Common:** Gray tones (`#6c757d` → `#495057`)
- **Rare:** Purple (`#9333ea` → `#4f46e5`, default)
- **Epic:** Gold (`#FFD700` → `#FF8C00`)
- **Legendary:** Rainbow (Conic, multiple colors)

## 📱 Responsive Design
- Gradients automatically scale to container size
- Works on mobile, tablet, and desktop
- Maintains aspect ratio and quality

## 🚀 Performance
- CSS gradients are GPU-accelerated
- No additional image loading required
- Instant rendering
- Zero performance impact

## 🔒 Browser Support
- Modern browsers: Full support
- Fallback: Default purple gradient
- IE11: Basic gradient support (linear only)

## ❓ FAQ

**Q: Can I use more than 2 colors?**
A: Currently limited to 2 colors for simplicity. Custom images support unlimited colors.

**Q: Do gradients work with custom pack images?**
A: No, if you upload a custom pack image, it replaces the gradient.

**Q: Can fans see my custom gradient?**
A: Yes! The gradient is sent with the share link and applied to their view.

**Q: Does this work on all subscription plans?**
A: Yes, gradient customization is available on all plans including Free.

**Q: Can I save multiple gradient presets?**
A: Currently one gradient per account. You can switch anytime and it saves automatically.

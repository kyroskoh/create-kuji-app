# Custom Background Patterns & Images Guide

## Overview
This guide explains how custom **background patterns** and **background images** work in the custom branding system.

---

## 🎨 Background Customization Options

### 1. **Background Patterns**
Pre-defined CSS patterns that add visual texture to your pages.

**Available Patterns**:
- **None**: No pattern (default)
- **Dots**: Repeating circular dots
- **Grid**: Square grid lines
- **Diagonal Lines**: Diagonal striped pattern
- **Waves**: Wave-like radial patterns

**How to Configure**:
1. Go to `/{username}/manage/branding`
2. Scroll to "Background Pattern" section
3. Click on a pattern thumbnail to select it
4. Click "Save Branding"

**Technical Details**:
- Applied as: CSS `backgroundImage` property
- Pattern size: 20px x 20px (repeating)
- Saved in: LocalForage as CSS gradient string
- CSS Variable: `--brand-bg-pattern`

### 2. **Background Images**
Custom images that serve as the full-page background.

**Specifications**:
- **Max file size**: 500KB
- **Format**: Any image format (PNG, JPG, GIF, SVG, etc.)
- **Storage**: Converted to base64 data URI
- **Display**: Cover (fills entire page)
- **Position**: Center

**How to Configure**:
1. Go to `/{username}/manage/branding`
2. Click "Upload Image" in Background Image section
3. Select an image file (max 500KB)
4. Preview will show immediately
5. Click "Save Branding" to apply

**Technical Details**:
- Applied as: CSS `backgroundImage` property
- Saved in: LocalForage as base64 data URI
- CSS Variable: `--brand-bg-image`
- Can layer with patterns

---

## 🗺️ Where Backgrounds Are Applied

### **Stock Page** (`/{username}/stock`)
- ✅ Full-page background coverage
- ✅ Patterns tile across entire page
- ✅ Images cover entire viewport
- ✅ Semi-transparent overlay for readability

### **Draw Page** (`/{username}/draw`)
- ✅ Full-page background coverage
- ✅ Patterns tile across entire page
- ✅ Images cover entire viewport
- ✅ Semi-transparent overlay for readability

### **Branding Manager** (`/{username}/manage/branding`)
- ✅ Live preview section shows background
- ✅ Applied branding section reflects saved state

---

## 🔧 Technical Implementation

### Component: **BrandingWrapper**
**Location**: `src/components/Branding/BrandingWrapper.jsx`

**Purpose**: Wraps page content and applies custom backgrounds

**Features**:
1. **Smart Background Detection**
   - Only applies backgrounds when branding is enabled
   - Gracefully handles missing background data
   
2. **Pattern + Image Layering**
   - If only pattern: Shows pattern
   - If only image: Shows image
   - If both: Layers image over pattern

3. **Readability Overlay**
   - Adds semi-transparent dark overlay
   - Includes backdrop blur for better text contrast
   - Only appears when custom background exists

4. **Z-index Management**
   - Background: base layer
   - Overlay: middle layer (non-interactive)
   - Content: top layer (z-10)

**Usage Example**:
```jsx
import BrandingWrapper from '../components/Branding/BrandingWrapper';

function MyPage() {
  return (
    <BrandingWrapper className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Your page content */}
      </div>
    </BrandingWrapper>
  );
}
```

---

## 📊 Background Styles Logic

### Pattern Only
```css
backgroundImage: radial-gradient(circle, #ffffff08 1px, transparent 1px)
backgroundSize: 20px 20px
backgroundPosition: 0 0
backgroundRepeat: repeat
```

### Image Only
```css
backgroundImage: var(--brand-bg-image)
backgroundSize: cover
backgroundPosition: center
backgroundRepeat: no-repeat
```

### Pattern + Image (Layered)
```css
backgroundImage: var(--brand-bg-image), radial-gradient(...)
backgroundSize: cover
backgroundPosition: center
backgroundRepeat: no-repeat
```

---

## 🎯 CSS Custom Properties

### `--brand-bg-pattern`
**Set by**: BrandingContext when pattern is configured
**Value**: CSS gradient string
**Example**: `radial-gradient(circle, #ffffff08 1px, transparent 1px)`

### `--brand-bg-image`
**Set by**: BrandingContext when image is uploaded
**Value**: `url(data:image/png;base64,...)`
**Example**: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...)`

---

## 🔄 Data Flow

```
User selects pattern/uploads image
         ↓
  BrandingManager.jsx
         ↓
  Form state updated (immediate preview)
         ↓
  User clicks "Save Branding"
         ↓
  updateBranding(formData)
         ↓
  BrandingContext.jsx
         ↓
  Saves to LocalForage
         ↓
  Sets CSS custom properties
         ↓
  BrandingWrapper component
         ↓
  Reads branding.backgroundPattern
  Reads branding.backgroundImage
         ↓
  Applies inline styles to wrapper div
         ↓
  Background visible on page
```

---

## 🎨 Visual Examples

### With Dots Pattern
```
┌─────────────────────────────────────┐
│ · · · · · · · · · · · · · · · · · │
│  · · · · · · · · · · · · · · · ·  │
│ · · · · [Page Content] · · · · · · │
│  · · · · · · · · · · · · · · · ·  │
│ · · · · · · · · · · · · · · · · · │
└─────────────────────────────────────┘
```

### With Grid Pattern
```
┌─────────────────────────────────────┐
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
│ │ │ │ [Page Content] │ │ │ │ │ │ │
├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤
│ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │ │
└─────────────────────────────────────┘
```

### With Background Image + Overlay
```
┌─────────────────────────────────────┐
│ [[ BACKGROUND IMAGE WITH OVERLAY ]] │
│                                     │
│      [Readable Page Content]       │
│  (Text appears clear due to         │
│   dark overlay + backdrop blur)    │
│                                     │
└─────────────────────────────────────┘
```

---

## 🛠️ Customization Tips

### For Best Readability
1. **Use subtle patterns**: High-contrast patterns can be distracting
2. **Choose appropriate images**: Avoid busy images with lots of detail
3. **Test text contrast**: Ensure text is readable over your background
4. **Consider mobile**: Backgrounds should work on all screen sizes

### For Professional Look
1. **Match brand colors**: Choose backgrounds that complement your color scheme
2. **Keep it simple**: Less is often more with backgrounds
3. **Test on dark mode**: Ensure backgrounds work with dark UI elements
4. **Use consistent style**: Stick to either patterns OR images, not both

### Performance Tips
1. **Optimize images**: Use compressed images (max 500KB already enforced)
2. **Use appropriate formats**: 
   - JPG for photos
   - PNG for graphics with transparency
   - SVG for logos/icons (if possible)
3. **Consider patterns first**: CSS patterns are more performant than large images

---

## 🐛 Troubleshooting

### Background not showing after save?
1. **Check browser console** for errors:
   - Look for "🎨 Branding Context" logs
   - Check if CSS custom properties are set
   
2. **Verify route**:
   - Backgrounds only apply on `/draw` and `/stock` pages
   - Won't appear on management pages (by design)

3. **Check branding is enabled**:
   - Only Pro plan has custom branding access
   - BrandingContext must detect the correct route

### Background image looks distorted?
- Image uses `background-size: cover` by default
- This maintains aspect ratio but may crop edges
- Choose images with centered subject matter

### Background pattern too strong?
- Patterns use semi-transparent white (#ffffff08)
- Overlay adds additional darkening for readability
- Consider using "None" if patterns are distracting

### File size too large?
- Maximum 500KB enforced for performance
- Compress images before uploading:
  - Use tools like TinyPNG, ImageOptim, or Squoosh
  - Reduce dimensions if original is very large
  - Adjust quality settings

---

## 📝 File Specifications

### Background Pattern
- **Data Type**: String (CSS gradient)
- **Storage Size**: ~100-200 bytes
- **LocalForage Key**: `create::branding` → `backgroundPattern`
- **Example Value**: `radial-gradient(circle, #ffffff08 1px, transparent 1px)`

### Background Image  
- **Data Type**: String (base64 data URI)
- **Max File Size**: 500KB original → ~666KB base64
- **LocalForage Key**: `create::branding` → `backgroundImage`
- **Example Value**: `data:image/png;base64,iVBORw0KGgoAAAA...`

---

## ✅ Testing Checklist

### For Users
1. **Test Pattern Selection**
   - [ ] Select each pattern option
   - [ ] Verify preview updates immediately
   - [ ] Save and check on draw page
   - [ ] Save and check on stock page

2. **Test Image Upload**
   - [ ] Upload image < 500KB (should succeed)
   - [ ] Try uploading image > 500KB (should show error)
   - [ ] Verify image appears in preview
   - [ ] Save and check on draw page
   - [ ] Save and check on stock page

3. **Test Pattern + Image Combination**
   - [ ] Select a pattern
   - [ ] Upload an image
   - [ ] Verify both appear in preview
   - [ ] Save and check layering on pages

4. **Test Removal**
   - [ ] Remove background image (click X button)
   - [ ] Select "None" pattern
   - [ ] Save and verify clean background

### For Developers
```bash
# Check CSS custom properties in console
getComputedStyle(document.documentElement).getPropertyValue('--brand-bg-pattern')
getComputedStyle(document.documentElement).getPropertyValue('--brand-bg-image')

# Check branding data in LocalForage
# Open Application tab → LocalForage → create-kuji → caris_kuji_store
# Look for key: create::branding
# Verify backgroundPattern and backgroundImage fields
```

---

## 🚀 Future Enhancements

Potential improvements for background customization:

1. **More Pattern Options**
   - Hexagon patterns
   - Triangular patterns
   - Custom CSS pattern generator

2. **Image Adjustments**
   - Brightness/contrast controls
   - Blur amount adjustment
   - Opacity control

3. **Gradient Backgrounds**
   - Custom gradient builder
   - Multiple gradient stops
   - Directional control

4. **Animation Options**
   - Animated patterns (for beta users)
   - Parallax scrolling effects
   - Fade-in effects

---

## 📋 Summary

### What Works Now ✅
- ✅ Background patterns display on draw/stock pages
- ✅ Background images display on draw/stock pages
- ✅ Pattern + Image layering supported
- ✅ Readability overlay for better text contrast
- ✅ Immediate preview in BrandingManager
- ✅ 500KB file size limit enforced
- ✅ Base64 storage for offline support

### What's Saved
- Background pattern CSS string
- Background image as base64 data URI
- Both stored in LocalForage
- Synced to backend database (if online)

### Where It Appears
- Draw page: Full background
- Stock page: Full background
- Branding manager: Preview only

---

## 🎉 Conclusion

Custom background patterns and images are now **fully functional** across your draw and stock pages! Users with Pro plans can upload custom backgrounds or select from pre-defined patterns to match their brand identity.

The implementation includes:
- Smart layering (pattern + image)
- Automatic readability overlay
- Performance optimizations
- Graceful fallbacks
- Responsive design
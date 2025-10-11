# 🎨 Branded QR Code Feature

## Overview
Pro plan users with custom branding enabled can now generate QR codes that include their uploaded logo embedded directly in the center of the QR code. This creates a professional, branded experience for sharing draw sessions with fans.

## Features

### ✨ Automatic Logo Embedding
- **Smart Detection**: Automatically detects if user has Pro plan with custom branding
- **Logo Integration**: Embeds the user's uploaded logo in the center of QR codes
- **Fallback Support**: Falls back to standard QR code if logo fails to load
- **Brand Colors**: Uses the user's primary brand color for QR code foreground

### 🎯 Technical Implementation

#### QR Code Generation Function
```javascript
generateQRCodeWithLogo(url, logoDataUrl, brandColors)
```

**Features:**
- Canvas-based rendering for high-quality output
- 400x400px QR code size (optimized for scanning)
- High error correction level ('H') to support logo embedding
- Logo sized at 20% of QR code dimensions
- White circular background behind logo for contrast
- Rounded corners on logo for professional appearance

#### Visual Indicators
1. **"Branded" Badge**: Purple-to-blue gradient badge shows when QR has logo
2. **Enhanced Description**: Text indicates Pro feature status
3. **Dropdown Menu Badge**: Shows "Branded" label in share menu
4. **Shadow Enhancement**: Extra shadow on branded QR codes

### 📱 User Experience

#### For Pro Users with Logo
1. Click "Draw & Share Link" button
2. QR code automatically generates with embedded logo
3. Badge displays "Branded" indicator
4. Message shows: "Branded QR code with your logo - Pro feature! 🎉"

#### For Standard Users
1. Click "Draw & Share Link" button
2. Standard QR code generates (with brand color if available)
3. Standard message: "Fan can scan this to access their prizes"

### 🔧 Integration Points

#### Modified Files
- `src/components/Draw/DrawScreen.jsx`: Main implementation
  - Added `generateQRCodeWithLogo()` helper function
  - Updated `handleGenerateQRCode()` to check for logo
  - Updated auto-generate on draw completion
  - Added visual indicators throughout UI

#### Dependencies
- `qrcode` npm package (already in use)
- Canvas API for logo embedding
- `hasCustomBranding()` from subscription plans utility
- `useBranding()` hook from BrandingContext

### 🎨 Logo Requirements

**Recommended:**
- Square or near-square aspect ratio
- High contrast against white background
- Max file size: 500KB (enforced in BrandingManager)
- Supported formats: PNG, JPG, GIF, WebP

**Technical:**
- Logo is rendered at 80px × 80px in final QR code
- 8px white padding circle around logo
- Rounded corners with 8px radius
- Centered position in QR code

### 🚀 Benefits

#### For Business Owners
- **Brand Recognition**: Logo visible on every shared QR code
- **Professional Appearance**: Polished, branded materials
- **Marketing Value**: Free branding on all fan interactions
- **Trust Building**: Fans recognize official QR codes

#### For Fans
- **Visual Confirmation**: Easily identify official QR codes
- **Trust**: Logo provides authenticity verification
- **Better UX**: More engaging than plain QR codes

### 📊 Subscription Plan Integration

**Free Plan:**
- Standard QR codes with default colors
- No logo embedding
- Full functionality otherwise

**Pro Plan:**
- Branded QR codes with logo (when logo uploaded)
- Custom colors for QR codes
- Visual "Branded" indicators
- All standard features

### 🛠️ Troubleshooting

#### Logo Not Appearing
1. Verify Pro plan subscription active
2. Check logo is uploaded in Branding Manager
3. Check browser console for errors
4. Verify logo file size < 500KB

#### QR Code Quality
- Uses high error correction (Level H: ~30% recovery)
- Safe logo size (20%) ensures scanability
- White background provides contrast
- 400x400px provides good resolution

#### Fallback Behavior
- If logo fails to load: generates standard QR code
- If branding disabled: uses default colors
- Always maintains functionality

### 🎯 Future Enhancements

Potential improvements:
- Custom logo size selection
- Logo border color customization  
- Alternative logo shapes (circle, hexagon)
- Downloadable branded QR code templates
- Bulk QR code generation with logo

### 📝 Code Example

```javascript
// Generate branded QR code
const shareUrl = "https://app.com/fan/draw/123";
const logoUrl = branding.logoUrl; // From branding context
const colors = { primaryColor: branding.primaryColor };

const qrDataUrl = await generateQRCodeWithLogo(
  shareUrl, 
  logoUrl, 
  colors
);

// Result: Data URL of QR code with embedded logo
```

### ✅ Testing Checklist

- [ ] QR code generates with logo for Pro users
- [ ] QR code generates without logo for Free users
- [ ] QR code scans successfully with embedded logo
- [ ] Fallback works if logo fails to load
- [ ] Brand colors apply to QR code
- [ ] "Branded" badges display correctly
- [ ] Download functionality works with logo
- [ ] Responsive on mobile devices
- [ ] Works in all modern browsers

---

## Summary

This feature enhances the professional appearance of shared draw sessions for Pro plan users by automatically embedding their brand logo into QR codes, creating a cohesive branded experience from draw creation to fan engagement.

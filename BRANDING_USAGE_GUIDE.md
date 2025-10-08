# Custom Branding Usage Guide

## Where Branding Elements Are Reflected

This document explains where each custom branding element appears in the application after being saved in the BrandingManager.

---

## 🎨 Branding Elements Overview

### 1. **Company Name** (`companyName`)
**Saved in**: BrandingManager → LocalForage
**Displayed in**:
- ✅ Stock Page (`/{username}/stock`) - Header section
- ✅ Draw Page (`/{username}/draw`) - Header section via DrawScreen component
- ✅ BrandingManager Preview (live preview & applied branding sections)

**Visual**:
```
┌─────────────────────────────────────┐
│     [Company Logo if uploaded]     │
│                                     │
│         COMPANY NAME HERE          │
│         Your Event Name            │
└─────────────────────────────────────┘
```

### 2. **Event Name** (`eventName`)
**Saved in**: BrandingManager → LocalForage
**Displayed in**:
- ✅ Stock Page (`/{username}/stock`) - Below company name in header
- ✅ Draw Page (`/{username}/draw`) - Below company name in header
- ✅ BrandingManager Preview

**Visual**: Appears as a subtitle under the company name in a lighter color

### 3. **Logo** (`logoUrl`)
**Saved in**: BrandingManager → LocalForage (as base64 data URI)
**Displayed in**:
- ✅ Stock Page (`/{username}/stock`) - Top of header section
- ✅ Draw Page (`/{username}/draw`) - Top of header section
- ✅ BrandingManager Preview

**Specifications**:
- Max file size: 500KB
- Format: Any image format (converted to base64)
- Display height: 80px (auto width)
- Position: Centered at top of branded pages

### 4. **Primary Color** (`primaryColor`)
**Saved in**: BrandingManager → LocalForage
**Applied as**: CSS Custom Property `--brand-primary`
**Used in**:
- ✅ All buttons styled with `var(--brand-primary)`
- ✅ Interactive elements using primary branding color
- ✅ Stock page refresh button
- ✅ Draw page action buttons

### 5. **Secondary Color** (`secondaryColor`)
**Saved in**: BrandingManager → LocalForage
**Applied as**: CSS Custom Property `--brand-secondary`
**Used in**:
- ✅ Secondary UI elements
- ✅ Hover states
- ✅ Alternative accent colors

### 6. **Accent Color** (`accentColor`)
**Saved in**: BrandingManager → LocalForage
**Applied as**: CSS Custom Property `--brand-accent`
**Used in**:
- ✅ Accent buttons
- ✅ Highlights
- ✅ Special UI elements

### 7. **Font Family** (`fontFamily`)
**Saved in**: BrandingManager → LocalForage
**Applied as**: CSS Custom Property `--brand-font-family`
**Used in**:
- ✅ Company name text
- ✅ Event name text
- ✅ Footer text
- Google Font auto-loaded if selected font is not 'Inter'

**Available Fonts**:
- Inter (default)
- Roboto
- Open Sans
- Lato
- Montserrat
- Poppins
- Raleway
- Nunito
- Playfair Display
- Merriweather

### 8. **Background Pattern** (`backgroundPattern`)
**Saved in**: BrandingManager → LocalForage
**Applied as**: CSS Custom Property `--brand-bg-pattern`
**Used in**:
- ⚠️ **Currently only in BrandingManager preview**
- Can be integrated into draw/stock pages by using the CSS variable

**Available Patterns**:
- None
- Dots
- Grid
- Diagonal Lines
- Waves

### 9. **Background Image** (`backgroundImage`)
**Saved in**: BrandingManager → LocalForage (as base64 data URI)
**Applied as**: CSS Custom Property `--brand-bg-image`
**Used in**:
- ⚠️ **Currently only in BrandingManager preview**
- Can be integrated into draw/stock pages by using the CSS variable

**Specifications**:
- Max file size: 500KB
- Format: Any image format (converted to base64)

### 10. **Footer Text** (`footerText`)
**Saved in**: BrandingManager → LocalForage
**Displayed in**:
- ✅ Stock Page (`/{username}/stock`) - Bottom section
- ✅ Draw Page (`/{username}/draw`) - Bottom section
- ✅ BrandingManager Preview

**Visual**:
```
┌─────────────────────────────────────┐
│    [Main page content above]       │
│  ─────────────────────────────────  │
│                                     │
│      Your custom footer text       │
│      Contact: info@example.com     │
└─────────────────────────────────────┘
```

---

## 🗺️ Component Structure

### Branding Components Created

#### **BrandingHeader.jsx**
**Location**: `src/components/Branding/BrandingHeader.jsx`
**Purpose**: Displays logo, company name, and event name
**Used in**:
- Stock.jsx page
- DrawScreen.jsx component

**Features**:
- Only renders if branding is enabled and has content
- Gracefully handles missing elements
- Uses CSS custom properties for font family
- Responsive design with centered layout

#### **BrandingFooter.jsx**
**Location**: `src/components/Branding/BrandingFooter.jsx`
**Purpose**: Displays footer text
**Used in**:
- Stock.jsx page
- DrawScreen.jsx component

**Features**:
- Only renders if branding is enabled and footer text exists
- Uses CSS custom properties for font family
- Centered layout with subtle border separator

---

## 📍 Pages Where Branding Appears

### 1. **Stock Page** (`/{username}/stock`)
**File**: `src/pages/Stock.jsx`
**Branding Elements**:
- ✅ Company Logo (if uploaded)
- ✅ Company Name
- ✅ Event Name
- ✅ Footer Text
- ✅ CSS Colors (via custom properties)
- ✅ Custom Font Family

**Layout**:
```
┌─────────────────────────────────────┐
│     [BrandingHeader Component]     │
│  ─ Logo, Company Name, Event Name ─ │
│                                     │
│    {username}'s Kuji Stock          │
│    View available prizes...         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Prize Stock Statistics    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Prize Tiers List       │   │
│  └─────────────────────────────┘   │
│                                     │
│   [Refresh Stock Data Button]      │
│                                     │
│  ─────────────────────────────────  │
│     [BrandingFooter Component]     │
│        Footer text here            │
└─────────────────────────────────────┘
```

### 2. **Draw Page** (`/{username}/draw`)
**File**: `src/components/Draw/DrawScreen.jsx`
**Branding Elements**:
- ✅ Company Logo (if uploaded)
- ✅ Company Name
- ✅ Event Name
- ✅ Footer Text
- ✅ CSS Colors (via custom properties)
- ✅ Custom Font Family

**Layout**:
```
┌─────────────────────────────────────┐
│     [BrandingHeader Component]     │
│  ─ Logo, Company Name, Event Name ─ │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Pricing Presets & Draw    │   │
│  │   Count Selection           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   Fan Info & Session #      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │     Draw Results Grid       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│     [BrandingFooter Component]     │
│        Footer text here            │
└─────────────────────────────────────┘
```

### 3. **Branding Management Page** (`/{username}/manage/branding`)
**File**: `src/components/Manage/BrandingManager.jsx`
**Branding Elements**:
- ✅ All elements in live preview (form data)
- ✅ Applied branding preview (CSS custom properties)

---

## 🔄 How Branding Data Flows

```
User Configures Branding
         ↓
  BrandingManager.jsx
         ↓
    Save Button Clicked
         ↓
   updateBranding(formData)
         ↓
  BrandingContext.jsx
         ↓
  useLocalStorageDAO → LocalForage
         ↓
  Sync Service (if online)
         ↓
    Backend Database
         ↓
  BrandingContext applies CSS vars
         ↓
  Components consume via:
  - useBranding() hook
  - CSS custom properties
         ↓
  UI Updates Instantly
```

---

## 🎯 Routes Where Branding is Applied

Branding CSS custom properties are applied on these routes:
- ✅ `/{username}/draw` - Draw page
- ✅ `/{username}/stock` - Stock page
- ✅ `/{username}/manage/branding` - Branding management (for live preview)

Branding is **NOT** applied on:
- ❌ `/{username}/manage/prizes` - Prize management
- ❌ `/{username}/manage/pricing` - Pricing management
- ❌ `/{username}/manage/settings` - Settings page
- ❌ `/` - Home page
- ❌ `/login` - Login page

This is by design to keep management interfaces clean and branding visible only on public-facing pages.

---

## 🛠️ Developer Guide

### Using Branding in New Components

#### **Option 1: Use BrandingHeader/Footer Components**
```jsx
import BrandingHeader from '../components/Branding/BrandingHeader';
import BrandingFooter from '../components/Branding/BrandingFooter';

function MyPage() {
  return (
    <div>
      <BrandingHeader />
      {/* Your page content */}
      <BrandingFooter />
    </div>
  );
}
```

#### **Option 2: Access Branding Data Directly**
```jsx
import { useBranding } from '../contexts/BrandingContext';

function MyComponent() {
  const { branding, isEnabled } = useBranding();
  
  if (!isEnabled || !branding) return null;
  
  return (
    <div>
      <h1>{branding.companyName}</h1>
      <p>{branding.eventName}</p>
      {branding.logoUrl && <img src={branding.logoUrl} alt="Logo" />}
    </div>
  );
}
```

#### **Option 3: Use CSS Custom Properties**
```jsx
<button style={{ backgroundColor: 'var(--brand-primary)' }}>
  Click Me
</button>

<p style={{ fontFamily: 'var(--brand-font-family)' }}>
  Branded text
</p>
```

---

## ✅ Testing Checklist

### For Users
1. **Configure Branding**
   - Navigate to `/{username}/manage/branding`
   - Add company name, event name, logo
   - Select colors and fonts
   - Add footer text
   - Click "Save Branding"

2. **Verify on Stock Page**
   - Visit `/{username}/stock`
   - Confirm logo appears at top
   - Confirm company name and event name display
   - Confirm footer text appears at bottom
   - Check that colors match selections

3. **Verify on Draw Page**
   - Visit `/{username}/draw`
   - Confirm all branding elements appear
   - Test that fonts are applied
   - Verify colors are correct

### For Developers
```bash
# Check branding is saved
# Open browser console at /{username}/manage/branding
# Look for: "🎨 Branding saved and CSS should be updated"

# Check CSS custom properties
getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')
getComputedStyle(document.documentElement).getPropertyValue('--brand-secondary')
getComputedStyle(document.documentElement).getPropertyValue('--brand-accent')
getComputedStyle(document.documentElement).getPropertyValue('--brand-font-family')

# Check branding context
# Look for: "🎨 Branding Context - Route Check"
# Look for: "🎨 Applying custom branding"
```

---

## 📝 Summary

### What's Working ✅
- Company name displays on draw/stock pages
- Event name displays on draw/stock pages
- Logo displays on draw/stock pages
- Footer text displays on draw/stock pages
- CSS colors applied globally via custom properties
- Font family applied to branding text
- Instant preview in branding manager
- Beta access integration with special features

### Future Enhancements 🚀
- Background patterns could be applied to draw/stock page containers
- Background images could be applied to draw/stock pages
- Additional branding customization options
- Animation preferences (beta feature)
- Typography enhancements (beta feature)

---

## 🎉 Conclusion

All custom branding elements are now properly integrated and reflected across the application's public-facing pages (draw and stock). Users with Pro plans can fully customize their brand identity, and the changes are immediately visible after saving.
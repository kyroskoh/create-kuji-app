# 📱 QR Code in History Panel Feature

## Overview
Added the ability to generate and display QR codes for any past draw session directly from the History Panel. This solves the problem of accidentally closing the share link modal and needing to regenerate QR codes for fans.

## Features

### ✨ **Key Capabilities**

1. **QR Button in History**
   - Purple "QR" button appears next to "Share" button for each entry
   - Generates QR code on-demand for any historical session
   - Works with both standard and branded QR codes

2. **QR Code Modal**
   - Displays session information (number and fan name)
   - Shows loading state while generating QR code
   - Displays "Branded" badge for Pro users with logos
   - Download button to save QR code as PNG
   - Responsive design for mobile/desktop

3. **Branded QR Support**
   - Automatically detects Pro plan with custom branding
   - Embeds logo if available (same as DrawScreen)
   - Uses custom brand colors
   - Falls back to standard QR code if needed

### 🎯 **User Flow**

#### Scenario: User Accidentally Closes Share Modal
1. User performs draw and closes share modal too quickly
2. User clicks "History" button to view past sessions
3. User finds the session they need
4. User clicks purple "QR" button
5. QR code generates with logo (if Pro plan)
6. User can download or share QR code with fan

### 📋 **UI Components**

#### History Entry Actions
- **Open** button (gray) - Opens session in new tab
- **🔗 Share** button (blue) - Copies share link to clipboard
- **QR** button (purple) - NEW! Shows QR code modal

#### QR Code Modal
```
┌─────────────────────────────────┐
│ QR Code              [X]        │
│ Session #5 - John Doe           │
├─────────────────────────────────┤
│                                 │
│  [Loading spinner if generating]│
│                                 │
│  OR                             │
│                                 │
│  ┌─────────────────────┐       │
│  │  Scan to View Prizes:       │
│  │  [Branded badge if Pro]     │
│  │                             │
│  │   [QR CODE IMAGE]           │
│  │   400x400px                 │
│  │                             │
│  │  Branded QR with logo 🎉    │
│  └─────────────────────┘       │
│                                 │
│  ✨ Share this QR code...       │
│  📱 They can scan it...         │
│                                 │
│  [Download] [Close]             │
└─────────────────────────────────┘
```

### 🔧 **Technical Implementation**

#### Modified File
`src/components/Draw/HistoryPanel.jsx`

#### Key Changes
1. **Imports Added**
   - `QRCode` from qrcode package
   - `hasCustomBranding` utility
   - `useBranding` hook
   - `useAuth` hook

2. **New State Variables**
   ```javascript
   const [qrModalEntry, setQrModalEntry] = useState(null);
   const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
   const [generatingQR, setGeneratingQR] = useState(false);
   ```

3. **New Functions**
   - `generateQRCodeWithLogo()` - Helper for logo embedding
   - `showQRCode(entry)` - Generates and displays QR code
   - `downloadQRCode()` - Downloads QR code as PNG
   - `closeQRModal()` - Closes the modal

4. **UI Additions**
   - Purple QR button in each history entry
   - Full QR code modal overlay
   - Loading state animation
   - Branded badge indicator
   - Download functionality

### 🎨 **Visual Design**

#### QR Button
- **Color**: Purple (`bg-purple-600`)
- **Icon**: QR code SVG icon
- **Size**: Small text (`text-xs`)
- **Hover**: Darker purple

#### Modal
- **Background**: Dark overlay (`bg-slate-950/90`)
- **Z-Index**: 60 (above history panel)
- **Size**: Max 448px wide, responsive
- **QR Display**: 256x256px in white container
- **Shadow**: 2xl shadow for depth

### 📊 **Plan Integration**

**Free Plan:**
- Standard QR codes with default colors
- Full functionality
- No logo embedding

**Pro Plan:**
- Branded QR codes with logo (when uploaded)
- Custom brand colors
- "Branded" badge indicator
- Professional appearance

### 🚀 **Benefits**

#### For Users
- **Recovery**: Can regenerate QR codes anytime
- **Convenience**: No need to redo draws
- **History**: Access any past session's QR code
- **Reliability**: Never lose access to share links

#### For Fans
- **Consistency**: Same QR code quality as original
- **Trust**: Branded QR codes for Pro users
- **Accessibility**: Easy scanning from any device

### 💡 **Use Cases**

1. **Accidental Close**: Closed share modal too fast
2. **Later Sharing**: Need to share session hours/days later
3. **Reprinting**: Need to reprint QR code for physical display
4. **Backup**: Generate QR code for record keeping
5. **Multiple Shares**: Share same session with multiple people

### 🔄 **User Journey Example**

```
User performs 10 draws throughout the day
  ↓
User accidentally closes share modal on draw #7
  ↓
Fan for draw #7 comes back asking for their link
  ↓
User clicks "History" button
  ↓
User searches for or scrolls to session #7
  ↓
User clicks purple "QR" button
  ↓
QR code generates (with logo if Pro)
  ↓
User shows phone to fan OR downloads QR code
  ↓
Fan scans and views their prizes ✨
```

### 🛠️ **Error Handling**

1. **Logo Fails to Load**
   - Falls back to standard QR code
   - No error shown to user
   - Continues gracefully

2. **QR Generation Fails**
   - Alert shown to user
   - Modal remains open
   - Can try again

3. **No Branding Data**
   - Uses default colors
   - Standard QR code generated
   - Full functionality maintained

### 📱 **Responsive Design**

- **Mobile**: Modal takes full screen with padding
- **Tablet**: Centered modal with max-width
- **Desktop**: Centered modal, optimal sizing
- **Button Layout**: Wraps on small screens

### ⚡ **Performance**

- **On-Demand Generation**: QR codes only generated when clicked
- **No Pre-Loading**: Doesn't slow down history panel
- **Fast Generation**: Canvas-based, completes in <500ms
- **Memory Efficient**: QR data cleared when modal closes

### 🎯 **Future Enhancements**

Potential improvements:
- Bulk QR code generation for multiple sessions
- Print-optimized QR code layout
- Email QR code directly to fan
- QR code with custom frames/borders
- Analytics on QR code scans

---

## Summary

This feature provides a safety net for users who accidentally close the share modal and need to regenerate QR codes later. It maintains consistency with the branded QR code feature for Pro users and offers a seamless experience for retrieving historical session QR codes at any time.

**Key Value**: Never lose the ability to share draw sessions with fans, even if the original share modal was closed!

# QR Code Generation Feature

## Overview
The draw share link feature now includes QR code generation, allowing organizers to easily share fan draw sessions through scannable QR codes.

## Features

### 1. Automatic QR Code Generation (Draw & Share Link)
When using the "Draw & Share Link" button:
- The system automatically generates a QR code for the share link
- QR code displays immediately in the share modal
- Fan name and session number are shown in the modal
- QR code is optimized for scanning (256x256px with appropriate margin)

### 2. Manual QR Code Generation (Regular Draws)
For regular draws with results visible:
- Click the "Share Link" button to open the share menu
- Click "Generate QR Code" to create a QR code
- The menu shows "QR Code Generated ✓" when ready
- QR code can be downloaded as PNG image

### 3. Download QR Code
Once a QR code is generated:
- Click "Download QR Code" from the share menu
- Saves as PNG file with naming format: `kuji-session-{sessionNumber}-{fanName}.png`
- Can be printed, shared via messaging apps, or displayed on screen

## Usage Scenarios

### Scenario 1: In-Person Event
1. Organizer clicks "Draw & Share Link"
2. QR code appears instantly
3. Fan scans QR code with their phone
4. Fan accesses their prizes via scratch cards

### Scenario 2: Remote Sharing
1. Organizer completes a draw
2. Generates QR code from share menu
3. Downloads QR code
4. Sends QR code image to fan via messaging app or email

### Scenario 3: Display at Booth
1. Generate QR codes for multiple sessions
2. Download and print QR codes
3. Display at event booth for fans to scan

## Technical Details

### Dependencies
- `qrcode` npm package (v1.x)
- React state management for QR code data URLs

### QR Code Configuration
```javascript
{
  width: 256,        // 256x256 pixels for clear scanning
  margin: 2,         // 2-module margin for better scanning
  color: {
    dark: '#1e293b', // Slate-800 for dark pixels
    light: '#ffffff' // White background
  }
}
```

### File Naming Convention
QR code images are named: `kuji-session-{sessionNumber}-{fanName}.png`
- Example: `kuji-session-5-Hana.png`
- Spaces in fan names are replaced with hyphens

## UI Components

### Share Modal (Draw & Share Link)
- Displays after "Draw & Share Link" button is clicked
- Shows QR code automatically
- Includes instructions for scanning
- Auto-copies share link to clipboard

### Share Menu Dropdown (Regular Draws)
- Accessible from "Share Link" button
- Contains 4 options:
  1. Copy Fan Link
  2. Generate QR Code
  3. Download QR Code (appears after generation)
  4. Preview Fan Page

## Benefits
1. **Faster sharing** - No need to type or copy URLs
2. **Mobile-friendly** - Fans can quickly scan with their phones
3. **Professional** - Clean QR codes for printed materials
4. **Versatile** - Works both digitally and in print
5. **Trackable** - Each session gets a unique QR code

## Future Enhancements
- Add branding/logo to QR code center
- Customize QR code colors based on tier or event branding
- Generate batch QR codes for multiple sessions
- Print-ready QR code sheets

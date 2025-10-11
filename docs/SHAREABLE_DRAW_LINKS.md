# Shareable Draw Session Links for Fans

## Overview

This feature allows event organizers to share a unique link with fans who participated in a draw session. Fans can access their personalized page to scratch and reveal their prizes using an interactive scratch card interface (available on paid plans).

## Features

### 🎯 For Event Organizers

1. **Easy Link Sharing**
   - Each draw session has a unique shareable link
   - Copy link with one click from History Panel or Draw History page
   - Link format: `/{username}/fan/draw/{entryId}`

2. **Automatic Scratch Card Mode**
   - Scratch cards enabled by default for Basic, Advanced, and Pro plans
   - Free plan users get instant reveal (no scratch card)
   - Based on subscription plan tier

3. **Consistent Branding**
   - Shared links use your custom branding (colors, fonts, logos)
   - Tier colors match your settings
   - Professional appearance for fans

### 🎉 For Fans

1. **Personalized Experience**
   - Welcome message with their name
   - Session number and queue information
   - Event details

2. **Interactive Scratch Cards** (Paid Plans)
   - Fun scratch-to-reveal experience
   - Scratch with mouse or touch
   - "Skip & Reveal All" option available
   - Visual progress indicator

3. **Prize Summary**
   - View all prizes after revealing
   - Tier breakdown with colored badges
   - Congratulations message

## How to Use

### Step 1: Generate a Draw Session

1. Go to Draw page (`/{username}/draw`)
2. Enter fan name and other details
3. Click "Start Draw" to generate prizes
4. Session is automatically saved to history

### Step 2: Share the Link

**Option A: From History Panel**
1. Click "History" button on Draw page
2. Find the session you want to share
3. Click "🔗 Share" button next to the session
4. Link is copied to clipboard
5. Send link to the fan via SMS, email, or messaging app

**Option B: From Draw History Page**
1. Click "Open" on a history entry
2. Click "Share Link" button at top-right
3. Link is copied to clipboard
4. Share with the fan

### Step 3: Fan Opens the Link

1. Fan receives link: `https://yourapp.com/username/fan/draw/abc123`
2. Fan opens link in browser (works on mobile/desktop)
3. Fan sees personalized welcome message
4. **If paid plan**: Fan scratches cards to reveal prizes
5. **If free plan**: Prizes are instantly revealed
6. Fan sees congratulations message and prize summary

## Subscription Plan Features

| Feature | Free | Basic | Advanced | Pro |
|---------|------|-------|----------|-----|
| Shareable Links | ✅ | ✅ | ✅ | ✅ |
| Scratch Card Mode | ❌ | ✅ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |
| Custom Tier Colors | ❌ | ❌ | ✅ | ✅ |

## Technical Details

### Routes

- `/:username/draw/history/:entryId` - Internal history view (authenticated)
- `/:username/fan/draw/:entryId` - Public fan-facing shareable link

### Files

- `src/pages/FanDrawSession.jsx` - Fan-facing scratch card experience
- `src/pages/DrawHistory.jsx` - Internal history view with share button
- `src/components/Draw/HistoryPanel.jsx` - History modal with share functionality
- `src/components/Draw/ScratchCard.jsx` - Interactive scratch card component

### Data Flow

1. Draw session created → Saved to localStorage with unique ID
2. Share button clicked → URL generated with entryId
3. Fan opens link → Loads data from localStorage using entryId
4. Scratch mode determined by subscription plan
5. Prizes revealed → Summary displayed

## Best Practices

### For Organizers

1. **Test Links Before Sharing**
   - Open the link yourself first
   - Verify all prizes are correct
   - Check branding appearance

2. **Timing**
   - Share link immediately after draw
   - Or schedule send for later reveal
   - Consider time zones for online events

3. **Communication**
   - Include event details in message
   - Provide collection instructions
   - Set expectations for prize pickup

### For Fans

1. **Mobile-Friendly**
   - Links work on any device
   - Scratch with finger on mobile
   - Responsive design

2. **Save Link**
   - Bookmark for reference
   - Take screenshot of results
   - Link remains active while in history

## Examples

### Sample Share Message

```
🎉 Hi Sarah! Your draw results are ready!

Click here to reveal your prizes:
https://myevent.com/organizer/fan/draw/abc123

Session #42 | Queue A15
Event: Summer Kuji 2025

Scratch each card to see what you won! 🪙
Collect your prizes at booth #3.
```

### URL Structure

```
Format: /{username}/fan/draw/{entryId}

Examples:
- https://app.com/kujimaster/fan/draw/550e8400-e29b-41d4-a716-446655440000
- https://app.com/eventshop/fan/draw/abc-def-ghi-123
```

## Troubleshooting

### Link Not Working

**Issue**: "Session Not Found" error
- **Cause**: History entry deleted or localStorage cleared
- **Solution**: Do not delete history before sharing links

**Issue**: Scratch cards not appearing
- **Cause**: Free plan doesn't include scratch cards
- **Solution**: Upgrade to Basic, Advanced, or Pro plan

### Incorrect Branding

**Issue**: Default colors instead of custom branding
- **Cause**: Branding not saved or applied
- **Solution**: Save branding in Settings → Branding

### Mobile Issues

**Issue**: Scratch not working on touch device
- **Cause**: Touch events not registered
- **Solution**: Try different browser or use "Skip & Reveal All" button

## Security Considerations

1. **Public Access**
   - Links are publicly accessible (no authentication required)
   - Anyone with link can view prizes
   - Consider this when sharing links

2. **Data Privacy**
   - Fan names are visible on page
   - Session numbers and queue info displayed
   - Only share links with intended recipients

3. **Link Validity**
   - Links remain valid as long as history exists
   - Deleting history invalidates links
   - No expiration date by default

## Future Enhancements

Planned features for future releases:

- [ ] Link expiration dates
- [ ] Password-protected sessions
- [ ] Email/SMS sharing integration
- [ ] QR code generation
- [ ] Social media share buttons
- [ ] Custom messages per session
- [ ] Prize collection tracking
- [ ] Multi-language support

## Support

For questions or issues:
- Check console for error messages
- Verify subscription plan features
- Contact support with session ID and error details

---

**Last Updated**: January 11, 2025
**Version**: 1.0.0

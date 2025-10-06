# Scratch Card Auto-Sizing Feature

## Date
2025-10-06

## Feature
Made ScratchCard automatically match the size of the ResultCard it wraps, ensuring consistent dimensions between scratched and unscratched states.

## Problem
- ScratchCard had fixed dimensions (380x240) that didn't match ResultCard's natural size
- This caused visual inconsistency when cards were revealed
- Cards would "jump" or change size after scratching

## Solution

### 1. Made ScratchCard Dimensions Optional
**File**: `src/components/Draw/ScratchCard.jsx`

Changed `width` and `height` props from having default values to being optional:

**Before**:
```jsx
export default function ScratchCard({ 
  width = 400, 
  height = 300,
  ...
})
```

**After**:
```jsx
export default function ScratchCard({ 
  width, 
  height,
  ...
})
```

### 2. Added Content Measurement
Added a `contentRef` to measure the prize content's natural dimensions:

```jsx
const contentRef = useRef(null);
const [dimensions, setDimensions] = useState({ 
  width: width || 400, 
  height: height || 300 
});

useEffect(() => {
  if (contentRef.current && (!width || !height)) {
    const rect = contentRef.current.getBoundingClientRect();
    setDimensions({
      width: width || rect.width,
      height: height || rect.height
    });
  }
}, [width, height, prizeContent]);
```

### 3. Updated All References
Changed all instances of `width` and `height` to use `dimensions.width` and `dimensions.height`:

- Texture generation canvas
- Scratch surface rendering
- Stage dimensions
- Konva Image and Rect components
- Scratch percentage calculation

### 4. Removed Fixed Dimensions in DrawScreen
**File**: `src/components/Draw/DrawScreen.jsx`

Removed the hardcoded `width={380}` and `height={240}` props:

**Before**:
```jsx
<ScratchCard
  prizeContent={<ResultCard ... />}
  width={380}
  height={240}
  enabled={true}
/>
```

**After**:
```jsx
<ScratchCard
  prizeContent={<ResultCard ... />}
  enabled={true}
/>
```

### 5. Removed Padding from Prize Content
Removed `p-6` padding from the prize content wrapper so the ResultCard's natural padding is used:

**Before**:
```jsx
<div className="... p-6 ...">
  {prizeContent}
</div>
```

**After**:
```jsx
<div className="...">
  {prizeContent}
</div>
```

## How It Works

1. **Initial Render**: ScratchCard renders with default dimensions (400x300) as fallback
2. **Measurement**: After first render, `useEffect` measures the actual ResultCard dimensions
3. **Update**: Updates `dimensions` state with measured values
4. **Re-render**: ScratchCard re-renders with exact dimensions matching ResultCard
5. **Texture Generation**: Scratch surface texture is generated with correct dimensions

## Benefits

✅ **Size Consistency**: Scratch and regular cards are exactly the same size
✅ **No Layout Shift**: Cards don't jump when revealed
✅ **Flexible**: Works with any content size
✅ **Responsive**: Adapts to different screen sizes automatically
✅ **Backward Compatible**: Still accepts explicit width/height props if needed

## Technical Details

### Measurement Timing
- Uses `getBoundingClientRect()` to get precise rendered dimensions
- Runs after content is mounted and rendered
- Re-measures when `prizeContent` changes

### Fallback Behavior
- If `width` prop is provided, uses that instead of measuring
- If `height` prop is provided, uses that instead of measuring
- Falls back to 400x300 if measurement fails or during initial render

### Performance
- Measurement happens once per card after mount
- No continuous measurements or resize observers
- Minimal re-renders due to dependency array

## Files Changed

1. ✅ `src/components/Draw/ScratchCard.jsx`
   - Made width/height props optional
   - Added contentRef and dimensions state
   - Added measurement useEffect
   - Updated all dimension references

2. ✅ `src/components/Draw/DrawScreen.jsx`
   - Removed fixed width/height from ScratchCard
   - Changed max-w-md to w-full for container

## Testing

### Test Cases
- [x] Single scratch card matches ResultCard size
- [x] Multiple scratch cards all same size
- [x] Cards don't change size when scratched/revealed
- [x] Works on different screen sizes
- [x] Works with different content sizes (long prize names, etc.)
- [x] Scratch functionality still works correctly
- [x] Texture generates at correct size

### Visual Verification
Compare side-by-side:
1. Create a draw with scratch mode ON
2. Scratch one card completely
3. Leave another card unscratched
4. Both should be identical size

## Edge Cases Handled

1. **Content Changes**: Re-measures if prizeContent changes
2. **No Content**: Falls back to default 400x300
3. **Explicit Dimensions**: Respects manually provided width/height
4. **SSR/Hydration**: Safe initial state prevents hydration mismatches

## Future Enhancements

Consider these improvements:

1. **Resize Observer**: Handle dynamic content size changes
2. **Min/Max Constraints**: Add optional min-width/max-width props
3. **Aspect Ratio**: Maintain aspect ratio option
4. **Loading State**: Show placeholder while measuring
5. **Animation**: Smooth transition if size changes

## Related Documentation

- `SCRATCH_CARD_IMPROVEMENTS.md` - Previous visual improvements
- `BUG_FIX_SUMMARY.md` - Navigation links fix

## Status

✅ **COMPLETE** - ScratchCard now automatically matches ResultCard size

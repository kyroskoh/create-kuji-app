import { COLOR_PALETTE } from "./colorPalette.js";
import colors from 'tailwindcss/colors.js';

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export const DEFAULT_TIER_SEQUENCE = ["S", ...LETTERS.filter((letter) => letter !== "S")];

// Tailwind CSS color palette with carefully selected vibrant shades
// Using 500 weight for most colors for optimal visibility and contrast
const TIER_COLOR_ASSIGNMENTS = {
  'S': colors.amber[500],    // Amber 500 - premium gold tier
  'A': colors.red[500],      // Red 500
  'B': colors.blue[500],     // Blue 500
  'C': colors.emerald[500],  // Emerald 500
  'D': colors.purple[500],   // Purple 500
  'E': colors.orange[500],   // Orange 500
  'F': colors.cyan[500],     // Cyan 500
  'G': colors.pink[500],     // Pink 500
  'H': colors.yellow[500],   // Yellow 500
  'I': colors.violet[500],   // Violet 500
  'J': colors.teal[500],     // Teal 500
  'K': colors.rose[500],     // Rose 500
  'L': colors.green[500],    // Green 500
  'M': colors.indigo[500],   // Indigo 500
  'N': colors.lime[500],     // Lime 500
  'O': colors.fuchsia[600],  // Fuchsia 600 (deeper for contrast)
  'P': colors.sky[500],      // Sky 500
  'Q': colors.slate[400],    // Slate 400 (lighter neutral)
  'R': colors.orange[400],   // Orange 400 (lighter variant)
  'T': colors.teal[400],     // Teal 400 (lighter variant)
  'U': colors.amber[400],    // Amber 400 (lighter gold)
  'V': colors.violet[400],   // Violet 400 (lighter)
  'W': colors.emerald[400],  // Emerald 400 (lighter)
  'X': colors.pink[400],     // Pink 400 (lighter)
  'Y': colors.blue[400],     // Blue 400 (lighter)
  'Z': colors.rose[400],     // Rose 400 (lighter)
};

// Tailwind color names mapping - automatically derived from Tailwind palette
const TIER_COLOR_NAMES = {
  [colors.amber[500]]: 'Amber',
  [colors.red[500]]: 'Red',
  [colors.blue[500]]: 'Blue',
  [colors.emerald[500]]: 'Emerald',
  [colors.purple[500]]: 'Purple',
  [colors.orange[500]]: 'Orange',
  [colors.cyan[500]]: 'Cyan',
  [colors.pink[500]]: 'Pink',
  [colors.yellow[500]]: 'Yellow',
  [colors.violet[500]]: 'Violet',
  [colors.teal[500]]: 'Teal',
  [colors.rose[500]]: 'Rose',
  [colors.green[500]]: 'Green',
  [colors.indigo[500]]: 'Indigo',
  [colors.lime[500]]: 'Lime',
  [colors.fuchsia[600]]: 'Fuchsia',
  [colors.sky[500]]: 'Sky',
  [colors.slate[400]]: 'Slate',
  [colors.orange[400]]: 'Orange Light',
  [colors.teal[400]]: 'Teal Light',
  [colors.amber[400]]: 'Gold',
  [colors.violet[400]]: 'Lavender',
  [colors.emerald[400]]: 'Mint',
  [colors.pink[400]]: 'Pink Light',
  [colors.blue[400]]: 'Azure',
  [colors.rose[400]]: 'Coral',
};

export const DEFAULT_TIER_COLOR_MAP = TIER_COLOR_ASSIGNMENTS;

// Get color name from hex code
export function getColorNameFromHex(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return null;
  return TIER_COLOR_NAMES[hexColor.toLowerCase()] || null;
}

const FALLBACK_PALETTE = COLOR_PALETTE[0];

const getPaletteById = (id) => {
  // Check if it's a custom hex color
  if (typeof id === 'string' && id.startsWith('#')) {
    // Create a dynamic palette for custom hex colors
    // Use minimal CSS classes - inline styles will handle colors
    return {
      id: id,
      label: 'Custom',
      hex: id,
      badgeClass: `border text-white`,
      inputClass: `border focus:ring-2`,
      chipClass: `border text-white`,
      swatchClass: ''
    };
  }
  
  return COLOR_PALETTE.find((palette) => palette.id === id) || FALLBACK_PALETTE;
};

const tierPriority = (tier) => {
  const upper = String(tier || "").trim().toUpperCase();
  const index = DEFAULT_TIER_SEQUENCE.indexOf(upper);
  if (index !== -1) {
    return index;
  }
  if (upper.length) {
    return DEFAULT_TIER_SEQUENCE.length + upper.charCodeAt(0);
  }
  return Number.MAX_SAFE_INTEGER;
};

export function compareTierLabels(a, b) {
  return tierPriority(a) - tierPriority(b);
}

const resolveColor = (tier, tierColors) => {
  const upper = String(tier || "").trim().toUpperCase();
  const paletteId = tierColors?.[upper] || DEFAULT_TIER_COLOR_MAP[upper];
  return getPaletteById(paletteId);
};

export function tierBadgeClass(tier, tierColors) {
  const palette = resolveColor(tier, tierColors);
  return `${palette.badgeClass} inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`;
}

export function tierInputClass(tier, tierColors) {
  const palette = resolveColor(tier, tierColors);
  return `${palette.inputClass} focus:outline-none focus:ring-2`;
}

export function tierChipClass(tier, tierColors) {
  const palette = resolveColor(tier, tierColors);
  return `${palette.chipClass} inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide`;
}

export function tierSwatchClass(colorId) {
  const palette = getPaletteById(colorId);
  
  // For custom hex colors, return an empty class since we'll use inline styles
  if (typeof colorId === 'string' && colorId.startsWith('#')) {
    return '';
  }
  
  return palette.swatchClass;
}

// Helper function to get inline style for custom colors
export function tierSwatchStyle(colorId) {
  if (typeof colorId === 'string' && colorId.startsWith('#')) {
    return { backgroundColor: colorId };
  }
  return {};
}

/**
 * Get the hex color value for a tier
 * @param {string} tier - The tier identifier
 * @param {Object} tierColors - The tierColors object from settings
 * @returns {string} Hex color value
 */
export function getTierColorHex(tier, tierColors) {
  const palette = resolveColor(tier, tierColors);
  return palette.hex;
}

/**
 * Get tier order based on settings and subscription plan
 * For Advanced/Pro plans with custom tier order: uses the order from tierColors object
 * For Free/Basic plans or no custom order: uses alphabetical sorting
 * 
 * @param {Object} tierColors - The tierColors object from settings
 * @param {boolean} allowCustomOrder - Whether custom tier ordering is allowed (based on subscription)
 * @returns {string[]} Array of tier keys in the correct order
 */
export function getTierOrder(tierColors, allowCustomOrder = false) {
  if (!tierColors || typeof tierColors !== 'object') {
    return DEFAULT_TIER_SEQUENCE;
  }
  
  const tierKeys = Object.keys(tierColors);
  
  if (allowCustomOrder && tierKeys.length > 0) {
    // Use insertion order from tierColors (for Advanced/Pro plans)
    return tierKeys;
  }
  
  // Alphabetical sorting (for Free/Basic plans or default)
  return tierKeys.sort(compareTierLabels);
}

/**
 * Sort tier entries (key-value pairs) based on tier order
 * Used for sorting tier totals, counts, etc.
 * 
 * @param {Array<[string, any]>} entries - Array of [tierKey, value] pairs
 * @param {Object} tierColors - The tierColors object from settings
 * @param {boolean} allowCustomOrder - Whether custom tier ordering is allowed
 * @returns {Array<[string, any]>} Sorted array of entries
 */
export function sortTierEntries(entries, tierColors, allowCustomOrder = false) {
  const tierOrder = getTierOrder(tierColors, allowCustomOrder);
  const tierIndexMap = new Map(tierOrder.map((tier, index) => [tier.toUpperCase(), index]));
  
  return entries.sort(([tierA], [tierB]) => {
    const upperA = tierA.toUpperCase();
    const upperB = tierB.toUpperCase();
    
    const indexA = tierIndexMap.has(upperA) ? tierIndexMap.get(upperA) : Number.MAX_SAFE_INTEGER;
    const indexB = tierIndexMap.has(upperB) ? tierIndexMap.get(upperB) : Number.MAX_SAFE_INTEGER;
    
    if (indexA !== indexB) {
      return indexA - indexB;
    }
    
    // Fallback to alphabetical if not in the tier order
    return compareTierLabels(tierA, tierB);
  });
}

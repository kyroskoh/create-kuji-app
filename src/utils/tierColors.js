import { COLOR_PALETTE } from "./colorPalette.js";

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export const DEFAULT_TIER_SEQUENCE = ["S", ...LETTERS.filter((letter) => letter !== "S")];

// Default tier color map: carefully curated colors with maximum contrast and visual distinction
// Colors are distributed across the hue spectrum to avoid repetition
// S tier gets the prestigious amber/gold color
const TIER_COLOR_ASSIGNMENTS = {
  'S': '#f59e0b',  // Amber/Gold - premium tier
  'A': '#ef4444',  // Red
  'B': '#3b82f6',  // Blue
  'C': '#10b981',  // Emerald Green
  'D': '#a855f7',  // Purple
  'E': '#f97316',  // Orange
  'F': '#06b6d4',  // Cyan
  'G': '#ec4899',  // Pink
  'H': '#eab308',  // Yellow
  'I': '#8b5cf6',  // Violet
  'J': '#14b8a6',  // Teal
  'K': '#f43f5e',  // Rose
  'L': '#22c55e',  // Green
  'M': '#6366f1',  // Indigo
  'N': '#84cc16',  // Lime
  'O': '#db2777',  // Fuchsia
  'P': '#0ea5e9',  // Sky
  'Q': '#94a3b8',  // Slate
  'R': '#fb923c',  // Peach
  'T': '#2dd4bf',  // Aqua
  'U': '#fbbf24',  // Gold
  'V': '#a78bfa',  // Lavender
  'W': '#34d399',  // Mint
  'X': '#f472b6',  // Magenta
  'Y': '#60a5fa',  // Azure
  'Z': '#fb7185',  // Coral
};

// Color names mapping for tier colors
const TIER_COLOR_NAMES = {
  '#f59e0b': 'Amber',
  '#ef4444': 'Red',
  '#3b82f6': 'Blue',
  '#10b981': 'Emerald',
  '#a855f7': 'Purple',
  '#f97316': 'Orange',
  '#06b6d4': 'Cyan',
  '#ec4899': 'Pink',
  '#eab308': 'Yellow',
  '#8b5cf6': 'Violet',
  '#14b8a6': 'Teal',
  '#f43f5e': 'Rose',
  '#22c55e': 'Green',
  '#6366f1': 'Indigo',
  '#84cc16': 'Lime',
  '#db2777': 'Fuchsia',
  '#0ea5e9': 'Sky',
  '#94a3b8': 'Slate',
  '#fb923c': 'Peach',
  '#2dd4bf': 'Aqua',
  '#fbbf24': 'Gold',
  '#a78bfa': 'Lavender',
  '#34d399': 'Mint',
  '#f472b6': 'Magenta',
  '#60a5fa': 'Azure',
  '#fb7185': 'Coral',
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

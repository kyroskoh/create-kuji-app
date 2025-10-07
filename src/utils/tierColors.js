import { COLOR_PALETTE } from "./colorPalette.js";

const LETTERS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
export const DEFAULT_TIER_SEQUENCE = ["S", ...LETTERS.filter((letter) => letter !== "S")];

export const DEFAULT_TIER_COLOR_MAP = DEFAULT_TIER_SEQUENCE.reduce((acc, tier, index) => {
  const palette = COLOR_PALETTE[index % COLOR_PALETTE.length];
  if (palette) {
    acc[tier] = palette.id;
  }
  return acc;
}, {});

const FALLBACK_PALETTE = COLOR_PALETTE[0];

const getPaletteById = (id) => COLOR_PALETTE.find((palette) => palette.id === id) || FALLBACK_PALETTE;

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
  return palette.swatchClass;
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

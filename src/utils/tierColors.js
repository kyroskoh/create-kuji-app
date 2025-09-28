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
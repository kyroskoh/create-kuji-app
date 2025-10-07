// Default tier color map matching frontend colorPalette
export const DEFAULT_TIER_COLOR_MAP = {
  S: 'amber',
  A: 'sky',
  B: 'emerald',
  C: 'purple',
  D: 'rose',
  E: 'lime',
  F: 'teal',
  G: 'cyan',
  H: 'violet',
  I: 'fuchsia',
  J: 'indigo',
  K: 'orange',
  L: 'yellow',
  M: 'green',
  N: 'blue',
  O: 'red',
  P: 'pink',
  Q: 'stone',
  R: 'slate',
  T: 'amber-dark',
  U: 'sky-dark',
  V: 'emerald-dark',
  W: 'purple-dark',
  X: 'rose-dark',
  Y: 'orange-dark',
  Z: 'blue-dark'
};

// Get default user settings for new users
export function getDefaultUserSettings() {
  return {
    sessionStatus: 'INACTIVE',
    stockPagePublished: true, // Default to public for free users
    lastReset: null,
    country: 'Malaysia',
    countryCode: 'MY',
    countryEmoji: '🇲🇾',
    currency: 'MYR',
    locale: 'ms-MY',
    tierColors: JSON.stringify(DEFAULT_TIER_COLOR_MAP),
    nextSessionNumber: 1,
    weightMode: 'basic'
  };
}

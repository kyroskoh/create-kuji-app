// User subscription plans with feature limits
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: "$0",
    maxTiers: 3,
    maxTierNameLength: 1,
    maxColors: 1,
    tierColorLimit: 1,
    tierSorting: false,
    allowedColors: ["amber"], // Only 1 color
    allowedWeightModes: ["basic"],
    features: {
      scratchCards: false,
      analytics: false,
      exportData: true,
      importData: true,
      customCurrency: false,
      advancedWeights: false,
      tierSorting: false,
      customHexColors: false,
      customColorNaming: false,
      customPalettePicker: false,
      customTierColors: false,
      publicStockPage: false, // Cannot publish stock page
      databaseSync: false, // No cloud sync
      eventManagement: false // No event session management
    },
    description: "Perfect for getting started",
    badge: null
  },
  BASIC: {
    id: "basic",
    name: "Basic",
    price: "$3",
    maxTiers: 5,
    maxTierNameLength: 1,
    maxColors: 5,
    tierColorLimit: 5,
    tierSorting: false,
    allowedColors: [
      "amber", "sky", "emerald", "purple", "rose"
    ],
    allowedWeightModes: ["basic"], // Basic weight only
    features: {
      scratchCards: true,
      analytics: false,
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: false, // No advanced weights
      tierSorting: false,
      customHexColors: false,
      customColorNaming: false,
      customPalettePicker: false,
      customTierColors: false,
      publicStockPage: true, // Can publish stock page
      databaseSync: true, // Cloud sync enabled
      eventManagement: false // No event management
    },
    description: "Best for small events",
    badge: "Popular"
  },
  ADVANCED: {
    id: "advanced",
    name: "Advanced",
    price: "$5",
    maxTiers: 10,
    maxTierNameLength: 2,
    maxColors: 10,
    tierColorLimit: 10,
    tierSorting: true,
    allowedColors: [
      "amber", "sky", "emerald", "purple", "rose",
      "lime", "teal", "cyan", "violet", "fuchsia"
    ],
    allowedWeightModes: ["basic", "advanced"],
    features: {
      scratchCards: true,
      analytics: true, // User analytics enabled
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: true,
      tierSorting: true,
      customHexColors: true, // Can use custom hex codes
      customColorNaming: true, // Can name custom colors
      customPalettePicker: false,
      customTierColors: false,
      publicStockPage: true, // Can publish stock page
      customBranding: false, // No custom branding
      databaseSync: true, // Cloud sync enabled
      apiAccess: true, // API access
      betaAccess: true, // Beta access for future features
      eventManagement: true // Event session management
    },
    description: "For growing businesses",
    badge: "Recommended"
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: "$10",
    maxTiers: Infinity,
    maxTierNameLength: 3,
    maxColors: Infinity, // Unlimited colors
    tierColorLimit: Infinity,
    tierSorting: true,
    allowedColors: null, // null means all colors
    allowedWeightModes: ["basic", "advanced"],
    features: {
      scratchCards: true,
      analytics: true, // Full user analytics
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: true,
      tierSorting: true,
      customHexColors: true, // Can use custom hex codes
      customColorNaming: true, // Can name custom colors
      customPalettePicker: true, // Full palette picker
      customTierColors: true, // Can use custom tier colors
      prioritySupport: true,
      customBranding: true, // Full branding customization
      publicStockPage: true, // Can publish stock page
      databaseSync: true, // Cloud sync enabled
      apiAccess: true,
      betaAccess: true, // Beta access for future features
      customDrawAnimation: true, // Custom draw animations (Beta)
      eventManagement: true // Event session management
    },
    description: "Unlimited power",
    badge: "Best Value"
  }
};

// Helper function to check if a color is allowed for a plan
export function isColorAllowedForPlan(colorId, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  // Pro plan has access to all colors
  if (plan.allowedColors === null) return true;
  
  return plan.allowedColors.includes(colorId);
}

// Helper function to check if tier creation is allowed
export function canCreateTier(currentTierCount, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  return currentTierCount < plan.maxTiers;
}

// Helper function to check if a weight mode is allowed
export function isWeightModeAllowedForPlan(weightMode, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  return plan.allowedWeightModes.includes(weightMode);
}

// Helper function to check if a feature is available
export function isFeatureAvailable(feature, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  return plan.features[feature] === true;
}

// Get filtered color palette based on user's plan
export function getAvailableColorsForPlan(colorPalette, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return [];
  
  // Pro plan has access to all colors
  if (plan.allowedColors === null) return colorPalette;
  
  return colorPalette.filter(color => plan.allowedColors.includes(color.id));
}

// Get available weight modes for plan
export function getAvailableWeightModesForPlan(weightModes, planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return [];
  
  return weightModes.filter(mode => plan.allowedWeightModes.includes(mode.id));
}

// Get max tier name length for plan
export function getMaxTierNameLength(planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return 1; // Default to 1 character
  
  return plan.maxTierNameLength || 1;
}

// Check if tier sorting is allowed for plan
export function isTierSortingAllowed(planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  return plan.tierSorting === true;
}

// Check if public stock page is allowed for plan
export function canPublishStockPage(planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return false;
  
  return plan.features.publicStockPage === true;
}

// Validate tier name based on plan limits
export function validateTierName(tierName, planId) {
  const maxLength = getMaxTierNameLength(planId);
  const trimmed = tierName.trim().toUpperCase();
  
  if (!trimmed) {
    return { valid: false, error: 'Tier name cannot be empty' };
  }
  
  if (trimmed.length > maxLength) {
    return { 
      valid: false, 
      error: `Tier name must be ${maxLength} character${maxLength > 1 ? 's' : ''} or less (Your plan: ${SUBSCRIPTION_PLANS[planId.toUpperCase()]?.name || 'Free'})` 
    };
  }
  
  if (!/^[A-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Tier name can only contain letters and numbers' };
  }
  
  return { valid: true, value: trimmed };
}

// Check if analytics is available for plan
export function hasAnalyticsAccess(planId) {
  return isFeatureAvailable('analytics', planId);
}

// Check if custom branding is available for plan
export function hasCustomBranding(planId) {
  return isFeatureAvailable('customBranding', planId);
}

// Check if database sync is available for plan
export function hasDatabaseSync(planId) {
  return isFeatureAvailable('databaseSync', planId);
}

// Get tier color limit for a plan
export function getTierColorLimit(planId) {
  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
  if (!plan) return 1; // Default to 1 color
  
  return plan.tierColorLimit || 1;
}

// Check if custom tier colors are available for plan
export function canUseCustomTierColors(planId) {
  return isFeatureAvailable('customTierColors', planId);
}

// Check if custom palette picker is available for plan
export function canUseCustomPalette(planId) {
  return isFeatureAvailable('customPalettePicker', planId);
}

// Check if beta access is available for plan
export function hasBetaAccess(planId) {
  return isFeatureAvailable('betaAccess', planId);
}

// Check if event management is available for plan
export function hasEventManagement(planId) {
  return isFeatureAvailable('eventManagement', planId);
}

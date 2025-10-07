// User subscription plans with feature limits
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: "$0",
    maxTiers: 3,
    allowedColors: ["amber", "sky", "emerald", "purple", "rose"],
    allowedWeightModes: ["basic"],
    features: {
      scratchCards: false,
      analytics: false,
      exportData: true,
      importData: true,
      customCurrency: false,
      advancedWeights: false
    },
    description: "Perfect for getting started",
    badge: null
  },
  BASIC: {
    id: "basic",
    name: "Basic",
    price: "$3/mo",
    maxTiers: 5,
    allowedColors: [
      "amber", "sky", "emerald", "purple", "rose",
      "lime", "teal", "cyan", "violet", "fuchsia"
    ],
    allowedWeightModes: ["basic", "advanced"],
    features: {
      scratchCards: true,
      analytics: false,
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: true
    },
    description: "Best for small events",
    badge: "Popular"
  },
  ADVANCED: {
    id: "advanced",
    name: "Advanced",
    price: "$5/mo",
    maxTiers: 10,
    allowedColors: [
      "amber", "sky", "emerald", "purple", "rose",
      "lime", "teal", "cyan", "violet", "fuchsia",
      "indigo", "orange", "yellow", "green", "blue",
      "red", "pink", "stone", "slate"
    ],
    allowedWeightModes: ["basic", "advanced"],
    features: {
      scratchCards: true,
      analytics: true,
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: true,
      prioritySupport: true,
      apiAccess: true
    },
    description: "For growing businesses",
    badge: "Recommended"
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: "$9/mo",
    maxTiers: Infinity,
    allowedColors: null, // null means all colors
    allowedWeightModes: ["basic", "advanced"],
    features: {
      scratchCards: true,
      analytics: true,
      exportData: true,
      importData: true,
      customCurrency: true,
      advancedWeights: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true
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

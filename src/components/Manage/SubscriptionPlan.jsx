import { SUBSCRIPTION_PLANS } from "../../utils/subscriptionPlans";

export default function SubscriptionPlan({ currentPlan, onPlanChange }) {
  const plans = Object.values(SUBSCRIPTION_PLANS);
  
  // Define plan hierarchy order
  const planOrder = ['free', 'basic', 'advanced', 'pro'];
  
  // Get plan tier index
  const getPlanTier = (planId) => {
    const index = planOrder.indexOf(planId.toLowerCase());
    return index === -1 ? 0 : index;
  };
  
  // Get plan color based on subscription tier
  const getPlanColor = (planId) => {
    switch (planId) {
      case 'free':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'basic':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'advanced':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'pro':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
    }
  };
  
  const currentPlanTier = getPlanTier(currentPlan);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold text-white">Subscription Plan</h3>
        <p className="text-sm text-slate-400 mt-1">
          Choose the plan that fits your needs. Upgrade anytime.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const planTier = getPlanTier(plan.id);
          const isUpgrade = planTier > currentPlanTier;
          const isDowngrade = planTier < currentPlanTier;
          
          return (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 transition-all ${
                isCurrentPlan
                  ? "border-create-primary bg-create-primary/10 shadow-lg shadow-create-primary/20"
                  : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-create-primary to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  {plan.badge}
                </span>
              )}
              
              <div className="space-y-4">
                {/* Plan header */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getPlanColor(plan.id)}`}>
                      {plan.name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-3xl font-bold text-white">
                  {plan.price}
                  {plan.id !== "free" && <span className="text-sm font-normal text-slate-400">/month</span>}
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-semibold text-slate-300">Tiers:</span>{" "}
                    <span className="text-white">
                      {plan.maxTiers === Infinity ? "Unlimited" : plan.maxTiers}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-300">Tier Name:</span>{" "}
                    <span className="text-white">
                      {plan.maxTierNameLength} char{plan.maxTierNameLength > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-300">Colors:</span>{" "}
                    <span className="text-white">
                      {plan.maxColors === Infinity ? "Unlimited" : plan.maxColors}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-slate-300">Weight Modes:</span>{" "}
                    <span className="text-white capitalize">
                      {plan.allowedWeightModes.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Feature list */}
                <div className="space-y-2 border-t border-slate-700 pt-4">
                  {plan.features.customHexColors && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom Hex Colors</span>
                    </div>
                  )}
                  {plan.features.customColorNaming && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom Color Naming</span>
                    </div>
                  )}
                  {plan.features.customPalettePicker && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom Palette Picker</span>
                    </div>
                  )}
                  {plan.features.tierSorting && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Tier Sorting/Arrangement</span>
                    </div>
                  )}
                  {plan.features.scratchCards && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Scratch Cards</span>
                    </div>
                  )}
                  {plan.features.analytics && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Analytics</span>
                    </div>
                  )}
                  {plan.features.customCurrency && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom Currency</span>
                    </div>
                  )}
                  {plan.features.advancedWeights && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Advanced Weights</span>
                    </div>
                  )}
                  {plan.features.prioritySupport && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Priority Support</span>
                    </div>
                  )}
                  {plan.features.customBranding && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom Branding</span>
                    </div>
                  )}
                  {plan.features.apiAccess && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className="h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>API Access</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  type="button"
                  onClick={() => onPlanChange(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    isCurrentPlan
                      ? "cursor-not-allowed bg-slate-700 text-slate-400"
                      : isUpgrade
                      ? "bg-create-primary text-white hover:bg-create-primary/90 hover:shadow-lg"
                      : "bg-slate-700 text-white hover:bg-slate-600"
                  }`}
                >
                  {isCurrentPlan ? "Current Plan" : isUpgrade ? "Upgrade" : "Downgrade"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan comparison note */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-400">
          <span className="font-semibold text-white">Note:</span> All plans include data export and import.
          Upgrading gives you instant access to additional features. Contact us for enterprise solutions.
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext.jsx";
import SubscriptionPlan from "../components/Manage/SubscriptionPlan.jsx";
import useLocalStorageDAO from "../hooks/useLocalStorageDAO.js";

export default function SubscriptionPlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscriptionPlan, updateSubscriptionPlan } = useSubscription();
  const { setSettings, getSettings } = useLocalStorageDAO();
  const [loading, setLoading] = useState(false);

  const handlePlanChange = async (planId) => {
    try {
      setLoading(true);
      const currentSettings = await getSettings();
      await setSettings({ ...currentSettings, subscriptionPlan: planId });
      
      // Update the global subscription context immediately
      updateSubscriptionPlan(planId);
      
      // Show success message and navigate back
      setTimeout(() => {
        setLoading(false);
        navigate(`/${user.username}/manage`);
      }, 800);
    } catch (error) {
      console.error('Failed to update subscription plan:', error);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${user.username}/manage`);
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          aria-label="Go back to settings"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Configuration
        </button>
      </header>
      
      <div>
        <h2 className="text-3xl font-bold text-white">Subscription Plans</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose the plan that best fits your needs. You can upgrade or downgrade at any time.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg">
        <SubscriptionPlan 
          currentPlan={subscriptionPlan} 
          onPlanChange={handlePlanChange}
        />
      </div>
    </section>
  );
}

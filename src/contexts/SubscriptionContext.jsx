import { createContext, useContext, useState, useEffect } from 'react';
import useLocalStorageDAO from '../hooks/useLocalStorageDAO';

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { getSettings } = useLocalStorageDAO();
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  // Load initial subscription plan
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const settings = await getSettings();
        setSubscriptionPlan(settings.subscriptionPlan || 'free');
      } catch (error) {
        console.error('Failed to load subscription plan:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPlan();
  }, [getSettings]);

  const updateSubscriptionPlan = (newPlan) => {
    setSubscriptionPlan(newPlan);
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptionPlan, updateSubscriptionPlan, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

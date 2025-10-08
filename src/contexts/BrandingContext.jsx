import { createContext, useContext, useEffect, useState } from 'react';
import useLocalStorageDAO from '../hooks/useLocalStorageDAO';
import { useAuth } from '../utils/AuthContext';
import { hasCustomBranding } from '../utils/subscriptionPlans';

const BrandingContext = createContext(null);

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
}

export function BrandingProvider({ children }) {
  const { getBranding, setBranding: saveBranding, resetBranding } = useLocalStorageDAO();
  const { user } = useAuth();
  const [branding, setBrandingState] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load branding from LocalForage
  useEffect(() => {
    let mounted = true;
    
    const loadBranding = async () => {
      try {
        const data = await getBranding();
        if (mounted) {
          setBrandingState(data);
          
          // Check if user has access to custom branding
          const plan = user?.subscriptionPlan || 'free';
          const hasBrandingAccess = hasCustomBranding(plan);
          setIsEnabled(hasBrandingAccess);
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load branding:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBranding();

    return () => {
      mounted = false;
    };
  }, [getBranding, user]);

  // Apply branding to CSS custom properties
  useEffect(() => {
    if (!branding || !isEnabled) {
      // Set default theme values instead of removing properties
      document.documentElement.style.setProperty('--brand-primary', '#3b82f6');
      document.documentElement.style.setProperty('--brand-secondary', '#8b5cf6');
      document.documentElement.style.setProperty('--brand-accent', '#06b6d4');
      document.documentElement.style.setProperty('--brand-font-family', 'Inter, sans-serif');
      document.documentElement.style.removeProperty('--brand-bg-pattern');
      document.documentElement.style.removeProperty('--brand-bg-image');
      return;
    }

    // Apply branding colors
    console.log('🎨 Applying custom branding:', branding);
    if (branding.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor);
    }
    if (branding.secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor);
    }
    if (branding.accentColor) {
      document.documentElement.style.setProperty('--brand-accent', branding.accentColor);
    }
    if (branding.fontFamily) {
      document.documentElement.style.setProperty('--brand-font-family', branding.fontFamily);
    }

    // Inject font if it's a Google Font
    if (branding.fontFamily && branding.fontFamily !== 'Inter') {
      injectGoogleFont(branding.fontFamily);
    }

    // Apply background pattern or image
    if (branding.backgroundPattern) {
      document.documentElement.style.setProperty('--brand-bg-pattern', branding.backgroundPattern);
    } else {
      document.documentElement.style.removeProperty('--brand-bg-pattern');
    }

    if (branding.backgroundImage) {
      document.documentElement.style.setProperty('--brand-bg-image', `url(${branding.backgroundImage})`);
    } else {
      document.documentElement.style.removeProperty('--brand-bg-image');
    }

  }, [branding, isEnabled]);

  // Helper to inject Google Font
  const injectGoogleFont = (fontName) => {
    const fontId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Check if already injected
    if (document.getElementById(fontId)) {
      return;
    }

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  };

  // Update branding
  const updateBranding = async (updates) => {
    const newBranding = { ...branding, ...updates };
    setBrandingState(newBranding);
    await saveBranding(newBranding);
  };

  // Reset branding to defaults
  const resetBrandingToDefaults = async () => {
    await resetBranding();
    const defaultBranding = await getBranding();
    setBrandingState(defaultBranding);
  };

  // Validate color contrast (WCAG AA standard)
  const validateColorContrast = (foreground, background) => {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const [rs, gs, bs] = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: Math.round(ratio * 100) / 100,
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7
    };
  };

  const value = {
    branding,
    isEnabled,
    loading,
    updateBranding,
    resetBranding: resetBrandingToDefaults,
    validateColorContrast
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

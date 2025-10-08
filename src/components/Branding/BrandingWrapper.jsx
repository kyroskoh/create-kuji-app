import { useBranding } from '../../contexts/BrandingContext';

/**
 * BrandingWrapper Component
 * 
 * Wraps page content and applies custom background patterns and images
 * when branding is enabled. Falls back to default background if no custom
 * branding is configured.
 */
export default function BrandingWrapper({ children, className = '' }) {
  const { branding, isEnabled } = useBranding();

  // Build background styles
  const getBackgroundStyles = () => {
    if (!isEnabled || !branding) {
      return {};
    }

    const styles = {};

    // Apply background pattern if set
    if (branding.backgroundPattern) {
      styles.backgroundImage = branding.backgroundPattern;
      styles.backgroundSize = '20px 20px'; // Standard size for patterns
      styles.backgroundPosition = '0 0';
      styles.backgroundRepeat = 'repeat';
    }

    // Apply background image if set (overrides pattern)
    if (branding.backgroundImage) {
      // If both pattern and image exist, layer them
      if (branding.backgroundPattern) {
        styles.backgroundImage = `var(--brand-bg-image), ${branding.backgroundPattern}`;
      } else {
        styles.backgroundImage = `var(--brand-bg-image)`;
      }
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
    }

    return styles;
  };

  const backgroundStyles = getBackgroundStyles();
  const hasCustomBackground = Object.keys(backgroundStyles).length > 0;

  return (
    <div 
      className={`relative ${className}`}
      style={backgroundStyles}
    >
      {/* Add overlay for better readability if custom background exists */}
      {hasCustomBackground && (
        <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm pointer-events-none" />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

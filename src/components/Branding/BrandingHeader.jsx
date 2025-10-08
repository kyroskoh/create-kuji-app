import { useBranding } from '../../contexts/BrandingContext';

/**
 * BrandingHeader Component
 * 
 * Displays custom branding header with logo, company name, and event name
 * Only renders if branding is enabled and custom branding data exists
 */
export default function BrandingHeader() {
  const { branding, isEnabled } = useBranding();

  // Don't render if branding is not enabled or no custom branding data
  if (!isEnabled || !branding) {
    return null;
  }

  // Check if any branding elements exist to display
  const hasLogo = branding.logoUrl;
  const hasCompanyName = branding.companyName;
  const hasEventName = branding.eventName;
  const hasAnyBranding = hasLogo || hasCompanyName || hasEventName;

  if (!hasAnyBranding) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-6">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Logo */}
        {hasLogo && (
          <div className="flex justify-center">
            <img 
              src={branding.logoUrl} 
              alt={branding.companyName || 'Company Logo'} 
              className="h-20 w-auto object-contain"
            />
          </div>
        )}

        {/* Company Name & Event Name */}
        {(hasCompanyName || hasEventName) && (
          <div className="space-y-1">
            {hasCompanyName && (
              <h1 
                className="text-3xl font-bold text-white"
                style={{ fontFamily: 'var(--brand-font-family, inherit)' }}
              >
                {branding.companyName}
              </h1>
            )}
            {hasEventName && (
              <p 
                className="text-lg text-slate-300"
                style={{ fontFamily: 'var(--brand-font-family, inherit)' }}
              >
                {branding.eventName}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

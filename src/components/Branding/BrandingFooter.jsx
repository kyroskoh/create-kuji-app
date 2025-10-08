import { useBranding } from '../../contexts/BrandingContext';

/**
 * BrandingFooter Component
 * 
 * Displays custom footer text at the bottom of pages
 * Only renders if branding is enabled and footer text exists
 */
export default function BrandingFooter() {
  const { branding, isEnabled } = useBranding();

  // Don't render if branding is not enabled or no footer text
  if (!isEnabled || !branding || !branding.footerText) {
    return null;
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-700">
      <div className="text-center">
        <p 
          className="text-sm text-slate-400"
          style={{ fontFamily: 'var(--brand-font-family, inherit)' }}
        >
          {branding.footerText}
        </p>
      </div>
    </div>
  );
}

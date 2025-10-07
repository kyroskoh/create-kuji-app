import { useState, useRef, useEffect } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import { hasCustomBranding } from '../../utils/subscriptionPlans';
import { useAuth } from '../../utils/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Popular Google Fonts
const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Playfair Display',
  'Merriweather'
];

// Background patterns (CSS patterns)
const BG_PATTERNS = [
  { id: 'none', label: 'None', value: null },
  { id: 'dots', label: 'Dots', value: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)' },
  { id: 'grid', label: 'Grid', value: 'linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)' },
  { id: 'diagonal', label: 'Diagonal Lines', value: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff08 10px, #ffffff08 11px)' },
  { id: 'waves', label: 'Waves', value: 'radial-gradient(ellipse at 50% 100%, transparent 40%, #ffffff08 41%)' }
];

export default function BrandingManager() {
  const { user } = useAuth();
  const { branding, isEnabled, loading, updateBranding, resetBranding, validateColorContrast } = useBranding();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const bgImageInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyName: '',
    eventName: '',
    logoUrl: null,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#06b6d4',
    fontFamily: 'Inter',
    backgroundPattern: null,
    backgroundImage: null,
    footerText: ''
  });

  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBgImage, setPreviewBgImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contrastWarnings, setContrastWarnings] = useState([]);

  // Load branding data
  useEffect(() => {
    if (branding) {
      setFormData(branding);
      setPreviewLogo(branding.logoUrl);
      setPreviewBgImage(branding.backgroundImage);
    }
  }, [branding]);

  // Check if user has access
  const hasBrandingAccess = hasCustomBranding(user?.subscriptionPlan || 'free');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading branding...</p>
        </div>
      </div>
    );
  }

  if (!hasBrandingAccess) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Custom Branding Available on Pro Plan</h3>
        <p className="text-slate-400 mb-4">
          Upgrade to Pro to customize your brand colors, logo, fonts, and more.
        </p>
        <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold">
          Upgrade to Pro
        </button>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('Logo file size must be less than 500KB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setPreviewLogo(dataUrl);
      handleInputChange('logoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast.error('Background image must be less than 500KB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setPreviewBgImage(dataUrl);
      handleInputChange('backgroundImage', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    handleInputChange('logoUrl', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveBgImage = () => {
    setPreviewBgImage(null);
    handleInputChange('backgroundImage', null);
    if (bgImageInputRef.current) {
      bgImageInputRef.current.value = '';
    }
  };

  // Function to lighten a color for better contrast
  const adjustColorForContrast = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate luminance increase needed
    // For dark backgrounds, we need brighter colors
    const factor = 1.4; // Increase brightness by 40%
    const newR = Math.min(255, Math.round(r * factor));
    const newG = Math.min(255, Math.round(g * factor));
    const newB = Math.min(255, Math.round(b * factor));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const checkContrast = () => {
    const warnings = [];
    const MINIMAL_ACCEPTABLE = 4.0; // WCAG AA for large text
    const HIGHLY_RECOMMENDED = 4.5; // WCAG AA for normal text
    
    // Check primary color against dark background
    const primaryContrast = validateColorContrast(formData.primaryColor, '#0f172a');
    if (primaryContrast.ratio < MINIMAL_ACCEPTABLE) {
      // Fails minimal acceptable - critical warning
      const suggestedColor = adjustColorForContrast(formData.primaryColor);
      warnings.push({
        type: 'primary',
        severity: 'critical',
        message: `Primary color has insufficient contrast (${primaryContrast.ratio}:1). Minimal acceptable: 4:1.`,
        currentColor: formData.primaryColor,
        suggestedColor
      });
    } else if (primaryContrast.ratio < HIGHLY_RECOMMENDED) {
      // Meets minimal but not highly recommended - info warning
      const suggestedColor = adjustColorForContrast(formData.primaryColor);
      warnings.push({
        type: 'primary',
        severity: 'info',
        message: `Primary color has acceptable contrast (${primaryContrast.ratio}:1). Highly recommended: 4.5:1 or higher.`,
        currentColor: formData.primaryColor,
        suggestedColor
      });
    }

    // Check secondary color against dark background
    const secondaryContrast = validateColorContrast(formData.secondaryColor, '#0f172a');
    if (secondaryContrast.ratio < MINIMAL_ACCEPTABLE) {
      // Fails minimal acceptable - critical warning
      const suggestedColor = adjustColorForContrast(formData.secondaryColor);
      warnings.push({
        type: 'secondary',
        severity: 'critical',
        message: `Secondary color has insufficient contrast (${secondaryContrast.ratio}:1). Minimal acceptable: 4:1.`,
        currentColor: formData.secondaryColor,
        suggestedColor
      });
    } else if (secondaryContrast.ratio < HIGHLY_RECOMMENDED) {
      // Meets minimal but not highly recommended - info warning
      const suggestedColor = adjustColorForContrast(formData.secondaryColor);
      warnings.push({
        type: 'secondary',
        severity: 'info',
        message: `Secondary color has acceptable contrast (${secondaryContrast.ratio}:1). Highly recommended: 4.5:1 or higher.`,
        currentColor: formData.secondaryColor,
        suggestedColor
      });
    }

    setContrastWarnings(warnings);
    return warnings.length === 0;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check contrast
      checkContrast();
      
      // Check if there are any critical warnings
      const criticalWarnings = contrastWarnings.filter(w => w.severity === 'critical');
      if (criticalWarnings.length > 0) {
        toast.error('Cannot save: Please fix critical contrast issues below');
        setIsSaving(false);
        return;
      }
      
      // Info warnings are acceptable, just notify
      const infoWarnings = contrastWarnings.filter(w => w.severity === 'info');
      if (infoWarnings.length > 0) {
        toast.info('Saved with contrast recommendations. Consider applying them for better accessibility.');
      }

      await updateBranding(formData);
      toast.success('Branding saved successfully!');
    } catch (error) {
      console.error('Failed to save branding:', error);
      toast.error('Failed to save branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset branding to defaults? This cannot be undone.')) {
      return;
    }

    try {
      await resetBranding();
      toast.success('Branding reset to defaults');
    } catch (error) {
      console.error('Failed to reset branding:', error);
      toast.error('Failed to reset branding');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Custom Branding</h2>
        <p className="text-slate-400 text-sm mb-6">
          Customize your brand identity across all pages and printable materials.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <div className="space-y-6">
            {/* Company/Event Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName || ''}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Your Company Name"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Event Name
              </label>
              <input
                type="text"
                value={formData.eventName || ''}
                onChange={(e) => handleInputChange('eventName', e.target.value)}
                placeholder="Event or Campaign Name"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Logo (Max 500KB)
              </label>
              <div className="flex items-start gap-4">
                {previewLogo ? (
                  <div className="relative">
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="w-24 h-24 object-contain bg-slate-900 rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                >
                  {previewLogo ? 'Change Logo' : 'Upload Logo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="flex-1 px-2 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="flex-1 px-2 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                    className="flex-1 px-2 py-2 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Font Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Font Family
              </label>
              <select
                value={formData.fontFamily}
                onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GOOGLE_FONTS.map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>

            {/* Background Pattern */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Background Pattern
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BG_PATTERNS.map(pattern => (
                  <button
                    key={pattern.id}
                    type="button"
                    onClick={() => handleInputChange('backgroundPattern', pattern.value)}
                    className={`h-16 rounded-lg border-2 ${
                      formData.backgroundPattern === pattern.value
                        ? 'border-blue-500'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    style={{
                      background: pattern.value || '#1e293b',
                      backgroundSize: pattern.id === 'dots' ? '20px 20px' : 
                                     pattern.id === 'grid' ? '20px 20px' : 'auto'
                    }}
                    title={pattern.label}
                  />
                ))}
              </div>
            </div>

            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Background Image (Max 500KB)
              </label>
              <div className="flex items-start gap-4">
                {previewBgImage ? (
                  <div className="relative">
                    <img
                      src={previewBgImage}
                      alt="Background preview"
                      className="w-32 h-20 object-cover bg-slate-900 rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveBgImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => bgImageInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                >
                  {previewBgImage ? 'Change Image' : 'Upload Image'}
                </button>
                <input
                  ref={bgImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBgImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Footer Text
              </label>
              <textarea
                value={formData.footerText || ''}
                onChange={(e) => handleInputChange('footerText', e.target.value)}
                placeholder="Custom footer text (e.g., contact info, tagline)"
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Contrast Warnings */}
            {contrastWarnings.length > 0 && (
              <div className="rounded-lg">
                <div className="space-y-3">
                  {contrastWarnings.map((warning, i) => {
                    const isCritical = warning.severity === 'critical';
                    const bgColor = isCritical ? 'bg-red-900/20' : 'bg-blue-900/20';
                    const borderColor = isCritical ? 'border-red-700' : 'border-blue-700';
                    const textColor = isCritical ? 'text-red-200' : 'text-blue-200';
                    const iconColor = isCritical ? 'text-red-400' : 'text-blue-400';
                    const titleColor = isCritical ? 'text-red-400' : 'text-blue-400';
                    const buttonColor = isCritical ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700';
                    
                    return (
                      <div key={i} className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
                        <h4 className={`${titleColor} font-semibold mb-2 flex items-center gap-2`}>
                          {isCritical ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isCritical ? 'Insufficient Contrast' : 'Contrast Recommendation'}
                        </h4>
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                          <p className={`${textColor} text-sm mb-2`}>{warning.message}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded border border-slate-600"
                                style={{ backgroundColor: warning.currentColor }}
                                title={`Current: ${warning.currentColor}`}
                              />
                              <span className="text-xs text-slate-400">Current</span>
                            </div>
                            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-8 h-8 rounded border border-green-600"
                                style={{ backgroundColor: warning.suggestedColor }}
                                title={`Suggested: ${warning.suggestedColor}`}
                              />
                              <span className="text-xs text-slate-400">Suggested</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const field = warning.type === 'primary' ? 'primaryColor' : 'secondaryColor';
                                handleInputChange(field, warning.suggestedColor);
                                toast.success(`Applied ${isCritical ? 'fix' : 'recommended'} ${warning.type} color`);
                                // Re-check contrast after applying
                                setTimeout(checkContrast, 100);
                              }}
                              className={`ml-auto px-3 py-1.5 ${buttonColor} text-white text-xs rounded-md font-medium transition-colors`}
                            >
                              {isCritical ? 'Apply Fix' : 'Apply Recommendation'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Live Preview */}
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
            <div 
              className="rounded-lg overflow-hidden border border-slate-700"
              style={{
                backgroundColor: '#0f172a',
                backgroundImage: formData.backgroundPattern || (formData.backgroundImage ? `url(${formData.backgroundImage})` : 'none'),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: formData.fontFamily || 'Inter'
              }}
            >
              <div className="p-6 space-y-4 backdrop-blur-sm bg-slate-950/50">
                {/* Logo Preview */}
                {previewLogo && (
                  <div className="flex justify-center mb-4">
                    <img src={previewLogo} alt="Logo" className="h-16 object-contain" />
                  </div>
                )}

                {/* Company/Event Name */}
                {(formData.companyName || formData.eventName) && (
                  <div className="text-center mb-4">
                    {formData.companyName && (
                      <h2 className="text-2xl font-bold text-white">{formData.companyName}</h2>
                    )}
                    {formData.eventName && (
                      <p className="text-lg text-slate-300">{formData.eventName}</p>
                    )}
                  </div>
                )}

                {/* Sample Button (Primary) */}
                <button
                  className="w-full py-2 px-4 rounded-lg font-semibold"
                  style={{ backgroundColor: formData.primaryColor, color: '#fff' }}
                >
                  Primary Button
                </button>

                {/* Sample Button (Secondary) */}
                <button
                  className="w-full py-2 px-4 rounded-lg font-semibold"
                  style={{ backgroundColor: formData.secondaryColor, color: '#fff' }}
                >
                  Secondary Button
                </button>

                {/* Sample Button (Accent) */}
                <button
                  className="w-full py-2 px-4 rounded-lg font-semibold"
                  style={{ backgroundColor: formData.accentColor, color: '#fff' }}
                >
                  Accent Button
                </button>

                {/* Footer Preview */}
                {formData.footerText && (
                  <div className="mt-6 pt-4 border-t border-slate-700 text-center">
                    <p className="text-sm text-slate-400">{formData.footerText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold"
          >
            {isSaving ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </div>
    </div>
  );
}

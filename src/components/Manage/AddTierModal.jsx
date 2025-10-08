import { useState, useMemo } from 'react';
import { COLOR_PALETTE } from '../../utils/colorPalette';
import { tierSwatchClass, tierSwatchStyle, DEFAULT_TIER_COLOR_MAP } from '../../utils/tierColors';
import { validateTierName, getAvailableColorsForPlan, canUseCustomTierColors } from '../../utils/subscriptionPlans';
import ProColorWheel from '../ProColorWheel';

export default function AddTierModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  existingTiers = [], 
  subscriptionPlan = 'free',
  maxTierNameLength = 1
}) {
  const [tierName, setTierName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].id);
  const [error, setError] = useState('');

  // Get available colors based on subscription plan
  const availableColors = useMemo(() => {
    return getAvailableColorsForPlan(COLOR_PALETTE, subscriptionPlan);
  }, [subscriptionPlan]);

  // Check if user can use custom colors (Pro plan)
  const hasCustomColorAccess = useMemo(() => {
    return canUseCustomTierColors(subscriptionPlan);
  }, [subscriptionPlan]);

  const handleTierNameChange = (value) => {
    setTierName(value);
    setError('');
  };

  const handleColorSelect = (colorId) => {
    const isAvailable = availableColors.some(c => c.id === colorId);
    if (isAvailable || colorId.startsWith('#')) {
      setSelectedColor(colorId);
    }
  };

  const handleCustomColorChange = (hexColor) => {
    setSelectedColor(hexColor);
  };

  const handleSubmit = () => {
    setError('');

    // Validate tier name
    const validation = validateTierName(tierName, subscriptionPlan);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    const normalizedTier = validation.value;

    // Check if tier already exists
    if (existingTiers.includes(normalizedTier)) {
      setError(`Tier "${normalizedTier}" already exists`);
      return;
    }

    // Confirm tier creation
    onConfirm({ tier: normalizedTier, color: selectedColor });
    
    // Reset form
    setTierName('');
    setSelectedColor(COLOR_PALETTE[0].id);
    setError('');
  };

  const handleCancel = () => {
    setTierName('');
    setSelectedColor(COLOR_PALETTE[0].id);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Tier</h2>
            <p className="text-sm text-slate-400 mt-1">
              Create a new tier with a custom name and color
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tier Name Input */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Tier Name ({maxTierNameLength} character{maxTierNameLength > 1 ? 's' : ''} max)
            </label>
            <input
              type="text"
              value={tierName}
              onChange={(e) => handleTierNameChange(e.target.value)}
              maxLength={maxTierNameLength}
              placeholder={maxTierNameLength === 1 ? 'S' : maxTierNameLength === 2 ? 'SS' : 'SSR'}
              className={`w-full px-4 py-3 bg-slate-900 border ${
                error ? 'border-red-500' : 'border-slate-700'
              } rounded-lg text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Select Tier Color
            </label>

            {/* Pro Color Wheel for Custom Colors */}
            {hasCustomColorAccess && (
              <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="text-sm font-semibold text-blue-400">Pro Custom Color</span>
                </div>
                <ProColorWheel
                  value={selectedColor.startsWith('#') ? selectedColor : '#3b82f6'}
                  onChange={handleCustomColorChange}
                  label=""
                />
              </div>
            )}

            {/* Color Palette Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PALETTE.map((palette) => {
                const isAvailable = availableColors.some(c => c.id === palette.id);
                const isSelected = selectedColor === palette.id;
                
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => handleColorSelect(palette.id)}
                    disabled={!isAvailable}
                    className={`relative flex items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
                        : isAvailable
                        ? 'border-slate-700 bg-slate-900 hover:border-blue-500/50 hover:bg-slate-800'
                        : 'border-slate-800 bg-slate-900/50 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <span 
                      className={`h-6 w-6 rounded-full flex-shrink-0 ${tierSwatchClass(palette.id)} ${!isAvailable ? 'opacity-40' : ''}`}
                      style={tierSwatchStyle(palette.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-white' : isAvailable ? 'text-slate-200' : 'text-slate-500'
                        }`}>
                          {palette.label}
                        </span>
                        {!isAvailable && (
                          <span className="text-xs">🔒</span>
                        )}
                      </div>
                      <span className={`text-xs font-mono ${
                        isSelected ? 'text-slate-300' : isAvailable ? 'text-slate-500' : 'text-slate-600'
                      }`}>
                        {palette.hex}
                      </span>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {!hasCustomColorAccess && (
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Upgrade to Pro to unlock custom hex colors and more preset colors
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <label className="block text-sm font-semibold text-white mb-3">Preview</label>
            <div className="flex items-center gap-3">
              <span 
                className={`h-10 w-10 rounded-full ${tierSwatchClass(selectedColor)}`}
                style={tierSwatchStyle(selectedColor)}
              />
              <div>
                <div className="text-lg font-bold text-white">
                  Tier {tierName.toUpperCase() || '?'}
                </div>
                <div className="text-xs text-slate-400">
                  {COLOR_PALETTE.find(p => p.id === selectedColor)?.label || 'Custom'} - {
                    selectedColor.startsWith('#') ? selectedColor : COLOR_PALETTE.find(p => p.id === selectedColor)?.hex
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700 bg-slate-900/50">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!tierName.trim()}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
              tierName.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Add Tier
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';

export default function ProColorWheel({ value = '#ffffff', onChange, label = 'Custom Color', className = '' }) {
  const [localColor, setLocalColor] = useState(value);
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalColor(value);
    setHexInput(value);
  }, [value]);

  // Validate and format hex input
  const isValidHex = (hex) => {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  };

  const handleColorChange = (newColor) => {
    setLocalColor(newColor);
    setHexInput(newColor);
    onChange?.(newColor);
  };

  const handleHexInputChange = (event) => {
    const inputValue = event.target.value;
    setHexInput(inputValue);
    
    // Auto-format hex input
    let formattedValue = inputValue;
    if (!formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    
    // Validate and update color if valid
    if (isValidHex(formattedValue)) {
      setLocalColor(formattedValue);
      onChange?.(formattedValue);
    }
  };

  const handleHexInputBlur = () => {
    // Ensure hex input is properly formatted on blur
    let formattedValue = hexInput;
    if (!formattedValue.startsWith('#')) {
      formattedValue = '#' + formattedValue;
    }
    
    if (!isValidHex(formattedValue)) {
      // Reset to last valid color
      setHexInput(localColor);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
          <span className="ml-1 text-xs text-purple-400">PRO</span>
        </label>
      )}
      
      <div className="space-y-3">
        {/* Color Swatch Button */}
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg hover:border-purple-500/50 transition-colors group"
        >
          <div 
            className="w-8 h-8 rounded-lg border-2 border-slate-600 group-hover:border-purple-500/50 transition-colors flex-shrink-0"
            style={{ backgroundColor: localColor }}
          />
          <div className="flex-1 text-left">
            <div className="text-white font-medium">Custom Color</div>
            <div className="text-slate-400 text-xs font-mono">{localColor.toUpperCase()}</div>
          </div>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${showPicker ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Color Picker Panel */}
        {showPicker && (
          <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 space-y-4">
            {/* Color Wheel */}
            <div className="flex justify-center">
              <HexColorPicker 
                color={localColor} 
                onChange={handleColorChange}
                style={{ width: '200px', height: '200px' }}
              />
            </div>
            
            {/* Hex Input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Hex Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={handleHexInputChange}
                  onBlur={handleHexInputBlur}
                  placeholder="#ffffff"
                  maxLength={7}
                  className={`flex-1 px-3 py-2 bg-slate-900 border rounded text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isValidHex(hexInput) ? 'border-slate-700' : 'border-red-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded font-medium"
                >
                  Done
                </button>
              </div>
              {!isValidHex(hexInput) && hexInput && (
                <p className="text-red-400 text-xs mt-1">
                  Invalid hex format. Use #RRGGBB (e.g., #FF5733)
                </p>
              )}
            </div>
            
            {/* Preset Colors for Quick Access */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Quick Colors
              </label>
              <div className="flex gap-2 flex-wrap">
                {[
                  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
                  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
                  '#C44569', '#40407A', '#706FD3', '#F8B500', '#2F3542'
                ].map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => handleColorChange(presetColor)}
                    className="w-8 h-8 rounded border-2 border-slate-600 hover:border-white transition-colors"
                    style={{ backgroundColor: presetColor }}
                    title={presetColor}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
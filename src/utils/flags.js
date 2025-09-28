// We'll use emoji-flags package for better emoji support
import emojiFlags from 'emoji-flags';

export function flagFromCountryCode(code = "") {
  if (!code) return "";
  
  const normalized = normalizeCountryCode(code);
  const flagData = emojiFlags.countryCode(normalized);
  
  return flagData ? flagData.emoji : "";
}

export function normalizeCountryCode(input = "") {
  if (!input) return "";
  
  // Convert to uppercase and trim
  const normalized = input.trim().toUpperCase();
  
  // Validate that it's a 2-letter code
  if (/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }
  
  return "";
}

// Get country name from code
export function countryNameFromCode(code = "") {
  if (!code) return "";
  
  const normalized = normalizeCountryCode(code);
  const flagData = emojiFlags.countryCode(normalized);
  
  return flagData ? flagData.name : "";
}

// Get all countries
export function getAllCountries() {
  return emojiFlags.data.map(country => ({
    code: country.code,
    name: country.name,
    emoji: country.emoji
  }));
}
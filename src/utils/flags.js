export function flagFromCountryCode(code = "") {
  const upper = code.trim().toUpperCase();
  if (upper.length !== 2) {
    return "";
  }
  const base = 127397;
  const first = upper.charCodeAt(0);
  const second = upper.charCodeAt(1);
  if (first < 65 || first > 90 || second < 65 || second > 90) {
    return "";
  }
  return String.fromCodePoint(first + base, second + base);
}

export function normalizeCountryCode(input = "") {
  const trimmed = input.trim().toUpperCase();
  return trimmed.length === 2 ? trimmed : "";
}
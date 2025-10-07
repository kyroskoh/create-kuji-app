// Comprehensive world countries database with currency, locale, and country codes
// Data sourced from ISO 3166 (country codes) and ISO 4217 (currency codes)

export const COUNTRIES = [
  // Asia Pacific
  { name: "Afghanistan", code: "AF", currency: "AFN", locale: "fa-AF" },
  { name: "Australia", code: "AU", currency: "AUD", locale: "en-AU" },
  { name: "Bangladesh", code: "BD", currency: "BDT", locale: "bn-BD" },
  { name: "Bhutan", code: "BT", currency: "BTN", locale: "dz-BT" },
  { name: "Brunei", code: "BN", currency: "BND", locale: "ms-BN" },
  { name: "Cambodia", code: "KH", currency: "KHR", locale: "km-KH" },
  { name: "China", code: "CN", currency: "CNY", locale: "zh-CN" },
  { name: "Hong Kong", code: "HK", currency: "HKD", locale: "zh-HK" },
  { name: "India", code: "IN", currency: "INR", locale: "hi-IN" },
  { name: "Indonesia", code: "ID", currency: "IDR", locale: "id-ID" },
  { name: "Japan", code: "JP", currency: "JPY", locale: "ja-JP" },
  { name: "Kazakhstan", code: "KZ", currency: "KZT", locale: "kk-KZ" },
  { name: "Kyrgyzstan", code: "KG", currency: "KGS", locale: "ky-KG" },
  { name: "Laos", code: "LA", currency: "LAK", locale: "lo-LA" },
  { name: "Macau", code: "MO", currency: "MOP", locale: "zh-MO" },
  { name: "Malaysia", code: "MY", currency: "MYR", locale: "ms-MY" },
  { name: "Maldives", code: "MV", currency: "MVR", locale: "dv-MV" },
  { name: "Mongolia", code: "MN", currency: "MNT", locale: "mn-MN" },
  { name: "Myanmar", code: "MM", currency: "MMK", locale: "my-MM" },
  { name: "Nepal", code: "NP", currency: "NPR", locale: "ne-NP" },
  { name: "New Zealand", code: "NZ", currency: "NZD", locale: "en-NZ" },
  { name: "North Korea", code: "KP", currency: "KPW", locale: "ko-KP" },
  { name: "Pakistan", code: "PK", currency: "PKR", locale: "ur-PK" },
  { name: "Philippines", code: "PH", currency: "PHP", locale: "en-PH" },
  { name: "Singapore", code: "SG", currency: "SGD", locale: "en-SG" },
  { name: "South Korea", code: "KR", currency: "KRW", locale: "ko-KR" },
  { name: "Sri Lanka", code: "LK", currency: "LKR", locale: "si-LK" },
  { name: "Taiwan", code: "TW", currency: "TWD", locale: "zh-TW" },
  { name: "Tajikistan", code: "TJ", currency: "TJS", locale: "tg-TJ" },
  { name: "Thailand", code: "TH", currency: "THB", locale: "th-TH" },
  { name: "Timor-Leste", code: "TL", currency: "USD", locale: "pt-TL" },
  { name: "Turkmenistan", code: "TM", currency: "TMT", locale: "tk-TM" },
  { name: "Uzbekistan", code: "UZ", currency: "UZS", locale: "uz-UZ" },
  { name: "Vietnam", code: "VN", currency: "VND", locale: "vi-VN" },

  // Middle East
  { name: "Armenia", code: "AM", currency: "AMD", locale: "hy-AM" },
  { name: "Azerbaijan", code: "AZ", currency: "AZN", locale: "az-AZ" },
  { name: "Bahrain", code: "BH", currency: "BHD", locale: "ar-BH" },
  { name: "Cyprus", code: "CY", currency: "EUR", locale: "el-CY" },
  { name: "Georgia", code: "GE", currency: "GEL", locale: "ka-GE" },
  { name: "Iran", code: "IR", currency: "IRR", locale: "fa-IR" },
  { name: "Iraq", code: "IQ", currency: "IQD", locale: "ar-IQ" },
  { name: "Israel", code: "IL", currency: "ILS", locale: "he-IL" },
  { name: "Jordan", code: "JO", currency: "JOD", locale: "ar-JO" },
  { name: "Kuwait", code: "KW", currency: "KWD", locale: "ar-KW" },
  { name: "Lebanon", code: "LB", currency: "LBP", locale: "ar-LB" },
  { name: "Oman", code: "OM", currency: "OMR", locale: "ar-OM" },
  { name: "Palestine", code: "PS", currency: "ILS", locale: "ar-PS" },
  { name: "Qatar", code: "QA", currency: "QAR", locale: "ar-QA" },
  { name: "Saudi Arabia", code: "SA", currency: "SAR", locale: "ar-SA" },
  { name: "Syria", code: "SY", currency: "SYP", locale: "ar-SY" },
  { name: "Turkey", code: "TR", currency: "TRY", locale: "tr-TR" },
  { name: "United Arab Emirates", code: "AE", currency: "AED", locale: "ar-AE" },
  { name: "Yemen", code: "YE", currency: "YER", locale: "ar-YE" },

  // Europe
  { name: "Albania", code: "AL", currency: "ALL", locale: "sq-AL" },
  { name: "Andorra", code: "AD", currency: "EUR", locale: "ca-AD" },
  { name: "Austria", code: "AT", currency: "EUR", locale: "de-AT" },
  { name: "Belarus", code: "BY", currency: "BYN", locale: "be-BY" },
  { name: "Belgium", code: "BE", currency: "EUR", locale: "nl-BE" },
  { name: "Bosnia and Herzegovina", code: "BA", currency: "BAM", locale: "bs-BA" },
  { name: "Bulgaria", code: "BG", currency: "BGN", locale: "bg-BG" },
  { name: "Croatia", code: "HR", currency: "EUR", locale: "hr-HR" },
  { name: "Czech Republic", code: "CZ", currency: "CZK", locale: "cs-CZ" },
  { name: "Denmark", code: "DK", currency: "DKK", locale: "da-DK" },
  { name: "Estonia", code: "EE", currency: "EUR", locale: "et-EE" },
  { name: "Finland", code: "FI", currency: "EUR", locale: "fi-FI" },
  { name: "France", code: "FR", currency: "EUR", locale: "fr-FR" },
  { name: "Germany", code: "DE", currency: "EUR", locale: "de-DE" },
  { name: "Greece", code: "GR", currency: "EUR", locale: "el-GR" },
  { name: "Hungary", code: "HU", currency: "HUF", locale: "hu-HU" },
  { name: "Iceland", code: "IS", currency: "ISK", locale: "is-IS" },
  { name: "Ireland", code: "IE", currency: "EUR", locale: "en-IE" },
  { name: "Italy", code: "IT", currency: "EUR", locale: "it-IT" },
  { name: "Kosovo", code: "XK", currency: "EUR", locale: "sq-XK" },
  { name: "Latvia", code: "LV", currency: "EUR", locale: "lv-LV" },
  { name: "Liechtenstein", code: "LI", currency: "CHF", locale: "de-LI" },
  { name: "Lithuania", code: "LT", currency: "EUR", locale: "lt-LT" },
  { name: "Luxembourg", code: "LU", currency: "EUR", locale: "lb-LU" },
  { name: "Malta", code: "MT", currency: "EUR", locale: "mt-MT" },
  { name: "Moldova", code: "MD", currency: "MDL", locale: "ro-MD" },
  { name: "Monaco", code: "MC", currency: "EUR", locale: "fr-MC" },
  { name: "Montenegro", code: "ME", currency: "EUR", locale: "sr-ME" },
  { name: "Netherlands", code: "NL", currency: "EUR", locale: "nl-NL" },
  { name: "North Macedonia", code: "MK", currency: "MKD", locale: "mk-MK" },
  { name: "Norway", code: "NO", currency: "NOK", locale: "nb-NO" },
  { name: "Poland", code: "PL", currency: "PLN", locale: "pl-PL" },
  { name: "Portugal", code: "PT", currency: "EUR", locale: "pt-PT" },
  { name: "Romania", code: "RO", currency: "RON", locale: "ro-RO" },
  { name: "Russia", code: "RU", currency: "RUB", locale: "ru-RU" },
  { name: "San Marino", code: "SM", currency: "EUR", locale: "it-SM" },
  { name: "Serbia", code: "RS", currency: "RSD", locale: "sr-RS" },
  { name: "Slovakia", code: "SK", currency: "EUR", locale: "sk-SK" },
  { name: "Slovenia", code: "SI", currency: "EUR", locale: "sl-SI" },
  { name: "Spain", code: "ES", currency: "EUR", locale: "es-ES" },
  { name: "Sweden", code: "SE", currency: "SEK", locale: "sv-SE" },
  { name: "Switzerland", code: "CH", currency: "CHF", locale: "de-CH" },
  { name: "Ukraine", code: "UA", currency: "UAH", locale: "uk-UA" },
  { name: "United Kingdom", code: "GB", currency: "GBP", locale: "en-GB" },
  { name: "Vatican City", code: "VA", currency: "EUR", locale: "it-VA" },

  // Americas
  { name: "Antigua and Barbuda", code: "AG", currency: "XCD", locale: "en-AG" },
  { name: "Argentina", code: "AR", currency: "ARS", locale: "es-AR" },
  { name: "Bahamas", code: "BS", currency: "BSD", locale: "en-BS" },
  { name: "Barbados", code: "BB", currency: "BBD", locale: "en-BB" },
  { name: "Belize", code: "BZ", currency: "BZD", locale: "en-BZ" },
  { name: "Bolivia", code: "BO", currency: "BOB", locale: "es-BO" },
  { name: "Brazil", code: "BR", currency: "BRL", locale: "pt-BR" },
  { name: "Canada", code: "CA", currency: "CAD", locale: "en-CA" },
  { name: "Chile", code: "CL", currency: "CLP", locale: "es-CL" },
  { name: "Colombia", code: "CO", currency: "COP", locale: "es-CO" },
  { name: "Costa Rica", code: "CR", currency: "CRC", locale: "es-CR" },
  { name: "Cuba", code: "CU", currency: "CUP", locale: "es-CU" },
  { name: "Dominica", code: "DM", currency: "XCD", locale: "en-DM" },
  { name: "Dominican Republic", code: "DO", currency: "DOP", locale: "es-DO" },
  { name: "Ecuador", code: "EC", currency: "USD", locale: "es-EC" },
  { name: "El Salvador", code: "SV", currency: "USD", locale: "es-SV" },
  { name: "Grenada", code: "GD", currency: "XCD", locale: "en-GD" },
  { name: "Guatemala", code: "GT", currency: "GTQ", locale: "es-GT" },
  { name: "Guyana", code: "GY", currency: "GYD", locale: "en-GY" },
  { name: "Haiti", code: "HT", currency: "HTG", locale: "fr-HT" },
  { name: "Honduras", code: "HN", currency: "HNL", locale: "es-HN" },
  { name: "Jamaica", code: "JM", currency: "JMD", locale: "en-JM" },
  { name: "Mexico", code: "MX", currency: "MXN", locale: "es-MX" },
  { name: "Nicaragua", code: "NI", currency: "NIO", locale: "es-NI" },
  { name: "Panama", code: "PA", currency: "PAB", locale: "es-PA" },
  { name: "Paraguay", code: "PY", currency: "PYG", locale: "es-PY" },
  { name: "Peru", code: "PE", currency: "PEN", locale: "es-PE" },
  { name: "Saint Kitts and Nevis", code: "KN", currency: "XCD", locale: "en-KN" },
  { name: "Saint Lucia", code: "LC", currency: "XCD", locale: "en-LC" },
  { name: "Saint Vincent and the Grenadines", code: "VC", currency: "XCD", locale: "en-VC" },
  { name: "Suriname", code: "SR", currency: "SRD", locale: "nl-SR" },
  { name: "Trinidad and Tobago", code: "TT", currency: "TTD", locale: "en-TT" },
  { name: "United States", code: "US", currency: "USD", locale: "en-US" },
  { name: "Uruguay", code: "UY", currency: "UYU", locale: "es-UY" },
  { name: "Venezuela", code: "VE", currency: "VES", locale: "es-VE" },

  // Africa
  { name: "Algeria", code: "DZ", currency: "DZD", locale: "ar-DZ" },
  { name: "Angola", code: "AO", currency: "AOA", locale: "pt-AO" },
  { name: "Benin", code: "BJ", currency: "XOF", locale: "fr-BJ" },
  { name: "Botswana", code: "BW", currency: "BWP", locale: "en-BW" },
  { name: "Burkina Faso", code: "BF", currency: "XOF", locale: "fr-BF" },
  { name: "Burundi", code: "BI", currency: "BIF", locale: "fr-BI" },
  { name: "Cameroon", code: "CM", currency: "XAF", locale: "fr-CM" },
  { name: "Cape Verde", code: "CV", currency: "CVE", locale: "pt-CV" },
  { name: "Central African Republic", code: "CF", currency: "XAF", locale: "fr-CF" },
  { name: "Chad", code: "TD", currency: "XAF", locale: "fr-TD" },
  { name: "Comoros", code: "KM", currency: "KMF", locale: "ar-KM" },
  { name: "Congo", code: "CG", currency: "XAF", locale: "fr-CG" },
  { name: "Democratic Republic of the Congo", code: "CD", currency: "CDF", locale: "fr-CD" },
  { name: "Djibouti", code: "DJ", currency: "DJF", locale: "fr-DJ" },
  { name: "Egypt", code: "EG", currency: "EGP", locale: "ar-EG" },
  { name: "Equatorial Guinea", code: "GQ", currency: "XAF", locale: "es-GQ" },
  { name: "Eritrea", code: "ER", currency: "ERN", locale: "ti-ER" },
  { name: "Eswatini", code: "SZ", currency: "SZL", locale: "en-SZ" },
  { name: "Ethiopia", code: "ET", currency: "ETB", locale: "am-ET" },
  { name: "Gabon", code: "GA", currency: "XAF", locale: "fr-GA" },
  { name: "Gambia", code: "GM", currency: "GMD", locale: "en-GM" },
  { name: "Ghana", code: "GH", currency: "GHS", locale: "en-GH" },
  { name: "Guinea", code: "GN", currency: "GNF", locale: "fr-GN" },
  { name: "Guinea-Bissau", code: "GW", currency: "XOF", locale: "pt-GW" },
  { name: "Ivory Coast", code: "CI", currency: "XOF", locale: "fr-CI" },
  { name: "Kenya", code: "KE", currency: "KES", locale: "sw-KE" },
  { name: "Lesotho", code: "LS", currency: "LSL", locale: "en-LS" },
  { name: "Liberia", code: "LR", currency: "LRD", locale: "en-LR" },
  { name: "Libya", code: "LY", currency: "LYD", locale: "ar-LY" },
  { name: "Madagascar", code: "MG", currency: "MGA", locale: "mg-MG" },
  { name: "Malawi", code: "MW", currency: "MWK", locale: "en-MW" },
  { name: "Mali", code: "ML", currency: "XOF", locale: "fr-ML" },
  { name: "Mauritania", code: "MR", currency: "MRU", locale: "ar-MR" },
  { name: "Mauritius", code: "MU", currency: "MUR", locale: "en-MU" },
  { name: "Morocco", code: "MA", currency: "MAD", locale: "ar-MA" },
  { name: "Mozambique", code: "MZ", currency: "MZN", locale: "pt-MZ" },
  { name: "Namibia", code: "NA", currency: "NAD", locale: "en-NA" },
  { name: "Niger", code: "NE", currency: "XOF", locale: "fr-NE" },
  { name: "Nigeria", code: "NG", currency: "NGN", locale: "en-NG" },
  { name: "Rwanda", code: "RW", currency: "RWF", locale: "rw-RW" },
  { name: "Sao Tome and Principe", code: "ST", currency: "STN", locale: "pt-ST" },
  { name: "Senegal", code: "SN", currency: "XOF", locale: "fr-SN" },
  { name: "Seychelles", code: "SC", currency: "SCR", locale: "en-SC" },
  { name: "Sierra Leone", code: "SL", currency: "SLL", locale: "en-SL" },
  { name: "Somalia", code: "SO", currency: "SOS", locale: "so-SO" },
  { name: "South Africa", code: "ZA", currency: "ZAR", locale: "en-ZA" },
  { name: "South Sudan", code: "SS", currency: "SSP", locale: "en-SS" },
  { name: "Sudan", code: "SD", currency: "SDG", locale: "ar-SD" },
  { name: "Tanzania", code: "TZ", currency: "TZS", locale: "sw-TZ" },
  { name: "Togo", code: "TG", currency: "XOF", locale: "fr-TG" },
  { name: "Tunisia", code: "TN", currency: "TND", locale: "ar-TN" },
  { name: "Uganda", code: "UG", currency: "UGX", locale: "en-UG" },
  { name: "Zambia", code: "ZM", currency: "ZMW", locale: "en-ZM" },
  { name: "Zimbabwe", code: "ZW", currency: "ZWL", locale: "en-ZW" },

  // Oceania
  { name: "Fiji", code: "FJ", currency: "FJD", locale: "en-FJ" },
  { name: "Kiribati", code: "KI", currency: "AUD", locale: "en-KI" },
  { name: "Marshall Islands", code: "MH", currency: "USD", locale: "en-MH" },
  { name: "Micronesia", code: "FM", currency: "USD", locale: "en-FM" },
  { name: "Nauru", code: "NR", currency: "AUD", locale: "en-NR" },
  { name: "Palau", code: "PW", currency: "USD", locale: "en-PW" },
  { name: "Papua New Guinea", code: "PG", currency: "PGK", locale: "en-PG" },
  { name: "Samoa", code: "WS", currency: "WST", locale: "sm-WS" },
  { name: "Solomon Islands", code: "SB", currency: "SBD", locale: "en-SB" },
  { name: "Tonga", code: "TO", currency: "TOP", locale: "to-TO" },
  { name: "Tuvalu", code: "TV", currency: "AUD", locale: "en-TV" },
  { name: "Vanuatu", code: "VU", currency: "VUV", locale: "bi-VU" },
];

// Helper function to search countries
export function searchCountries(query) {
  if (!query || query.trim() === "") {
    return COUNTRIES;
  }
  
  const lowerQuery = query.toLowerCase();
  return COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(lowerQuery) ||
    country.code.toLowerCase().includes(lowerQuery) ||
    country.currency.toLowerCase().includes(lowerQuery)
  );
}

// Helper function to get country by code
export function getCountryByCode(code) {
  return COUNTRIES.find(country => country.code === code);
}

// Helper function to get country by name
export function getCountryByName(name) {
  return COUNTRIES.find(country => country.name === name);
}

// Helper to format currency sample
export function formatCurrencySample(locale, currency, amount = 1234) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
}

# Comprehensive World Country Selector

## Overview
The Settings page now includes a comprehensive world country database with **195+ countries**, each with their proper currency code and locale information.

## Features

### 🌍 Full World Coverage
- **195+ countries** from all continents
- Asia Pacific (34 countries)
- Middle East (19 countries)
- Europe (44 countries)
- Americas (35 countries)
- Africa (54 countries)
- Oceania (12 countries)

### 🔍 Smart Search
- **Real-time search** as you type
- Search by country name, country code, or currency
- Shows up to 50 matching results
- Auto-applies settings on exact match

### 💱 Automatic Currency & Locale
When you select a country, it automatically sets:
- **Currency code** (ISO 4217)
- **Locale** (language-country format)
- **Country flag emoji** 
- **Sample currency formatting**

### 📊 Live Preview
- **Default view**: Shows 17 popular countries (Asia-focused + major currencies)
  - Southeast Asia: Malaysia, Singapore, Indonesia, Thailand, Philippines, Vietnam
  - East Asia: Japan, South Korea, China, Hong Kong, Taiwan
  - Others: India, Australia, United States, United Kingdom, Germany, Canada
- **Search mode**: Shows top 12 matching results
- Sample amount: 1234 in local currency format
- Updates dynamically as you search

## Usage

### Select a Country
1. Go to Settings → Region & Currency
2. Start typing a country name
3. See dropdown suggestions with flags and currencies
4. Select from list or type exact name
5. Settings auto-apply on exact match
6. Or click "Apply" button

### Search Examples
- Type "jap" → Shows Japan, Jamaica
- Type "USD" → Shows all countries using US Dollar
- Type "EU" → Shows European countries
- Type "MY" → Shows Malaysia

### Manual Override
If you need a specific currency not in the database:
1. Use "Custom currency code" field
2. Enter code (e.g., "BTC", "CUSTOM")
3. Click Save

## Database Structure

Each country entry includes:
```javascript
{
  name: "Malaysia",      // Full country name
  code: "MY",           // ISO 3166-1 alpha-2 code
  currency: "MYR",      // ISO 4217 currency code
  locale: "ms-MY"       // BCP 47 locale identifier
}
```

## Currency Formatting Examples

### Asia
- 🇲🇾 Malaysia: MYR 1,234
- 🇯🇵 Japan: ¥1,234
- 🇸🇬 Singapore: S$1,234
- 🇹🇭 Thailand: ฿1,234
- 🇮🇩 Indonesia: Rp1.234

### Europe
- 🇬🇧 United Kingdom: £1,234
- 🇪🇺 Euro countries: €1,234
- 🇨🇭 Switzerland: CHF 1,234
- 🇵🇱 Poland: 1 234 zł
- 🇷🇺 Russia: 1 234 ₽

### Americas
- 🇺🇸 United States: $1,234
- 🇨🇦 Canada: CA$1,234
- 🇧🇷 Brazil: R$ 1.234
- 🇲🇽 Mexico: $1,234
- 🇦🇷 Argentina: $ 1.234

### Africa
- 🇿🇦 South Africa: R 1,234
- 🇪🇬 Egypt: ج.م.‏ 1,234
- 🇳🇬 Nigeria: ₦1,234
- 🇰🇪 Kenya: KSh 1,234
- 🇲🇦 Morocco: 1 234 د.م.‏

## Implementation

### Files Created
- `src/utils/countries.js` - Database with 195+ countries

### Files Modified
- `src/components/Manage/Settings.jsx` - Updated country selector

### Key Functions

```javascript
// Search countries by any field
searchCountries(query)

// Get specific country
getCountryByCode("MY")
getCountryByName("Malaysia")

// Format currency sample
formatCurrencySample("ms-MY", "MYR", 1234) // "MYR 1,234"
```

## Data Sources
- **ISO 3166-1**: Country codes (alpha-2)
- **ISO 4217**: Currency codes  
- **BCP 47**: Locale identifiers
- **Unicode CLDR**: Currency formatting

## Benefits

✅ **No hardcoding** - All countries in database  
✅ **Automatic formatting** - Uses browser's Intl API  
✅ **Type-to-search** - Fast country selection  
✅ **Accurate data** - Based on ISO standards  
✅ **Easy maintenance** - Single source of truth  
✅ **Extensible** - Easy to add custom currencies  

## Future Enhancements

### Potential Additions
1. **Regional grouping** - Group by continent in dropdown
2. **Popular countries first** - Show frequently used at top
3. **Currency symbols** - Display proper symbol (¥, €, £)
4. **Multiple currencies** - Countries with multiple currencies
5. **Historical data** - Support for discontinued currencies
6. **Cryptocurrency** - Add BTC, ETH, etc.

## Notes

- Some countries use shared currencies (e.g., EUR, XCD, USD)
- Locale format is language-COUNTRY (e.g., en-US, ms-MY)
- Currency formatting respects locale's number format
- Fallback formatting if Intl.NumberFormat fails
- Search is case-insensitive
- Results limited to 50 for performance

# Caris Kuji App

> **Created by [Kyros Koh](https://github.com/kyroskoh)**

A multilingual gacha prize drawing application for Carol x Iris (CARIS) merchandise, built with React, Vite, and Tailwind CSS.

## Features

- **Prize Drawing System**: Weighted random engine with configurable tiers (Tier S and beyond) plus fan/session metadata.
- **Advanced Weight Modes**: Switch between basic (weight-only) and advanced (weight × quantity) probability calculations.
- **Customizable Tier Palette**: Choose from 30 curated color swatches per tier, reflected across chips, badges, and tables.
- **Country & Currency Presets**: Region-aware settings with emoji flags, locale formatting, and custom currency overrides.
- **History Tracking**: Search, filter, and review draw sessions with fan names, queue numbers, and per-tier tallies.
- **Sample Data Import**: Built-in CSV samples for prizes and pricing to bootstrap offline events quickly.
- **Data Export/Import**: Export CSV backups before resetting sessions, and re-import to restore state.
- **Responsive UI**: Tailwind-powered layout tuned for tablets, laptops, and widescreen kiosks.

## Technology Stack

- **Frontend**: React 18 + React Router 7
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **State & Storage**: React hooks with LocalForage persistence
- **Animation**: Framer Motion
- **CSV Handling**: PapaParse

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   `ash
   git clone https://github.com/kyroskoh/caris-kuji-app.git
   cd caris-kuji-app
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Start the development server:
   `ash
   npm run dev
   `
4. Open your browser and navigate to http://localhost:5173

### Building for Production

`ash
npm run build
`

The optimized bundle will be emitted to the dist/ directory.

## Using the App

### Settings Overview

The Settings page is grouped into four cards:

1. **Region & Currency** - Search for a country (emoji flag included), auto-fill locale and currency, or override with a custom 3-5 letter code.
2. **Weight Engine** - Toggle between basic (weight-only) and advanced (weight × quantity × tier priority) probability engines; the active mode is shown in the Admin panels.
3. **Tier Color Palette** - Select Tier S through Tier D (and beyond), assign one of 30 swatches, or add custom tier codes.
4. **Maintenance** - Export everything, reset session data, or reset the counter—confirmation dialogs remind you to back up first.

When advanced weighting is enabled, the **Prize Pool** tab shows probability guidance that compares current odds vs. stock ratios.

### Prize Pool Management

1. Navigate to **Admin > Prize Pool**.
2. Import the new sample CSV (tiers S through L) or add entries manually; SKUs are optional.
3. Adjust tier, quantity, and weight—advanced mode factors tier priority and remaining quantity automatically.
4. Save to persist in local storage.

### Pricing Presets

1. Go to **Admin > Pricing & Bonus**.
2. Load the sample CSV or configure draw bundles in whole dollars.
3. The currency label auto-adapts to the region set in Settings.

### Running Draws

1. Open the **Draw** page.
2. Enter the fan name (required) and optional queue number.
3. Choose a preset or custom draw count and start the session.
4. Results animate in, with tier chips reflecting your palette and draw metadata pinned at the top.

### History & Exports

1. Click **History** to open the overlay and search by fan, tier, prize, or queue.
2. Review fan/session details and per-tier counts; use **Open** to view a printable log in a new tab.
3. Export data from the Admin tabs before resetting sessions.

## Configuration Notes

- **CSV Format** - Pricing uses whole-dollar amounts (price column). Legacy price_minor columns are still parsed and converted.
- **Tier Ordering** - Tier S is preconfigured as the top tier; additional tiers follow the custom ordering helper.
- **Emoji Flags** - Flags are derived from ISO country codes to avoid mojibake (for example, MY ? ????, SG ? ????).

## License

MIT License - see LICENSE for details.

## Acknowledgments

Built with care for the Carol x Iris community.
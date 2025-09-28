# Caris Kuji App

> **Created by [Kyros Koh](https://github.com/kyroskoh)**

A multilingual gacha prize drawing application for Carol x Iris (Caris) merchandise, built with React, Vite, and Tailwind CSS.

## Features

- **Prize Drawing System**: Weighted random drawing system with configurable prize tiers
- **Multilingual Support**: Full support for English, Simplified Chinese, and Traditional Chinese
- **Advanced Weight Calculation**: Choose between basic and advanced probability calculation modes
- **Customizable Tier Colors**: Personalize the color scheme for each prize tier
- **History Tracking**: Search and filter through draw history with detailed records
- **Country Flag Support**: Display country flags using emoji
- **Data Export/Import**: Export and import data for backup and migration
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: React 18 with React Router
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Hooks and Context API
- **Storage**: LocalForage for persistent local storage
- **Animation**: Framer Motion
- **CSV Handling**: Papa Parse
- **Internationalization**: Custom i18n implementation

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/caris-kuji-app.git
   cd caris-kuji-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Usage

### Prize Pool Management

1. Navigate to the Admin page
2. Select the "Prize Pool" tab
3. Import a CSV file or add prizes manually
4. Configure prize tiers, quantities, and weights

### Drawing Prizes

1. Navigate to the Draw page
2. Enter fan name and optional queue number
3. Select the number of draws
4. Click "Start Draw" to reveal prizes

### Viewing History

1. Click the "History" button on the Draw page
2. Use the search and filter options to find specific draws
3. Click the "Open in New Tab" button for a detailed view

## Configuration

### Weight Calculation Modes

- **Basic Mode**: Each prize's weight is used directly without considering quantity
- **Advanced Mode**: Total probability is calculated as weight × quantity for each prize

### Tier Colors

Customize the color scheme for each prize tier in the Settings page.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built for Caris (Carol × Iris) merchandise events
- Special thanks to all contributors and supporters

Made with ❤️ by [Kyros Koh](https://github.com/kyroskoh)

# Ignite UI SassDoc Theme

[![npm version](https://badge.fury.io/js/igniteui-sassdoc-theme.svg)](https://badge.fury.io/js/igniteui-sassdoc-theme)

A specialized SassDoc theme built specifically for **Infragistics' Ignite UI** component libraries. This theme generates comprehensive, searchable documentation websites for Sass/SCSS APIs with integrated Infragistics branding, global navigation, and enhanced user experience features.

## Overview

This package provides a complete documentation generation solution tailored to Infragistics' Ignite UI ecosystem, including:

- **Custom SassDoc Theme**: Built with Astro and TypeScript for modern, fast documentation sites
- **Infragistics Branding**: The Infragistics.com header and footer, embedded at build time, and styling consistent with Infragistics websites
- **Enhanced Search**: Full-text search powered by Pagefind 2 and its component UI
- **Responsive Design**: Mobile-first responsive layout using Ignite UI theming system
- **Multi-language Support**: Built-in internationalization support (English/Japanese)
- **Plugin Architecture**: Extensible plugin system for custom functionality

The theme transforms Sass documentation comments into professional, interactive documentation websites like the [Ignite UI for Angular Sass API docs](https://www.infragistics.com/products/ignite-ui-angular/docs/sass/latest/).

## Features

### 🎨 **Ignite UI Integration**
- Seamless integration with Infragistics' design system and theming
- The same header and footer as Infragistics.com and the Ignite UI documentation, embedded at build time (nothing is fetched from the marketing site at runtime)
- "View code" links to the documented item's source on GitHub
- Consistent styling with other Ignite UI documentation

### 🔍 **Advanced Search**
- Full-text search across all documentation content
- Real-time search with highlighted results and per-item sub-results (each mixin, function and variable links to its own section)
- Search dialog with keyboard navigation (`Ctrl`/`Cmd` + `K`)

### 📱 **Modern Architecture**
- Built with Astro for optimal performance and SEO
- Component-based architecture with reusable UI elements
- Static site generation with fast client-side navigation

### 🌐 **Internationalization**
- Support for multiple languages (English, Japanese)
- Localized navigation and UI elements
- Language-specific metadata and content

### 🔧 **Developer Experience**
- Plugin system for extending functionality
- TypeScript support throughout
- Hot module replacement during development
- Comprehensive error handling and logging

## Installation

```bash
npm install igniteui-sassdoc-theme
```

## Usage

### Basic Configuration

Create a `sassdoc.config.json` file in your project:

```json
{
  "theme": "igniteui-sassdoc-theme",
  "dest": "./docs",
  "autofill": ["throw", "content"],
  "display": {
    "alias": true,
    "access": ["public", "private"]
  }
}
```

### Generate Documentation

```bash
# Using SassDoc CLI
sassdoc src/scss -c sassdoc.config.json

# Using npm script
npm run compile
```

## Configuration Options

The theme accepts standard SassDoc configuration plus additional options:

```json
{
  "theme": "igniteui-sassdoc-theme",
  "dest": "./docs",
  "language": "en",
  "environment": "production",
  "display": {
    "access": ["public", "private"],
    "alias": true,
    "watermark": false
  },
  "groups": {
    "undefined": "utilities"
  },
  "plugins": [
    {
      "name": "custom-plugin",
      "path": "./plugins/custom-plugin.js",
      "options": {}
    }
  ]
}
```

### Theme-Specific Options

- `language`: Documentation language (`"en"` or `"ja"`)
- `environment`: Build environment (`"production"`, `"staging"` or `"development"`). Selects the Infragistics URLs, analytics ID and versions feed, and which header/footer snapshot is embedded (`staging` uses the staging snapshot, everything else the production one)
- `plugins`: Array of plugin configurations for extending functionality

### Source Code Links

Each item gets a "View code" link built from its `@package` annotation and its file path relative to the documented source root:

| `@package`          | Links to                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `theming`           | `IgniteUI/igniteui-theming` → `packages/theming/sass/`                                        |
| none / `auto`       | `IgniteUI/igniteui-angular` → `projects/igniteui-angular/core/src/core/styles/`               |

The source roots are defined in `src/content.config.ts`. Paths are normalized to forward slashes, so documentation built on Windows produces valid links.

### Header and Footer

English builds embed a snapshot of the header and footer the marketing site exports at `/assets/chrome/fragment.html`, the same one igniteui-documentation uses. The snapshots are committed in `ig-chrome/production` and `ig-chrome/staging` and ship with the package; their CSS, JS and images are copied into the generated site under `_ig-chrome/<build>/`.

Japanese builds keep the legacy header and footer, fetched from the `navigationURL` in `src/utils/sources.json`, until a Japanese fragment is published.

## Development

### Prerequisites

- Node.js `^22.23.4`, `^24.15.0` or `>=26` (required by Astro 7 and jsdom)
- npm 9.6.5+

### Setup

```bash
# Clone the repository
git clone https://github.com/IgniteUI/igniteui-sassdoc-theme.git
cd igniteui-sassdoc-theme

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build Process

```bash
# Build SCSS assets
npm run scss:build

# Build the theme
npm run build

# Test with sample documentation
npm run compile

# Build the sample documentation and serve it under its production base path
npm run serve

# Refresh the embedded header/footer snapshots from the marketing site
npm run chrome:sync
```

`npm run chrome:sync` writes nothing when a snapshot's build hash is unchanged. To sync a single snapshot, or from a local marketing build:

```bash
node scripts/chrome-sync.js --source <url | path/to/dist/assets/chrome/fragment.html> --out ig-chrome/staging
```

### Project Structure

```
src/
├── components/          # Astro UI components
├── layouts/            # Page layouts
├── pages/              # Route pages
├── styles/             # Global styles and theming
├── utils/              # Utility functions
├── integrations/       # Astro integrations (ig-chrome header/footer)
├── i18n/              # Internationalization files
├── content.config.ts  # Content collections and source code link roots
├── theme.ts           # Main theme entry point
└── annotations.ts     # Custom SassDoc annotations

ig-chrome/
├── production/        # Header/footer snapshot from www.infragistics.com
└── staging/           # Header/footer snapshot from astro-staging.infragistics.com

scripts/
└── chrome-sync.js     # Refreshes the ig-chrome snapshots

data/
├── navigation.json    # Legacy navigation data (Japanese builds)
└── sassdoc-data.json  # Generated documentation data
```

## Plugin Development

The theme supports a plugin architecture for extending functionality:

```javascript
// Example plugin
export default function customPlugin(options = {}) {
  return {
    name: 'custom-plugin',
    
    // Hook: before data processing
    beforeProcess(ctx) {
      // Modify context before processing
      return false; // Return true to terminate processing
    },
    
    // Hook: after data processing
    afterProcess(ctx) {
      // Modify processed data
    },
    
    // Hook: before site build
    beforeBuild(ctx) {
      // Pre-build modifications
    },
    
    // Hook: after site build
    afterBuild(ctx) {
      // Post-build operations
    }
  };
}
```

## Contributing

This theme is specifically designed for Infragistics' Ignite UI documentation needs. For questions or contributions related to Ignite UI integration, please contact the Infragistics development team.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built for Infragistics Ignite UI** | [Documentation](https://www.infragistics.com/products/ignite-ui-angular/docs/sass/latest/) | [Ignite UI](https://www.infragistics.com/products/ignite-ui)

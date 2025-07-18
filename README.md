# Ignite UI SassDoc Theme

[![npm version](https://badge.fury.io/js/igniteui-sassdoc-theme.svg)](https://badge.fury.io/js/igniteui-sassdoc-theme)

A specialized SassDoc theme built specifically for **Infragistics' Ignite UI** component libraries. This theme generates comprehensive, searchable documentation websites for Sass/SCSS APIs with integrated Infragistics branding, global navigation, and enhanced user experience features.

## Overview

This package provides a complete documentation generation solution tailored to Infragistics' Ignite UI ecosystem, including:

- **Custom SassDoc Theme**: Built with Astro and TypeScript for modern, fast documentation sites
- **Infragistics Branding**: Integrated global navigation, footer, and styling consistent with Infragistics websites
- **Enhanced Search**: Full-text search capabilities powered by Pagefind
- **Responsive Design**: Mobile-first responsive layout using Ignite UI theming system
- **Multi-language Support**: Built-in internationalization support (English/Japanese)
- **Plugin Architecture**: Extensible plugin system for custom functionality

The theme transforms Sass documentation comments into professional, interactive documentation websites like the [Ignite UI for Angular Sass API docs](https://www.infragistics.com/products/ignite-ui-angular/docs/sass/latest/).

## Features

### 🎨 **Ignite UI Integration**
- Seamless integration with Infragistics' design system and theming
- Global navigation and footer matching Infragistics.com
- Consistent styling with other Ignite UI documentation

### 🔍 **Advanced Search**
- Full-text search across all documentation content
- Real-time search with highlighted results
- Search dialog with keyboard navigation

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
- `environment`: Build environment (`"production"` or `"development"`)
- `plugins`: Array of plugin configurations for extending functionality

## Development

### Prerequisites

- Node.js 18+ 
- npm 7+

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
```

### Project Structure

```
src/
├── components/          # Astro UI components
├── layouts/            # Page layouts
├── pages/              # Route pages
├── styles/             # Global styles and theming
├── utils/              # Utility functions
├── i18n/              # Internationalization files
├── theme.ts           # Main theme entry point
└── annotations.ts     # Custom SassDoc annotations

data/
├── navigation.json    # Global navigation data
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

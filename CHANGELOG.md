# Changelog

All notable changes to this project are documented in this file.

## 3.0.0

### Breaking Changes

- Requires Node.js `^22.23.4`, `^24.15.0` or `>=26.0.0` (Astro 7 and jsdom 30).
- Upgraded to Astro 7 and Pagefind 2. The search dialog now uses the Pagefind component UI, so custom styles targeting the old `.pagefind-ui__*` classes no longer apply.
- English builds no longer fetch the header and footer from `/navigation`; they render the snapshot bundled with the theme. Japanese builds keep the legacy header and footer.
- The page header is split into `.main-nav` (Infragistics navigation) and `.main-head` (the sticky sub-header).

### Features

- Embedded the Infragistics header and footer at build time from a snapshot of the marketing site's `ig-chrome` export, the same one the Ignite UI documentation uses. The SassDoc `environment` option selects the production or staging snapshot.
- Aligned the UI with the Ignite UI documentation: palette, typography, border radii, sub-header, sidebar navigation, search dialog and Dark+ code blocks.
- Search results list matching mixins, functions and variables under each group.

### Bug Fixes

- "View code" links point to the igniteui-theming monorepo (`packages/theming/sass`) and the current igniteui-angular styles location, and use forward slashes when the docs are built on Windows.
- The prerender build bundles Astro's dependencies, so building inside a project that hoists older versions (e.g. `cookie`) no longer fails.
- Pages no longer overflow the viewport on small screens.

### Security

- Updated all dependencies, resolving the Astro and sharp advisories reported against consumers of 2.x. Runtime dependencies have no known vulnerabilities.

### Development

- `npm run chrome:sync` refreshes the header and footer snapshots; it only fetches from the allowed Infragistics hosts.
- `npm run serve` serves the sample site under its production base path.
- `npm run dev` stops the Sass watcher together with the dev server.
- CI tests Node 22, 24 and 26 and builds the sample site; releases are built and smoke-tested before publishing.

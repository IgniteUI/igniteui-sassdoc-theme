import { defineConfig } from "astro/config";
import type { AstroIntegration } from "astro";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import { igChrome } from "./src/integrations/ig-chrome";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "/"
    : "/products/ignite-ui-angular/docs/sass/latest/";

// Set by the theme from the SassDoc `environment` option.
const chromeSnapshot =
  process.env.SASSDOC_ENV === "staging"
    ? "./ig-chrome/staging"
    : "./ig-chrome/production";

/**
 * Self-contained prerender bundle for builds: when the theme runs inside a
 * consuming project (or outside its cwd, where Astro falls back to <cwd>/.astro),
 * bare imports of Astro's own dependencies would otherwise resolve whatever
 * versions that project has hoisted (e.g. an old `cookie`).
 * Build only: the dev server's module runner can't load bundled CommonJS.
 */
const bundlePrerender: AstroIntegration = {
  name: "igniteui:bundle-prerender",
  hooks: {
    "astro:config:setup"({ command, updateConfig }) {
      if (command === "build") {
        updateConfig({
          vite: {
            environments: { prerender: { resolve: { noExternal: true } } },
          },
        });
      }
    },
  },
};

export default defineConfig({
  base: baseUrl,
  output: "static",
  outDir: "./site",
  build: {
    assets: "_assets",
    format: "directory",
  },
  integrations: [
    expressiveCode({
      themes: ["github-light"],
      styleOverrides: {
        borderRadius: "0",
        borderWidth: "1px",
        borderColor: "var(--ig-gray-300)",
        frames: {
          shadowColor: "none",
        },
      },
      shiki: {
        bundledLangs: ["scss", "html"],
        engine: "oniguruma",
      },
      defaultProps: {
        wrap: true,
      },
    }),
    pagefind(),
    igChrome({ snapshot: chromeSnapshot }),
    bundlePrerender,
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true,
          loadPaths: ["./node_modules/"],
        },
      },
    },
  },
});

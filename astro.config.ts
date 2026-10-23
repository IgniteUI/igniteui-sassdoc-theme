import { defineConfig } from "astro/config";
import type { AstroIntegration } from "astro";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";
import { igChrome } from "./src/integrations/ig-chrome";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "/"
    : "/products/ignite-ui-angular/docs/sass/latest/";

const chromeSnapshot =
  process.env.SASSDOC_ENV === "staging"
    ? "./ig-chrome/staging"
    : "./ig-chrome/production";

// Bundle Astro's dependencies into the prerender build, so they don't resolve to
// incompatible versions hoisted by the consuming project. Build only: dev can't load bundled CJS.
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
      themes: ["dark-plus"],
      styleOverrides: {
        borderRadius: "var(--igd-border-radius)",
        borderWidth: "1px",
        borderColor: "var(--igd-app-outline-color)",
        codeFontFamily: "var(--igd-font-mono)",
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

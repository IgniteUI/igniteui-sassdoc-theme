import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "/"
    : "/products/ignite-ui-angular/docs/sass/latest/";

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

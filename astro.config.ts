import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import pagefind from "astro-pagefind";

export default defineConfig({
  output: "static",
  outDir: "./site",
  build: {
    assets: "_assets",
    format: "file",
  },
  integrations: [
    expressiveCode({
      themes: ["rose-pine-moon"],
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

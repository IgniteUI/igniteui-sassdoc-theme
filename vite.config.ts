import { dirname, join, resolve } from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  publicDir: false,
  build: {
    sourcemap: false,
    lib: {
      entry: resolve(join(__dirname, "src", "index.ts")),
      name: "IgniteUISassdocTheme",
      fileName: () => `index.js`,
      formats: ["cjs"],
    },
    rollupOptions: {
      platform: "node",
      external: ["astro", "fs-extra", "jsdom", "path", "child_process", "url"],
    },
  },
});

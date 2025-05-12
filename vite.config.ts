import { dirname, join, resolve } from "path";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_EXCLUDE = [
  "!**/theme.ts",
  "!**/package.json",
  "!**/index.ts",
  "!**/annotations.ts",
];

export default defineConfig({
  publicDir: false,
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "astro.config.ts",
          dest: "./",
        },
        {
          src: "schema/sassdoc-schema.json",
          dest: "./",
        },
        {
          src: "src/package.json",
          dest: "./",
        },
        {
          src: [normalizePath(join("src", "*"))].concat(SRC_EXCLUDE),
          dest: "./src",
        },
      ],
    }),
  ],
  build: {
    sourcemap: false,
    lib: {
      entry: resolve(join(__dirname, "src", "index.ts")),
      name: "IgniteUISassdocTheme",
      fileName: () => `index.js`,
      formats: ["cjs"],
    },
    rollupOptions: {
      external: ["astro", "fs-extra", "jsdom", "path", "child_process", "url"],
    },
  },
});

import { dirname, join, resolve } from "path";
import { defineConfig, normalizePath } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SRC_EXCLUDE = [
  "!**/theme.ts",
  "!**/package.json",
  "!**/annotations.ts",
  "!**/*.scss",
];

export default defineConfig({
  publicDir: false,
  plugins: [
    viteStaticCopy({
      structured: true,
      targets: [
        {
          src: "astro.config.ts",
          dest: "./",
        },
        {
          src: "web.config",
          dest: "./public/",
        },
        {
          src: "schema/sassdoc-schema.json",
          dest: "./",
        },
        {
          src: normalizePath(join("src", "**/*.astro")),
          dest: "./",
        },
        {
          src: [normalizePath(join("src", "**/*.ts"))].concat(SRC_EXCLUDE),
          dest: "./",
        },
        {
          src: normalizePath(join("src", "**/*.css")),
          dest: "./",
        },
        {
          src: [normalizePath(join("src", "**/*.json"))].concat(SRC_EXCLUDE),
          dest: "./",
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

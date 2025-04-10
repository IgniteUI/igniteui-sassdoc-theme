import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
          src: "tsconfig.json",
          dest: "./",
        },
        {
          src: "src/components",
          dest: "./src",
        },
        {
          src: "src/content",
          dest: "./src",
        },
        {
          src: "src/layouts",
          dest: "./src",
        },
        {
          src: "src/pages",
          dest: "./src",
        },
        {
          src: "src/pages",
          dest: "./src",
        },
        {
          src: "src/styles",
          dest: "./src",
        },
        {
          src: "src/package.json",
          dest: "./",
        },
      ],
    }),
  ],
  build: {
    sourcemap: false,
    lib: {
      entry: path.resolve(path.join(__dirname, "src", "index.ts")),
      name: "IgniteUISassdocTheme",
      fileName: () => `index.js`,
      formats: ["cjs"],
    },
    rollupOptions: {
      external: [
        "astro",
        "fs-extra",
        "path",
        "child_process",
        "url",
        "sassdoc-extras",
      ],
    },
  },
});

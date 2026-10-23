import fs from "fs-extra";
import { globSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const SRC_EXCLUDE = new Set([
  "src/theme.ts",
  "src/annotations.ts",
  "src/package.json",
]);

function copy(from, to = from) {
  fs.copySync(path.join(root, from), path.join(dist, to));
}

log("post-build", "Copying theme files to dist...");

copy("src/package.json", "package.json");
copy("astro.config.ts");
copy("web.config", "public/web.config");
copy("schema/sassdoc-schema.json");
copy("ig-chrome");

const sources = globSync("src/**/*.{astro,ts,css,json}", { cwd: root })
  .map((file) => file.split(path.sep).join("/"))
  .filter((file) => !SRC_EXCLUDE.has(file));

for (const file of sources) {
  copy(file);
}

log("post-build", "Operations completed successfully.");

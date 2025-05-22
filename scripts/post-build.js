import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { log } from "./logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log("post-build", "Copying package.json to dist...");

fs.copySync(
  path.resolve(__dirname, "../src/package.json"),
  path.resolve(__dirname, "../dist/package.json"),
);

log("post-build", "Operations completed successfully.");

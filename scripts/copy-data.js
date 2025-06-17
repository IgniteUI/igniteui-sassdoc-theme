import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { log, logError } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const paths = {
  pagefind: {
    source: path.join(projectRoot, "dist", "site", "pagefind"),
    dest: path.join(projectRoot, "public", "pagefind"),
  },
  sassdoc: {
    source: path.join(projectRoot, "dist", "data", "sassdoc-data.json"),
    dest: path.join(projectRoot, "data", "sassdoc-data.json"),
  },
  navigation: {
    source: path.join(projectRoot, "dist", "data", "navigation.json"),
    dest: path.join(projectRoot, "data", "navigation.json"),
  },
  versions: {
    source: path.join(projectRoot, "dist", "data", "versions.json"),
    dest: path.join(projectRoot, "data", "versions.json"),
  },
};

/**
 * Copies files from source to destination, replacing existing files if needed
 * @param {string} source - Source path
 * @param {string} dest - Destination path
 * @param {string} label - Label for logging
 * @returns {Promise<void>}
 */
async function copyFiles(source, dest, label) {
  try {
    if (!(await fs.pathExists(source))) {
      throw new Error(`Source path does not exist: ${source}`);
    }

    if (await fs.pathExists(dest)) {
      await fs.remove(dest);
    }

    await fs.copy(source, dest);
    log("script", `Successfully copied ${label}`);

    return true;
  } catch (error) {
    logError("error", `Failed to copy ${label}`, error);
    return false;
  }
}

async function main() {
  log("start", "Beginning copy operations");

  const results = await Promise.all([
    copyFiles(paths.sassdoc.source, paths.sassdoc.dest, "sassdoc data"),
    copyFiles(paths.navigation.source, paths.navigation.dest, "navigation"),
    copyFiles(paths.versions.source, paths.versions.dest, "versions"),
    copyFiles(paths.pagefind.source, paths.pagefind.dest, "pagefind"),
  ]);

  const successCount = results.filter(Boolean).length;
  const totalOperations = results.length;

  log("done", `Completed ${successCount}/${totalOperations} operations`);
  process.exit(successCount === totalOperations ? 0 : 1);
}

main().catch((error) => {
  logError("fatal", "Unhandled error in main process", error);
  process.exit(1);
});

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { getConfig } from "./config";
import type { Context } from "../content/sassdoc-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);
const OUT_PATH = path.join(projectRoot, "src", "data", "versions.json");

export async function fetchVersions(ctx: Context): Promise<void> {
  const { url, versions: dataURL } = getConfig(ctx.language, ctx.environment);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(dataURL, { signal: controller.signal });
    clearTimeout(timeout);

    const payload = await response.json();

    const versions = payload.folders
      .map((version: string) => ({
        version: version,
        url: `${url}/products/ignite-ui-angular/docs/${version}/sass/`,
      }))
      .reverse();

    fs.ensureDir(path.dirname(OUT_PATH));
    fs.writeJsonSync(OUT_PATH, {
      versions,
    });
  } catch (error) {
    console.error("Failed to fetch previous documentation versions.", error);

    fs.writeJsonSync(OUT_PATH, {
      versions: [
        {
          version: "0.0.0",
          url: "#",
        },
      ],
    });
  }
}

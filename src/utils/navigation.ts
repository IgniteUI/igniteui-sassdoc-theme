import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { getConfig } from "./config";
import type { Context } from "../content/sassdoc-schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname);
const OUT_PATH = path.join(projectRoot, "src", "data", "navigation.json");

export async function fetchNavigation(ctx: Context): Promise<void> {
  const { navigationURL } = getConfig(ctx.language, ctx.environment);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(navigationURL, { signal: controller.signal });
    clearTimeout(timeout);

    const html = await response.text();
    const dom = new JSDOM(html);

    const header =
      dom.window.document.querySelector("#header")?.outerHTML ?? null;
    const footer =
      dom.window.document.querySelector("footer")?.outerHTML ?? null;
    const copyright =
      dom.window.document.querySelector("#footer")?.outerHTML ?? null;

    fs.ensureDir(path.dirname(OUT_PATH));
    fs.writeJsonSync(OUT_PATH, {
      header,
      footer,
      copyright,
    });
  } catch (error) {
    console.error("Failed to fetch navigation parts.", error);

    fs.writeJsonSync(OUT_PATH, {
      header: "",
      footer: "",
      copyright: "",
    });
  }
}

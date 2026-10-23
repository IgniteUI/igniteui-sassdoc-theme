/**
 * `igChrome()` — render the Infragistics header and footer from a snapshot of
 * the marketing site's own export (see scripts/chrome-sync.js).
 *
 * Per build:
 *   - the snapshot is validated against the ig-chrome contract; a missing or
 *     broken snapshot fails the build;
 *   - the layout reads the parsed head/header/footer through the build-time
 *     `__IG_CHROME__` constant;
 *   - the CSS, JS and images are served from the generated site, under its base
 *     path: `{base}/_ig-chrome/{build}/…`. Nothing is loaded from the marketing
 *     host at runtime.
 *
 * SNAPSHOT LAYOUT:
 *   <snapshot>/manifest.json       contract, build hash, source, sync time
 *   <snapshot>/fragment.html       asset URLs written as %IG_CHROME_ASSETS%/…
 *   <snapshot>/assets/chrome.css
 *   <snapshot>/assets/chrome.js
 *   <snapshot>/assets/media/*
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import { parseFragment, ASSET_TOKEN, type ParsedFragment } from "./contract";

export interface IgChromeOptions {
  /** The snapshot folder, absolute or relative to the Astro project root. */
  snapshot: string;
}

export type IgChromeData = ParsedFragment;

const MIME: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

export function igChrome(options: IgChromeOptions): AstroIntegration {
  let assetsDir = "";
  let build = "";

  return {
    name: "igniteui:chrome",
    hooks: {
      "astro:config:setup"({ config, updateConfig, logger }) {
        const snapshotDir = path.resolve(
          fileURLToPath(config.root),
          options.snapshot,
        );
        const fragmentFile = path.join(snapshotDir, "fragment.html");
        assetsDir = path.join(snapshotDir, "assets");

        if (!fs.existsSync(fragmentFile)) {
          throw new Error(
            `[igniteui:chrome] no snapshot at ${snapshotDir}. Run \`npm run chrome:sync\` first.`,
          );
        }

        let parsed: ParsedFragment;

        try {
          parsed = parseFragment(fs.readFileSync(fragmentFile, "utf8"));
        } catch (err) {
          throw new Error(
            `[igniteui:chrome] the snapshot at ${snapshotDir} is invalid: ${(err as Error).message}`,
          );
        }

        for (const file of ["chrome.css", "chrome.js"]) {
          if (!parsed.head.includes(`${ASSET_TOKEN}/${file}`)) {
            throw new Error(
              `[igniteui:chrome] the snapshot at ${snapshotDir} does not load ${ASSET_TOKEN}/${file}. Run \`npm run chrome:sync\` again.`,
            );
          }

          if (!fs.existsSync(path.join(assetsDir, file))) {
            throw new Error(
              `[igniteui:chrome] the snapshot at ${snapshotDir} has no assets/${file}.`,
            );
          }
        }

        build = parsed.build;

        const base = (config.base || "/").replace(/\/+$/, "");
        const prefix = `${base}/_ig-chrome/${build}`;
        const resolve = (text: string) => text.split(ASSET_TOKEN).join(prefix);
        const data: IgChromeData = {
          ...parsed,
          head: resolve(parsed.head),
          header: resolve(parsed.header),
          footer: resolve(parsed.footer),
        };

        updateConfig({
          vite: {
            plugins: [
              {
                name: "igniteui:chrome-dev-assets",
                // Server environments only; the client never needs the snapshot.
                configEnvironment(name) {
                  if (name !== "client") {
                    return { define: { __IG_CHROME__: JSON.stringify(data) } };
                  }
                },
                // `astro dev`: serve the snapshot's assets at the URLs the build emits.
                configureServer(server) {
                  const prefixes = [`${prefix}/`, `/_ig-chrome/${build}/`];

                  server.middlewares.use((req, res, next) => {
                    const url = (req.url || "").split("?")[0];
                    const match = prefixes.find((p) => url.startsWith(p));

                    if (!match) return next();

                    const file = path.join(
                      assetsDir,
                      decodeURIComponent(url.slice(match.length)),
                    );
                    const relative = path.relative(assetsDir, file);

                    if (
                      !relative ||
                      relative.startsWith("..") ||
                      path.isAbsolute(relative) ||
                      !fs.statSync(file, { throwIfNoEntry: false })?.isFile()
                    ) {
                      return next();
                    }

                    res.setHeader(
                      "Content-Type",
                      MIME[path.extname(file).toLowerCase()] ??
                        "application/octet-stream",
                    );
                    fs.createReadStream(file).pipe(res);
                  });
                },
              },
            ],
          },
        });

        logger.info(`header/footer from snapshot build ${build}`);
      },

      "astro:build:done"({ dir }) {
        const target = path.join(fileURLToPath(dir), "_ig-chrome", build);
        fs.cpSync(assetsDir, target, { recursive: true });
      },
    },
  };
}

#!/usr/bin/env node
/**
 * Snapshots the marketing site's header/footer (fragment, CSS, JS and media) into ig-chrome/.
 *
 *   node scripts/chrome-sync.js                  # every target in TARGETS
 *   node scripts/chrome-sync.js --source <url | dist/assets/chrome/fragment.html> --out <dir>
 *   node scripts/chrome-sync.js ... --allow-missing --force
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseFragment, ASSET_TOKEN } from '../src/integrations/ig-chrome/contract.ts';

const MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_EXT = /\.(?:png|jpe?g|webp|avif|gif|svg|ico)$/i;

const TARGETS = [
  { source: 'https://www.infragistics.com/assets/chrome/fragment.html', out: 'ig-chrome/production' },
  { source: 'https://astro-staging.infragistics.com/assets/chrome/fragment.html', out: 'ig-chrome/staging' },
];

const ALLOWED_ORIGINS = new Set(TARGETS.map(({ source }) => new URL(source).origin));

class NotPublished extends Error {}

function parseArgs(argv) {
  const args = { source: '', out: '', force: false, allowMissing: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--source') args.source = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--force') args.force = true;
    else if (a === '--allow-missing') args.allowMissing = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!args.help && !!args.source !== !!args.out) {
    throw new Error('--source and --out go together (see --help).');
  }
  return args;
}

const isUrl = (s) => /^https?:\/\//i.test(s);

async function fetchBytes(url, { html = false } = {}) {
  const { origin } = new URL(url);
  if (!ALLOWED_ORIGINS.has(origin)) {
    throw new Error(`${url} is not on an allowed host (${[...ALLOWED_ORIGINS].join(', ')}).`);
  }
  let res;
  try {
    res = await fetch(url, {
      redirect: 'error', // never follow a redirect to another host
      headers: { 'User-Agent': 'igniteui-chrome-sync/1.0' },
    });
  } catch (err) {
    const cause = err.cause?.code || err.cause?.message || err.message;
    throw new Error(`${url} could not be reached (${cause})`);
  }
  if (res.status === 404 && html) throw new NotPublished(`${url} answered HTTP 404`);
  if (!res.ok) throw new Error(`${url} answered HTTP ${res.status}`);
  if (html) {
    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (type !== 'text/html') {
      throw new Error(`${url} answered with Content-Type '${type || '(none)'}', not text/html`);
    }
  }
  const length = Number(res.headers.get('content-length'));
  if (length > MAX_BYTES) throw new Error(`${url} is ${length} bytes, over the ${MAX_BYTES} limit`);
  const chunks = [];
  let size = 0;
  for await (const chunk of res.body ?? []) {
    size += chunk.length;
    if (size > MAX_BYTES) throw new Error(`${url} returned more than the ${MAX_BYTES} byte limit`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function makeReader(source) {
  if (isUrl(source)) {
    return {
      fragment: () => fetchBytes(source, { html: true }),
      asset: (url) => fetchBytes(url),
    };
  }
  const file = path.resolve(source);
  const distRoot = path.dirname(path.dirname(path.dirname(file))); // dist/assets/chrome/fragment.html -> dist
  return {
    fragment: async () => fs.readFileSync(file),
    asset: async (url) => {
      // Decoding can turn %2F into a separator; keep the result inside dist.
      const asset = path.join(distRoot, decodeURIComponent(new URL(url).pathname));
      const rel = path.relative(distRoot, asset);
      if (rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) {
        throw new Error(`The fragment links ${url}, which is outside ${distRoot}.`);
      }
      return fs.readFileSync(asset);
    },
  };
}

const mediaName = (pathname) =>
  (pathname.startsWith('/assets/chrome/media/')
    ? pathname.slice('/assets/chrome/media/'.length)
    : pathname.replace(/^\/+/, '')
  ).replace(/[^\w.-]+/g, '-');

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
    return;
  }

  const targets = args.source ? [{ source: args.source, out: args.out }] : TARGETS;
  for (const target of targets) {
    await sync({ ...args, ...target });
  }
}

async function sync(args) {
  const outDir = path.resolve(args.out);
  const read = makeReader(args.source);

  console.log(`[chrome-sync] ${args.out}: reading ${args.source}`);
  let html;
  try {
    html = (await read.fragment()).toString('utf8');
  } catch (err) {
    if (err instanceof NotPublished && args.allowMissing) {
      console.log(`[chrome-sync] ${args.out}: not published yet (${err.message}); keeping the current snapshot`);
      setOutputs({ changed: 'false', build: '' });
      return;
    }
    throw err;
  }
  const parsed = parseFragment(html);

  const manifestFile = path.join(outDir, 'manifest.json');
  const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;
  if (previous && previous.build === parsed.build && !args.force) {
    console.log(`[chrome-sync] ${args.out}: up to date, build ${parsed.build}`);
    setOutputs({ changed: 'false', build: parsed.build });
    return;
  }

  const cssUrl = /href="([^"]+\/chrome\.css)"/.exec(parsed.head)?.[1];
  const jsUrl = /src="([^"]+\/chrome\.js)"/.exec(parsed.head)?.[1];
  if (!cssUrl || !jsUrl) throw new Error("The fragment's head does not link chrome.css and chrome.js.");
  const origin = new URL(isUrl(args.source) ? args.source : cssUrl).origin;
  if (isUrl(args.source)) {
    for (const url of [cssUrl, jsUrl]) {
      if (new URL(url).origin !== origin) throw new Error(`The fragment links ${url}, which is not on ${origin}.`);
    }
  }

  const css = (await read.asset(cssUrl)).toString('utf8');
  const js = (await read.asset(jsUrl)).toString('utf8');

  const images = new Map(); // pathname -> media file name
  const collect = (text, pattern) => {
    for (const m of text.matchAll(pattern)) {
      const url = new URL(m[1].replace(/&amp;/g, '&'), origin);
      if (url.origin === origin && IMAGE_EXT.test(url.pathname)) images.set(url.pathname, mediaName(url.pathname));
    }
  };
  const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  collect(html, new RegExp(`(${escapedOrigin}/[^"'\\s)]+)`, 'g'));
  collect(css, /url\(\s*["']?(\/[^"')]+)["']?\s*\)/g);
  const names = [...images.values()];
  if (new Set(names).size !== names.length) throw new Error('Two of the images map to the same media file name.');

  const tmp = `${outDir}.tmp-${process.pid}`;
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.join(tmp, 'assets', 'media'), { recursive: true });

  for (const [pathname, name] of images) {
    fs.writeFileSync(path.join(tmp, 'assets', 'media', name), await read.asset(origin + pathname));
  }

  let fragment = html.replace(cssUrl, `${ASSET_TOKEN}/chrome.css`).replace(jsUrl, `${ASSET_TOKEN}/chrome.js`);
  let cssOut = css;
  for (const [pathname, name] of images) {
    fragment = fragment.split(origin + pathname).join(`${ASSET_TOKEN}/media/${name}`);
    cssOut = cssOut.split(`(${pathname})`).join(`(media/${name})`).split(`("${pathname}")`).join(`("media/${name}")`);
  }

  parseFragment(fragment);

  fs.writeFileSync(path.join(tmp, 'fragment.html'), fragment);
  fs.writeFileSync(path.join(tmp, 'assets', 'chrome.css'), cssOut);
  fs.writeFileSync(path.join(tmp, 'assets', 'chrome.js'), js);
  fs.writeFileSync(
    path.join(tmp, 'manifest.json'),
    JSON.stringify(
      {
        contract: parsed.contract,
        build: parsed.build,
        source: isUrl(args.source) ? args.source : 'local marketing build',
        origin,
        syncedAt: new Date().toISOString(),
        media: [...images.values()].sort(),
      },
      null,
      2,
    ) + '\n',
  );

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.renameSync(tmp, outDir);

  console.log(
    `[chrome-sync] ${args.out}: ${previous ? `${previous.build} -> ` : ''}${parsed.build} ` +
      `(css ${kb(cssOut)}, js ${kb(js)}, ${images.size} image(s))`,
  );
  setOutputs({ changed: 'true', build: parsed.build });
}

function setOutputs(values) {
  if (!process.env.GITHUB_OUTPUT) return;
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    Object.entries(values)
      .map(([k, v]) => `${k}=${v}\n`)
      .join(''),
  );
}

const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`;

main().catch((err) => {
  console.error(`[chrome-sync] ${err.message}`);
  process.exitCode = 1;
});

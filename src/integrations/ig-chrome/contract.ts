export const CHROME_CONTRACT = "v1";

export const ASSET_TOKEN = "%IG_CHROME_ASSETS%";

export interface ParsedFragment {
  contract: string;
  build: string;
  head: string;
  header: string;
  footer: string;
}

const STAMP = /<!--\s*ig-chrome\s+(v\d+)\s+build=([A-Za-z0-9]+)/;
const SITE_HEADER = /<header\b[^>]*\sclass="nv[\s"]/i;

export function parseFragment(html: string): ParsedFragment {
  const text = html ?? "";
  const stamp = STAMP.exec(text);

  if (!stamp) {
    throw new Error("The fragment carries no ig-chrome version stamp.");
  }

  if (stamp[1] !== CHROME_CONTRACT) {
    throw new Error(
      `The fragment is contract ${stamp[1]}; this theme understands ${CHROME_CONTRACT}.`,
    );
  }

  const fragment: ParsedFragment = {
    contract: stamp[1],
    build: stamp[2],
    head: part(text, "head"),
    header: part(text, "header"),
    footer: part(text, "footer"),
  };

  if (!fragment.head.includes("chrome.css")) {
    throw new Error("The fragment's head part does not load chrome.css.");
  }

  if (!fragment.head.includes("chrome.js")) {
    throw new Error("The fragment's head part does not load chrome.js.");
  }

  if (!fragment.header.includes('data-ig-chrome="header"')) {
    throw new Error(
      'The fragment\'s header part has no [data-ig-chrome="header"] root.',
    );
  }

  if (!SITE_HEADER.test(fragment.header)) {
    throw new Error(
      'The fragment\'s header part has no <header class="nv"> element.',
    );
  }

  if (!/<footer\b/i.test(fragment.footer)) {
    throw new Error("The fragment's footer part has no <footer> element.");
  }

  return fragment;
}

function part(html: string, name: string): string {
  const open = `<!-- ig-chrome:${name} -->`;
  const close = `<!-- /ig-chrome:${name} -->`;
  const start = html.indexOf(open);
  const end = start < 0 ? -1 : html.indexOf(close, start + open.length);

  if (start < 0 || end < 0) {
    throw new Error(`The fragment has no '${name}' part.`);
  }

  const body = html.slice(start + open.length, end).trim();

  if (!body) {
    throw new Error(`The fragment's '${name}' part is empty.`);
  }

  return body;
}

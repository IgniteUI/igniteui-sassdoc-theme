interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Defined by the igChrome() integration for server-side rendering. */
declare const __IG_CHROME__:
  | import("../integrations/ig-chrome").IgChromeData
  | undefined;

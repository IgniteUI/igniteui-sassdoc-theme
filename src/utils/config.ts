import sources from "./sources.json";
import type { Lang } from "../i18n/ui";
import type { Mode } from "../content/sassdoc-schema";

type SourceEntry = {
  id: string;
  url: string;
  navigationURL: string;
  gaID: string;
  versions: string;
  sassdoc_default_url: string;
};

export function getConfig(lang: Lang, mode: Mode): SourceEntry {
  return (sources as Record<string, Record<string, SourceEntry>>)[lang][mode];
}

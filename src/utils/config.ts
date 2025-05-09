import sources from "./sources.json";
import type { Lang } from "../i18n/ui";
import type { Mode } from "../content/sassdoc-schema";

export function getConfig(lang: Lang, mode: Mode) {
  return sources[lang][mode];
}

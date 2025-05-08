import { z } from "zod";
import type { Lang } from "../i18n/ui";
import sources from "./sources.json";

const Modes = z.enum(["development", "staging", "production"]);
type Mode = z.infer<typeof Modes>;

export function getConfig(lang: Lang, mode: Mode) {
  return sources[lang][mode];
}

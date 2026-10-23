import type { Lang } from "../i18n/ui";
import type { IgChromeData } from "../integrations/ig-chrome";

export function getChrome(lang: Lang): IgChromeData | null {
  if (lang === "ja" || typeof __IG_CHROME__ === "undefined") {
    return null;
  }

  return __IG_CHROME__;
}

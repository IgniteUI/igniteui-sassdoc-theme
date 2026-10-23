import type { Lang } from "../i18n/ui";
import type { IgChromeData } from "../integrations/ig-chrome";

/**
 * The Infragistics header/footer snapshot (see src/integrations/ig-chrome), or
 * `null` when the page should render the legacy chrome fetched from /navigation.
 * Japanese builds keep the legacy chrome until a Japanese fragment is published.
 */
export function getChrome(lang: Lang): IgChromeData | null {
  if (lang === "ja" || typeof __IG_CHROME__ === "undefined") {
    return null;
  }

  return __IG_CHROME__;
}

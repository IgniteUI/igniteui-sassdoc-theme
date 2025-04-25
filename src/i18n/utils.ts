import { ui, defaultLang, type Lang } from "./ui";

export function getLangFromEnv() {
  const lang = import.meta.env.PUBLIC_LANG;

  if (lang && Object.keys(ui).includes(lang)) {
    return lang as Lang;
  }

  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

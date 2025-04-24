import { ui, defaultLang, type Lang } from './ui';

export function getLangFromEnv() {
  return (import.meta.env.PUBLIC_LANG ?? 'en') as Lang;
}

export function useTranslations(lang: Lang) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

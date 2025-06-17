import en from "./en.json";
import ja from "./ja.json";

export type Lang = keyof typeof ui;
export type TranslationKey = keyof typeof ui[Lang];

export const languages = {
  en: "English",
  ja: "日本語",
};

export const defaultLang: Lang = "en" ;

export const ui = {
  en,
  ja,
} as const;

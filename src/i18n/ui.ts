import en from "./en.json";
import bg from "./bg.json";
import ja from "./ja.json";

export type Lang = keyof typeof ui;
export type TranslationKey = keyof typeof ui[Lang];

export const languages = {
  en: "English",
  bg: "Български",
  ja: "日本語",
};

export const defaultLang: Lang = "en" ;

export const ui = {
  en,
  bg,
  ja,
} as const;

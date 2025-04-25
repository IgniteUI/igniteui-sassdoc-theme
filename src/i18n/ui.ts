import en from "./en.json?raw";
import bg from "./bg.json?raw";
import ja from "./ja.json?raw";

export const languages = {
  en: "English",
  bg: "Български",
  ja: "日本語",
};

export const defaultLang = "en";

export const ui = {
  en: JSON.parse(en),
  bg: JSON.parse(bg),
  ja: JSON.parse(ja),
} as const;

export type Lang = keyof typeof ui;

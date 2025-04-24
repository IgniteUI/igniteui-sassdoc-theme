import en from "./en.json?raw";
import bg from "./bg.json?raw";

export const languages = {
  en: "English",
  bg: "Български",
};

export const defaultLang = "en";

export const ui = {
  en: JSON.parse(en),
  bg: JSON.parse(bg),
} as const;

export type Lang = keyof typeof ui;

import { en } from "./en";

export type Locale = "en" | "fi";
export type Messages = typeof en;
export type DeepTranslated<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly DeepTranslated<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepTranslated<T[Key]> }
      : T;

export const defaultLocale: Locale = "en";
export const localeCookieName = "woittola-locale";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "fi";
}

export async function getMessages(locale: Locale): Promise<DeepTranslated<Messages>> {
  if (locale === "fi") {
    const { fi } = await import("./fi");
    return fi;
  }

  return en;
}

export function interpolate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

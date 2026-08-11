import { cookies } from "next/headers";
import { defaultLocale, getMessages, isLocale, localeCookieName } from "./index";

export async function getLocale() {
  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  return isLocale(value) ? value : defaultLocale;
}

export async function getLocaleMessages() {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return { locale, messages };
}

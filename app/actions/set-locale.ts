"use server";

import { cookies } from "next/headers";
import { isLocale, localeCookieName } from "../locales";

export async function setLocale(nextLocale: string) {
  if (!isLocale(nextLocale)) return;

  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, nextLocale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

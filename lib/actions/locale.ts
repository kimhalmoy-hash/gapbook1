"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n";

export async function setLandingLocale(formData: FormData) {
  const locale = parseLocale(formData.get("locale"));
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  revalidatePath("/");
}

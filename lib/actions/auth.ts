"use server";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { clearSession, setSession } from "@/lib/session";
import { MARKETS } from "@/lib/constants";

export type ActionState = { error: string } | null;

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = asString(formData, "email").toLowerCase();
  const password = asString(formData, "password");
  if (!email || !password) return { error: "Fyll inn e-post og passord." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Feil e-post eller passord." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Feil e-post eller passord." };

  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "BUSINESS") redirect("/bedrift");
  redirect("/konto");
}

export async function registerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = asString(formData, "name");
  const email = asString(formData, "email").toLowerCase();
  const password = asString(formData, "password");
  const role = asString(formData, "role") === "BUSINESS" ? "BUSINESS" : "CUSTOMER";
  const companyName = asString(formData, "companyName");

  if (!name || !email || !password) {
    return { error: "Navn, e-post og passord er påkrevd." };
  }
  if (password.length < 8) {
    return { error: "Passordet må være minst 8 tegn." };
  }
  if (role === "BUSINESS" && !companyName) {
    return { error: "Bedriftsnavn er påkrevd." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "E-posten er allerede i bruk." };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: role as Role,
      ...(role === "BUSINESS"
        ? {
            business: {
              create: {
                name: companyName,
                orgNr: "",
                country: MARKETS[0].country,
                city: MARKETS[0].city,
                trades: [],
                approved: false,
              },
            },
          }
        : {}),
    },
  });

  await setSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  if (role === "BUSINESS") redirect("/bedrift/profil");
  redirect("/sok");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

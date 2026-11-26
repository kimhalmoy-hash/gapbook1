"use server";

import { Country, Trade } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { MARKETS, TRADES } from "@/lib/constants";
import type { ActionState } from "./auth";

const TRADE_VALUES = new Set(TRADES.map((trade) => trade.value));

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function saveBusinessProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireSession();
  if (session.role !== "BUSINESS" && session.role !== "ADMIN") {
    return { error: "Kun bedrifter kan lagre bedriftsprofil." };
  }

  const name = asString(formData, "name");
  const orgNr = asString(formData, "orgNr");
  const city = asString(formData, "city");
  const trades = formData
    .getAll("trades")
    .map((value) => String(value))
    .filter((value): value is Trade => TRADE_VALUES.has(value as Trade));

  const market = MARKETS.find((item) => item.city === city);
  if (!name) return { error: "Bedriftsnavn er påkrevd." };
  if (!orgNr || orgNr.length < 6) return { error: "Oppgi gyldig org.nr." };
  if (!market) return { error: "Velg Oslo eller Stockholm." };
  if (trades.length === 0) return { error: "Velg minst ett fag." };

  await prisma.business.upsert({
    where: { userId: session.userId },
    update: {
      name,
      orgNr,
      city: market.city,
      country: market.country as Country,
      trades,
    },
    create: {
      userId: session.userId,
      name,
      orgNr,
      city: market.city,
      country: market.country as Country,
      trades,
      approved: false,
    },
  });

  revalidatePath("/bedrift");
  revalidatePath("/admin");
  redirect("/bedrift/profil?m=lagret");
}

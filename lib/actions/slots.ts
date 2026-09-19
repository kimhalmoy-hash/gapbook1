"use server";

import { SlotStatus, SlotUnit, Trade } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireBusiness } from "@/lib/auth";
import { currencyForCity, TRADES } from "@/lib/constants";
import { computeSlotRange, validateSlotWindow } from "@/lib/slots";
import type { ActionState } from "./auth";

const TRADE_VALUES = new Set(TRADES.map((trade) => trade.value));
const UNIT_VALUES = new Set<SlotUnit>(["HOURS", "DAY", "WEEK"]);

function asString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function asInt(formData: FormData, key: string) {
  const raw = asString(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.round(value) : null;
}

function parseSlotForm(formData: FormData) {
  const trade = asString(formData, "trade") as Trade;
  const unit = asString(formData, "unit") as SlotUnit;
  const startDate = asString(formData, "startDate");
  const startTime = asString(formData, "startTime") || "08:00";
  const start = unit === "HOURS" ? `${startDate}T${startTime}` : startDate;
  const durationHours = asInt(formData, "durationHours") ?? undefined;
  const days = asInt(formData, "days") ?? undefined;
  const priceAmount = asInt(formData, "priceAmount");
  const suitableFor = asString(formData, "suitableFor");
  const cancellationFeeAmount = asInt(formData, "cancellationFeeAmount");

  return {
    trade,
    unit,
    start,
    durationHours,
    days,
    priceAmount,
    suitableFor,
    cancellationFeeAmount,
  };
}

function validatePublishInput(
  businessTrades: Trade[],
  city: string,
  input: ReturnType<typeof parseSlotForm>,
) {
  if (!businessTrades.length) {
    return { error: "Fyll inn fag på bedriftsprofilen først." };
  }
  if (!TRADE_VALUES.has(input.trade)) return { error: "Ugyldig fag." };
  if (!businessTrades.includes(input.trade)) {
    return { error: "Du kan bare publisere slots i fagene på profilen." };
  }
  if (!UNIT_VALUES.has(input.unit)) return { error: "Ugyldig enhet." };
  if (!input.start) return { error: "Starttid er påkrevd." };
  if (input.unit === "HOURS" && (input.durationHours ?? 0) < 3) {
    return { error: "Time-slot må være minst 3 timer." };
  }
  if (!input.priceAmount || input.priceAmount <= 0) {
    return { error: "Synlig pris må være større enn 0." };
  }
  if (!input.suitableFor) return { error: "Oppgi hva sloten passer til." };

  const range = computeSlotRange({
    unit: input.unit,
    start: input.start,
    durationHours: input.durationHours,
    days: input.days,
  });
  const windowError = validateSlotWindow(range.startsAt, range.endsAt);
  if (windowError) return { error: windowError };

  return {
    data: {
      ...range,
      trade: input.trade,
      unit: input.unit,
      priceAmount: input.priceAmount,
      suitableFor: input.suitableFor,
      cancellationFeeAmount: input.cancellationFeeAmount,
      city,
      currency: currencyForCity(city),
    },
  };
}

export async function createSlotAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { business } = await requireBusiness();
  if (!business.approved) {
    return { error: "Bedriften må godkjennes av admin før du kan publisere slots." };
  }

  const parsed = validatePublishInput(
    business.trades,
    business.city,
    parseSlotForm(formData),
  );
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  if (!("data" in parsed) || !parsed.data) return { error: "Ugyldig skjema." };

  let slot;
  try {
    slot = await prisma.slot.create({
      data: {
        businessId: business.id,
        trade: parsed.data.trade,
        country: business.country,
        city: parsed.data.city,
        startsAt: parsed.data.startsAt,
        endsAt: parsed.data.endsAt,
        unit: parsed.data.unit,
        durationHours: parsed.data.durationHours,
        priceAmount: parsed.data.priceAmount,
        currency: parsed.data.currency,
        suitableFor: parsed.data.suitableFor,
        cancellationFeeAmount: parsed.data.cancellationFeeAmount,
        status: SlotStatus.OPEN,
      },
    });
  } catch {
    return { error: "Kunne ikke lagre sloten. Sjekk datoene og prøv igjen." };
  }

  revalidatePath("/sok");
  revalidatePath("/bedrift/slot");
  redirect(`/bedrift/slot/${slot.id}?m=opprettet`);
}

export async function updateSlotAction(
  slotId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { business } = await requireBusiness();
  const slot = await prisma.slot.findFirst({
    where: { id: slotId, businessId: business.id },
  });
  if (!slot) return { error: "Fant ikke sloten." };
  if (slot.status !== "OPEN") {
    return { error: "Bare åpne slots kan redigeres." };
  }

  const parsed = validatePublishInput(
    business.trades,
    business.city,
    parseSlotForm(formData),
  );
  if ("error" in parsed && parsed.error) return { error: parsed.error };
  if (!("data" in parsed) || !parsed.data) return { error: "Ugyldig skjema." };

  await prisma.slot.update({
    where: { id: slot.id },
    data: {
      trade: parsed.data.trade,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      unit: parsed.data.unit,
      durationHours: parsed.data.durationHours,
      priceAmount: parsed.data.priceAmount,
      currency: parsed.data.currency,
      suitableFor: parsed.data.suitableFor,
      cancellationFeeAmount: parsed.data.cancellationFeeAmount,
    },
  });

  revalidatePath("/sok");
  revalidatePath(`/slot/${slot.id}`);
  revalidatePath("/bedrift/slot");
  redirect(`/bedrift/slot/${slot.id}?m=lagret`);
}

export async function cancelSlotAction(slotId: string) {
  const { business } = await requireBusiness();
  const slot = await prisma.slot.findFirst({
    where: { id: slotId, businessId: business.id },
  });
  if (!slot || slot.status !== "OPEN") return;
  await prisma.slot.update({
    where: { id: slot.id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/sok");
  revalidatePath("/bedrift/slot");
  redirect("/bedrift/slot?m=trukket");
}

import { Country, SlotUnit, Trade } from "@prisma/client";
import { countryLabel, tradeLabel, unitLabel } from "./constants";

const dateTimeFmt = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFmt = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateTime(date: Date): string {
  return dateTimeFmt.format(date);
}

export function formatDate(date: Date): string {
  return dateFmt.format(date);
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatSlotWindow(
  startsAt: Date,
  endsAt: Date,
  unit: SlotUnit,
): string {
  if (unit === "HOURS") {
    return `${formatDateTime(startsAt)} – ${formatDateTime(endsAt)}`;
  }
  return `${formatDate(startsAt)} – ${formatDate(endsAt)}`;
}

export function formatPlace(city: string, country: Country): string {
  return `${city}, ${countryLabel(country)}`;
}

export function formatTradeUnit(trade: Trade, unit: SlotUnit): string {
  return `${tradeLabel(trade)} · ${unitLabel(unit)}`;
}

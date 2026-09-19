import { Country, SlotUnit, Trade } from "@prisma/client";

export const MIN_DURATION_HOURS = 3;
export const MAX_DURATION_HOURS = 7 * 24;
export const LAUNCH_FREE_BOOKINGS = 2;
export const SUCCESS_FEE_PERCENT = 5;
export const LATE_CANCEL_HOURS = 48;
export const SESSION_COOKIE = "gapbook_session";

export const TRADES: { value: Trade; labelNb: string }[] = [
  { value: "PAINTING", labelNb: "Maling/tapetsering" },
  { value: "ELECTRICIAN", labelNb: "Elektriker" },
  { value: "PLUMBER", labelNb: "Rørlegger" },
  { value: "CARPENTER", labelNb: "Tømrer/snekker" },
  { value: "TILE_MASONRY", labelNb: "Flis/mur" },
  { value: "ROOFING", labelNb: "Tak" },
];

export const MARKETS: {
  city: string;
  country: Country;
  currency: "NOK" | "SEK";
  live: boolean;
}[] = [
  { city: "Oslo", country: "NO", currency: "NOK", live: true },
  { city: "Stockholm", country: "SE", currency: "SEK", live: true },
];

export const UNITS: { value: SlotUnit; labelNb: string }[] = [
  { value: "HOURS", labelNb: "Timer (≥ 3)" },
  { value: "DAY", labelNb: "Dag" },
  { value: "WEEK", labelNb: "Uke (maks 1 uke)" },
];

export function tradeLabel(trade: Trade): string {
  return TRADES.find((item) => item.value === trade)?.labelNb ?? trade;
}

export function unitLabel(unit: SlotUnit): string {
  switch (unit) {
    case "HOURS":
      return "timer";
    case "DAY":
      return "dag";
    case "WEEK":
      return "uke";
  }
}

export function slotStatusLabel(status: "OPEN" | "BOOKED" | "CANCELLED"): string {
  switch (status) {
    case "OPEN":
      return "Åpen";
    case "BOOKED":
      return "Booket";
    case "CANCELLED":
      return "Trukket";
  }
}

export function countryLabel(country: Country): string {
  return country === "NO" ? "Norge" : "Sverige";
}

export function marketForCity(city: string) {
  return MARKETS.find((market) => market.city === city) ?? null;
}

export function currencyForCity(city: string): "NOK" | "SEK" {
  return marketForCity(city)?.currency ?? "NOK";
}

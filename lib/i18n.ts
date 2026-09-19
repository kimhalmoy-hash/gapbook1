import { Trade } from "@prisma/client";

export const LOCALES = ["nb", "sv", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nb";
export const LOCALE_COOKIE = "gapbook_locale";

export function parseLocale(value: unknown): Locale {
  if (value === "nb" || value === "sv" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  nb: "Norsk",
  sv: "Svenska",
  en: "English",
};

export type LandingCopy = {
  lang: Locale;
  kicker: string;
  title: string;
  subtitle: string;
  ctaSee: string;
  ctaSell: string;
  chips: readonly string[];
  tradesHeading: string;
  tradesSeeOpen: string;
  openNow: string;
  allSlots: string;
  noSlots: string;
  howHeading: string;
  steps: readonly { n: string; t: string; d: string }[];
  businessHeading: string;
  businessBody: string;
  businessCta: string;
  trades: Record<Trade, string>;
  switcherLabel: string;
};

const NB: LandingCopy = {
  lang: "nb",
  kicker: "Oslo + Stockholm · synlig pris",
  title: "Se ledige timer, dager og uker nær deg",
  subtitle:
    "Book fra 3 timer til én uke — til synlig pris. Ledig kapasitet hos flere fag, klar til å bookes.",
  ctaSee: "Se ledig tid",
  ctaSell: "Selg ledig tid",
  chips: [
    "Ikke anbud",
    "Ingen depositum",
    "Jobbpenger direkte til bedrift",
    "3 t – 1 uke",
  ],
  tradesHeading: "Fag live fra start",
  tradesSeeOpen: "Se åpne slots",
  openNow: "Ledig nå",
  allSlots: "Alle slots",
  noSlots: "Ingen åpne slots ennå. Kjør seed for demodata.",
  howHeading: "Slik fungerer det",
  steps: [
    {
      n: "01",
      t: "Søk",
      d: "Velg sted, periode og fag. Du ser bare godkjente bedrifter med synlig pris.",
    },
    {
      n: "02",
      t: "Book",
      d: "Godta digital avtale (checkbox + tidspunkt). Ingen Stripe, ingen depositum.",
    },
    {
      n: "03",
      t: "Gjør jobben opp",
      d: "Jobbpenger går direkte bedrift ↔ kunde. GapBook tar success fee av bedriften etterpå.",
    },
  ],
  businessHeading: "For bedrifter",
  businessBody:
    "Selg ledig kapasitet før den mister verdien. Publiser timer, dager eller én uke i Oslo og Stockholm. Launch: 0 % success fee på de to første bookingene, deretter 5 % — fakturert månedlig.",
  businessCta: "Selg ledig tid",
  trades: {
    PAINTING: "Maling/tapetsering",
    ELECTRICIAN: "Elektriker",
    PLUMBER: "Rørlegger",
    CARPENTER: "Tømrer/snekker",
    TILE_MASONRY: "Flis/mur",
    ROOFING: "Tak",
  },
  switcherLabel: "Språk",
};

const SV: LandingCopy = {
  lang: "sv",
  kicker: "Oslo + Stockholm · synligt pris",
  title: "Se lediga timmar, dagar och veckor nära dig",
  subtitle:
    "Boka från 3 timmar till en vecka — till synligt pris. Ledig kapacitet hos flera yrken, redo att bokas.",
  ctaSee: "Se ledig tid",
  ctaSell: "Sälj ledig tid",
  chips: [
    "Inte anbud",
    "Ingen deposition",
    "Jobbbetalning direkt till företaget",
    "3 t – 1 vecka",
  ],
  tradesHeading: "Yrken live från start",
  tradesSeeOpen: "Se öppna slots",
  openNow: "Ledigt nu",
  allSlots: "Alla slots",
  noSlots: "Inga öppna slots ännu. Kör seed för demodata.",
  howHeading: "Så fungerar det",
  steps: [
    {
      n: "01",
      t: "Sök",
      d: "Välj plats, period och yrke. Du ser bara godkända företag med synligt pris.",
    },
    {
      n: "02",
      t: "Boka",
      d: "Godkänn digitalt avtal (kryssruta + tidsstämpel). Ingen Stripe, ingen deposition.",
    },
    {
      n: "03",
      t: "Gör upp om jobbet",
      d: "Jobbpengar går direkt företag ↔ kund. GapBook tar success fee av företaget efteråt.",
    },
  ],
  businessHeading: "För företag",
  businessBody:
    "Sälj ledig kapacitet innan den tappar värde. Publicera timmar, dagar eller en vecka i Oslo och Stockholm. Launch: 0 % success fee på de två första bokningarna, därefter 5 % — faktureras månadsvis.",
  businessCta: "Sälj ledig tid",
  trades: {
    PAINTING: "Målning/tapetsering",
    ELECTRICIAN: "Elektriker",
    PLUMBER: "Rörmokare",
    CARPENTER: "Snickare",
    TILE_MASONRY: "Kakel/mur",
    ROOFING: "Tak",
  },
  switcherLabel: "Språk",
};

const EN: LandingCopy = {
  lang: "en",
  kicker: "Oslo + Stockholm · visible price",
  title: "See open hours, days and weeks near you",
  subtitle:
    "Book from 3 hours to one week — at a visible price. Spare capacity across trades, ready to book.",
  ctaSee: "See open time",
  ctaSell: "Sell spare time",
  chips: [
    "Not a bidding market",
    "No deposit",
    "Job payment goes directly to the business",
    "3 h – 1 week",
  ],
  tradesHeading: "Trades live from day one",
  tradesSeeOpen: "See open slots",
  openNow: "Open now",
  allSlots: "All slots",
  noSlots: "No open slots yet. Run seed for demo data.",
  howHeading: "How it works",
  steps: [
    {
      n: "01",
      t: "Search",
      d: "Pick a place, period and trade. You only see approved businesses with a visible price.",
    },
    {
      n: "02",
      t: "Book",
      d: "Accept the digital agreement (checkbox + timestamp). No Stripe, no deposit.",
    },
    {
      n: "03",
      t: "Settle the job",
      d: "Job money goes directly business ↔ customer. GapBook bills the business a success fee afterwards.",
    },
  ],
  businessHeading: "For businesses",
  businessBody:
    "Sell spare capacity before it loses value. Publish hours, days or one week in Oslo and Stockholm. Launch: 0% success fee on the first two bookings, then 5% — invoiced monthly.",
  businessCta: "Sell spare time",
  trades: {
    PAINTING: "Painting/wallpaper",
    ELECTRICIAN: "Electrician",
    PLUMBER: "Plumber",
    CARPENTER: "Carpenter",
    TILE_MASONRY: "Tile/masonry",
    ROOFING: "Roofing",
  },
  switcherLabel: "Language",
};

const LANDING: Record<Locale, LandingCopy> = {
  nb: NB,
  sv: SV,
  en: EN,
};

export function landingCopy(locale: Locale = DEFAULT_LOCALE): LandingCopy {
  return LANDING[locale];
}

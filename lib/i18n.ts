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

export const PRODUCT_TAGLINES: Record<Locale, string> = {
  nb: "WeekSlot selger kalenderhull hos maler, elektriker, rørlegger og flere — 3 timer til 1 uke, til synlig pris, ofte under ordinær. Ikke anbud.",
  sv: "WeekSlot säljer kalenderluckor hos målare, elektriker, rörmokare med flera — 3 timmar till 1 vecka, till synligt pris, ofta under ordinarie. Inte anbud.",
  en: "WeekSlot sells leftover calendar gaps from painters, electricians, plumbers and more — 3 hours to 1 week, at a visible price, often below the usual rate. Not a bidding market.",
};

export type LandingCopy = {
  lang: Locale;
  kicker: string;
  badge: string;
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
  badge: "Ledige timer & uker — ofte under ordinær pris",
  title: "Ledig håndverkertid er ferskvare",
  subtitle: PRODUCT_TAGLINES.nb,
  ctaSee: "Se ledig tid",
  ctaSell: "Selg ledig tid",
  chips: [
    "Kalenderhull, ikke anbud",
    "Ofte under ordinær pris",
    "Synlig pris · 3 t – 1 uke",
    "Ingen depositum",
  ],
  tradesHeading: "Fag live fra start",
  tradesSeeOpen: "Se åpne kalenderhull",
  openNow: "Ledig nå",
  allSlots: "Alle slots",
  noSlots: "Ingen åpne slots ennå. Kjør seed for demodata.",
  howHeading: "Slik fungerer det",
  steps: [
    {
      n: "01",
      t: "Finn hullene",
      d: "Velg sted, periode og fag. Du ser godkjente bedrifters ledige timer og uker — synlig pris, ofte under ordinær.",
    },
    {
      n: "02",
      t: "Book hullet",
      d: "Book 3 timer til 1 uke. Godta digital avtale (checkbox + tidspunkt). Ingen Stripe, ingen depositum.",
    },
    {
      n: "03",
      t: "Gjør jobben opp",
      d: "Jobbpenger går direkte bedrift ↔ kunde. WeekSlot tar success fee av bedriften etterpå.",
    },
  ],
  businessHeading: "For bedrifter",
  businessBody:
    "Selg kalenderhull før tiden blir verdiløs ferskvare. Publiser ledig kapasitet — timer, dager eller én uke — ofte under ordinær pris, i Oslo og Stockholm. Launch: 0 % success fee på de to første bookingene, deretter 5 % — fakturert månedlig.",
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
  badge: "Lediga timmar & veckor — ofta under ordinarie pris",
  title: "Ledig hantverkartid är färskvara",
  subtitle: PRODUCT_TAGLINES.sv,
  ctaSee: "Se ledig tid",
  ctaSell: "Sälj ledig tid",
  chips: [
    "Kalenderluckor, inte anbud",
    "Ofta under ordinarie pris",
    "Synligt pris · 3 t – 1 vecka",
    "Ingen deposition",
  ],
  tradesHeading: "Yrken live från start",
  tradesSeeOpen: "Se öppna kalenderluckor",
  openNow: "Ledigt nu",
  allSlots: "Alla slots",
  noSlots: "Inga öppna slots ännu. Kör seed för demodata.",
  howHeading: "Så fungerar det",
  steps: [
    {
      n: "01",
      t: "Hitta luckorna",
      d: "Välj plats, period och yrke. Du ser godkända företags lediga timmar och veckor — synligt pris, ofta under ordinarie.",
    },
    {
      n: "02",
      t: "Boka luckan",
      d: "Boka 3 timmar till 1 vecka. Godkänn digitalt avtal (kryssruta + tidsstämpel). Ingen Stripe, ingen deposition.",
    },
    {
      n: "03",
      t: "Gör upp om jobbet",
      d: "Jobbpengar går direkt företag ↔ kund. WeekSlot tar success fee av företaget efteråt.",
    },
  ],
  businessHeading: "För företag",
  businessBody:
    "Sälj kalenderluckor innan tiden blir värdelös färskvara. Publicera ledig kapacitet — timmar, dagar eller en vecka — ofta under ordinarie pris, i Oslo och Stockholm. Launch: 0 % success fee på de två första bokningarna, därefter 5 % — faktureras månadsvis.",
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
  badge: "Spare hours & weeks — often below the usual rate",
  title: "Fill empty trade slots for less",
  subtitle: PRODUCT_TAGLINES.en,
  ctaSee: "See leftover time",
  ctaSell: "Sell leftover time",
  chips: [
    "Leftover slots, not bidding",
    "Often below the usual rate",
    "Visible price · 3 h – 1 week",
    "No deposit",
  ],
  tradesHeading: "Trades live from day one",
  tradesSeeOpen: "See leftover slots",
  openNow: "Open now",
  allSlots: "All slots",
  noSlots: "No open slots yet. Run seed for demo data.",
  howHeading: "How it works",
  steps: [
    {
      n: "01",
      t: "Find leftover slots",
      d: "Pick a place, period and trade. You only see approved businesses' idle hours and weeks — visible price, often below the usual rate.",
    },
    {
      n: "02",
      t: "Book the gap",
      d: "Book 3 hours to 1 week. Accept the digital agreement (checkbox + timestamp). No Stripe, no deposit.",
    },
    {
      n: "03",
      t: "Settle the job",
      d: "Job money goes directly business ↔ customer. WeekSlot bills the business a success fee afterwards.",
    },
  ],
  businessHeading: "For businesses",
  businessBody:
    "Sell leftover calendar gaps before idle time is wasted. Publish spare capacity — hours, days or one week — often below the usual rate, in Oslo and Stockholm. Launch: 0% success fee on the first two bookings, then 5% — invoiced monthly.",
  businessCta: "Sell leftover time",
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

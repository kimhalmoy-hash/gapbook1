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
  nb: "WeekSlot selger kalenderhull hos håndverkere — ledig tid til bedre pris, før den mister verdien.",
  sv: "WeekSlot säljer kalenderluckor hos hantverkare — ledig tid till bättre pris, innan den förlorar värdet.",
  en: "WeekSlot sells trades’ calendar gaps — open time at a better price, before it loses value.",
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
  title: "Se ledige timer og uker nær deg",
  subtitle:
    "Kalenderhull hos håndverkere — solgt før de mister verdien, ofte under ordinær pris. Fra 3 timer til én uke.",
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
      t: "Finn kalenderhull",
      d: "Velg sted, periode og fag. Du ser godkjente bedrifters ledige timer og uker — ofte under ordinær pris.",
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
    "Selg kalenderhull før de mister verdien — ledig tid til bedre pris. Publiser timer, dager eller én uke i Oslo og Stockholm. Launch: 0 % success fee på de to første bookingene, deretter 5 % — fakturert månedlig.",
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
  title: "Se lediga timmar och veckor nära dig",
  subtitle:
    "Kalenderluckor hos hantverkare — sålda innan de förlorar värdet, ofta under ordinarie pris. Från 3 timmar till en vecka.",
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
      t: "Hitta kalenderluckor",
      d: "Välj plats, period och yrke. Du ser godkända företags lediga timmar och veckor — ofta under ordinarie pris.",
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
    "Sälj kalenderluckor innan de förlorar värdet — ledig tid till bättre pris. Publicera timmar, dagar eller en vecka i Oslo och Stockholm. Launch: 0 % success fee på de två första bokningarna, därefter 5 % — faktureras månadsvis.",
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
  badge: "Open hours & weeks — often under standard rates",
  title: "See open hours and weeks near you",
  subtitle:
    "Calendar gaps from trades — sold before they lose value, often below usual rates. From 3 hours to one week.",
  ctaSee: "See open time",
  ctaSell: "List open time",
  chips: [
    "Calendar gaps, not bidding",
    "Often below usual rates",
    "Visible price · 3 h – 1 week",
    "No deposit",
  ],
  tradesHeading: "Trades live from day one",
  tradesSeeOpen: "See open calendar gaps",
  openNow: "Open now",
  allSlots: "All slots",
  noSlots: "No open slots yet. Run seed for demo data.",
  howHeading: "How it works",
  steps: [
    {
      n: "01",
      t: "Find calendar gaps",
      d: "Pick a place, period and trade. You only see approved businesses' open hours and weeks — often below usual rates.",
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
    "Sell calendar gaps before they lose value — open time at a better price. Publish hours, days or one week in Oslo and Stockholm. Launch: 0% success fee on the first two bookings, then 5% — invoiced monthly.",
  businessCta: "List open time",
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

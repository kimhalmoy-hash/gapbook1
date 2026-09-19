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
  nb: "WeekSlot — rabatterte ledige timer og uker hos håndverkere, før tiden mister verdien.",
  sv: "WeekSlot — rabatterade lediga timmar och veckor hos hantverkare, innan tiden tappar värde.",
  en: "WeekSlot — discounted open hours and weeks from trades, before time loses its value.",
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
  kicker: "Oslo + Stockholm · rabattert ledig tid",
  badge: "Rabatterte ledige slots",
  title: "Rabattert ledig tid hos håndverkere",
  subtitle:
    "Ledige slots i kalenderen — solgt med rabatt før tiden mister verdien. Fra 3 timer til én uke.",
  ctaSee: "Se ledig tid",
  ctaSell: "Selg ledig tid",
  chips: [
    "Rabatterte slots, ikke anbud",
    "Solgt med rabatt",
    "Synlig pris · 3 t – 1 uke",
    "Ingen depositum",
  ],
  tradesHeading: "Fag live fra start",
  tradesSeeOpen: "Se rabatterte slots",
  openNow: "Ledig nå",
  allSlots: "Alle slots",
  noSlots: "Ingen åpne slots ennå. Kjør seed for demodata.",
  howHeading: "Slik fungerer det",
  steps: [
    {
      n: "01",
      t: "Finn rabatten",
      d: "Velg sted, periode og fag. Du ser godkjente bedrifters ledige slots — solgt med rabatt før tiden mister verdien.",
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
    "Selg rabattert ledig tid før den mister verdien. Publiser ledige slots — timer, dager eller én uke — i Oslo og Stockholm. Launch: 0 % success fee på de to første bookingene, deretter 5 % — fakturert månedlig.",
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
  kicker: "Oslo + Stockholm · rabatterad ledig tid",
  badge: "Rabatterade lediga slots",
  title: "Rabatterad ledig tid hos hantverkare",
  subtitle:
    "Lediga slots i kalendern — sålda med rabatt innan tiden tappar värde. Från 3 timmar till en vecka.",
  ctaSee: "Se ledig tid",
  ctaSell: "Sälj ledig tid",
  chips: [
    "Rabatterade slots, inte anbud",
    "Sålda med rabatt",
    "Synligt pris · 3 t – 1 vecka",
    "Ingen deposition",
  ],
  tradesHeading: "Yrken live från start",
  tradesSeeOpen: "Se rabatterade slots",
  openNow: "Ledigt nu",
  allSlots: "Alla slots",
  noSlots: "Inga öppna slots ännu. Kör seed för demodata.",
  howHeading: "Så fungerar det",
  steps: [
    {
      n: "01",
      t: "Hitta rabatten",
      d: "Välj plats, period och yrke. Du ser godkända företags lediga slots — sålda med rabatt innan tiden tappar värde.",
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
    "Sälj rabatterad ledig tid innan den tappar värde. Publicera lediga slots — timmar, dagar eller en vecka — i Oslo och Stockholm. Launch: 0 % success fee på de två första bokningarna, därefter 5 % — faktureras månadsvis.",
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
  kicker: "Oslo + Stockholm · discounted open time",
  badge: "Discounted open slots",
  title: "Discounted open time from trades",
  subtitle:
    "Empty calendar slots — sold at a discount before time loses value. From 3 hours to one week.",
  ctaSee: "See open time",
  ctaSell: "List open time",
  chips: [
    "Discounted slots, not bidding",
    "Sold at a discount",
    "Visible price · 3 h – 1 week",
    "No deposit",
  ],
  tradesHeading: "Trades live from day one",
  tradesSeeOpen: "See discounted slots",
  openNow: "Open now",
  allSlots: "All slots",
  noSlots: "No open slots yet. Run seed for demo data.",
  howHeading: "How it works",
  steps: [
    {
      n: "01",
      t: "Find the discount",
      d: "Pick a place, period and trade. You only see approved businesses' empty calendar slots — sold at a discount before time loses value.",
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
    "Sell discounted open time before it loses value. Publish empty slots — hours, days or one week — in Oslo and Stockholm. Launch: 0% success fee on the first two bookings, then 5% — invoiced monthly.",
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

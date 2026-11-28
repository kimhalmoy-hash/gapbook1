export type Inline = { t: "tekst"; tekst: string; fet?: boolean } | { t: "lenke"; tekst: string; href: string };

export type GuideBlokk =
  | { type: "h2"; tekst: string }
  | { type: "h3"; tekst: string }
  | { type: "p"; deler: Inline[] }
  | { type: "ul"; punkter: Inline[][] }
  | { type: "ol"; punkter: Inline[][] }
  | { type: "tabell"; hode: Inline[][]; justering: ("venstre" | "hoyre")[]; rader: Inline[][][] };

export type Guide = {
  meta: { aar: number; h1: string; tittel: string; beskrivelse: string };
  blokker: GuideBlokk[];
  faq: { q: string; a: string }[];
};

export const FAQ_OVERSKRIFT: string;
export function inline(tekst: string): Inline[];
export function inlineTekst(deler: Inline[]): string;
export function parseGuide(md: string): Guide;
export function faqFra(blokker: GuideBlokk[]): { q: string; a: string }[];
export function guideLenker(blokker: GuideBlokk[]): string[];
export function erIntern(href: string): boolean;
export function tilpassLenker(blokker: GuideBlokk[], harSide: (href: string) => boolean): GuideBlokk[];

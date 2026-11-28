export type Inline =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "a"; text: string; href: string }
  | { type: "br" };

export type PersonvernBlokk =
  | { type: "h1" | "h2" | "h3"; inline: Inline[] }
  | { type: "p"; inline: Inline[] }
  | { type: "ul"; items: Inline[][] };

export const PERSONVERN_LOKALER: readonly ["nb", "sv", "en"];
export const SAMTYKKE_ANKER: string;
export function lesPersonvernMd(locale: string, rot?: string): string;
export function parseInline(tekst: string): Inline[];
export function parsePersonvern(md: string): PersonvernBlokk[];
export function inlineTekst(inline: Inline[]): string;
export function blokkTekst(blokk: PersonvernBlokk): string;
export function personvernBeskrivelse(locale: string, rot?: string): string;

export type SesongNavn = "vinter" | "sommer" | "host" | "paske";

export type FeriePeriode = {
  uke?: number | null;
  datoFra: string;
  datoTil: string;
};

export type SkoleruteRad = {
  skolear: string;
  kommune: string;
  hostferie: FeriePeriode | null;
  vinterferie: FeriePeriode | null;
  paske: ({ datoFra: string; datoTil: string } & { uke?: number | null }) | null;
  kildeUrl: string;
  merknad: string | null;
  slug?: string;
  fylke?: string | null;
};

export type FerieTreff = {
  nokkel: SesongNavn;
  uke?: number | null;
  datoFra: string;
  datoTil: string;
};

export type KommuneFri = {
  kommune: string;
  slug: string;
  nokkel: SesongNavn;
  uke: number | null;
  datoFra: string;
  datoTil: string;
  kildeUrl: string;
  merknad: string | null;
  skolear: string;
};

export type LeirUke = {
  sesong: string;
  uke: number | string | null;
  datoFra: string | null;
  datoTil: string | null;
  kommune: string;
  dod?: boolean;
  demo?: boolean;
  lenkestatus?: string | null;
  status?: string;
};

export function slug(verdi: unknown): string;
export const TYPE_STI: Record<string, string>;
export function ukeListe(uke: number | string | null | undefined): number[];
export function isoUke(iso: string): { aar: number; uke: number };
export function ukeMandag(aar: number, uke: number): string;
export function leggTilDager(iso: string, n: number): string;
export function dagerMellom(fra: string, til: string): string[];
export function overlap(
  a0: string | null,
  a1: string | null,
  b0: string | null,
  b1: string | null,
): boolean;
export function sesongDeler(sesong: string | null | undefined): { navn: SesongNavn; aar: number } | null;
export function ukeNokkel(aar: number, uke: number): string;
export function parseUkeNokkel(nokkel: string): { aar: number; uke: number } | null;
export function campUker(camp: LeirUke): string[];
export const TEMA_MIN: number;
export function erDato8(s: string): boolean;
export function inneholderPerson(verdi: unknown): boolean;
export function rensPerson(verdi: unknown): string | null;
export function avvikKommuner(linjer: readonly string[]): string[];
export function fjoraarsTekst(notat: string | null | undefined): string | null;
export function utenPamelding(leir: { type?: string | null; notat?: string | null; prisNotat?: string | null }): boolean;
export function ferieFelter(rad: SkoleruteRad): FerieTreff[];
export function kommunerMedFri(rader: SkoleruteRad[], aar: number, uke: number): KommuneFri[];
export function erHelUke(fra: string | null | undefined, til: string | null | undefined): boolean;
export function campIFerie(camp: LeirUke & { fylke?: string | null }, rad: SkoleruteRad & { fylke?: string | null }): FerieTreff[];
export function kommunerISesong(rader: SkoleruteRad[], navn: SesongNavn, skolearSlutt: number): KommuneFri[];
export function skolearSlutt(skolear: string): number | null;
export function skolearKort(skolear: string): string;
export function lagId(tilbyder: string, tittel: string, sesong: string, uke: number | string): string;
export function typeSlug(type: string): string;
export function synlig(leir: LeirUke, iDag: string): boolean;
export function tellerMotTerskel(leir: LeirUke, iDag: string): boolean;
export function gruppeNokkel(leir: { tilbyder?: string | null; tittel?: string | null; kommune?: string | null; by?: string | null }): string;
export function grupperLeirer<T extends { id: string; uke?: number | string | null }>(leirer: readonly T[]): T[][];
export function gruppeSlugBasis(medlemmer: { id: string; tilbyder?: string | null; tittel?: string | null; kommune?: string | null; by?: string | null }[]): string;
export function medSlug<T extends { id: string }>(grupper: readonly (readonly T[])[]): { slug: string; medlemmer: T[] }[];
export function formaterUkeTall(uker: number[]): string;
export function ukeTallFra(medlemmer: { uke: number | string | null }[]): number[];
export function gruppeTrefferUke(medlemmer: LeirUke[], aar: number, uke: number): boolean;
export function besteStatus(statuser: string[]): "verifisert" | "delvis" | "forventet";
export function gruppeTellerMotTerskel(medlemmer: (LeirUke & { status?: string; demo?: boolean })[], iDag: string): boolean;
export function antallSomTeller(leirer: (LeirUke & { id: string; status?: string; demo?: boolean; tilbyder?: string; tittel?: string; kommune?: string; by?: string | null })[], iDag: string): number;
export function pameldingErLik(medlemmer: { pameldingStatus?: string | null; pameldingApner?: string | null }[]): boolean;
export function skolerutaIndeks(kind: string, locale: string): boolean | null;
export function hreflangLokaler(kind: string): ("nb" | "sv" | "en")[];
export function prisVisning(
  prisLabel: string | null | undefined,
  prisNotat: string | null | undefined,
  mangler: string,
): { linje: string; notat: string | null };
export function pameldingModus(
  status: string | null | undefined,
  apner: string | null | undefined,
  iDag: string,
): "apnet" | "apner" | "status";

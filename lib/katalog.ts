import type { Metadata } from "next";
import siteConfig from "@/config/site.json";
import leirerJson from "@/data/leirer.json";
import skoleruteJson from "@/data/skolerute.json";
import sokeTitler from "@/data/sokeord.json";
import vinterIntroNb from "@/data/intro-vinterferie-nb.json";
import sommerIntroNb from "@/data/intro-sommerferie-nb.json";
import geografiJson from "@/data/geografi.json";
import { globaleSider } from "@/lib/globale-ruter.mjs";
import { lesSkolekalender, norskeKalenderSider, regionInnhold } from "@/lib/skolekalender.mjs";
import { sideInnhold, tilbudSider } from "@/lib/bolge-ruter.mjs";
import globaleLeirerJson from "@/data/leirer-global.json";
import {
  campIFerie,
  campUker,
  erHelUke,
  ferieFelter,
  heleFerieuker,
  ferieUkeTekst,
  sommerKommuneTekst,
  kommunerISesong,
  kommunerMedFri,
  leggTilDager,
  fjoraarsTekst,
  rensPerson,
  sesongDeler,
  skolearKort,
  skolearSlutt,
  skolerutaIndeks,
  hreflangLokaler,
  slug,
  synlig,
  TEMA_MIN,
  TYPE_STI,
  typeSlug,
  ukeListe,
  utenPamelding,
  pameldingModus,
  pameldingErLik,
  besteStatus,
  erFjoraarsSommer,
  formaterUkeTall,
  sommerPeriode,
  sommerSideUker,
  gruppeNokkel,
  gruppeTellerMotTerskel,
  grupperLeirer,
  medSlug,
  ukeTallFra,
  ukeMandag,
  ukeNokkel,
} from "@/lib/pure.mjs";
import { COPY, copy, fyll, intlLocale, type Copy, type Locale, LOCALES } from "@/lib/i18n";

type SesongNavn = "vinter" | "sommer" | "host" | "paske";

type FeriePeriode = { uke?: number | null; datoFra: string; datoTil: string };

type SkoleruteRad = {
  skolear: string;
  kommune: string;
  hostferie: FeriePeriode | null;
  vinterferie: FeriePeriode | null;
  paske: FeriePeriode | null;
  kildeUrl: string;
  merknad: string | null;
  slug?: string;
  fylke?: string | null;
  sommer?: {
    sisteSkole: string | null;
    forsteSkole: string | null;
    kildeUrl: string | null;
    forsteKildeUrl: string | null;
  } | null;
};

function sesongNavn(verdi: string): SesongNavn {
  if (verdi === "vinter" || verdi === "sommer" || verdi === "host" || verdi === "paske") return verdi;
  return "vinter";
}

export const site = siteConfig;
export const I_DAG = new Date().toISOString().slice(0, 10);
export type Leir = {
  id: string;
  tittel: string;
  tilbyder: string;
  tilbyderUrl: string | null;
  url: string;
  type: string;
  sesong: string;
  uke: number | string;
  datoFra: string | null;
  datoTil: string | null;
  alderFra: number | null;
  alderTil: number | null;
  prisNok: number | null;
  prisNotat: string | null;
  by: string | null;
  kommune: string;
  fylke: string | null;
  land: string;
  status: "verifisert" | "delvis" | "forventet";
  notat: string | null;
  kildeSjekket: string | null;
  lenkestatus: "ok" | "usikker" | "utløpt" | null;
  dod: boolean;
  pameldingStatus: "apen" | "ikke_apnet" | "full" | "stengt" | null;
  pameldingApner: string | null;
  fremhevet: boolean;
  demo: boolean;
};

export const leirer = leirerJson as Leir[];
const globaleLeirer = globaleLeirerJson as Leir[];
const bolgeSider = tilbudSider(globaleLeirer);
const bolgeAvPath = new Map(bolgeSider.map((side) => [side.path, side]));

type GeoSted = { iso2: string; region: string; slug: string; navn: { nb: string; sv: string; en: string } };
type GeoRegion = { iso2: string; slug: string; navn: { nb: string; sv: string; en: string } };
const geografi = geografiJson as unknown as { steder: GeoSted[]; regioner: GeoRegion[]; ferier: never[]; tilbud: never[] };
const skolekalender = lesSkolekalender();
const stedAvSlug = new Map(geografi.steder.map((sted) => [sted.slug, sted]));
const regionAvNokkel = new Map(geografi.regioner.map((region) => [`${region.iso2}:${region.slug}`, region]));
export const skolerute = skoleruteJson as SkoleruteRad[];

const SESONG_STI: Record<SesongNavn, string> = {
  vinter: "vinterferie",
  sommer: "sommerleir",
  host: "hostferie",
  paske: "paskeferie",
};

export type Rute =
  | { kind: "hjem"; locale: Locale; slug: string[] }
  | { kind: "sesong"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number }
  | { kind: "ferieUke"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number; uke: number }
  | { kind: "fylke"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number; fylkeSlug: string }
  | { kind: "skoleruta"; locale: Locale; slug: string[]; kommuneSlug: string }
  | { kind: "skolerutaHub"; locale: Locale; slug: string[] }
  | { kind: "type"; locale: Locale; slug: string[]; typeSlug: string; offentlig: boolean }
  | { kind: "typeKommune"; locale: Locale; slug: string[]; typeSti: string; kommuneSlug: string }
  | { kind: "leir"; locale: Locale; slug: string[]; id: string }
  | { kind: "fremhevet"; locale: Locale; slug: string[] }
  | { kind: "personvern"; locale: Locale; slug: string[] }
  | { kind: "ferieKommune"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number; kommuneSlug: string }
  | {
      kind: "global";
      locale: Locale;
      slug: string[];
      path: string;
      globalKind: "school-holidays" | "by-kategori" | "land" | "region" | "by" | "by-ferie" | "by-uke";
      offisiell: boolean;
      antall: number;
      regionSlug: string | null;
      maal: string | null;
      indeks: boolean;
      landKode: string | null;
      slag: string | null;
    };

const PERSONVERN_STI: Record<Locale, string> = {
  nb: "personvern",
  sv: "integritet",
  en: "privacy",
};

export type CampView = {
  id: string;
  href: string;
  tittel: string;
  tilbyder: string;
  url: string;
  tilbyderUrl: string | null;
  typeSlug: string;
  typeLabel: string;
  kommune: string;
  kommuneSlug: string;
  land: string;
  regionSlug: string;
  regionNavn: string;
  sted: string;
  uker: string[];
  ukeLabel: string;
  fjoraarsUker: number[] | null;
  datoLabel: string | null;
  alderLabel: string | null;
  alderFra: number | null;
  alderTil: number | null;
  prisLabel: string | null;
  prisNotat: string | null;
  status: Leir["status"];
  statusLabel: string | null;
  notat: string | null;
  fremhevet: boolean;
  demo: boolean;
  utenPamelding: boolean;
  gratis: boolean;
  pameldingLabel: string | null;
  apnerLabel: string | null;
  sjekketLabel: string | null;
  sesong: string;
  kortLinje: string | null;
  ferieBadge: string | null;
  datoFra: string | null;
  notatIListe: string | null;
  sesonger: string[];
  aldre: { fra: number | null; til: number | null }[];
  ukerader: UkeRad[];
};

type UkeRad = {
  id: string;
  ukeLabel: string;
  datoLabel: string | null;
  prisLabel: string | null;
  prisNotat: string | null;
  pameldingLabel: string;
  apnerLabel: string | null;
  sjekketLabel: string | null;
  url: string;
};

export type FerieLinje = {
  kommune: string;
  href: string;
  label: string;
  dato: string;
  uke: number | null;
  uker: string | null;
};

export type SideModell = {
  rute: Rute;
  tekst: Copy;
  h1: string;
  ingress: string;
  kalenderUke: string | null;
  ferieOverskrift: string | null;
  ferieListe: FerieLinje[];
  skoleruteKort: null | {
    skolear: string;
    kildeUrl: string;
    merknad: string | null;
    ferier: { label: string; dato: string; uke: number | null; uker: string | null; href?: string }[];
  };
  sommerLinje: string | null;
  sommerKilder: { href: string; label: string }[];
  regionKalender: null | {
    helligdager: { navn: string; dato: string; uke: string; fridager: number; kilder: string[] }[];
    kommuner: {
      navn: string;
      href: string | null;
      rader: { navn: string; dato: string; uke: string; fridager: number; skolear: string; kilder: string[] }[];
    }[];
  };
  leirer: CampView[];
  filter: boolean;
  crumbs: { name: string; href: string }[];
  sesongLenker: { href: string; label: string; blurb: string }[];
  spraakKode: string | null;
  dokumentTittel: string | null;
  dokumentBeskrivelse: string | null;
  utenlandsk: null | {
    tilbud: { tittel: string; tilbyder: string; href: string; meta: string }[];
    lenker: { href: string; label: string }[];
  };
};

function sti(locale: Locale, parts: string[]): string {
  const segs = locale === "nb" ? parts : [locale, ...parts];
  if (!segs.length) return "/";
  return `/${segs.join("/")}/`;
}

export function absolut(path: string): string {
  return `${site.url}${path}`;
}

function formatDato(iso: string, locale: Locale, medAar = true): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    ...(medAar ? { year: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

function formatPeriode(fra: string | null, til: string | null, locale: Locale): string | null {
  if (!fra && !til) return null;
  if (fra && til && fra !== til) return `${formatDato(fra, locale)}–${formatDato(til, locale)}`;
  return formatDato((fra || til) as string, locale);
}

function formatPris(nok: number | null, locale: Locale): string | null {
  if (nok == null) return null;
  return new Intl.NumberFormat(intlLocale(locale), {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(nok);
}

function formatAlder(fra: number | null, til: number | null, tekst: Copy): string | null {
  if (fra != null && til != null) return fyll(tekst.ageRange, { fra, til });
  if (fra != null) return fyll(tekst.fromAge, { alder: fra });
  if (til != null) return fyll(tekst.toAge, { alder: til });
  return null;
}

function formatUke(uke: number | string, tekst: Copy): string {
  if (typeof uke === "number") return fyll(tekst.week, { nr: uke });
  const s = String(uke);
  if (/^\d+-\d+$/.test(s)) {
    const [a, b] = s.split("-");
    return fyll(tekst.weeks, { nr: `${a}–${b}` });
  }
  return fyll(tekst.weeks, { nr: s.replace(/,/g, ", ") });
}

function synlige(): Leir[] {
  return leirer.filter((e) => synlig(e, I_DAG));
}

const GRUPPER: { slug: string; medlemmer: Leir[] }[] = medSlug(grupperLeirer(leirer));
const GRUPPE_SLUG = new Map<string, Leir[]>(GRUPPER.map((g) => [g.slug, g.medlemmer]));
const SLUG_AV_NOKKEL = new Map<string, string>(GRUPPER.map((g) => [gruppeNokkel(g.medlemmer[0]), g.slug]));

function grupperFor(liste: Leir[]): { slug: string; medlemmer: Leir[] }[] {
  const nokler = new Set(liste.map((e) => gruppeNokkel(e)));
  const ut: { slug: string; medlemmer: Leir[] }[] = [];
  for (const g of GRUPPER) {
    if (!nokler.has(gruppeNokkel(g.medlemmer[0]))) continue;
    const syn = g.medlemmer.filter((e) => synlig(e, I_DAG));
    if (syn.length) ut.push({ slug: g.slug, medlemmer: syn });
  }
  return ut;
}

function antallIndeks(liste: Leir[]): number {
  const nokler = new Set(liste.map((e) => gruppeNokkel(e)));
  let n = 0;
  for (const g of GRUPPER) {
    if (!nokler.has(gruppeNokkel(g.medlemmer[0]))) continue;
    if (gruppeTellerMotTerskel(g.medlemmer, I_DAG)) n += 1;
  }
  return n;
}

const kommuneNavn = new Map<string, string>();
for (const e of leirer) {
  if (e.kommune) kommuneNavn.set(slug(e.kommune), e.kommune);
}
for (const rad of skolerute) kommuneNavn.set(rad.slug || slug(rad.kommune), rad.kommune);

const typeNavn = new Map<string, string>();
for (const e of synlige()) {
  if (e.type) typeNavn.set(typeSlug(e.type), e.type);
}

function skoleruteFor(kommuneSlug: string): SkoleruteRad | null {
  return (
    skolerute.find((rad) => rad.slug === kommuneSlug) ??
    skolerute.find((rad) => slug(rad.kommune) === kommuneSlug) ??
    null
  );
}

function ukerIDato(fra: string | null | undefined, til: string | null | undefined, aar: number): number[] {
  if (!fra || !til) return [];
  return heleFerieuker(fra, til).filter((u) => u.aar === aar).map((u) => u.uke);
}

function ukeVisning(fra: string | null | undefined, til: string | null | undefined, locale: Locale = "nb"): string | null {
  const tekst = ferieUkeTekst(fra, til, locale);
  if (!tekst) return null;
  return `${tekst.kort}${tekst.detalj}`;
}

function leirerFor(rute: Rute): Leir[] {
  const alle = synlige();
  if (rute.kind === "hjem") return alle;
  if (rute.kind === "sesong") {
    return alle.filter((e) => e.sesong === `${rute.navn}${rute.aar}`);
  }
  if (rute.kind === "ferieUke") {
    const nokkel = ukeNokkel(rute.aar, rute.uke);
    return alle.filter((e) => sesongDeler(e.sesong)?.navn === rute.navn && !erFjoraarsSommer(e) && campUker(e).includes(nokkel));
  }
  if (rute.kind === "skoleruta") {
    return alle.filter((e) => slug(e.kommune) === rute.kommuneSlug);
  }
  if (rute.kind === "fylke") {
    return alle.filter((e) => {
      const del = sesongDeler(e.sesong);
      return del?.navn === rute.navn && del.aar === rute.aar && slug(e.fylke || "") === rute.fylkeSlug;
    });
  }
  if (rute.kind === "type") {
    const sti = TYPE_STI as Record<string, string>;
    return alle.filter((e) => (rute.offentlig ? sti[e.type] === rute.typeSlug : typeSlug(e.type) === rute.typeSlug && !sti[e.type]));
  }
  if (rute.kind === "typeKommune") {
    const sti = TYPE_STI as Record<string, string>;
    return alle.filter((e) => sti[e.type] === rute.typeSti && slug(e.kommune) === rute.kommuneSlug);
  }
  if (rute.kind === "ferieKommune") {
    return alle.filter((e) => {
      const del = sesongDeler(e.sesong);
      return slug(e.kommune) === rute.kommuneSlug && del?.navn === rute.navn && del.aar === rute.aar;
    });
  }
  return [];
}

export function indekserbar(rute: Rute): boolean {
  if (rute.kind === "skoleruta" || rute.kind === "skolerutaHub") return skolerutaIndeks(rute.kind, rute.locale) === true;
  if (rute.kind === "fremhevet" || rute.kind === "personvern") return true;
  if (rute.kind === "global") return rute.indeks === true;
  if (rute.kind === "leir") {
    return gruppeTellerMotTerskel(GRUPPE_SLUG.get(rute.id) || [], I_DAG);
  }
  return antallIndeks(leirerFor(rute)) >= TEMA_MIN;
}

function feltFor(rad: (typeof skolerute)[number], navn: SesongNavn) {
  if (navn === "host") return rad.hostferie;
  if (navn === "vinter") return rad.vinterferie;
  if (navn === "paske") return rad.paske;
  return null;
}

/** Neste sesong med dato i dag eller senere. Ellers den siste vi har. Året kommer fra dataene. */
function sesongAar(navn: SesongNavn): number | null {
  const starter: { aar: number; start: string }[] = [];
  for (const rad of skolerute) {
    const felt = feltFor(rad, navn);
    if (!felt?.datoFra) continue;
    const fraDato = Number(felt.datoFra.slice(0, 4));
    const aar = navn === "host" ? (skolearSlutt(rad.skolear) ?? fraDato) : fraDato;
    starter.push({ aar, start: felt.datoFra });
  }
  for (const e of synlige()) {
    const del = sesongDeler(e.sesong);
    if (!del || del.navn !== navn) continue;
    starter.push({ aar: del.aar, start: e.datoFra || `${del.aar}-12-31` });
  }
  if (!starter.length) return null;
  const kommende = starter.filter((s) => s.start >= I_DAG).sort((a, b) => a.start.localeCompare(b.start));
  if (kommende.length) return kommende[0].aar;
  starter.sort((a, b) => b.start.localeCompare(a.start));
  return starter[0].aar;
}

function sesongLenker(locale: Locale): { href: string; label: string; blurb: string }[] {
  const tekst = copy(locale);
  const ut: { href: string; label: string; blurb: string }[] = [];
  for (const navn of ["vinter", "paske", "sommer", "host"] as SesongNavn[]) {
    const year = sesongAar(navn);
    if (year == null || !harSesong(navn, year)) continue;
    ut.push({
      href: sti(locale, [SESONG_STI[navn]]),
      label: sesongTittel(tekst, navn, year),
      blurb: tekst.seasonBlurb[navn],
    });
  }
  return ut;
}

function harSesong(navn: SesongNavn, aar: number): boolean {
  if (synlige().some((e) => e.sesong === `${navn}${aar}`)) return true;
  return kommunerISesong(skolerute, navn, aar).length > 0;
}

function sesongTittel(tekst: Copy, navn: SesongNavn, aar: number): string {
  const navnTekst = tekst.seasonName[navn];
  if (navn === "host") {
    const rad = skolerute.find((r) => skolearSlutt(r.skolear) === aar && r.hostferie);
    if (rad) return `${navnTekst} ${skolearKort(rad.skolear)}`;
  }
  return `${navnTekst} ${aar}`;
}

function ukeTekst(uker: number[], og: string): string {
  const unike = [...new Set(uker.filter((u) => Number.isInteger(u)))].sort((a, b) => a - b);
  if (!unike.length) return "";
  if (unike.length === 1) return String(unike[0]);
  if (unike.length === 2) return `${unike[0]} ${og} ${unike[1]}`;
  return `${unike.slice(0, -1).join(", ")} ${og} ${unike[unike.length - 1]}`;
}

function overskrift(rute: Rute): string {
  if (rute.locale === "nb" && rute.kind !== "hjem" && rute.kind !== "leir") {
    const path = sammeSti({ ...rute, locale: "nb" }, "nb").replace(/\/$/, "");
    const fraSok = (sokeTitler as Record<string, string>)[path];
    if (fraSok) return fraSok;
  }
  const tekst = copy(rute.locale);
  const og = rute.locale === "en" ? "and" : "og";
  if (rute.kind === "sesong") {
    const uker = ukeTekst(
      kommunerISesong(skolerute, rute.navn, rute.aar)
        .flatMap((rad) => ukerIDato(rad.datoFra, rad.datoTil, rute.aar)),
      og,
    );
    const ferie = sesongTittel(tekst, rute.navn, rute.aar);
    return uker ? fyll(tekst.h1SeasonWeek, { ferie, uke: uker }) : fyll(tekst.h1Season, { ferie });
  }
  if (rute.kind === "ferieUke") {
    const fri = kommunerMedFri(skolerute, rute.aar, rute.uke);
    const nokler = [...new Set(fri.map((rad) => rad.nokkel))];
    if (nokler.length === 1) {
      const nokkel = sesongNavn(String(nokler[0]));
      const ferieNavn = tekst.seasonName[nokkel];
      const aarVis = nokkel === "host" ? skolearKort(fri[0].skolear) : String(rute.aar);
      return fyll(tekst.h1WeekHoliday, { ferie: `${ferieNavn} ${aarVis}`, nr: rute.uke });
    }
    return fyll(tekst.h1Week, { nr: rute.uke, aar: rute.aar });
  }
  if (rute.kind === "skoleruta") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    const rad = skoleruteFor(rute.kommuneSlug);
    const deler: string[] = [];
    const hostUker = ukeVisning(rad?.hostferie?.datoFra, rad?.hostferie?.datoTil, rute.locale);
    const vinterUker = ukeVisning(rad?.vinterferie?.datoFra, rad?.vinterferie?.datoTil, rute.locale);
    if (hostUker) deler.push(`${tekst.seasonName.host} ${tekst.weekWord} ${hostUker}`);
    if (vinterUker) deler.push(`${tekst.seasonName.vinter} ${tekst.weekWord} ${vinterUker}`);
    if (deler.length) return fyll(tekst.h1PlaceWeek, { by: navn, uker: deler.join(", ") });
    return fyll(tekst.h1Place, { by: navn });
  }
  if (rute.kind === "ferieKommune") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    const ferie = tekst.seasonName[rute.navn];
    const rad = skoleruteFor(rute.kommuneSlug);
    const felt = rad ? feltFor(rad, rute.navn) : null;
    const hele = ukeVisning(felt?.datoFra, felt?.datoTil, rute.locale);
    if (hele) return fyll(tekst.h1HolidayPlace, { ferie, by: navn, aar: rute.aar, uke: hele });
    return fyll(tekst.h1HolidayPlaceNoWeek, { ferie, by: navn, aar: rute.aar });
  }
  return tekst.heroTitle;
}

function legg(ruter: Rute[], locale: Locale, uten: string[], rute: object) {
  const slugDeler = locale === "nb" ? uten : [locale, ...uten];
  ruter.push({ ...rute, locale, slug: slugDeler } as Rute);
}

function byggRuter(): Rute[] {
  const ruter: Rute[] = [];
  const fylkeNavn = new Map<string, string>();
  for (const rad of skolerute) {
    if (rad.fylke) fylkeNavn.set(slug(rad.fylke), rad.fylke);
  }
  for (const e of synlige()) {
    if (e.fylke) fylkeNavn.set(slug(e.fylke), e.fylke);
  }
  const ukerFor = (navn: SesongNavn, year: number) => {
    const sett = new Set<number>();
    for (const rad of skolerute) {
      const felt = feltFor(rad, navn);
      for (const uke of ukerIDato(felt?.datoFra, felt?.datoTil, year)) sett.add(uke);
      if (navn === "sommer") {
        for (const uke of sommerSideUker(rad, year)) sett.add(uke);
      }
    }
    for (const e of synlige()) {
      const del = sesongDeler(e.sesong);
      if (!del || del.navn !== navn || del.aar !== year || erFjoraarsSommer(e)) continue;
      for (const u of ukeListe(e.uke)) sett.add(u);
    }
    return [...sett].sort((a, b) => a - b);
  };
  for (const locale of LOCALES) {
    legg(ruter, locale, [], { kind: "hjem" });
    legg(ruter, locale, ["skoleruta"], { kind: "skolerutaHub" });
    legg(ruter, locale, ["arrangor"], { kind: "fremhevet" });
    legg(ruter, locale, [PERSONVERN_STI[locale]], { kind: "personvern" });
    for (const rad of skolerute) {
      const kommuneSlug = rad.slug || slug(rad.kommune);
      legg(ruter, locale, ["skoleruta", kommuneSlug], { kind: "skoleruta", kommuneSlug });
    }
    for (const navn of Object.keys(SESONG_STI) as SesongNavn[]) {
      const year = sesongAar(navn);
      if (year == null || !harSesong(navn, year)) continue;
      const rot = SESONG_STI[navn];
      legg(ruter, locale, [rot], { kind: "sesong", navn, aar: year });
      for (const [kommuneSlug] of kommuneNavn) {
        const har = synlige().some((e) => {
          const del = sesongDeler(e.sesong);
          return slug(e.kommune) === kommuneSlug && del?.navn === navn && del.aar === year;
        });
        if (!har) continue;
        legg(ruter, locale, [rot, kommuneSlug], { kind: "ferieKommune", navn, aar: year, kommuneSlug });
      }
      for (const uke of ukerFor(navn, year)) {
        legg(ruter, locale, [rot, `uke-${uke}`], { kind: "ferieUke", navn, aar: year, uke });
      }
      for (const [fylkeSlug] of fylkeNavn) {
        const harFylke = skolerute.some((rad) => slug(rad.fylke || "") === fylkeSlug && feltFor(rad, navn))
          || synlige().some((e) => sesongDeler(e.sesong)?.navn === navn && slug(e.fylke || "") === fylkeSlug);
        if (!harFylke) continue;
        legg(ruter, locale, [rot, "fylke", fylkeSlug], { kind: "fylke", navn, aar: year, fylkeSlug });
      }
    }
    for (const [typeSti] of Object.entries(TYPE_STI)) {
      const har = synlige().some((e) => (TYPE_STI as Record<string, string>)[e.type] === typeSti);
      if (!har) continue;
      legg(ruter, locale, [typeSti], { kind: "type", typeSlug: typeSti, offentlig: true });
      for (const [kommuneSlug] of kommuneNavn) {
        const harK = synlige().some((e) => (TYPE_STI as Record<string, string>)[e.type] === typeSti && slug(e.kommune) === kommuneSlug);
        if (!harK) continue;
        legg(ruter, locale, [typeSti, kommuneSlug], { kind: "typeKommune", typeSti, kommuneSlug });
      }
    }
    for (const [tSlug] of [...typeNavn.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      if (Object.values(TYPE_STI).includes(tSlug)) continue;
      const har = synlige().some((e) => typeSlug(e.type) === tSlug && !(TYPE_STI as Record<string, string>)[e.type]);
      if (!har) continue;
      legg(ruter, locale, ["type", tSlug], { kind: "type", typeSlug: tSlug, offentlig: false });
    }
    for (const g of GRUPPER) {
      if (!g.medlemmer.some((e) => synlig(e, I_DAG))) continue;
      legg(ruter, locale, ["leir", g.slug], { kind: "leir", id: g.slug });
    }
  }
  for (const side of [...globaleSider(geografi), ...norskeKalenderSider(geografi, skolekalender), ...bolgeSider]) {
    if (side.locale && side.locale !== "nb" && side.locale !== "sv" && side.locale !== "en" && !side.maal) continue;
    if (side.path.startsWith("/no/") && side.kind !== "school-holidays") continue;
    const deler = side.path.split("/").filter(Boolean);
    const norskKalender = side.path.startsWith("/no/");
    ruter.push({
      kind: "global",
      locale: (side.locale === "sv" || side.locale === "en" ? side.locale : "nb") as Locale,
      slug: deler,
      path: side.path,
      globalKind: side.kind as "school-holidays" | "by-kategori" | "land" | "region" | "by" | "by-ferie" | "by-uke",
      offisiell: side.offisiell === true,
      antall: side.antall ?? 0,
      regionSlug: side.region ?? null,
      maal: side.maal ?? (norskKalender ? "nb-NO" : null),
      indeks: typeof side.indeks === "boolean" ? side.indeks : norskKalender ? side.offisiell === true : (side.antall ?? 0) >= TEMA_MIN,
      landKode: side.land ?? (norskKalender ? "NO" : null),
      slag: side.slag ?? (side.kind === "school-holidays" ? "kalender" : "kategori"),
    });
  }
  const nokler = ruter.map((r) => r.slug.join("/"));
  if (new Set(nokler).size !== nokler.length) {
    throw new Error("Duplikat-URL i rutetabellen");
  }
  return ruter;
}

const RUTER = byggRuter();
const RUTE_MAP = new Map(RUTER.map((rute) => [rute.slug.join("/"), rute]));

export function alleRuter(): Rute[] {
  return RUTER;
}

export function finnRute(slug: string[] | undefined): Rute | null {
  return RUTE_MAP.get((slug ?? []).join("/")) ?? null;
}

export function sammeSti(rute: Rute, locale: Locale): string {
  if (rute.kind === "global") return rute.path;
  if (rute.kind === "personvern") return sti(locale, [PERSONVERN_STI[locale]]);
  const uten = rute.locale === "nb" ? rute.slug : rute.slug.slice(1);
  return sti(locale, uten);
}

function sommerVisning(rad: SkoleruteRad | null, locale: Locale, tekst: Copy): { linje: string; kilder: { href: string; label: string }[] } | null {
  if (!rad) return null;
  const periode = sommerPeriode(rad);
  if (!periode || !periode.uker.length) return null;
  const ukeTekst = ferieUkeTekst(periode.fra, periode.til, locale);
  if (!ukeTekst) return null;
  const fra = formatDato(periode.fra, locale);
  const linje = periode.komplett && periode.til
    ? fyll(tekst.summerBoth, { fra, til: formatDato(periode.til, locale), uker: ukeTekst.kort, detalj: ukeTekst.detalj })
    : fyll(tekst.summerStart, { fra, uker: ukeTekst.kort, detalj: ukeTekst.detalj });
  const kilder: { href: string; label: string }[] = [];
  if (periode.kildeUrl) kilder.push({ href: periode.kildeUrl, label: tekst.source });
  if (periode.forsteKildeUrl && periode.forsteKildeUrl !== periode.kildeUrl) {
    kilder.push({ href: periode.forsteKildeUrl, label: tekst.summerSourceFirst });
  }
  return { linje, kilder };
}

function pameldingLinjer(e: Leir, locale: Locale, tekst: Copy): { pameldingLabel: string; apnerLabel: string | null } {
  const modus = pameldingModus(e.pameldingStatus, e.pameldingApner, I_DAG);
  if (modus === "apnet" && e.pameldingApner) {
    return { pameldingLabel: fyll(tekst.openedCheck, { dato: formatDato(e.pameldingApner, locale, false) }), apnerLabel: null };
  }
  return {
    pameldingLabel: e.pameldingStatus ? tekst.pamelding[e.pameldingStatus] : tekst.pamelding.ukjent,
    apnerLabel: modus === "apner" && e.pameldingApner ? fyll(tekst.opens, { dato: formatDato(e.pameldingApner, locale) }) : null,
  };
}

function prisFor(e: Leir, locale: Locale, tekst: Copy): string | null {
  if (e.prisNok == null) return null;
  if (e.status === "forventet") {
    return e.prisNok === 0 ? tekst.lastYearFree : fyll(tekst.lastYearPrice, { pris: formatPris(e.prisNok, locale) });
  }
  return e.prisNok === 0 ? tekst.gratis : formatPris(e.prisNok, locale);
}

function prisForGruppe(medlemmer: Leir[], locale: Locale, tekst: Copy): string | null {
  const tall = medlemmer.map((e) => e.prisNok).filter((n): n is number => n != null);
  if (!tall.length) return null;
  const min = Math.min(...tall);
  const max = Math.max(...tall);
  const forventet = medlemmer.every((e) => e.status === "forventet");
  if (min === max) return prisFor({ ...medlemmer[0], prisNok: min, status: forventet ? "forventet" : "verifisert" }, locale, tekst);
  if (min === 0) return `${tekst.gratis}–${formatPris(max, locale)}`;
  const fra = fyll(tekst.fromPrice, { pris: formatPris(min, locale) });
  return forventet ? fyll(tekst.lastYearPrice, { pris: fra }) : fra;
}

function groupView(slugId: string, medlemmer: Leir[], locale: Locale, ferieBadge: string | null): CampView {
  const tekst = copy(locale);
  const sortert = [...medlemmer].sort((a, b) => String(a.uke).localeCompare(String(b.uke), "nb", { numeric: true }) || a.id.localeCompare(b.id));
  const best = besteStatus(sortert.map((e) => e.status));
  const rep = sortert.find((e) => e.status === best) || sortert[0];
  const aar = sesongDeler(rep.sesong)?.aar;
  const statusLabel = best === "forventet" ? fyll(tekst.expected, { år: aar ?? "" }) : best === "delvis" ? tekst.partial : null;
  const sted = rep.by && rep.by !== rep.kommune ? `${rep.by}, ${rep.kommune}` : rep.kommune;
  const datoerFra = sortert.map((e) => e.datoFra).filter((d): d is string => !!d).sort();
  const datoerTil = sortert.map((e) => e.datoTil).filter((d): d is string => !!d).sort();
  const bareFjor = sortert.length > 0 && sortert.every((e) => erFjoraarsSommer(e));
  const fjoraarsUker = bareFjor ? ukeTallFra(sortert) : null;
  const visning = bareFjor ? [] : sortert.filter((e) => !erFjoraarsSommer(e));
  const ukerTekst = formaterUkeTall(ukeTallFra(visning.length ? visning : sortert));
  const sesongAar = aar ?? 2027;
  const likPamelding = pameldingErLik(sortert);
  const felles = likPamelding ? pameldingLinjer(sortert[0], locale, tekst) : { pameldingLabel: null, apnerLabel: null };
  const notater = [...new Set(sortert.map((e) => rensPerson(e.notat)).filter((n): n is string => !!n))];
  const kort = [...new Set(sortert.map((e) => {
    const fjor = fjoraarsTekst(e.notat);
    if (fjor) return fyll(tekst.lastYearLine, { dato: fjor });
    if (e.status === "forventet") return tekst.expectedShort;
    return "";
  }).filter(Boolean))];
  const sjekket = sortert.map((e) => e.kildeSjekket).filter((d): d is string => !!d).sort().at(-1) || null;
  const prisNotater = [...new Set(sortert.map((e) => e.prisNotat || ""))];
  const aldre = sortert.map((e) => ({ fra: e.alderFra, til: e.alderTil }));
  const unikeAlder = [...new Set(sortert.map((e) => formatAlder(e.alderFra, e.alderTil, tekst) || ""))];
  return {
    id: slugId,
    href: sti(locale, ["leir", slugId]),
    tittel: rep.tittel,
    tilbyder: rep.tilbyder,
    url: rep.url,
    tilbyderUrl: rep.tilbyderUrl,
    typeSlug: typeSlug(rep.type),
    typeLabel: tekst.types[rep.type] || rep.type,
    kommune: rep.kommune,
    kommuneSlug: slug(rep.kommune),
    land: stedAvSlug.get(slug(rep.kommune))?.iso2 || rep.land || "NO",
    regionSlug: stedAvSlug.get(slug(rep.kommune))?.region || "",
    regionNavn: (() => {
      const sted = stedAvSlug.get(slug(rep.kommune));
      const region = sted ? regionAvNokkel.get(`${sted.iso2}:${sted.region}`) : undefined;
      if (!region) return rep.fylke || "";
      return region.navn[locale] || region.navn.nb;
    })(),
    sted,
    uker: [...new Set(sortert.flatMap((e) => campUker(e)))].sort(),
    ukeLabel: fjoraarsUker?.length
      ? fyll(tekst.expectedSummer, { aar: sesongAar, fjor: sesongAar - 1, uker: formaterUkeTall(fjoraarsUker) })
      : ukerTekst
        ? fyll(tekst.weeks, { nr: ukerTekst })
        : formatUke(rep.uke, tekst),
    fjoraarsUker,
    datoLabel: fjoraarsUker?.length ? null : formatPeriode(datoerFra[0] || null, datoerTil.at(-1) || null, locale),
    alderLabel: unikeAlder.filter(Boolean).join(", ") || null,
    alderFra: aldre.reduce<number | null>((min, a) => (a.fra == null ? min : min == null ? a.fra : Math.min(min, a.fra)), null),
    alderTil: aldre.reduce<number | null>((max, a) => (a.til == null ? max : max == null ? a.til : Math.max(max, a.til)), null),
    prisLabel: prisForGruppe(sortert, locale, tekst),
    prisNotat: prisNotater.length === 1 ? prisNotater[0] || null : null,
    status: best,
    statusLabel,
    notat: notater.join("\n") || null,
    notatIListe: best === "verifisert" ? null : notater.join("\n") || null,
    fremhevet: false,
    demo: sortert.every((e) => e.demo),
    utenPamelding: sortert.every((e) => utenPamelding(e)),
    gratis: sortert.every((e) => e.prisNok === 0),
    pameldingLabel: felles.pameldingLabel,
    apnerLabel: felles.apnerLabel,
    sjekketLabel: sjekket ? fyll(tekst.checked, { dato: formatDato(sjekket, locale) }) : null,
    sesong: rep.sesong,
    sesonger: [...new Set(sortert.map((e) => e.sesong))],
    kortLinje: kort.length === 1 ? kort[0] : best === "forventet" ? tekst.expectedShort : null,
    ferieBadge,
    datoFra: datoerFra[0] || null,
    aldre,
    ukerader: sortert.map((e) => {
      const linjer = pameldingLinjer(e, locale, tekst);
      const fjor = erFjoraarsSommer(e);
      const fjorAar = (sesongDeler(e.sesong)?.aar ?? sesongAar) - 1;
      return {
        id: e.id,
        ukeLabel: fjor
          ? fyll(tekst.expectedSummerWeek, { fjor: fjorAar, uker: formaterUkeTall(ukeListe(e.uke)) })
          : formatUke(e.uke, tekst),
        datoLabel: fjor ? null : formatPeriode(e.datoFra, e.datoTil, locale),
        prisLabel: prisFor(e, locale, tekst),
        prisNotat: e.prisNotat,
        pameldingLabel: linjer.pameldingLabel,
        apnerLabel: linjer.apnerLabel,
        sjekketLabel: e.kildeSjekket ? fyll(tekst.checked, { dato: formatDato(e.kildeSjekket, locale) }) : null,
        url: e.url,
      };
    }),
  };
}

function sorter(a: CampView, b: CampView): number {
  if (a.ferieBadge && !b.ferieBadge) return -1;
  if (!a.ferieBadge && b.ferieBadge) return 1;
  const da = a.datoFra || "9999";
  const db = b.datoFra || "9999";
  if (da !== db) return da.localeCompare(db);
  return a.tittel.localeCompare(b.tittel, "nb");
}

function ferieLinjer(locale: Locale, rader: ReturnType<typeof kommunerMedFri> | ReturnType<typeof kommunerISesong>): FerieLinje[] {
  const tekst = copy(locale);
  return rader
    .map((rad) => ({
      kommune: rad.kommune,
      href: sti(locale, [SESONG_STI[sesongNavn(String(rad.nokkel))], rad.slug]),
      label: tekst.seasonName[sesongNavn(String(rad.nokkel))],
      dato: formatPeriode(rad.datoFra, rad.datoTil, locale) || "",
      uke: heleFerieuker(rad.datoFra, rad.datoTil)[0]?.uke ?? null,
      uker: ukeVisning(rad.datoFra, rad.datoTil, locale),
    }))
    .sort((a, b) => (a.uke ?? 99) - (b.uke ?? 99) || a.kommune.localeCompare(b.kommune, "nb"));
}

function vinterIntro(rute: Rute): string | null {
  if (rute.kind !== "ferieKommune" || rute.navn !== "vinter" || rute.locale !== "nb") return null;
  const mal = (vinterIntroNb as Record<string, string>)[rute.kommuneSlug];
  if (!mal) return null;
  const felt = skoleruteFor(rute.kommuneSlug)?.vinterferie;
  const aar = String(rute.aar);
  const hele = ukeVisning(felt?.datoFra, felt?.datoTil);
  if (hele) return mal.replaceAll("{uke}", hele).replaceAll("{år}", aar);
  if (felt?.datoFra && felt.datoTil && !erHelUke(felt.datoFra, felt.datoTil)) {
    const dato = formatPeriode(felt.datoFra, felt.datoTil, "nb") || "";
    return mal.replace(/uke \{uke\}/g, dato).replaceAll("{år}", aar).replaceAll("{uke}", dato);
  }
  return mal.replaceAll("{uke}", felt?.uke != null ? String(felt.uke) : "").replaceAll("{år}", aar);
}

const sommerTekster = sommerIntroNb as {
  h1: string;
  ingress: string;
  kommuner: Record<string, string>;
};

function sommerIntro(rute: Rute): string | null {
  if (rute.kind !== "ferieKommune" || rute.navn !== "sommer" || rute.locale !== "nb") return null;
  const mal = sommerTekster.kommuner[rute.kommuneSlug];
  if (!mal) return null;
  const rad = skoleruteFor(rute.kommuneSlug);
  const periode = rad ? sommerPeriode(rad) : null;
  const kommune = rad?.kommune || kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
  const fra = periode?.komplett ? periode.fra : null;
  const til = periode?.komplett ? periode.til : null;
  return sommerKommuneTekst(mal, kommune, fra, til);
}

function soketittel(rute: Rute): string | null {
  if (rute.locale !== "nb" || rute.kind === "hjem" || rute.kind === "leir" || rute.kind === "fremhevet" || rute.kind === "personvern") return null;
  const path = sammeSti({ ...rute, locale: "nb" }, "nb").replace(/\/$/, "");
  return (sokeTitler as Record<string, string>)[path] || null;
}

export function modell(rute: Rute): SideModell {
  const tekst = copy(rute.locale);
  const home = sti(rute.locale, []);
  const sesonger = sesongLenker(rute.locale);
  let h1 = tekst.heroTitle;
  let ingress = tekst.heroSub;
  let kalenderUke: string | null = null;
  let ferieOverskrift: string | null = null;
  let ferieListe: FerieLinje[] = [];
  let skoleruteKort: SideModell["skoleruteKort"] = null;
  const badge = new Map<string, string>();

  let sommerLinje: string | null = null;
  let sommerKilder: { href: string; label: string }[] = [];
  let regionKalender: SideModell["regionKalender"] = null;
  let spraakKode: string | null = null;
  let dokumentTittel: string | null = null;
  let dokumentBeskrivelse: string | null = null;
  let utenlandsk: SideModell["utenlandsk"] = null;
  let utenlandskCrumbs: { name: string; href: string }[] | null = null;
  let sesongLenkerTom = false;
  if (rute.kind === "fremhevet") {
    h1 = tekst.featuredH1;
    ingress = tekst.featuredIntro;
  } else if (rute.kind === "personvern") {
    h1 = tekst.privacyH1;
    ingress = "";
  } else if (rute.kind !== "hjem" && rute.kind !== "leir") {
    h1 = overskrift(rute);
  }

  if (rute.kind === "sesong" && rute.navn === "sommer" && rute.locale === "nb") {
    h1 = sommerTekster.h1.replaceAll("{år}", String(rute.aar));
    ingress = sommerTekster.ingress;
  } else if (rute.kind === "sesong") {
    ingress = tekst.seasonBlurb[rute.navn];
  }
  if (rute.kind === "sesong") {
    const rader = kommunerISesong(skolerute, rute.navn, rute.aar);
    if (rader.length) {
      ferieOverskrift = tekst.offThisSeason;
      ferieListe = ferieLinjer(rute.locale, rader);
    }
  }

  if (rute.kind === "ferieUke") {
    const man = ukeMandag(rute.aar, rute.uke);
    const son = leggTilDager(man, 6);
    kalenderUke = fyll(tekst.calendarWeek, {
      nr: rute.uke,
      fra: formatDato(man, rute.locale),
      til: formatDato(son, rute.locale),
    });
    ingress = fyll(tekst.weekDescription, { nr: rute.uke, år: rute.aar });
    const rader = kommunerMedFri(skolerute, rute.aar, rute.uke);
    if (rader.length) {
      ferieOverskrift = tekst.offThisWeek;
      ferieListe = ferieLinjer(rute.locale, rader);
    }
  }

  if (rute.kind === "skoleruta") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    ingress =
      rute.locale === "en"
        ? `From football schools to nature camps in and around ${navn}, sorted by week.`
        : rute.locale === "sv"
          ? `Från fotbollsskola till naturläger i ${navn} med omnejd, sorterat efter vecka.`
          : `Fra fotballskole til naturleir i ${navn} og omegn, sortert på uke.`;
    const rad = skoleruteFor(rute.kommuneSlug);
    if (rad) {
      const ferier = ferieFelter(rad).map((f) => {
        const nokkel = sesongNavn(String(f.nokkel));
        return {
          label: tekst.seasonName[nokkel],
          dato: formatPeriode(f.datoFra, f.datoTil, rute.locale) || "",
          uke: heleFerieuker(f.datoFra, f.datoTil)[0]?.uke ?? null,
          uker: ukeVisning(f.datoFra, f.datoTil, rute.locale),
          href: sti(rute.locale, [SESONG_STI[nokkel], rute.kommuneSlug]),
        };
      });
      skoleruteKort = {
        skolear: skolearKort(rad.skolear),
        kildeUrl: rad.kildeUrl,
        merknad: rad.merknad,
        ferier,
      };
      const sommer = sommerVisning(rad, rute.locale, tekst);
      if (sommer) {
        sommerLinje = sommer.linje;
        sommerKilder = sommer.kilder;
      }
      for (const e of leirerFor(rute)) {
        const treff = campIFerie(e, rad);
        const gruppe = SLUG_AV_NOKKEL.get(gruppeNokkel(e));
        if (treff.length && gruppe) {
          const navn = sesongNavn(String(treff[0].nokkel));
          badge.set(gruppe, fyll(tekst.inHoliday, { ferie: tekst.seasonName[navn].toLowerCase() }));
        }
      }
    }
  }

  if (rute.kind === "type") {
    const raw = typeNavn.get(rute.typeSlug) || rute.typeSlug;
    const label = tekst.types[raw] || raw;
    if (h1 === tekst.heroTitle) {
      h1 = fyll(
        rute.locale === "sv"
          ? "{type} för barn: veckokurser och läger"
          : rute.locale === "en"
            ? "{type} for kids: week-long courses and camps"
            : "{type} for barn: ukekurs og leirer",
        { type: label },
      );
    }
    ingress =
      rute.locale === "en"
        ? `See ${label.toLowerCase()} week by week. Choose a town to see what's near you.`
        : rute.locale === "sv"
          ? `Se ${label.toLowerCase()} vecka för vecka. Välj ort för att se vad som finns nära dig.`
          : `Se ${label.toLowerCase()} uke for uke. Velg by for å se hva som er nær deg.`;
  }

  if (rute.kind === "ferieKommune") {
    const rad = skoleruteFor(rute.kommuneSlug);
    const felt = rute.navn === "host" ? rad?.hostferie : rute.navn === "vinter" ? rad?.vinterferie : rute.navn === "paske" ? rad?.paske : null;
    const dato = felt ? formatPeriode(felt.datoFra, felt.datoTil, rute.locale) : null;
    if (dato) {
      const hele = ukeVisning(felt?.datoFra, felt?.datoTil, rute.locale);
      kalenderUke = `${tekst.seasonName[rute.navn]}: ${dato}${hele ? ` (${fyll(tekst.week, { nr: hele })})` : ""}`;
    }
    ingress = sommerIntro(rute) || vinterIntro(rute) || tekst.seasonBlurb[rute.navn];
    if (rad && felt) {
      skoleruteKort = {
        skolear: skolearKort(rad.skolear),
        kildeUrl: rad.kildeUrl,
        merknad: rad.merknad,
        ferier: [{ label: tekst.seasonName[rute.navn], dato: dato || "", uke: heleFerieuker(felt.datoFra, felt.datoTil)[0]?.uke ?? null, uker: ukeVisning(felt.datoFra, felt.datoTil, rute.locale) }],
      };
    }
    if (rad && rute.navn === "sommer") {
      const sommer = sommerVisning(rad, rute.locale, tekst);
      if (sommer) {
        sommerLinje = sommer.linje;
        sommerKilder = sommer.kilder;
      }
    }
  }

  if (rute.kind === "global" && rute.globalKind === "school-holidays" && rute.regionSlug) {
    const region = regionAvNokkel.get(`NO:${rute.regionSlug}`);
    const navn = region?.navn.nb || rute.regionSlug;
    h1 = `Skoleferier i ${navn}`;
    ingress = `Verifiserte feriedatoer for ${navn}. Året står i datoene. Bare rader med status verifisert er tatt med.`;
    const innhold = regionInnhold(skolekalender, rute.regionSlug);
    regionKalender = {
      helligdager: innhold.helligdager.map((dag: { navn: string[]; dato: string; uke: string; fridager: number; kilder: string[] }) => ({
        navn: dag.navn.join(" og "),
        dato: formatDato(dag.dato, rute.locale),
        uke: dag.uke,
        fridager: dag.fridager,
        kilder: dag.kilder,
      })),
      kommuner: innhold.kommuner.map(
        (kommune: { navn: string; slug: string; rader: { navn: string; fra: string; til: string; uke: string; fridager: number; skolear: string; kilder: string[] }[] }) => ({
          navn: kommune.navn,
          href: skoleruteFor(kommune.slug) ? sti("nb", ["skoleruta", kommune.slug]) : null,
          rader: kommune.rader.map((rad) => ({
            navn: rad.navn,
            dato: formatPeriode(rad.fra, rad.til, rute.locale) || "",
            uke: rad.uke,
            fridager: rad.fridager,
            skolear: rad.skolear,
            kilder: rad.kilder,
          })),
        }),
      ),
    };
  }

  if (rute.kind === "global" && rute.landKode && rute.landKode !== "NO") {
    const side = bolgeAvPath.get(rute.path);
    if (side) {
      const innhold = sideInnhold(side, bolgeSider);
      h1 = innhold.h1;
      ingress = innhold.ingress;
      spraakKode = innhold.lang;
      dokumentTittel = innhold.title;
      dokumentBeskrivelse = innhold.description;
      utenlandsk = { tilbud: innhold.tilbud, lenker: innhold.lenker };
      sesongLenkerTom = true;
      utenlandskCrumbs = innhold.crumbs;
    }
  }

  if (rute.kind === "leir") {
    const e = (GRUPPE_SLUG.get(rute.id) || []).find((x) => synlig(x, I_DAG));
    if (e) {
      h1 = e.tittel;
      ingress = `${e.tilbyder} · ${e.by && e.by !== e.kommune ? `${e.by}, ${e.kommune}` : e.kommune}`;
    }
  }

  const kilde = rute.kind === "leir" ? GRUPPE_SLUG.get(rute.id) || [] : leirerFor(rute);
  const leirVisning = grupperFor(kilde)
    .filter((g) => (indekserbar(rute) ? g.medlemmer.some((e) => !e.demo) : true))
    .map((g) => groupView(g.slug, g.medlemmer, rute.locale, badge.get(g.slug) ?? null))
    .sort(sorter);

  const crumbs = [{ name: tekst.breadcrumbHome, href: home }];
  if (rute.kind === "ferieKommune") {
    crumbs.push({
      name: sesongTittel(tekst, rute.navn, rute.aar),
      href: sti(rute.locale, [SESONG_STI[rute.navn]]),
    });
  }
  if (rute.kind !== "hjem") crumbs.push({ name: h1, href: sammeSti(rute, rute.locale) });
  if (utenlandskCrumbs) {
    crumbs.length = 0;
    crumbs.push(...utenlandskCrumbs);
  }

  return {
    rute,
    tekst,
    h1,
    ingress,
    kalenderUke,
    ferieOverskrift,
    ferieListe,
    skoleruteKort,
    sommerLinje,
    sommerKilder,
    regionKalender,
    leirer: leirVisning,
    filter: rute.kind === "hjem",
    crumbs,
    sesongLenker: sesongLenkerTom ? [] : sesonger,
    spraakKode,
    dokumentTittel,
    dokumentBeskrivelse,
    utenlandsk,
  };
}

function beskrivelse(rute: Rute, side: SideModell): string {
  const tekst = side.tekst;
  if (rute.kind === "fremhevet") return tekst.featuredPageDescription;
  if (rute.kind === "personvern") return tekst.privacyBody.join(" ");
  if (rute.kind === "hjem") return tekst.homeDescription;
  if (side.dokumentBeskrivelse) return side.dokumentBeskrivelse;
  if (rute.kind === "global" && rute.globalKind === "school-holidays") return side.ingress;
  if (rute.kind === "ferieUke") return fyll(tekst.weekDescription, { nr: rute.uke, år: rute.aar });
  if (rute.kind === "skoleruta") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    return fyll(tekst.placeDescription, { by: navn });
  }
  if (rute.kind === "type") {
    const raw = typeNavn.get(rute.typeSlug) || rute.typeSlug;
    return fyll(tekst.typeDescription, { type: tekst.types[raw] || raw });
  }
  if (rute.kind === "sesong" || rute.kind === "ferieKommune") {
    return fyll(tekst.seasonDescription, { ferie: soketittel(rute) || side.h1 });
  }
  const e = side.leirer[0];
  if (!e) return tekst.homeDescription;
  const grunn = fyll(tekst.detailDescription, { tittel: e.tittel, tilbyder: e.tilbyder, sted: e.sted });
  return e.fjoraarsUker?.length ? `${grunn} ${e.ukeLabel}` : grunn;
}

function tittel(rute: Rute, side: SideModell): string {
  const tekst = side.tekst;
  if (rute.kind === "fremhevet") return tekst.featuredPageTitle;
  if (rute.kind === "personvern") return tekst.privacyTitle;
  if (rute.kind === "hjem") return tekst.homeTitle;
  if (side.dokumentTittel) return side.dokumentTittel;
  if (rute.kind !== "leir") return `${soketittel(rute) || side.h1} | ${site.name}`;
  const e = side.leirer[0];
  return e ? `${e.tittel} | ${site.name}` : tekst.homeTitle;
}

export function metadataFor(rute: Rute): Metadata {
  const side = modell(rute);
  const title = tittel(rute, side);
  const description = beskrivelse(rute, side);
  const path = sammeSti(rute, rute.locale);
  const canonical = absolut(path);
  const nbSti = absolut(sammeSti(rute, "nb"));
  const languages: Record<string, string> = {};
  if (rute.kind === "global" && rute.maal && rute.landKode && rute.landKode !== "NO") {
    languages[rute.maal] = canonical;
  } else {
    languages["x-default"] = rute.kind === "global" ? canonical : nbSti;
    const lokaler = rute.kind === "global" ? [rute.locale] : (hreflangLokaler(rute.kind) as Locale[]);
    for (const locale of lokaler) {
      languages[COPY[locale].htmlLang] = locale === "nb" ? nbSti : absolut(sammeSti(rute, locale));
    }
  }
  const indeks = indekserbar(rute);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages },
    robots: indeks ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      locale: rute.kind === "global" && rute.maal ? rute.maal.replace("-", "_") : rute.locale === "sv" ? "sv_SE" : rute.locale === "en" ? "en_GB" : "nb_NO",
      type: "website",
    },
  };
}

export function jsonLd(rute: Rute, side: SideModell): unknown[] {
  const path = sammeSti(rute, rute.locale);
  const url = absolut(path);
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: side.crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absolut(c.href),
    })),
  };
  const blokker: unknown[] = [crumbs];
  if (rute.kind === "fremhevet") {
    blokker.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: side.tekst.featuredFaq.map((rad) => ({
        "@type": "Question",
        name: rad.q,
        acceptedAnswer: { "@type": "Answer", text: rad.a },
      })),
    });
  }
  if (rute.kind !== "leir" && rute.kind !== "fremhevet") {
    const elementer = side.leirer
      .filter((e) => !e.demo)
      .map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.tittel,
        url: absolut(e.href),
      }));
    if (elementer.length) {
      blokker.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: side.h1,
        url,
        itemListElement: elementer,
      });
    }
  }
  return blokker;
}

export function sistEndret(rute: Rute): string | undefined {
  const datoer = (rute.kind === "leir" ? GRUPPE_SLUG.get(rute.id) || [] : leirerFor(rute))
    .map((e) => e.kildeSjekket)
    .filter((d): d is string => !!d)
    .sort();
  return datoer.at(-1);
}

export function mailto(subject: string): string {
  return `mailto:${site.kontaktEpost}?subject=${encodeURIComponent(subject)}`;
}

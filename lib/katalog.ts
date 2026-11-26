import type { Metadata } from "next";
import siteConfig from "@/config/site.json";
import leirerJson from "@/data/leirer.json";
import skoleruteJson from "@/data/skolerute.json";
import avvikJson from "@/data/skolerute-avvik.json";
import {
  avvikKommuner,
  campIFerie,
  campUker,
  dagerMellom,
  ferieFelter,
  isoUke,
  kommunerISesong,
  kommunerMedFri,
  leggTilDager,
  parseUkeNokkel,
  rensPerson,
  sesongDeler,
  skolearKort,
  skolearSlutt,
  slug,
  synlig,
  TEMA_MIN,
  tellerMotTerskel,
  typeSlug,
  utenPamelding,
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
export const skolerute = skoleruteJson as SkoleruteRad[];
const AVVIK = new Set(avvikKommuner(avvikJson as string[]).map((navn) => slug(navn)));

const SESONG_STI: Record<SesongNavn, string> = {
  vinter: "vinterferie",
  sommer: "sommerleir",
  host: "hostferie",
  paske: "paske",
};

export type Rute =
  | { kind: "hjem"; locale: Locale; slug: string[] }
  | { kind: "sesong"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number }
  | { kind: "uke"; locale: Locale; slug: string[]; aar: number; uke: number }
  | { kind: "kommune"; locale: Locale; slug: string[]; kommuneSlug: string }
  | { kind: "type"; locale: Locale; slug: string[]; typeSlug: string }
  | { kind: "leir"; locale: Locale; slug: string[]; id: string }
  | { kind: "ferieKommune"; locale: Locale; slug: string[]; navn: SesongNavn; aar: number; kommuneSlug: string };

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
  sted: string;
  uker: string[];
  ukeLabel: string;
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
  pameldingLabel: string;
  apnerLabel: string | null;
  sjekketLabel: string | null;
  ferieBadge: string | null;
  datoFra: string | null;
  notatIListe: string | null;
};

export type FerieLinje = {
  kommune: string;
  href: string;
  label: string;
  dato: string;
  uke: number | null;
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
    ferier: { label: string; dato: string; uke: number | null }[];
  };
  leirer: CampView[];
  filter: boolean;
  crumbs: { name: string; href: string }[];
  sesongLenker: { href: string; label: string; blurb: string }[];
};

function sti(locale: Locale, parts: string[]): string {
  const segs = locale === "nb" ? parts : [locale, ...parts];
  if (!segs.length) return "/";
  return `/${segs.join("/")}/`;
}

export function absolut(path: string): string {
  return `${site.url}${path}`;
}

function formatDato(iso: string, locale: Locale): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
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

const kommuneNavn = new Map<string, string>();
for (const e of leirer) {
  if (e.kommune) kommuneNavn.set(slug(e.kommune), e.kommune);
}
for (const rad of skolerute) kommuneNavn.set(slug(rad.kommune), rad.kommune);

const typeNavn = new Map<string, string>();
for (const e of synlige()) {
  if (e.type) typeNavn.set(typeSlug(e.type), e.type);
}

function skoleruteFor(kommuneSlug: string): SkoleruteRad | null {
  if (AVVIK.has(kommuneSlug)) return null;
  return skolerute.find((rad) => slug(rad.kommune) === kommuneSlug) ?? null;
}

function leirerFor(rute: Rute): Leir[] {
  const alle = synlige();
  if (rute.kind === "hjem") return alle;
  if (rute.kind === "sesong") {
    return alle.filter((e) => e.sesong === `${rute.navn}${rute.aar}`);
  }
  if (rute.kind === "uke") {
    const nokkel = ukeNokkel(rute.aar, rute.uke);
    return alle.filter((e) => campUker(e).includes(nokkel));
  }
  if (rute.kind === "kommune") {
    return alle.filter((e) => slug(e.kommune) === rute.kommuneSlug);
  }
  if (rute.kind === "type") {
    return alle.filter((e) => typeSlug(e.type) === rute.typeSlug);
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
  if (rute.kind === "leir") {
    const e = leirer.find((x) => x.id === rute.id);
    return !!e && tellerMotTerskel(e, I_DAG);
  }
  const antall = leirerFor(rute).filter((e) => tellerMotTerskel(e, I_DAG)).length;
  return antall >= TEMA_MIN;
}

function vises(rute: Rute): Leir[] {
  const indeks = indekserbar(rute);
  return leirerFor(rute).filter((e) => (indeks ? !e.demo : true));
}

function sesongLenker(locale: Locale): { href: string; label: string; blurb: string }[] {
  const tekst = copy(locale);
  const aar = new Set<number>();
  for (const e of synlige()) {
    const del = sesongDeler(e.sesong);
    if (del) aar.add(del.aar);
  }
  for (const rad of skolerute) {
    const slutt = skolearSlutt(rad.skolear);
    if (slutt) aar.add(slutt);
  }
  const ut: { href: string; label: string; blurb: string; sort: string }[] = [];
  for (const year of [...aar].sort()) {
    for (const navn of ["vinter", "paske", "sommer", "host"] as SesongNavn[]) {
      if (!harSesong(navn, year)) continue;
      const label = sesongTittel(tekst, navn, year);
      ut.push({
        href: sti(locale, [SESONG_STI[navn], String(year)]),
        label,
        blurb: tekst.seasonBlurb[navn],
        sort: `${year}-${navn}`,
      });
    }
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
  const tekst = copy(rute.locale);
  const og = rute.locale === "en" ? "and" : "og";
  if (rute.kind === "sesong") {
    const uker = ukeTekst(
      kommunerISesong(skolerute, rute.navn, rute.aar)
        .filter((rad) => !AVVIK.has(rad.slug) && rad.uke != null)
        .map((rad) => Number(rad.uke)),
      og,
    );
    const ferie = sesongTittel(tekst, rute.navn, rute.aar);
    return uker ? fyll(tekst.h1SeasonWeek, { ferie, uke: uker }) : fyll(tekst.h1Season, { ferie });
  }
  if (rute.kind === "uke") {
    const fri = kommunerMedFri(skolerute, rute.aar, rute.uke).filter((rad) => !AVVIK.has(rad.slug));
    const nokler = [...new Set(fri.map((rad) => rad.nokkel))];
    if (nokler.length === 1) {
      const nokkel = sesongNavn(String(nokler[0]));
      const ferieNavn = tekst.seasonName[nokkel];
      const aarVis = nokkel === "host" ? skolearKort(fri[0].skolear) : String(rute.aar);
      return fyll(tekst.h1WeekHoliday, { ferie: `${ferieNavn} ${aarVis}`, nr: rute.uke });
    }
    return fyll(tekst.h1Week, { nr: rute.uke, aar: rute.aar });
  }
  if (rute.kind === "kommune") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    const rad = skoleruteFor(rute.kommuneSlug);
    const deler: string[] = [];
    if (rad?.hostferie?.uke != null) deler.push(`${tekst.seasonName.host} ${tekst.weekWord} ${rad.hostferie.uke}`);
    if (rad?.vinterferie?.uke != null) deler.push(`${tekst.seasonName.vinter} ${tekst.weekWord} ${rad.vinterferie.uke}`);
    if (deler.length) return fyll(tekst.h1PlaceWeek, { by: navn, uker: deler.join(", ") });
    return fyll(tekst.h1Place, { by: navn });
  }
  if (rute.kind === "ferieKommune") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    const ferie = sesongTittel(tekst, rute.navn, rute.aar);
    const rad = skoleruteFor(rute.kommuneSlug);
    const felt = rute.navn === "host" ? rad?.hostferie : rute.navn === "vinter" ? rad?.vinterferie : rute.navn === "paske" ? rad?.paske : null;
    if (felt?.uke != null) return fyll(tekst.h1HolidayPlace, { ferie, by: navn, uke: felt.uke });
    return fyll(tekst.h1HolidayPlaceNoWeek, { ferie, by: navn });
  }
  return tekst.heroTitle;
}

function byggRuter(): Rute[] {
  const ruter: Rute[] = [];
  const aar = new Set<number>();
  for (const e of synlige()) {
    const del = sesongDeler(e.sesong);
    if (del) aar.add(del.aar);
  }
  for (const rad of skolerute) {
    const slutt = skolearSlutt(rad.skolear);
    if (slutt) aar.add(slutt);
  }
  const ukeSett = new Set<string>();
  for (const e of synlige()) {
    for (const nokkel of campUker(e)) ukeSett.add(nokkel);
  }
  for (const rad of skolerute) {
    for (const ferie of ferieFelter(rad)) {
      for (const dag of dagerMellom(ferie.datoFra, ferie.datoTil)) {
        const iso = isoUke(dag);
        ukeSett.add(ukeNokkel(iso.aar, iso.uke));
      }
    }
  }
  for (const locale of LOCALES) {
    ruter.push({ kind: "hjem", locale, slug: locale === "nb" ? [] : [locale] });
    for (const year of [...aar].sort()) {
      for (const navn of Object.keys(SESONG_STI) as SesongNavn[]) {
        if (!harSesong(navn, year)) continue;
        const parts = [SESONG_STI[navn], String(year)];
        ruter.push({
          kind: "sesong",
          locale,
          navn,
          aar: year,
          slug: locale === "nb" ? parts : [locale, ...parts],
        });
        for (const [kommuneSlug] of kommuneNavn) {
          if (navn !== "sommer" && AVVIK.has(kommuneSlug)) continue;
          const har = synlige().some((e) => {
            const del = sesongDeler(e.sesong);
            return slug(e.kommune) === kommuneSlug && del?.navn === navn && del.aar === year;
          });
          if (!har) continue;
          const komb = [...parts, kommuneSlug];
          ruter.push({
            kind: "ferieKommune",
            locale,
            navn,
            aar: year,
            kommuneSlug,
            slug: locale === "nb" ? komb : [locale, ...komb],
          });
        }
      }
    }
    for (const nokkel of [...ukeSett].sort()) {
      const parsed = parseUkeNokkel(nokkel);
      if (!parsed) continue;
      const parts = ["uke", nokkel];
      ruter.push({
        kind: "uke",
        locale,
        aar: parsed.aar,
        uke: parsed.uke,
        slug: locale === "nb" ? parts : [locale, ...parts],
      });
    }
    for (const [kommuneSlug] of [...kommuneNavn.entries()].sort((a, b) => a[0].localeCompare(b[0], "nb"))) {
      const parts = ["by", kommuneSlug];
      ruter.push({
        kind: "kommune",
        locale,
        kommuneSlug,
        slug: locale === "nb" ? parts : [locale, ...parts],
      });
    }
    for (const [tSlug] of [...typeNavn.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      const parts = ["type", tSlug];
      ruter.push({
        kind: "type",
        locale,
        typeSlug: tSlug,
        slug: locale === "nb" ? parts : [locale, ...parts],
      });
    }
    for (const e of synlige()) {
      const parts = ["leir", e.id];
      ruter.push({
        kind: "leir",
        locale,
        id: e.id,
        slug: locale === "nb" ? parts : [locale, ...parts],
      });
    }
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
  const uten = rute.locale === "nb" ? rute.slug : rute.slug.slice(1);
  return sti(locale, uten);
}

function campView(e: Leir, locale: Locale, ferieBadge: string | null): CampView {
  const tekst = copy(locale);
  const del = sesongDeler(e.sesong);
  const aar = del?.aar;
  const statusLabel =
    e.status === "forventet"
      ? fyll(tekst.expected, { år: aar ?? "" })
      : e.status === "delvis"
        ? tekst.partial
        : null;
  const sted = e.by && e.by !== e.kommune ? `${e.by}, ${e.kommune}` : e.kommune;
  return {
    id: e.id,
    href: sti(locale, ["leir", e.id]),
    tittel: e.tittel,
    tilbyder: e.tilbyder,
    url: e.url,
    tilbyderUrl: e.tilbyderUrl,
    typeSlug: typeSlug(e.type),
    typeLabel: tekst.types[e.type] || e.type,
    kommune: e.kommune,
    kommuneSlug: slug(e.kommune),
    sted,
    uker: campUker(e),
    ukeLabel: formatUke(e.uke, tekst),
    datoLabel: formatPeriode(e.datoFra, e.datoTil, locale),
    alderLabel: formatAlder(e.alderFra, e.alderTil, tekst),
    alderFra: e.alderFra,
    alderTil: e.alderTil,
    prisLabel:
      e.prisNok == null
        ? null
        : e.status === "forventet"
          ? e.prisNok === 0
            ? tekst.lastYearFree
            : fyll(tekst.lastYearPrice, { pris: formatPris(e.prisNok, locale) })
          : e.prisNok === 0
            ? tekst.gratis
            : formatPris(e.prisNok, locale),
    prisNotat: e.prisNotat,
    status: e.status,
    statusLabel,
    notat: rensPerson(e.notat),
    notatIListe: e.status === "verifisert" ? null : rensPerson(e.notat),
    fremhevet: e.fremhevet,
    demo: e.demo,
    utenPamelding: utenPamelding(e),
    gratis: e.prisNok === 0,
    pameldingLabel: e.pameldingStatus ? tekst.pamelding[e.pameldingStatus] : tekst.pamelding.ukjent,
    apnerLabel: e.pameldingApner ? fyll(tekst.opens, { dato: formatDato(e.pameldingApner, locale) }) : null,
    sjekketLabel: e.kildeSjekket ? fyll(tekst.checked, { dato: formatDato(e.kildeSjekket, locale) }) : null,
    ferieBadge,
    datoFra: e.datoFra,
  };
}

function sorter(a: CampView, b: CampView): number {
  if (a.fremhevet !== b.fremhevet) return a.fremhevet ? -1 : 1;
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
      href: sti(locale, ["by", rad.slug]),
      label: tekst.seasonName[sesongNavn(String(rad.nokkel))],
      dato: formatPeriode(rad.datoFra, rad.datoTil, locale) || "",
      uke: rad.uke,
    }))
    .sort((a, b) => (a.uke ?? 99) - (b.uke ?? 99) || a.kommune.localeCompare(b.kommune, "nb"));
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

  if (rute.kind === "sesong" || rute.kind === "uke" || rute.kind === "kommune" || rute.kind === "ferieKommune") {
    h1 = overskrift(rute);
  }

  if (rute.kind === "sesong") {
    ingress = tekst.seasonBlurb[rute.navn];
    const rader = kommunerISesong(skolerute, rute.navn, rute.aar).filter((rad) => !AVVIK.has(rad.slug));
    if (rader.length) {
      ferieOverskrift = tekst.offThisSeason;
      ferieListe = ferieLinjer(rute.locale, rader);
    }
  }

  if (rute.kind === "uke") {
    const man = ukeMandag(rute.aar, rute.uke);
    const son = leggTilDager(man, 6);
    kalenderUke = fyll(tekst.calendarWeek, {
      nr: rute.uke,
      fra: formatDato(man, rute.locale),
      til: formatDato(son, rute.locale),
    });
    ingress = kalenderUke;
    const rader = kommunerMedFri(skolerute, rute.aar, rute.uke).filter((rad) => !AVVIK.has(rad.slug));
    if (rader.length) {
      ferieOverskrift = tekst.offThisWeek;
      ferieListe = ferieLinjer(rute.locale, rader);
    }
  }

  if (rute.kind === "kommune") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    ingress =
      rute.locale === "en"
        ? `From football schools to nature camps in and around ${navn}, sorted by week.`
        : rute.locale === "sv"
          ? `Från fotbollsskola till naturläger i ${navn} med omnejd, sorterat efter vecka.`
          : `Fra fotballskole til naturleir i ${navn} og omegn, sortert på uke.`;
    const rad = skoleruteFor(rute.kommuneSlug);
    if (rad) {
      const ferier = ferieFelter(rad).map((f) => ({
        label: tekst.seasonName[sesongNavn(String(f.nokkel))],
        dato: formatPeriode(f.datoFra, f.datoTil, rute.locale) || "",
        uke: f.uke ?? null,
      }));
      skoleruteKort = {
        skolear: skolearKort(rad.skolear),
        kildeUrl: rad.kildeUrl,
        merknad: rad.merknad,
        ferier,
      };
      for (const e of vises(rute)) {
        const treff = campIFerie(e, rad);
        if (treff.length) {
          const navn = sesongNavn(String(treff[0].nokkel));
          badge.set(e.id, fyll(tekst.inHoliday, { ferie: tekst.seasonName[navn].toLowerCase() }));
        }
      }
    }
  }

  if (rute.kind === "type") {
    const raw = typeNavn.get(rute.typeSlug) || rute.typeSlug;
    const label = tekst.types[raw] || raw;
    h1 = fyll(
      rute.locale === "sv"
        ? "{type} för barn: veckokurser och läger"
        : rute.locale === "en"
          ? "{type} for kids: week-long courses and camps"
          : "{type} for barn: ukekurs og leirer",
      { type: label },
    );
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
    ingress = dato ? `${tekst.seasonName[rute.navn]}: ${dato}` : tekst.seasonBlurb[rute.navn];
    if (rad && felt) {
      skoleruteKort = {
        skolear: skolearKort(rad.skolear),
        kildeUrl: rad.kildeUrl,
        merknad: rad.merknad,
        ferier: [{ label: tekst.seasonName[rute.navn], dato: dato || "", uke: felt.uke ?? null }],
      };
    }
  }

  if (rute.kind === "leir") {
    const e = leirer.find((x) => x.id === rute.id);
    if (e) {
      h1 = e.tittel;
      ingress = `${e.tilbyder} · ${e.by && e.by !== e.kommune ? `${e.by}, ${e.kommune}` : e.kommune}`;
    }
  }

  const leirVisning = (rute.kind === "leir"
    ? synlige().filter((e) => e.id === rute.id)
    : vises(rute)
  )
    .map((e) => campView(e, rute.locale, badge.get(e.id) ?? null))
    .sort(sorter);

  const crumbs = [{ name: tekst.breadcrumbHome, href: home }];
  if (rute.kind === "ferieKommune") {
    crumbs.push({
      name: sesongTittel(tekst, rute.navn, rute.aar),
      href: sti(rute.locale, [SESONG_STI[rute.navn], String(rute.aar)]),
    });
  }
  if (rute.kind !== "hjem") crumbs.push({ name: h1, href: sammeSti(rute, rute.locale) });

  return {
    rute,
    tekst,
    h1,
    ingress,
    kalenderUke,
    ferieOverskrift,
    ferieListe,
    skoleruteKort,
    leirer: leirVisning,
    filter: rute.kind === "hjem",
    crumbs,
    sesongLenker: sesonger,
  };
}

function beskrivelse(rute: Rute, side: SideModell): string {
  const tekst = side.tekst;
  if (rute.kind === "hjem") return tekst.homeDescription;
  if (rute.kind === "uke") return fyll(tekst.weekDescription, { nr: rute.uke, år: rute.aar });
  if (rute.kind === "kommune") {
    const navn = kommuneNavn.get(rute.kommuneSlug) || rute.kommuneSlug;
    return fyll(tekst.placeDescription, { by: navn });
  }
  if (rute.kind === "type") {
    const raw = typeNavn.get(rute.typeSlug) || rute.typeSlug;
    return fyll(tekst.typeDescription, { type: tekst.types[raw] || raw });
  }
  if (rute.kind === "sesong" || rute.kind === "ferieKommune") {
    return fyll(tekst.seasonDescription, { ferie: side.h1 });
  }
  const e = side.leirer[0];
  if (!e) return tekst.homeDescription;
  return fyll(tekst.detailDescription, { tittel: e.tittel, tilbyder: e.tilbyder, sted: e.sted });
}

function tittel(rute: Rute, side: SideModell): string {
  const tekst = side.tekst;
  if (rute.kind === "hjem") return tekst.homeTitle;
  if (rute.kind === "uke" || rute.kind === "kommune" || rute.kind === "sesong" || rute.kind === "ferieKommune") {
    return `${side.h1} | ${site.name}`;
  }
  if (rute.kind === "type") {
    const raw = typeNavn.get(rute.typeSlug) || rute.typeSlug;
    return fyll(tekst.typeTitle, { type: tekst.types[raw] || raw });
  }
  const e = side.leirer[0];
  return e ? `${e.tittel} | ${site.name}` : tekst.homeTitle;
}

export function metadataFor(rute: Rute): Metadata {
  const side = modell(rute);
  const title = tittel(rute, side);
  const description = beskrivelse(rute, side);
  const path = sammeSti(rute, rute.locale);
  const canonical = absolut(path);
  const languages: Record<string, string> = { "x-default": absolut(sammeSti(rute, "nb")) };
  for (const locale of LOCALES) languages[COPY[locale].htmlLang] = absolut(sammeSti(rute, locale));
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
      locale: rute.locale === "sv" ? "sv_SE" : rute.locale === "en" ? "en_GB" : "nb_NO",
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
  if (rute.kind !== "leir") {
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
  const datoer = (rute.kind === "leir" ? synlige().filter((e) => e.id === rute.id) : leirerFor(rute))
    .map((e) => e.kildeSjekket)
    .filter((d): d is string => !!d)
    .sort();
  return datoer.at(-1);
}

export function mailto(subject: string): string {
  return `mailto:${site.kontaktEpost}?subject=${encodeURIComponent(subject)}`;
}

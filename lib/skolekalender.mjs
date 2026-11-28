/**
 * Leser Norges skolekalender (skjema v2).
 * Sider bruker bare status=verifisert. Merknad styrer ingenting.
 * 17. mai og 2. pinsedag 2027 er samme dato og telles som én dag.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { slug } from "./pure.mjs";

export const KOLONNER = [
  "land",
  "region_niva",
  "region_kode",
  "region",
  "overordnet_region",
  "skolear",
  "ferie_type",
  "navn_lokalt",
  "fra",
  "til",
  "iso_uke_fra",
  "iso_uke_til",
  "fridager",
  "kilde_url",
  "kilde_type",
  "kilde_hentet",
  "status",
  "merknad",
  "kilde_url_2",
];

const STATUS = new Set(["verifisert", "uavklart", "ikke funnet", "ikke publisert"]);
const NIVA = new Set([
  "land",
  "stat",
  "distrikt",
  "fylke",
  "lan",
  "kommune",
  "local_authority",
  "nasjon",
  "delomrade",
  "landsdel",
  "sprakfellesskap",
  "kanton",
  "sone",
  "academie",
]);
const FERIE_TYPE = new Set([
  "sommer",
  "host",
  "jul",
  "vinter",
  "paske",
  "var",
  "pinse",
  "halvterm",
  "sportlov",
  "thanksgiving",
  "annet_fri",
  "helligdag",
  "siste_skoledag",
  "forste_skoledag",
]);
const FERIE = new Set(["host", "vinter", "paske", "sommer"]);
const REKKE = ["host", "vinter", "paske", "siste_skoledag", "sommer", "forste_skoledag"];
const UKE = /^\d{4}-W\d{2}$/;
const DATO = /^\d{4}-\d{2}-\d{2}$/;

const FIL = join(dirname(fileURLToPath(import.meta.url)), "../data/kalender/no.csv");

export function parseCsv(tekst) {
  const rader = [];
  let rad = [];
  let felt = "";
  let sitat = false;
  const kild = String(tekst).replace(/^\uFEFF/, "");
  for (let i = 0; i < kild.length; i++) {
    const tegn = kild[i];
    if (sitat) {
      if (tegn === '"') {
        if (kild[i + 1] === '"') {
          felt += '"';
          i += 1;
        } else sitat = false;
      } else felt += tegn;
    } else if (tegn === '"') sitat = true;
    else if (tegn === ",") {
      rad.push(felt);
      felt = "";
    } else if (tegn === "\n") {
      rad.push(felt);
      rader.push(rad);
      rad = [];
      felt = "";
    } else if (tegn !== "\r") felt += tegn;
  }
  if (felt.length || rad.length) {
    rad.push(felt);
    rader.push(rad);
  }
  return rader.filter((linje) => linje.some((verdi) => verdi !== ""));
}

export function parseSkolekalender(tekst) {
  const tabell = parseCsv(tekst);
  const hode = tabell[0] || [];
  const feil = [];
  if (hode.join(",") !== KOLONNER.join(",")) feil.push("skjema v2: uventet kolonnehode");
  const rader = [];
  for (let i = 1; i < tabell.length; i++) {
    const linje = tabell[i];
    if (linje.length !== KOLONNER.length) {
      feil.push(`rad ${i + 1}: ${linje.length} kolonner`);
      continue;
    }
    rader.push(Object.fromEntries(KOLONNER.map((nokkel, indeks) => [nokkel, linje[indeks]])));
  }
  return { rader, feil };
}

export function lesSkolekalender(sti = FIL) {
  return parseSkolekalender(readFileSync(sti, "utf8")).rader;
}

function erUrl(verdi) {
  return verdi.startsWith("http://") || verdi.startsWith("https://");
}

export function validerSkolekalender(rader) {
  const feil = [];
  if (!Array.isArray(rader) || rader.length === 0) return ["skolekalenderen er tom"];
  for (const [indeks, rad] of rader.entries()) {
    const hvem = `rad ${indeks + 2} ${rad.region || ""}`.trim();
    if (!/^[A-Z]{2}$/.test(rad.land || "")) feil.push(`${hvem}: land`);
    if (!NIVA.has(rad.region_niva)) feil.push(`${hvem}: region_niva`);
    if (rad.region_niva === "distrikt" && !String(rad.overordnet_region || "").trim()) {
      feil.push(`${hvem}: distrikt mangler overordnet_region`);
    }
    if (!STATUS.has(rad.status)) feil.push(`${hvem}: ukjent status «${rad.status}»`);
    if (rad.ferie_type && !FERIE_TYPE.has(rad.ferie_type)) feil.push(`${hvem}: ferie_type`);
    if (!rad.ferie_type && rad.status !== "ikke publisert" && rad.status !== "ikke funnet") {
      feil.push(`${hvem}: tom ferie_type krever status ikke publisert eller ikke funnet`);
    }
    if (rad.status === "verifisert" && !rad.ferie_type) feil.push(`${hvem}: verifisert rad mangler ferie_type`);
    if (rad.fra && !DATO.test(rad.fra)) feil.push(`${hvem}: fra`);
    if (rad.til && !DATO.test(rad.til)) feil.push(`${hvem}: til`);
    if (rad.status === "verifisert" && rad.fra && rad.til && rad.fra > rad.til) feil.push(`${hvem}: fra etter til`);
    if (rad.iso_uke_fra && !UKE.test(rad.iso_uke_fra)) feil.push(`${hvem}: ISO-uke skal være ÅÅÅÅ-Www`);
    if (rad.iso_uke_til && !UKE.test(rad.iso_uke_til)) feil.push(`${hvem}: ISO-uke skal være ÅÅÅÅ-Www`);
    if (rad.fridager && !/^\d+$/.test(rad.fridager)) feil.push(`${hvem}: fridager`);
    if (rad.status === "verifisert") {
      if (!DATO.test(rad.fra) || !DATO.test(rad.til)) feil.push(`${hvem}: verifisert rad mangler dato`);
      if (!UKE.test(rad.iso_uke_fra) || !UKE.test(rad.iso_uke_til)) feil.push(`${hvem}: verifisert rad mangler ÅÅÅÅ-Www`);
      if (!/^\d+$/.test(rad.fridager)) feil.push(`${hvem}: verifisert rad mangler fridager`);
      if (!erUrl(rad.kilde_url)) feil.push(`${hvem}: verifisert rad mangler kilde`);
    }
    if (rad.kilde_url && !erUrl(rad.kilde_url)) feil.push(`${hvem}: kilde_url`);
    if (rad.kilde_url_2 && !erUrl(rad.kilde_url_2)) feil.push(`${hvem}: kilde_url_2`);
    if (rad.kilde_url_2 && !rad.kilde_url) feil.push(`${hvem}: kilde_url_2 uten kilde_url`);
  }
  return feil;
}

/** Bare status-kolonnen. Merknad er ikke et filter. */
export function raderForSide(rader) {
  return rader.filter((rad) => rad.status === "verifisert");
}

export function kilderFor(rad) {
  const ut = [];
  for (const url of [rad.kilde_url, rad.kilde_url_2]) {
    if (url && erUrl(url) && !ut.includes(url)) ut.push(url);
  }
  return ut;
}

export function ukeSpan(fra, til) {
  if (!fra) return "";
  if (!til || fra === til) return fra;
  return `${fra}–${til}`;
}

/**
 * Helligdager med samme dato slås sammen.
 * fridager er maks for datoen, ikke summen, så 17. mai og 2. pinsedag blir 1.
 */
export function slåSammenHelligdager(rader) {
  const mappe = new Map();
  for (const rad of raderForSide(rader)) {
    if (rad.ferie_type !== "helligdag" || rad.region_niva !== "land" || !rad.fra) continue;
    if (!mappe.has(rad.fra)) {
      mappe.set(rad.fra, { dato: rad.fra, navn: [], fridager: 0, uke: ukeSpan(rad.iso_uke_fra, rad.iso_uke_til), kilder: [] });
    }
    const dag = mappe.get(rad.fra);
    if (rad.navn_lokalt && !dag.navn.includes(rad.navn_lokalt)) dag.navn.push(rad.navn_lokalt);
    dag.fridager = Math.max(dag.fridager, Number(rad.fridager) || 0);
    for (const url of kilderFor(rad)) {
      if (!dag.kilder.includes(url)) dag.kilder.push(url);
    }
  }
  return [...mappe.values()].sort((a, b) => a.dato.localeCompare(b.dato));
}

function kommuneRader(rader, regionSlug) {
  const grupper = new Map();
  for (const rad of raderForSide(rader)) {
    if (rad.region_niva !== "kommune") continue;
    if (slug(rad.overordnet_region) !== regionSlug) continue;
    if (!grupper.has(rad.region)) grupper.set(rad.region, []);
    grupper.get(rad.region).push(rad);
  }
  return [...grupper.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "nb"))
    .map(([navn, liste]) => ({
      navn,
      slug: slug(navn),
      rader: liste
        .slice()
        .sort((a, b) => REKKE.indexOf(a.ferie_type) - REKKE.indexOf(b.ferie_type) || a.fra.localeCompare(b.fra))
        .map((rad) => ({
          type: rad.ferie_type,
          navn: rad.navn_lokalt,
          fra: rad.fra,
          til: rad.til,
          uke: ukeSpan(rad.iso_uke_fra, rad.iso_uke_til),
          fridager: Number(rad.fridager) || 0,
          skolear: rad.skolear,
          kilder: kilderFor(rad),
        })),
    }));
}

export function regionInnhold(rader, regionSlug) {
  return {
    helligdager: slåSammenHelligdager(rader),
    kommuner: kommuneRader(rader, regionSlug),
  };
}

function harOffisiellFerie(rader, regionSlug) {
  return raderForSide(rader).some(
    (rad) =>
      rad.region_niva === "kommune" &&
      slug(rad.overordnet_region) === regionSlug &&
      FERIE.has(rad.ferie_type) &&
      erUrl(rad.kilde_url || ""),
  );
}

/**
 * /no/{region}/school-holidays/ bare der fylket har verifiserte kommunerader.
 * Ett fylke som er samme sted som en eksisterende /skoleruta/-side (Oslo)
 * er et duplikat: canonical dit, og siden indekseres ikke.
 */
export function norskeKalenderSider(geo, rader, skoleruteSlugs = new Set()) {
  const sider = [];
  for (const region of geo.regioner || []) {
    if (region.iso2 !== "NO") continue;
    const innhold = regionInnhold(rader, region.slug);
    if (!innhold.kommuner.length) continue;
    const en = innhold.kommuner.length === 1 ? innhold.kommuner[0] : null;
    const canonical = en && skoleruteSlugs.has(en.slug) ? `/skoleruta/${en.slug}/` : null;
    const offisiell = harOffisiellFerie(rader, region.slug);
    sider.push({
      kind: "school-holidays",
      id: `cal:NO:${region.slug}`,
      iso2: "no",
      region: region.slug,
      path: `/no/${region.slug}/school-holidays/`,
      offisiell,
      canonical,
      indeks: offisiell && !canonical,
      locale: "nb",
      antall: 0,
      land: "NO",
      slag: "kalender",
    });
  }
  return sider;
}

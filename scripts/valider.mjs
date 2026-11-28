/**
 * Validerer data/leirer.json mot docs/data-schema.md, skoleruta, og at config ikke inneholder Hoopit.
 * Avslutter med kode 1 ved feil.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { assertKilderTrygge, erHoopit } from "./lib/plattform.mjs";
import {
  inneholderPerson,
  isoUke,
  leggTilDager,
  sesongDeler,
  ukeListe,
} from "../lib/pure.mjs";
import { globaleSider, validerGeografi } from "../lib/globale-ruter.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const feil = [];

function les(navn) {
  return JSON.parse(readFileSync(path.join(ROT, navn), "utf8"));
}

function krev(ok, melding) {
  if (!ok) feil.push(melding);
}

function erDato(verdi) {
  return typeof verdi === "string" && /^\d{4}-\d{2}-\d{2}$/.test(verdi);
}

function erUrl(verdi) {
  if (typeof verdi !== "string") return false;
  try {
    const u = new URL(verdi);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const TEKSTFELT = ["tittel", "tilbyder", "prisNotat", "notat", "by", "kommune", "fylke", "type", "sesong"];

function validerLeirer(leirer) {
  krev(Array.isArray(leirer), "leirer.json må være en array");
  if (!Array.isArray(leirer)) return;
  const ider = new Set();
  for (const e of leirer) {
    const hvem = e?.id || e?.tittel || "(uten id)";
    krev(typeof e.id === "string" && e.id.length > 0, `${hvem}: id mangler`);
    if (ider.has(e.id)) feil.push(`${e.id}: duplikat-id`);
    ider.add(e.id);
    for (const felt of ["tittel", "tilbyder", "type", "sesong", "kommune", "land"]) {
      krev(typeof e[felt] === "string" && e[felt].trim() !== "", `${hvem}: ${felt} må være tekst`);
    }
    krev(erUrl(e.url), `${hvem}: url må være http(s)`);
    krev(e.tilbyderUrl == null || erUrl(e.tilbyderUrl), `${hvem}: tilbyderUrl må være URL eller null`);
    krev(!erHoopit(e.url) && !erHoopit(e.tilbyderUrl), `${hvem}: Hoopit-lenke er ikke tillatt`);
    krev(sesongDeler(e.sesong), `${hvem}: sesong må være vinter|sommer|host|paske + år`);
    const uker = ukeListe(e.uke);
    krev(uker.length > 0, `${hvem}: uke kan ikke leses (${JSON.stringify(e.uke)})`);
    krev(e.datoFra == null || erDato(e.datoFra), `${hvem}: datoFra`);
    krev(e.datoTil == null || erDato(e.datoTil), `${hvem}: datoTil`);
    if (erDato(e.datoFra) && erDato(e.datoTil)) {
      krev(e.datoFra <= e.datoTil, `${hvem}: datoTil er før datoFra`);
      const datoUker = new Set();
      for (let dag = e.datoFra; dag <= e.datoTil; dag = leggTilDager(dag, 1)) {
        datoUker.add(isoUke(dag).uke);
      }
      const innenfor = [...datoUker].every((u) => uker.some((o) => Math.abs(o - u) <= 1));
      krev(innenfor, `${hvem}: uke ${JSON.stringify(e.uke)} stemmer ikke med datoene`);
    }
    for (const felt of ["alderFra", "alderTil"]) {
      krev(e[felt] == null || (Number.isInteger(e[felt]) && e[felt] >= 0 && e[felt] <= 99), `${hvem}: ${felt}`);
    }
    if (e.alderFra != null && e.alderTil != null) {
      krev(e.alderFra <= e.alderTil, `${hvem}: alderFra er høyere enn alderTil`);
    }
    krev(e.prisNok == null || (Number.isInteger(e.prisNok) && e.prisNok >= 0), `${hvem}: prisNok må være heltall eller null`);
    krev(["NO", "SE", "DK", "FI"].includes(e.land), `${hvem}: land`);
    krev(["verifisert", "delvis", "forventet"].includes(e.status), `${hvem}: status`);
    krev(e.lenkestatus == null || ["ok", "usikker", "utløpt"].includes(e.lenkestatus), `${hvem}: lenkestatus`);
    krev(e.kildeSjekket == null || erDato(e.kildeSjekket), `${hvem}: kildeSjekket`);
    krev(
      e.pameldingStatus == null || ["apen", "ikke_apnet", "full", "stengt"].includes(e.pameldingStatus),
      `${hvem}: pameldingStatus`,
    );
    krev(e.pameldingApner == null || erDato(e.pameldingApner), `${hvem}: pameldingApner`);
    krev("pameldingStatus" in e && "pameldingApner" in e, `${hvem}: pamelding-felt mangler`);
    krev(typeof e.dod === "boolean" && typeof e.fremhevet === "boolean" && typeof e.demo === "boolean", `${hvem}: dod/fremhevet/demo`);
    if (e.lenkestatus === "utløpt") krev(e.dod === true, `${hvem}: utløpt lenke skal ha dod true`);
    for (const felt of TEKSTFELT) {
      if (inneholderPerson(e[felt])) feil.push(`${hvem}: ${felt} ser ut som e-post eller telefon`);
    }
    if (e.datoFra && e.datoTil) {
      const start = isoUke(e.datoFra);
      krev(start.uke >= 1 && start.uke <= 53, `${hvem}: ISO-uke`);
    }
  }
}

function validerSkolerute(rader) {
  krev(Array.isArray(rader) && rader.length > 0, "skolerute.json må ha rader");
  if (!Array.isArray(rader)) return;
  for (const rad of rader) {
    const hvem = rad?.kommune || "(uten kommune)";
    krev(/^\d{4}-\d{4}$/.test(rad.skolear || ""), `${hvem}: skolear`);
    krev(typeof rad.kommune === "string", `${hvem}: kommune`);
    krev(erUrl(rad.kildeUrl), `${hvem}: kildeUrl`);
    krev("merknad" in rad, `${hvem}: merknad-feltet må finnes`);
    for (const felt of ["hostferie", "vinterferie", "paske"]) {
      const f = rad[felt];
      if (f == null) continue;
      krev(erDato(f.datoFra) && erDato(f.datoTil) && f.datoFra <= f.datoTil, `${hvem}: ${felt} datoer`);
    }
  }
}

try {
  assertKilderTrygge(les("config/kilder.json"));
} catch (err) {
  feil.push(err.message);
}

validerLeirer(les("data/leirer.json"));
validerSkolerute(les("data/skolerute.json"));
const geografi = les("data/geografi.json");
for (const melding of validerGeografi(geografi)) feil.push(melding);
if (globaleSider(geografi).some((side) => side.path.startsWith("/no/"))) {
  feil.push("globale ruter skal ikke duplisere Norge under /no/");
}

if (feil.length) {
  console.error(`valider: ${feil.length} feil`);
  for (const f of feil) console.error(`- ${f}`);
  process.exit(1);
}
const leirer = les("data/leirer.json");
console.log(`valider: ${leirer.length} leirer ok`);

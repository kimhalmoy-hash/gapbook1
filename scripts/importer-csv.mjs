/**
 * Leser data/kilder/*.csv og skriver data/tilbydere.json og data/skolerute.json.
 * data/leirer.json er Supply v8 og skrives ikke over herfra.
 * Fyller ikke inn manglende felt. Skriver aldri personopplysninger.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { lagId, rensPerson, slug } from "../lib/pure.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const KILDER = path.join(ROT, "data", "kilder");

function les(navn) {
  return parseCsv(readFileSync(path.join(KILDER, navn), "utf8"));
}

function tom(verdi) {
  if (verdi == null) return null;
  const tekst = rensPerson(String(verdi).trim());
  return tekst == null || tekst === "" ? null : tekst;
}

function heltall(verdi) {
  const tekst = String(verdi ?? "").trim();
  if (!/^\d+$/.test(tekst)) return null;
  return Number(tekst);
}

function ukeVerdi(verdi) {
  const tekst = String(verdi ?? "").trim();
  if (/^\d+$/.test(tekst)) return Number(tekst);
  return tekst;
}

const STATUS = {
  verifisert: "verifisert",
  delvis: "delvis",
  forventet: "forventet",
  dato_ikke_publisert: "forventet",
};

const PAMELDING = new Set(["apen", "ikke_apnet", "full", "stengt"]);

function pameldingStatus(verdi) {
  const tekst = String(verdi ?? "").trim();
  if (!tekst) return null;
  if (!PAMELDING.has(tekst)) throw new Error(`Ukjent pamelding_status «${tekst}»`);
  return tekst;
}

function pameldingApner(verdi) {
  const tekst = String(verdi ?? "").trim();
  if (!tekst) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tekst)) throw new Error(`Ugyldig pamelding_apner «${tekst}»`);
  return tekst;
}

function skriv(navn, data) {
  writeFileSync(path.join(ROT, "data", navn), `${JSON.stringify(data, null, 2)}\n`);
}

function importerLeirer(tilbydere) {
  const nett = new Map(tilbydere.map((t) => [t.tilbyder, t.nettside]));
  const rader = les("kurs-norge-v7.csv");
  const brukt = new Set();
  const leirer = rader.map((rad) => {
    const status = STATUS[rad.status];
    if (!status) throw new Error(`Ukjent status «${rad.status}» for ${rad.kurs_navn}`);
    const tittel = tom(rad.kurs_navn);
    const tilbyder = tom(rad.tilbyder);
    const sesong = tom(rad.sesong);
    const uke = ukeVerdi(rad.uke);
    if (!tittel || !tilbyder || !sesong || uke === "") {
      throw new Error(`Mangler tittel, tilbyder, sesong eller uke: ${rad.kurs_navn}`);
    }
    let id = lagId(tilbyder, tittel, sesong, uke);
    if (brukt.has(id)) id = `${id}-${lagId(rad.url || id, "", "x", "1").slice(0, 12)}`;
    brukt.add(id);
    const nettside = nett.get(rad.tilbyder) ?? null;
    return {
      id,
      tittel,
      tilbyder,
      tilbyderUrl: nettside,
      url: tom(rad.url),
      type: tom(rad.type),
      sesong,
      uke,
      datoFra: tom(rad.dato_fra),
      datoTil: tom(rad.dato_til),
      alderFra: heltall(rad.alder_fra),
      alderTil: heltall(rad.alder_til),
      prisNok: heltall(rad.pris_nok),
      prisNotat: tom(rad.pris_notat),
      by: tom(rad.by),
      kommune: tom(rad.kommune),
      fylke: tom(rad.fylke),
      // Land står ikke per rad. Påmelding tas bare fra kolonnene, aldri fra notatet.
      land: "NO",
      status,
      notat: tom(rad.notat),
      kildeSjekket: tom(rad.kilde_sjekket_dato),
      lenkestatus: null,
      dod: false,
      pameldingStatus: pameldingStatus(rad.pamelding_status),
      pameldingApner: pameldingApner(rad.pamelding_apner),
      fremhevet: false,
      demo: false,
    };
  });
  leirer.sort((a, b) =>
    a.sesong.localeCompare(b.sesong) ||
    String(a.uke).localeCompare(String(b.uke), "nb") ||
    a.kommune.localeCompare(b.kommune, "nb") ||
    a.id.localeCompare(b.id),
  );
  return leirer;
}

function importerTilbydere() {
  return les("tilbydere-norge-v8.csv")
    .map((rad) => ({
      tilbyder: tom(rad.tilbyder),
      typeTilbyder: tom(rad.type_tilbyder),
      by: tom(rad.by),
      kommune: tom(rad.kommune),
      nettside: tom(rad.nettside),
      antallKursILista: heltall(rad.antall_kurs_i_lista),
      harPameldingOnline: tom(rad["har_påmelding_online"]),
      notat: tom(rad.notat),
    }))
    .sort((a, b) => String(a.tilbyder).localeCompare(String(b.tilbyder), "nb"));
}

function datoEllerNull(verdi) {
  const tekst = tom(verdi);
  if (!tekst || !/^\d{4}-\d{2}-\d{2}$/.test(tekst)) return null;
  return tekst;
}

function sommer(rad) {
  const sisteSkole = datoEllerNull(rad.siste_skoledag_2027);
  const forsteSkole = datoEllerNull(rad.forste_skoledag_2027);
  if (!sisteSkole && !forsteSkole) return null;
  return {
    sisteSkole,
    forsteSkole,
    kildeUrl: sisteSkole ? tom(rad.sommer_kilde_url) : null,
    forsteKildeUrl: forsteSkole ? tom(rad.forste_kilde_url) : null,
  };
}

function ferie(uke, fra, til) {
  const datoFra = tom(fra);
  const datoTil = tom(til);
  if (!datoFra || !datoTil || datoFra > datoTil) return null;
  return {
    uke: heltall(uke),
    datoFra,
    datoTil,
  };
}

function importerSkolerute() {
  const rader = les("skolerute-2027-alle.csv")
    .map((rad) => ({
      skolear: "2026-2027",
      rang: heltall(rad.rang),
      kommune: tom(rad.kommune),
      kommunenummer: tom(rad.kommunenummer),
      fylke: tom(rad.fylke),
      folketall: heltall(rad.folketall),
      hostferie: ferie(rad.hostferie_uke, rad.hostferie_fra, rad.hostferie_til),
      vinterferie: ferie(rad.vinterferie_uke, rad.vinterferie_fra, rad.vinterferie_til),
      paske: ferie(null, rad.paske_fra, rad.paske_til),
      sommer: sommer(rad),
      kildeUrl: tom(rad.kilde_url),
      kildeType: tom(rad.kilde_type),
      merknad: rad.merknad?.trim() ? rad.merknad.trim() : null,
    }))
    .filter((rad) => {
      if (String(rad.kildeType || "").toLowerCase() === "ikke funnet") return false;
      const har = [rad.hostferie, rad.vinterferie, rad.paske].some((f) => f?.datoFra && f?.datoTil);
      return har && rad.kildeUrl && rad.kommune;
    });
  const tell = new Map();
  for (const rad of rader) {
    const base = slug(rad.kommune);
    tell.set(base, (tell.get(base) || 0) + 1);
  }
  const ut = rader.map((rad) => {
    const base = slug(rad.kommune);
    const unik = tell.get(base) > 1 ? slug(`${rad.kommune} ${rad.fylke || ""}`) : base;
    return { ...rad, slug: unik };
  });
  const slugs = ut.map((rad) => rad.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("skolerute: slug er ikke unik");
  return ut;
}

const skolerute = importerSkolerute();
if (process.argv.includes("--bare-skolerute")) {
  skriv("skolerute.json", skolerute);
  console.log(`skolerute: ${skolerute.length} kommuner med datoer`);
  process.exit(0);
}
if (process.argv.includes("--leirer")) {
  console.error("data/leirer.json er Supply v8. kurs-norge-v8.csv fulgte ikke med, så CSV-import skriver ikke over katalogen.");
  process.exit(1);
}
const tilbydere = importerTilbydere();
skriv("tilbydere.json", tilbydere);
skriv("skolerute.json", skolerute);
console.log("data/leirer.json er Supply v8 og ble ikke overskrevet.");
console.log(`importer: ${tilbydere.length} tilbydere, ${skolerute.length} kommuner i skoleruten`);

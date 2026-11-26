/**
 * Leser data/kilder/*.csv og skriver data/leirer.json, data/tilbydere.json og data/skolerute.json.
 * Fyller ikke inn manglende felt. Skriver aldri personopplysninger.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { lagId, rensPerson } from "../lib/pure.mjs";

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

function skriv(navn, data) {
  writeFileSync(path.join(ROT, "data", navn), `${JSON.stringify(data, null, 2)}\n`);
}

function importerLeirer(tilbydere) {
  const nett = new Map(tilbydere.map((t) => [t.tilbyder, t.nettside]));
  const rader = les("kurs-norge-v4.csv");
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
      // Filen er kurs-norge-v4. Land står ikke per rad. Påmelding finnes ikke i CSV-en.
      land: "NO",
      status,
      notat: tom(rad.notat),
      kildeSjekket: tom(rad.kilde_sjekket_dato),
      lenkestatus: null,
      dod: false,
      pameldingStatus: null,
      pameldingApner: null,
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
  return les("tilbydere-norge-v4.csv")
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

function ferie(uke, fra, til) {
  const datoFra = tom(fra);
  const datoTil = tom(til);
  if (!datoFra && !datoTil && !String(uke || "").trim()) return null;
  return {
    uke: heltall(uke),
    datoFra,
    datoTil,
  };
}

function importerSkolerute() {
  return les("skolerute-2027.csv").map((rad) => ({
    skolear: "2026-2027",
    rang: heltall(rad.rang),
    kommune: tom(rad.kommune),
    kommunenummer: tom(rad.kommunenummer),
    fylke: tom(rad.fylke),
    folketall: heltall(rad.folketall),
    hostferie: ferie(rad.hostferie_uke, rad.hostferie_fra, rad.hostferie_til),
    vinterferie: ferie(rad.vinterferie_uke, rad.vinterferie_fra, rad.vinterferie_til),
    paske: ferie(null, rad.paske_fra, rad.paske_til),
    kildeUrl: tom(rad.kilde_url),
    kildeType: tom(rad.kilde_type),
    merknad: tom(rad.merknad),
  }));
}

const tilbydere = importerTilbydere();
const leirer = importerLeirer(tilbydere);
const skolerute = importerSkolerute();
skriv("tilbydere.json", tilbydere);
skriv("skolerute.json", skolerute);
if (process.argv.includes("--leirer")) {
  console.error("data/leirer.json er Supply v5. kurs-norge-v5.csv ligger ikke i data/kilder/, så v4-CSV-en skal ikke skrives over JSON-en.");
  process.exit(1);
}
console.log("data/leirer.json er Supply v5 og ble ikke overskrevet.");
console.log(
  `importer: ${leirer.length} leirer fra CSV, ${tilbydere.length} tilbydere, ${skolerute.length} kommuner i skoleruten`,
);

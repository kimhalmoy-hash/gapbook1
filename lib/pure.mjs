/** Rene funksjoner delt av nettstedet og skriptene. Ingen nettverk, ingen ferieuker hardkodet. */

export function slug(verdi) {
  return String(verdi ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Ett tall, «25-33» eller «26,27,32». Tom liste hvis verdien ikke kan leses. */
export function ukeListe(uke) {
  if (uke == null || uke === "") return [];
  if (typeof uke === "number" && Number.isInteger(uke)) {
    return uke >= 1 && uke <= 53 ? [uke] : [];
  }
  const s = String(uke).trim();
  if (/^\d{1,2}$/.test(s)) {
    const n = Number(s);
    return n >= 1 && n <= 53 ? [n] : [];
  }
  const range = s.match(/^(\d{1,2})-(\d{1,2})$/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (a < 1 || b > 53 || b < a || b - a > 20) return [];
    const ut = [];
    for (let i = a; i <= b; i++) ut.push(i);
    return ut;
  }
  if (/^\d{1,2}(,\d{1,2})+$/.test(s)) {
    const tall = s.split(",").map(Number);
    if (tall.some((n) => n < 1 || n > 53)) return [];
    return tall;
  }
  return [];
}

export function isoUke(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dag = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dag);
  const aar = dt.getUTCFullYear();
  const start = new Date(Date.UTC(aar, 0, 1));
  const uke = Math.ceil(((dt.getTime() - start.getTime()) / 86400000 + 1) / 7);
  return { aar, uke };
}

export function ukeMandag(aar, uke) {
  const jan4 = new Date(Date.UTC(aar, 0, 4));
  const dag = jan4.getUTCDay() || 7;
  const man = new Date(jan4);
  man.setUTCDate(jan4.getUTCDate() - dag + 1 + (uke - 1) * 7);
  return man.toISOString().slice(0, 10);
}

export function leggTilDager(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function dagerMellom(fra, til) {
  const ut = [];
  let cur = fra;
  let guard = 0;
  while (cur <= til && guard < 400) {
    ut.push(cur);
    cur = leggTilDager(cur, 1);
    guard++;
  }
  return ut;
}

export function overlap(a0, a1, b0, b1) {
  if (!a0 || !a1 || !b0 || !b1) return false;
  return a0 <= b1 && b0 <= a1;
}

export function sesongDeler(sesong) {
  const m = String(sesong || "").match(/^(vinter|sommer|host|paske)(\d{4})$/);
  if (!m) return null;
  return { navn: m[1], aar: Number(m[2]) };
}

export function ukeNokkel(aar, uke) {
  return `${aar}-${String(uke).padStart(2, "0")}`;
}

export function parseUkeNokkel(nokkel) {
  const m = String(nokkel).match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return { aar: Number(m[1]), uke: Number(m[2]) };
}

/** Ukenøkler fra oppgitt uke og, når datoer finnes, fra datoenes ISO-uker. */
export function campUker(camp) {
  const del = sesongDeler(camp.sesong);
  const keys = new Set();
  if (del) {
    for (const u of ukeListe(camp.uke)) keys.add(ukeNokkel(del.aar, u));
  }
  if (camp.datoFra && camp.datoTil && camp.datoFra <= camp.datoTil) {
    for (const dag of dagerMellom(camp.datoFra, camp.datoTil)) {
      const iso = isoUke(dag);
      keys.add(ukeNokkel(iso.aar, iso.uke));
    }
  }
  return [...keys].sort();
}

export const TEMA_MIN = 3;

function epostRe() {
  return /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
}

function telefonMedMellomrom() {
  return /(?:\+47[\s-]?)?(?:\d{2}[\s]\d{2}[\s]\d{2}[\s]\d{2}|\d{3}[\s]\d{2}[\s]\d{3})/g;
}

/** DDMMYYYY or YYYYMMDD. Used so 01052026 is a date, not a phone. */
export function erDato8(s) {
  if (!/^\d{8}$/.test(s)) return false;
  const dag = Number(s.slice(0, 2));
  const mnd = Number(s.slice(2, 4));
  const aar = Number(s.slice(4));
  if (dag >= 1 && dag <= 31 && mnd >= 1 && mnd <= 12 && aar >= 1990 && aar <= 2100) return true;
  const aar2 = Number(s.slice(0, 4));
  const mnd2 = Number(s.slice(4, 6));
  const dag2 = Number(s.slice(6));
  return aar2 >= 1990 && aar2 <= 2100 && mnd2 >= 1 && mnd2 <= 12 && dag2 >= 1 && dag2 <= 31;
}

function harLøstTelefon(s) {
  if (telefonMedMellomrom().test(s)) return true;
  for (const m of s.matchAll(/\d{8}/g)) {
    if (!erDato8(m[0])) return true;
  }
  return false;
}

export function inneholderPerson(verdi) {
  if (verdi == null) return false;
  const s = String(verdi);
  return epostRe().test(s) || harLøstTelefon(s);
}

export function rensPerson(verdi) {
  if (verdi == null) return null;
  const s = String(verdi)
    .replace(epostRe(), "")
    .replace(telefonMedMellomrom(), "")
    .replace(/\d{8}/g, (m) => (erDato8(m) ? m : ""))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .trim();
  return s === "" ? null : s;
}

/** Kommuner named in skolerute-avvik.json. Their week stays the provider's week. */
export function avvikKommuner(linjer) {
  const navn = [];
  const re = /([A-Za-zÆØÅæøå][A-Za-zÆØÅæøå]*(?:\s+[A-Za-zÆØÅæøå]+)*)\s+finnes ikke i skolerute-fila/g;
  for (const linje of linjer || []) {
    for (const m of String(linje).matchAll(re)) navn.push(m[1]);
  }
  return [...new Set(navn)];
}

export function utenPamelding(leir) {
  const tekst = `${leir?.type || ""} ${leir?.notat || ""} ${leir?.prisNotat || ""}`;
  return /drop-in|uten påmelding|åpent tilbud/i.test(tekst);
}

export function ferieFelter(rad) {
  const ut = [];
  if (rad.hostferie?.datoFra && rad.hostferie?.datoTil) {
    ut.push({ nokkel: "host", ...rad.hostferie });
  }
  if (rad.vinterferie?.datoFra && rad.vinterferie?.datoTil) {
    ut.push({ nokkel: "vinter", ...rad.vinterferie });
  }
  if (rad.paske?.datoFra && rad.paske?.datoTil) {
    ut.push({ nokkel: "paske", ...rad.paske });
  }
  return ut;
}

/** Kommuner hvis feriedatoer overlapper kalenderuken. Ukenummer alene er ikke nok. */
export function kommunerMedFri(rader, aar, uke) {
  const man = ukeMandag(aar, uke);
  const son = leggTilDager(man, 6);
  const ut = [];
  for (const rad of rader) {
    for (const f of ferieFelter(rad)) {
      if (!overlap(f.datoFra, f.datoTil, man, son)) continue;
      ut.push({
        kommune: rad.kommune,
        slug: slug(rad.kommune),
        nokkel: f.nokkel,
        uke: f.uke ?? null,
        datoFra: f.datoFra,
        datoTil: f.datoTil,
        kildeUrl: rad.kildeUrl,
        merknad: rad.merknad ?? null,
        skolear: rad.skolear,
      });
    }
  }
  return ut;
}

/**
 * Treff mellom et kurs og en kommunes ferier.
 * Har kurset datoer, brukes bare datooverlapp (slik at en tredagers høstferie ikke fyller hele uken).
 * Mangler datoer, sammenlignes oppgitt ukenummer med feriens ukenummer i feriedatoens år.
 */
export function campIFerie(camp, rad) {
  if (slug(camp.kommune) !== slug(rad.kommune)) return [];
  const del = sesongDeler(camp.sesong);
  const treff = [];
  for (const f of ferieFelter(rad)) {
    if (camp.datoFra && camp.datoTil) {
      if (overlap(camp.datoFra, camp.datoTil, f.datoFra, f.datoTil)) treff.push(f);
      continue;
    }
    if (f.uke != null && del && f.datoFra) {
      const iso = isoUke(f.datoFra);
      if (iso.aar === del.aar && ukeListe(camp.uke).includes(Number(f.uke))) treff.push(f);
    }
  }
  return treff;
}

/** Ferier i ett skoleår. Sommerferie finnes ikke i skoleruta og gir tom liste. */
export function kommunerISesong(rader, navn, skolearSlutt) {
  const felt = { vinter: "vinterferie", host: "hostferie", paske: "paske" }[navn];
  if (!felt) return [];
  const ut = [];
  for (const rad of rader) {
    const slutt = Number(String(rad.skolear || "").split("-")[1]);
    if (slutt !== skolearSlutt) continue;
    const f = rad[felt];
    if (!f?.datoFra || !f?.datoTil) continue;
    ut.push({
      kommune: rad.kommune,
      slug: slug(rad.kommune),
      nokkel: navn,
      uke: f.uke ?? null,
      datoFra: f.datoFra,
      datoTil: f.datoTil,
      kildeUrl: rad.kildeUrl,
      merknad: rad.merknad ?? null,
      skolear: rad.skolear,
    });
  }
  return ut;
}

export function skolearSlutt(skolear) {
  const slutt = Number(String(skolear || "").split("-")[1]);
  return Number.isInteger(slutt) ? slutt : null;
}

export function skolearKort(skolear) {
  const [a, b] = String(skolear || "").split("-");
  if (!a || !b) return String(skolear || "");
  return `${a}/${b.slice(2)}`;
}

export function lagId(tilbyder, tittel, sesong, uke) {
  return `${slug(tilbyder)}-${slug(tittel)}-${sesong}-u${slug(String(uke))}`;
}

export function typeSlug(type) {
  return slug(type);
}

export function synlig(leir, iDag) {
  if (leir.dod) return false;
  if (leir.lenkestatus === "utløpt") return false;
  if (leir.datoTil && leir.datoTil < iDag) return false;
  return true;
}

export function tellerMotTerskel(leir, iDag) {
  return (
    synlig(leir, iDag) &&
    !leir.demo &&
    leir.status !== "forventet" &&
    (leir.status === "verifisert" || leir.status === "delvis")
  );
}

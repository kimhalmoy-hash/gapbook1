/** Rene funksjoner delt av nettstedet og skriptene. Ingen nettverk, ingen ferieuker hardkodet. */

const SLUG_OVERSTYR = {
  faerder: "fardar",
};

export function slug(verdi) {
  const base = String(verdi ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return SLUG_OVERSTYR[base] || base;
}

/** Offentlige typesider bare der type-verdien treffer et kjent søkeord. Ingenting gjettes. */
export const TYPE_STI = {
  fotballskole: "fotballskole",
  rideleir: "rideleir",
  seilleir: "seilleir",
  idrettsleir: "idrettsleir",
};

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

function ukedag(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return wd === 0 ? 7 : wd;
}

/** Første mandag på eller etter datoen. */
export function forsteMandag(iso) {
  const wd = ukedag(iso);
  return wd === 1 ? iso : leggTilDager(iso, 8 - wd);
}

/** Påskedag, anonym gregoriansk algoritme. */
export function paaskedag(aar) {
  const a = aar % 19;
  const b = Math.floor(aar / 100);
  const c = aar % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${aar}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const HELLIG = new Map();

/** Offentlige helligdager i Norge for ett år. Bevegelige dager regnes fra påskedag. */
export function norskeHelligdager(aar) {
  if (HELLIG.has(aar)) return HELLIG.get(aar);
  const p = paaskedag(aar);
  const sett = new Set([
    `${aar}-01-01`,
    `${aar}-05-01`,
    `${aar}-05-17`,
    `${aar}-12-25`,
    `${aar}-12-26`,
    leggTilDager(p, -3),
    leggTilDager(p, -2),
    p,
    leggTilDager(p, 1),
    leggTilDager(p, 39),
    leggTilDager(p, 49),
    leggTilDager(p, 50),
  ]);
  HELLIG.set(aar, sett);
  return sett;
}

function erHelligdag(iso) {
  return norskeHelligdager(Number(iso.slice(0, 4))).has(iso);
}

function mandagIUka(iso) {
  return leggTilDager(iso, 1 - ukedag(iso));
}

const DAGER = {
  nb: [null, "man", "tir", "ons", "tor", "fre"],
  sv: [null, "mån", "tis", "ons", "tor", "fre"],
  en: [null, "Mon", "Tue", "Wed", "Thu", "Fri"],
};

function dagSpan(numre, locale) {
  const navn = DAGER[locale] || DAGER.nb;
  const dager = [...numre].sort((a, b) => a - b);
  const deler = [];
  let i = 0;
  while (i < dager.length) {
    let j = i;
    while (j + 1 < dager.length && dager[j + 1] === dager[j] + 1) j += 1;
    deler.push(i === j ? navn[dager[i]] : `${navn[dager[i]]}–${navn[dager[j]]}`);
    i = j + 1;
  }
  return deler.join(", ");
}

/**
 * Ferieuker mellom fra og til.
 * En ISO-uke teller når minst 3 hverdager (man–fre som ikke er helligdager) er inne i ferien.
 * hel er sann når alle slike hverdager er fri. Ellers er dager ukedagene som er fri,
 * helligdager inkludert. Mangler til, brukes uka til første mandag på eller etter fra.
 */
export function heleFerieuker(fra, til) {
  if (!fra) return [];
  if (!til) {
    const iso = isoUke(forsteMandag(fra));
    return [{ ...iso, hel: true, dager: [] }];
  }
  if (fra > til) return [];
  const ut = [];
  let man = mandagIUka(fra);
  while (man <= til && ut.length < 60) {
    const hverdager = [0, 1, 2, 3, 4].map((i) => leggTilDager(man, i));
    const skole = hverdager.filter((dag) => !erHelligdag(dag));
    const friSkole = skole.filter((dag) => dag >= fra && dag <= til);
    if (friSkole.length >= 3) {
      const hel = friSkole.length === skole.length;
      const dager = hel
        ? []
        : hverdager.filter((dag) => (dag >= fra && dag <= til) || erHelligdag(dag)).map((dag) => ukedag(dag));
      ut.push({ ...isoUke(man), hel, dager });
    }
    man = leggTilDager(man, 7);
  }
  return ut;
}

/** Kort uketekst, og en detalj når en uke i et spenn bare er delvis fri. */
export function ferieUkeTekst(fra, til, locale = "nb") {
  const uker = heleFerieuker(fra, til);
  if (!uker.length) return null;
  const ukeOrd = locale === "en" ? "week" : locale === "sv" ? "vecka" : "uke";
  const delvis = uker.filter((uke) => !uke.hel);
  if (uker.length === 1 && delvis.length === 1) {
    return { kort: `${uker[0].uke} (${dagSpan(uker[0].dager, locale)})`, detalj: "" };
  }
  const detalj = delvis.map((uke) => `${ukeOrd} ${uke.uke} (${dagSpan(uke.dager, locale)})`).join(", ");
  return { kort: formaterUkeTall(uker.map((uke) => uke.uke)), detalj: detalj ? ` · ${detalj}` : "" };
}

/** Uketekst til en setning. Delvise uker blir «25–33, der uke 33 er man–ons». */
export function ukerISetning(fra, til) {
  const tekst = ferieUkeTekst(fra, til, "nb");
  if (!tekst) return null;
  if (!tekst.detalj) return tekst.kort;
  const deler = tekst.detalj
    .replace(/^ · /, "")
    .split(", ")
    .map((del) => del.replace(/ \((.+)\)/, " er $1"));
  return `${tekst.kort}, der ${deler.join(" og ")}`;
}

/** Første setning byttes når sommeruken ikke er publisert. Da vises ikke {uker}. */
export function sommerKommuneTekst(mal, kommune, fra, til) {
  const uker = fra && til ? ukerISetning(fra, til) : null;
  if (!uker) {
    const rest = String(mal).replace(/^[^.]*\.\s*/, "");
    const forste = `Skoleruta for sommeren 2027 er ikke publisert ennå i ${kommune}.`;
    return rest ? `${forste} ${rest}` : forste;
  }
  return String(mal).replaceAll("{uker}", uker);
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
  const m = String(sesong || "").match(/^(vinter|sommer|host|paske|halvterm)(\d{4})$/);
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

/** Sommer + forventet: uketallet er fjorårets uke, ikke en bekreftet uke i sesongåret. */
export function erFjoraarsSommer(camp) {
  return sesongDeler(camp?.sesong)?.navn === "sommer" && camp?.status === "forventet";
}

/** Ukenøkler fra oppgitt uke og, når datoer finnes, fra datoenes ISO-uker. */
export function campUker(camp) {
  const del = sesongDeler(camp.sesong);
  const keys = new Set();
  if (del && !erFjoraarsSommer(camp)) {
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

const URL_RE = /https?:\/\/[^\s<>"']+/g;

function epostRe() {
  return /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
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

function delOppUrl(s) {
  const deler = [];
  let sist = 0;
  for (const m of s.matchAll(URL_RE)) {
    deler.push({ url: false, tekst: s.slice(sist, m.index) });
    deler.push({ url: true, tekst: m[0] });
    sist = m.index + m[0].length;
  }
  deler.push({ url: false, tekst: s.slice(sist) });
  return deler;
}

function harTelefon(s) {
  if (/(?:^|[^\w])(?:\+47[\s-]?)?(?:\d{2}[\s]\d{2}[\s]\d{2}[\s]\d{2}|\d{3}[\s]\d{2}[\s]\d{3})(?![\w])/.test(s)) {
    return true;
  }
  for (const m of s.matchAll(/(?:^|[^\w])(\d{8})(?![\w])/g)) {
    if (!erDato8(m[1])) return true;
  }
  return false;
}

function rensTekst(s) {
  return s
    .replace(epostRe(), "")
    .replace(/(^|[^\w])((?:\+47[\s-]?)?(?:\d{2}[\s]\d{2}[\s]\d{2}[\s]\d{2}|\d{3}[\s]\d{2}[\s]\d{3}))(?![\w])/g, "$1")
    .replace(/(^|[^\w])(\d{8})(?![\w])/g, (hele, foran, tall) => (erDato8(tall) ? hele : foran))
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1");
}

export function inneholderPerson(verdi) {
  if (verdi == null) return false;
  const ren = delOppUrl(String(verdi))
    .filter((d) => !d.url)
    .map((d) => d.tekst)
    .join(" ");
  return epostRe().test(ren) || harTelefon(ren);
}

export function rensPerson(verdi) {
  if (verdi == null) return null;
  const s = delOppUrl(String(verdi))
    .map((d) => (d.url ? d.tekst : rensTekst(d.tekst)))
    .join("")
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

/** Kort linje til besøkende. URL-er tas ut. Fjorårsdato beholdes når den står i notatet. */
export function fjoraarsTekst(notat) {
  if (!notat) return null;
  const uten = String(notat).replace(/https?:\/\/\S+/g, " ").replace(/\s+/g, " ").trim();
  const m = uten.match(/Fjorår:\s*(.+?)(?:\s+Kilde\b|$)/i);
  if (!m) return null;
  const bit = m[1].replace(/[.\s]+$/, "").trim();
  if (!bit) return null;
  return bit.length > 70 ? `${bit.slice(0, 67).replace(/\s+\S*$/, "")}…` : bit;
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

/** Kommuner der uka er en hel ferieuke, ikke bare en lørdag eller en slutt midt i uka. */
export function kommunerMedFri(rader, aar, uke) {
  const ut = [];
  for (const rad of rader) {
    for (const f of ferieFelter(rad)) {
      const hele = heleFerieuker(f.datoFra, f.datoTil);
      if (!hele.some((u) => u.aar === aar && u.uke === uke)) continue;
      ut.push({
        kommune: rad.kommune,
        slug: rad.slug || slug(rad.kommune),
        nokkel: f.nokkel,
        uke,
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
export function erHelUke(fra, til) {
  if (!fra || !til) return false;
  const start = new Date(`${fra}T00:00:00Z`);
  const slutt = new Date(`${til}T00:00:00Z`);
  const wd = (dt) => dt.getUTCDay() || 7;
  if (wd(start) !== 1 || wd(slutt) !== 5) return false;
  return leggTilDager(fra, 4) === til;
}

export function campIFerie(camp, rad) {
  if (slug(camp.kommune) !== slug(rad.kommune)) return [];
  if (camp.fylke && rad.fylke && slug(camp.fylke) !== slug(rad.fylke)) return [];
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

/**
 * Sommerferie fra siste og første skoledag. Tomt felt blir ikke fylt inn.
 * fra er dagen etter siste skoledag. til er dagen før første skoledag.
 * Uker er hele ferieuker, fra mandagen etter siste skoledag.
 * Bare start: den uka, uten å gjette slutten.
 */
export function sommerPeriode(rad) {
  const siste = rad?.sommer?.sisteSkole || null;
  const forste = rad?.sommer?.forsteSkole || null;
  if (!siste) return null;
  const fra = leggTilDager(siste, 1);
  const til = forste ? leggTilDager(forste, -1) : null;
  if (til && fra > til) return null;
  const uker = heleFerieuker(fra, til).map((u) => u.uke);
  return {
    fra,
    til,
    uker,
    komplett: Boolean(til),
    kildeUrl: rad.sommer?.kildeUrl || null,
    forsteKildeUrl: rad.sommer?.forsteKildeUrl || null,
  };
}

/** Uker som får en sommerside. Uke 24 i startåret tas med selv om den ikke har tre hverdager. */
export function sommerSideUker(rad, aar) {
  const periode = sommerPeriode(rad);
  if (!periode) return [];
  const sett = new Set(periode.uker);
  if (periode.fra) {
    const start = isoUke(periode.fra);
    if (start.uke === 24 && (aar == null || start.aar === aar)) sett.add(24);
  }
  return [...sett].sort((a, b) => a - b);
}

/** Ferier i ett skoleår. Sommeruker lages ikke her, så forventede 2026-uker ikke blir 2027-uker. */
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
      slug: rad.slug || slug(rad.kommune),
      nokkel: navn,
      uke: heleFerieuker(f.datoFra, f.datoTil)[0]?.uke ?? null,
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

function normGruppe(verdi) {
  return String(verdi ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

/** Samme tilbyder, tittel og sted (kommune + by) er ett tilbud. */
export function gruppeNokkel(leir) {
  return [leir.tilbyder, leir.tittel, leir.kommune, leir.by].map(normGruppe).join("\0");
}

export function grupperLeirer(leirer) {
  const map = new Map();
  for (const leir of leirer) {
    const nokkel = gruppeNokkel(leir);
    if (!map.has(nokkel)) map.set(nokkel, []);
    map.get(nokkel).push(leir);
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "nb"))
    .map(([, medlemmer]) =>
      medlemmer.sort((a, b) => String(a.uke).localeCompare(String(b.uke), "nb", { numeric: true }) || a.id.localeCompare(b.id)),
    );
}

export function gruppeSlugBasis(medlemmer) {
  const forste = [...medlemmer].sort((a, b) => a.id.localeCompare(b.id))[0];
  return slug(`${forste.tilbyder} ${forste.tittel} ${forste.kommune} ${forste.by || ""}`) || slug(forste.id);
}

/** Stabil slug per gruppe. Kollisjoner får -2, -3, … */
export function medSlug(grupper) {
  const brukt = new Set();
  return grupper.map((medlemmer) => {
    const base = gruppeSlugBasis(medlemmer);
    let navn = base;
    let n = 2;
    while (brukt.has(navn)) {
      navn = `${base}-${n}`;
      n += 1;
    }
    brukt.add(navn);
    return { slug: navn, medlemmer };
  });
}

/** «25–33» når ukene henger sammen, «25, 27, 30» når de ikke gjør det, «25–27, 30» når bare noen gjør. */
export function formaterUkeTall(uker) {
  const tall = [...new Set(uker.filter((n) => Number.isInteger(n) && n >= 1 && n <= 53))].sort((a, b) => a - b);
  if (!tall.length) return "";
  const deler = [];
  let start = tall[0];
  let prev = tall[0];
  for (let i = 1; i <= tall.length; i++) {
    const n = tall[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    deler.push(start === prev ? String(start) : `${start}–${prev}`);
    start = n;
    prev = n;
  }
  return deler.join(", ");
}

export function ukeTallFra(medlemmer) {
  const sett = new Set();
  for (const leir of medlemmer) {
    for (const uke of ukeListe(leir.uke)) sett.add(uke);
  }
  return [...sett].sort((a, b) => a - b);
}

export function gruppeTrefferUke(medlemmer, aar, uke) {
  const nokkel = ukeNokkel(aar, uke);
  return medlemmer.some((leir) => campUker(leir).includes(nokkel));
}

export function besteStatus(statuser) {
  if (statuser.includes("verifisert")) return "verifisert";
  if (statuser.includes("delvis")) return "delvis";
  return "forventet";
}

export function gruppeTellerMotTerskel(medlemmer, iDag) {
  const bruk = medlemmer.filter((leir) => synlig(leir, iDag) && !leir.demo);
  if (!bruk.length) return false;
  const best = besteStatus(bruk.map((leir) => leir.status));
  return best === "verifisert" || best === "delvis";
}

/** Antall tilbud etter gruppering. Én leir i ni uker teller som 1. */
export function antallSomTeller(leirer, iDag) {
  return medSlug(grupperLeirer(leirer)).filter((g) => gruppeTellerMotTerskel(g.medlemmer, iDag)).length;
}

export function pameldingErLik(medlemmer) {
  const signatur = medlemmer.map((leir) => `${leir.pameldingStatus || ""}|${leir.pameldingApner || ""}`);
  return new Set(signatur).size <= 1;
}

/** Kommune-skolerute indekseres bare på bokmål. Huben indekseres på alle språk. */
export function skolerutaIndeks(kind, locale) {
  if (kind === "skolerutaHub") return true;
  if (kind === "skoleruta") return locale === "nb";
  return null;
}

/** hreflang-mål som er indekserbare. Kommune-skolerute peker bare på bokmål. */
export function hreflangLokaler(kind) {
  if (kind === "skoleruta") return ["nb"];
  return ["nb", "sv", "en"];
}

/** Prislinjen. Notatet brukes som linje når tallet mangler. «Ikke oppgitt» bare når begge er tomme. */
export function prisVisning(prisLabel, prisNotat, mangler) {
  const label = typeof prisLabel === "string" && prisLabel.trim() ? prisLabel.trim() : null;
  const notat = typeof prisNotat === "string" && prisNotat.trim() ? prisNotat.trim() : null;
  if (label) return { linje: label, notat: notat && notat !== label ? notat : null };
  if (notat) return { linje: notat, notat: null };
  return { linje: mangler, notat: null };
}

/** «apnet» when the opening date is today or earlier and status is still unknown. */
export function pameldingModus(status, apner, iDag) {
  const har = typeof apner === "string" && apner !== "";
  const passert = har && apner <= iDag;
  if (!status && passert) return "apnet";
  if (har && apner > iDag) return "apner";
  return "status";
}

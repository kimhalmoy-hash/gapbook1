/**
 * Kalendersider for SE, DE, AT, GB og IE fra skjema v2.
 * Bare status=verifisert. Delområde vises for seg, aldri som hele regionen.
 * Uten Search Console slippes bare kalendere og hubber, maks 150 per land.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSkolekalender, kilderFor, ukeSpan, raderForSide } from "./skolekalender.mjs";
import { regionSlug, maalFor, kalenderSlug } from "./slug-tabell.mjs";
import { SEARCH_CONSOLE_VERIFISERT, UKES_KVOTE } from "./terskel.mjs";

const ROT = dirname(fileURLToPath(import.meta.url));
const FERIE = new Set(["host", "vinter", "paske", "sommer", "jul", "pinse", "halvterm", "sportlov", "var", "thanksgiving"]);
const SE_LAN = {
  "Stockholms län": "SE-AB",
  "Uppsala län": "SE-C",
  "Södermanlands län": "SE-D",
  "Östergötlands län": "SE-E",
  "Jönköpings län": "SE-F",
  "Kronobergs län": "SE-G",
  "Kalmar län": "SE-H",
  "Gotlands län": "SE-I",
  "Blekinge län": "SE-K",
  "Skåne län": "SE-M",
  "Hallands län": "SE-N",
  "Västra Götalands län": "SE-O",
  "Värmlands län": "SE-S",
  "Örebro län": "SE-T",
  "Västmanlands län": "SE-U",
  "Dalarnas län": "SE-W",
  "Gävleborgs län": "SE-X",
  "Västernorrlands län": "SE-Y",
  "Jämtlands län": "SE-Z",
  "Västerbottens län": "SE-AC",
  "Norrbottens län": "SE-BD",
};
const NASJON = { England: "england", Scotland: "scotland", Wales: "wales", "Northern Ireland": "northern-ireland" };

export function kildeErFersk(dato, iDag, dager = 90) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dato || "") || !/^\d{4}-\d{2}-\d{2}$/.test(iDag || "")) return false;
  const fra = Date.parse(`${dato}T00:00:00Z`);
  const til = Date.parse(`${iDag}T00:00:00Z`);
  return (til - fra) / 86400000 <= dager && til >= fra;
}

function les(fil) {
  return parseSkolekalender(readFileSync(join(ROT, "../data/kalender", fil), "utf8")).rader;
}

function periode(rad) {
  return {
    navn: rad.navn_lokalt,
    type: rad.ferie_type,
    fra: rad.fra,
    til: rad.til,
    uke: ukeSpan(rad.iso_uke_fra, rad.iso_uke_til),
    skolear: rad.skolear,
    kilder: kilderFor(rad),
  };
}

function offisielle(rader, iDag) {
  return raderForSide(rader).filter(
    (rad) =>
      rad.region_niva !== "delomrade" &&
      FERIE.has(rad.ferie_type) &&
      typeof rad.kilde_url === "string" &&
      rad.kilde_url.startsWith("http") &&
      kildeErFersk(rad.kilde_hentet, iDag),
  );
}

function kvalifisert(rader, iDag) {
  return new Set(offisielle(rader, iDag).map((rad) => rad.ferie_type)).size >= 2;
}

function delomrader(alle, overordnet) {
  return raderForSide(alle)
    .filter((rad) => rad.region_niva === "delomrade" && rad.overordnet_region === overordnet)
    .map((rad) => ({ omrade: rad.region, ...periode(rad) }));
}

function side(felter) {
  return {
    kind: "school-holidays",
    slag: "kalender",
    offisiell: true,
    antall: 0,
    locale: "nb",
    indeks: false,
    koe: false,
    ...felter,
  };
}

function h1(land, navn) {
  if (land === "SE") return `Skollov 2026/27 i ${navn}`;
  if (land === "DE" || land === "AT") return `Schulferien in ${navn} 2026/27`;
  if (land === "IE") return "School holidays in Ireland 2026/27";
  return `${navn} school holidays 2026/27`;
}

export function byggKalendere(iDag, puljer) {
  const innhold = new Map();
  const sider = [];
  const legg = (rad, blokk) => {
    sider.push(rad);
    innhold.set(rad.path, { h1: rad.h1, ingress: rad.ingress, ...blokk });
  };

  const se = les("se.csv");
  const perLan = new Map();
  for (const rad of se) {
    if (rad.region_niva !== "kommune") continue;
    const kode = SE_LAN[rad.overordnet_region];
    if (!kode) continue;
    if (!perLan.has(kode)) perLan.set(kode, []);
    perLan.get(kode).push(rad);
  }
  for (const [kode, rader] of perLan) {
    if (!kvalifisert(rader, iDag)) continue;
    const slug = regionSlug(kode);
    const navn = rader[0].overordnet_region;
    const path = `/se/${slug}/${kalenderSlug("SE")}/`;
    const kommuner = new Map();
    for (const rad of offisielle(rader, iDag)) {
      if (!kommuner.has(rad.region)) kommuner.set(rad.region, []);
      kommuner.get(rad.region).push(periode(rad));
    }
    legg(
      side({ land: "SE", maal: maalFor("SE"), region: slug, regionNavn: navn, path, h1: h1("SE", navn), ingress: `Verifiserte lovdatoer i ${navn}, kommune for kommune.` }),
      { perioder: [], kommuner: [...kommuner.entries()].sort((a, b) => a[0].localeCompare(b[0], "sv")).map(([navn, rader]) => ({ navn, rader })), delomrade: [] },
    );
  }

  for (const [fil, land] of [["de.csv", "DE"], ["at.csv", "AT"]]) {
    const rader = les(fil);
    const perStat = new Map();
    for (const rad of rader) {
      if (rad.region_niva !== "stat") continue;
      if (!perStat.has(rad.region_kode)) perStat.set(rad.region_kode, []);
      perStat.get(rad.region_kode).push(rad);
    }
    for (const [kode, liste] of perStat) {
      if (!kvalifisert(liste, iDag)) continue;
      const slug = regionSlug(kode);
      const navn = liste[0].region;
      const path = `/${land.toLowerCase()}/${slug}/${kalenderSlug(land)}/`;
      legg(
        side({ land, maal: maalFor(land), region: slug, regionNavn: navn, path, h1: h1(land, navn), ingress: `Verifiserte feriedatoer for ${navn}.` }),
        { perioder: offisielle(liste, iDag).map(periode), kommuner: [], delomrade: delomrader(rader, navn) },
      );
    }
  }

  const gb = les("gb.csv");
  const rang = new Map((puljer?.councils || []).map((rad) => [rad.council.toLowerCase(), rad]));
  const perCouncil = new Map();
  for (const rad of gb) {
    if (rad.region_niva !== "local_authority") continue;
    if (!perCouncil.has(rad.region)) perCouncil.set(rad.region, []);
    perCouncil.get(rad.region).push(rad);
  }
  for (const [navn, liste] of perCouncil) {
    if (!kvalifisert(liste, iDag)) continue;
    const treff = rang.get(navn.toLowerCase());
    const nasjon = NASJON[liste[0].overordnet_region] || "england";
    const path = treff?.path || `/gb/${nasjon}/${navn.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/school-holidays/`;
    legg(
      side({ land: "GB", maal: maalFor("GB"), region: nasjon, regionNavn: navn, path, rang: treff?.rang ?? 9999, h1: h1("GB", navn), ingress: `Verified term dates for ${navn}.` }),
      { perioder: offisielle(liste, iDag).map(periode), kommuner: [], delomrade: [] },
    );
  }
  const ni = gb.filter((rad) => rad.region_niva === "nasjon" && rad.region === "Northern Ireland");
  if (kvalifisert(ni, iDag)) {
    legg(
      side({ land: "GB", maal: maalFor("GB"), region: "northern-ireland", regionNavn: "Northern Ireland", path: "/gb/northern-ireland/school-holidays/", rang: 0, h1: h1("GB", "Northern Ireland"), ingress: "Verified school holidays for Northern Ireland." }),
      { perioder: offisielle(ni, iDag).map(periode), kommuner: [], delomrade: [] },
    );
  }

  const ie = les("ie.csv").filter((rad) => rad.region_niva === "land");
  if (kvalifisert(ie, iDag)) {
    legg(
      side({ land: "IE", maal: maalFor("IE"), region: null, regionNavn: "Ireland", path: "/ie/school-holidays/", h1: h1("IE"), ingress: "Verified school holidays and mid-term breaks for Ireland." }),
      { perioder: offisielle(ie, iDag).map(periode), kommuner: [], delomrade: [] },
    );
  }

  return { sider: merkKoe(sider), innhold };
}

/** Første uke: kalendere og hubber, maks 150 nye indekserbare per land. Resten står i kø. */
export function merkKoe(sider, { gsc = SEARCH_CONSOLE_VERIFISERT, kvote = UKES_KVOTE } = {}) {
  const perLand = new Map();
  for (const side of sider) {
    if (!perLand.has(side.land)) perLand.set(side.land, []);
    perLand.get(side.land).push(side);
  }
  for (const [land, liste] of perLand) {
    const sortert = [...liste].sort((a, b) => (a.rang ?? 9999) - (b.rang ?? 9999) || a.path.localeCompare(b.path));
    const plass = gsc ? sortert : sortert.filter((side) => side.slag === "kalender" || side.slag === "hub");
    const tak = land === "GB" ? Math.max(0, kvote - 5) : kvote;
    plass.forEach((side, indeks) => {
      side.indeks = indeks < tak;
      side.koe = indeks >= tak;
    });
    for (const side of liste) {
      if (!plass.includes(side)) {
        side.indeks = false;
        side.koe = true;
      }
    }
  }
  return sider;
}

const HUBB_PLAN = {
  SE: ["/se/"],
  DE: ["/de/"],
  AT: ["/at/"],
  IE: ["/ie/"],
  GB: ["/gb/", "/gb/england/", "/gb/scotland/", "/gb/wales/", "/gb/northern-ireland/"],
};

/** Hubber som får plass i samme ukekvote som kalenderne. */
export function hubberSomSlippes(sider) {
  const tall = kalenderTall(sider);
  const ut = new Set();
  for (const [land, stier] of Object.entries(HUBB_PLAN)) {
    const indekserte = tall[land]?.indeks || 0;
    if (land === "IE" && indekserte < 1) continue;
    if (land !== "IE" && land !== "GB" && indekserte < 3) continue;
    let rom = UKES_KVOTE - indekserte;
    for (const sti of stier) {
      if (rom <= 0) break;
      ut.add(sti);
      rom -= 1;
    }
  }
  return ut;
}

export function kalenderTall(sider) {
  const ut = {};
  for (const side of sider) {
    if (!ut[side.land]) ut[side.land] = { bygget: 0, indeks: 0, koe: 0 };
    ut[side.land].bygget += 1;
    if (side.indeks) ut[side.land].indeks += 1;
    if (side.koe) ut[side.land].koe += 1;
  }
  return ut;
}

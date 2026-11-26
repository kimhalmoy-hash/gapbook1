/**
 * Leser config/kilder.json og skriver kandidater til data/kandidater.json.
 * Publiserer aldri til leirer.json. Gjetter ikke manglende felt.
 * Hoopit hentes aldri. Andre plattformer bare når de står som tillatt.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertKilderTrygge, vurderUrl } from "./lib/plattform.mjs";
import { lagHenter } from "./lib/hent.mjs";
import {
  erSamleside,
  entydigPeriode,
  faktaFraJsonLd,
  h1,
  lenkerSomMatcher,
  sitemapLocs,
  tittelFraHead,
} from "./lib/utdrag.mjs";
import { lagId, rensPerson } from "../lib/pure.mjs";
import { stiTillatt as robotsTillatt } from "./lib/robots.mjs";
import { forfalte } from "./lib/sjekk-plan.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(path.join(ROT, "config", "kilder.json"), "utf8"));
assertKilderTrygge(config);

const idag = new Date().toISOString().slice(0, 10);
const maks = Number(config.maksSiderPerKjor) || 20;
const henter = lagHenter(config);
const kandidater = [];
const hoppetOver = [];
let hentet = 0;

function kandidat(del) {
  const tittel = rensPerson(del.tittel);
  const tilbyder = rensPerson(del.tilbyder);
  const url = del.url || null;
  return {
    id: tittel && tilbyder ? lagId(tilbyder, tittel, del.sesong || "ukjent", del.uke || "x") : null,
    tittel,
    tilbyder,
    tilbyderUrl: del.tilbyderUrl || null,
    url,
    type: null,
    sesong: null,
    uke: null,
    datoFra: del.datoFra || null,
    datoTil: del.datoTil || null,
    alderFra: null,
    alderTil: null,
    prisNok: del.prisNok ?? null,
    prisNotat: null,
    by: null,
    kommune: del.kommune || null,
    fylke: null,
    land: null,
    status: null,
    notat: "Kandidat fra finn-leirer. Ikke gjennomgått, ikke publisert.",
    kildeSjekket: idag,
    lenkestatus: null,
    dod: false,
    fremhevet: false,
    demo: false,
  };
}

function stopp() {
  return hentet >= maks;
}

async function hentInnenfor(url) {
  if (stopp()) {
    hoppetOver.push({ url, grunn: "maks-sider" });
    return null;
  }
  const vurdering = vurderUrl(config, url);
  if (vurdering.handling === "blokker" || vurdering.handling === "ikke-tillatt" || vurdering.handling === "utenfor" || vurdering.handling === "ugyldig") {
    hoppetOver.push({ url, grunn: vurdering.grunn || vurdering.handling });
    return null;
  }
  hentet++;
  const svar = await henter.hent(url);
  if (!svar.ok) {
    hoppetOver.push({ url, grunn: svar.info || (svar.hoppet ? "robots.txt" : "usikker") });
    return null;
  }
  return { ...svar, vurdering };
}

async function fraSpond(url) {
  const svar = await hentInnenfor(url);
  if (!svar) return;
  if (/sitemap/i.test(url)) {
    for (const loc of sitemapLocs(svar.body)) {
      if (stopp()) break;
      if (vurderUrl(config, loc).handling !== "spond") continue;
      await fraSpond(loc);
    }
    return;
  }
  for (const fakta of faktaFraJsonLd(svar.body)) {
    kandidater.push(
      kandidat({
        tittel: fakta.tittel,
        url: fakta.url || url,
        datoFra: fakta.datoFra,
        datoTil: fakta.datoTil,
        prisNok: fakta.prisNok,
        kommune: fakta.sted,
      }),
    );
  }
}

async function fraKfuk(url) {
  const sm = await hentInnenfor("https://kfuk-kfum.no/sitemap.xml");
  if (!sm) return;
  const tillatte = sitemapLocs(sm.body).filter((loc) => {
    try {
      const sti = new URL(loc).pathname;
      return robotsTillatt(sm.robots || "", sti, config.userAgent);
    } catch {
      return false;
    }
  });
  const mal = url.includes("sitemap") ? tillatte : tillatte.filter((loc) => loc === url);
  if (!url.includes("sitemap") && !tillatte.includes(url)) {
    hoppetOver.push({ url, grunn: "kfuk-ikke-i-sitemap-eller-robots" });
    return;
  }
  for (const loc of mal) {
    const side = await hentInnenfor(loc);
    if (!side) continue;
    const tittel = h1(side.body) || tittelFraHead(side.body);
    kandidater.push(kandidat({ tittel, url: loc, tilbyder: "KFUK-KFUM" }));
  }
}

async function fraRubic(url) {
  const svar = await hentInnenfor(url);
  if (!svar) return;
  const eventLenker = lenkerSomMatcher(svar.body, (href) => /\/Public\/Events\/\d+/.test(href));
  if (eventLenker.length) {
    for (const href of eventLenker) {
      const abs = new URL(href, url).href;
      const side = await hentInnenfor(abs);
      if (!side) continue;
      const tittel = h1(side.body) || tittelFraHead(side.body);
      kandidater.push(kandidat({ tittel, url: abs }));
    }
    return;
  }
  const tittel = h1(svar.body) || tittelFraHead(svar.body);
  kandidater.push(kandidat({ tittel, url }));
}

async function fraArrangor(kilde) {
  const svar = await hentInnenfor(kilde.url);
  if (!svar) return;
  if (erSamleside(svar.body, kilde.url)) {
    hoppetOver.push({ url: kilde.url, grunn: "samleside" });
    return;
  }
  const tittel = h1(svar.body) || tittelFraHead(svar.body);
  const periode = entydigPeriode(svar.body);
  let tilbyderUrl = null;
  try {
    tilbyderUrl = new URL(kilde.url).origin + "/";
  } catch {
    tilbyderUrl = null;
  }
  kandidater.push(
    kandidat({
      tittel,
      tilbyder: kilde.tilbyder || null,
      tilbyderUrl,
      url: kilde.url,
      datoFra: periode.datoFra,
      datoTil: periode.datoTil,
      kommune: kilde.kommune || null,
    }),
  );
}

const forfalt = process.argv.includes("--forfalte");
let kilder = config.kilder || [];
if (forfalt) {
  const plan = JSON.parse(readFileSync(path.join(ROT, "data", "sjekk-plan.json"), "utf8"));
  const due = forfalte(plan, idag);
  const sett = new Set();
  kilder = [];
  for (const rad of due) {
    if (sett.has(rad.kildeUrl)) continue;
    sett.add(rad.kildeUrl);
    kilder.push({ url: rad.kildeUrl, tilbyder: rad.tilbyder, kommune: rad.kommune });
  }
  console.log(`finn --forfalte: ${due.length} forfalt, ${kilder.length} adresser på eller før ${idag}`);
}

for (const kilde of kilder) {
  const vurdering = vurderUrl(config, kilde.url);
  if (vurdering.handling === "spond") await fraSpond(kilde.url);
  else if (vurdering.handling === "kfuk") await fraKfuk(kilde.url);
  else if (vurdering.handling === "rubic") await fraRubic(kilde.url);
  else if (vurdering.handling === "arrangor" || vurdering.handling === "plattform") await fraArrangor(kilde);
  else hoppetOver.push({ url: kilde.url, grunn: vurdering.grunn || vurdering.handling });
}

const ut = {
  generert: idag,
  merknad: forfalt
    ? "Forfalte kilder fra sjekk-plan. Kandidater til manuell gjennomgang. Skriver aldri til leirer.json."
    : "Kandidater til manuell gjennomgang. Skriptet skriver aldri til leirer.json.",
  kandidater,
  hoppetOver,
};
mkdirSync(path.join(ROT, "data"), { recursive: true });
writeFileSync(path.join(ROT, "data", "kandidater.json"), `${JSON.stringify(ut, null, 2)}\n`);
console.log(`finn: ${kandidater.length} kandidater, ${hoppetOver.length} hoppet over, ${hentet} sider hentet.`);

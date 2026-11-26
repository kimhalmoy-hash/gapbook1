/**
 * Sjekker url på hver leir. Én forespørsel, ærlig User-Agent, robots.txt.
 * 404/410/DNS → lenkestatus utløpt, dod true.
 * 403/429/451/5xx, tidsavbrudd eller bot-utfordring → usikker. Ingen nye forsøk.
 * Hoopit hentes aldri. Plattformer med tillatt:false hentes ikke.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { assertKilderTrygge, vurderUrl } from "./lib/plattform.mjs";
import { lagHenter } from "./lib/hent.mjs";
import { pameldingFraJsonLd, pameldingFraRubic, sitemapLocs } from "./lib/utdrag.mjs";
import { stiTillatt } from "./lib/robots.mjs";

const ROT = path.resolve(import.meta.dirname, "..");
const fil = path.join(ROT, "data", "leirer.json");
const config = JSON.parse(readFileSync(path.join(ROT, "config", "kilder.json"), "utf8"));
assertKilderTrygge(config);

const idag = new Date().toISOString().slice(0, 10);
const leirer = JSON.parse(readFileSync(fil, "utf8"));
const henter = lagHenter(config);
let kfukSitemap = null;

async function kfukTillater(url) {
  if (kfukSitemap) return kfukSitemap;
  const sm = await henter.hent("https://kfuk-kfum.no/sitemap.xml");
  if (!sm.ok) {
    kfukSitemap = { ok: false, info: sm.info || "sitemap" };
    return kfukSitemap;
  }
  const locs = new Set(sitemapLocs(sm.body));
  kfukSitemap = { ok: true, locs, robots: sm.robots || "" };
  return kfukSitemap;
}

async function sjekkEn(leir) {
  const vurdering = vurderUrl(config, leir.url);
  if (vurdering.handling === "blokker" || vurdering.handling === "ikke-tillatt" || vurdering.handling === "utenfor" || vurdering.handling === "ugyldig") {
    return { lenkestatus: "usikker", grunn: vurdering.grunn || vurdering.handling };
  }
  if (vurdering.handling === "kfuk") {
    const sm = await kfukTillater(leir.url);
    if (!sm.ok) return { lenkestatus: "usikker", grunn: `kfuk-sitemap:${sm.info}` };
    if (!sm.locs.has(leir.url)) return { lenkestatus: "usikker", grunn: "kfuk-ikke-i-sitemap" };
    const sti = new URL(leir.url).pathname;
    if (sm.robots && !stiTillatt(sm.robots, sti, config.userAgent)) {
      return { lenkestatus: "usikker", grunn: "robots.txt" };
    }
  }
  const svar = await henter.hent(leir.url);
  if (svar.hoppet) return { lenkestatus: "usikker", grunn: svar.info };
  if (svar.dod) return { lenkestatus: "utløpt", dod: true, grunn: svar.info };
  if (svar.ok) {
    const struktur =
      pameldingFraJsonLd(svar.body) ||
      (vurdering.handling === "rubic" ? pameldingFraRubic(svar.body) : null);
    return { lenkestatus: "ok", dod: false, grunn: svar.status, pameldingStatus: struktur };
  }
  return { lenkestatus: "usikker", grunn: svar.info };
}

let ok = 0;
let usikre = 0;
let dode = 0;
for (const leir of leirer) {
  const svar = await sjekkEn(leir);
  leir.kildeSjekket = idag;
  leir.lenkestatus = svar.lenkestatus;
  if (svar.lenkestatus === "utløpt") {
    leir.dod = true;
    dode++;
  } else if (svar.lenkestatus === "ok") {
    leir.dod = false;
    if (svar.pameldingStatus) leir.pameldingStatus = svar.pameldingStatus;
    ok++;
  } else {
    usikre++;
  }
  console.log(`${svar.lenkestatus.padEnd(8)} ${String(svar.grunn).padEnd(28)} ${leir.url}`);
}

writeFileSync(fil, `${JSON.stringify(leirer, null, 2)}\n`);
console.log(`\n${leirer.length} sjekket: ${ok} ok, ${dode} utløpt, ${usikre} usikre.`);
